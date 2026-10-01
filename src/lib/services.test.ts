import { describe, expect, it } from 'vitest';
import type { ArticleEntry } from './articles';
import {
  ServiceValidationError,
  relatedArticlesFor,
  serviceFor,
  servicePath,
  servicesFor,
  validateServices,
  type ServiceData,
  type ServiceEntry,
} from './services';

function service(id: string, data: Partial<ServiceData> = {}): ServiceEntry {
  const [lang, key] = id.split('/') as [ServiceData['lang'], ServiceData['key']];
  return { id, data: { key, lang, order: 1, relatedArticles: [], ...data } };
}

function article(id: string, translationKey: string, draft = false): ArticleEntry {
  const lang = id.startsWith('en/') ? 'en' : 'pt';
  return {
    id,
    data: { title: id, lang, translationKey, category: 'gestao', pubDate: new Date('2026-01-01'), draft },
  };
}

const complete = ['pt', 'en'].flatMap((lang) =>
  ['consultoria', 'mentoria', 'palestras'].map((key, index) => service(`${lang}/${key}`, { order: index + 1 })),
);

function problemsOf(services: ServiceEntry[], articles: ArticleEntry[] = []): string[] {
  try {
    validateServices(services, articles);
    return [];
  } catch (error) {
    if (error instanceof ServiceValidationError) return error.problems;
    throw error;
  }
}

describe('servicePath', () => {
  it('deve seguir o contrato de URLs quando recebe a chave e o idioma', () => {
    // Arrange
    const keys = ['consultoria', 'mentoria', 'palestras'] as const;

    // Act
    const paths = keys.map((key) => [servicePath(key, 'pt'), servicePath(key, 'en')]);

    // Assert
    expect(paths).toEqual([
      ['/consultoria/', '/en/consulting/'],
      ['/mentoria/', '/en/mentoring/'],
      ['/palestras/', '/en/speaking/'],
    ]);
  });
});

describe('validateServices', () => {
  it('deve aceitar quando os 3 serviços existem nos 2 idiomas', () => {
    // Arrange
    const services = complete;

    // Act
    const problems = problemsOf(services);

    // Assert
    expect(problems).toEqual([]);
  });

  it('deve falhar quando falta um serviço em um idioma', () => {
    // Arrange
    const services = complete.filter((entry) => entry.id !== 'en/mentoria');

    // Act
    const problems = problemsOf(services);

    // Assert
    expect(problems).toEqual(['serviço "mentoria": esperado 1 arquivo em en, encontrados 0']);
  });

  it('deve falhar quando o nome do arquivo não é a chave do serviço', () => {
    // Arrange
    const services = complete.map((entry) => (entry.id === 'pt/mentoria' ? { ...entry, id: 'pt/mentorias' } : entry));

    // Act
    const problems = problemsOf(services);

    // Assert
    expect(problems).toContain('pt/mentorias: o arquivo deve se chamar "mentoria.md"');
  });

  it('deve falhar quando a pasta não bate com o idioma declarado', () => {
    // Arrange
    const services = complete.map((entry) => (entry.id === 'pt/palestras' ? { ...entry, id: 'en/palestras' } : entry));

    // Act
    const problems = problemsOf(services);

    // Assert
    expect(problems).toContain('en/palestras: está na pasta "en" mas declara lang "pt"');
  });

  it('deve falhar quando o artigo relacionado não existe ou é rascunho no idioma', () => {
    // Arrange
    const services = complete.map((entry) =>
      entry.id === 'pt/consultoria' ? service('pt/consultoria', { relatedArticles: ['publicado', 'rascunho', 'inexistente'] }) : entry,
    );
    const articles = [article('pt/publicado', 'publicado'), article('pt/rascunho', 'rascunho', true)];

    // Act
    const problems = problemsOf(services, articles);

    // Assert
    expect(problems).toEqual([
      'pt/consultoria: artigo relacionado "rascunho" não está publicado em pt',
      'pt/consultoria: artigo relacionado "inexistente" não está publicado em pt',
    ]);
  });
});

describe('servicesFor e serviceFor', () => {
  it('deve listar os serviços do idioma na ordem definida quando recebe todos', () => {
    // Arrange
    const services = [...complete].reverse();

    // Act
    const ids = servicesFor(services, 'en').map((entry) => entry.id);

    // Assert
    expect(ids).toEqual(['en/consultoria', 'en/mentoria', 'en/palestras']);
  });

  it('deve encontrar o serviço pela chave e idioma quando ele existe', () => {
    // Arrange
    const services = complete;

    // Act
    const found = serviceFor(services, 'palestras', 'en');

    // Assert
    expect(found.id).toBe('en/palestras');
  });
});

describe('relatedArticlesFor', () => {
  it('deve devolver os artigos publicados do idioma na ordem do serviço quando há relacionados', () => {
    // Arrange
    const entry = service('en/consultoria', { relatedArticles: ['b', 'a', 'rascunho'] });
    const articles = [article('en/a', 'a'), article('en/b', 'b'), article('pt/b', 'b'), article('en/r', 'rascunho', true)];

    // Act
    const related = relatedArticlesFor(entry, articles).map((item) => item.id);

    // Assert
    expect(related).toEqual(['en/b', 'en/a']);
  });
});
