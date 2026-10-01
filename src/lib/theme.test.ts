import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import {
  ACCENTS,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  bootTheme,
  themeBootScript,
} from './theme';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    data,
  };
}

const blocked = () => {
  throw new Error('SecurityError');
};

function run(local: () => ReturnType<typeof memoryStorage>, session: () => ReturnType<typeof memoryStorage>, random = 0) {
  const root = { dataset: {} as Record<string, string | undefined> };
  bootTheme(root, local, session, () => random);
  return root.dataset;
}

describe('bootTheme', () => {
  it('deve usar o tema escuro quando não há escolha salva', () => {
    // Arrange
    const local = memoryStorage();

    // Act
    const dataset = run(() => local, () => memoryStorage());

    // Assert
    expect(dataset.theme).toBe('dark');
    expect(DEFAULT_THEME).toBe('dark');
  });

  it('deve respeitar o tema salvo quando o visitante escolheu o claro', () => {
    // Arrange
    const local = memoryStorage({ [THEME_STORAGE_KEY]: 'light' });

    // Act
    const dataset = run(() => local, () => memoryStorage());

    // Assert
    expect(dataset.theme).toBe('light');
  });

  it('deve ignorar valor salvo inválido quando o armazenamento foi adulterado', () => {
    // Arrange
    const local = memoryStorage({ [THEME_STORAGE_KEY]: 'roxo' });

    // Act
    const dataset = run(() => local, () => memoryStorage());

    // Assert
    expect(dataset.theme).toBe('dark');
  });

  it('deve sortear uma das 4 cores e guardá-la quando é a primeira página da visita', () => {
    // Arrange
    const session = memoryStorage();

    // Act
    const dataset = run(() => memoryStorage(), () => session, 0.6);

    // Assert
    expect(dataset.accent).toBe('blue');
    expect(session.data.get(ACCENT_STORAGE_KEY)).toBe('blue');
  });

  it('deve manter a cor da visita quando o visitante navega para outra página', () => {
    // Arrange
    const session = memoryStorage({ [ACCENT_STORAGE_KEY]: 'orange' });

    // Act
    const dataset = run(() => memoryStorage(), () => session, 0);

    // Assert
    expect(dataset.accent).toBe('orange');
  });

  it('deve cobrir as 4 cores quando o sorteio percorre todo o intervalo', () => {
    // Arrange
    const randoms = [0, 0.25, 0.5, 0.75, 0.9999];

    // Act
    const accents = randoms.map((r) => run(() => memoryStorage(), () => memoryStorage(), r).accent);

    // Assert
    expect(accents).toEqual(['green', 'yellow', 'blue', 'orange', 'orange']);
    expect([...ACCENTS]).toEqual(['green', 'yellow', 'blue', 'orange']);
  });

  it('deve funcionar com tema padrão e cor sorteada quando o armazenamento está bloqueado', () => {
    // Arrange
    const local = blocked as never;
    const session = blocked as never;

    // Act
    const dataset = run(local, session, 0.3);

    // Assert
    expect(dataset).toEqual({ theme: 'dark', accent: 'yellow' });
    expect(DEFAULT_ACCENT).toBe('green');
  });
});

describe('themeBootScript', () => {
  it('deve rodar sozinho no navegador quando é injetado como script inline', () => {
    // Arrange
    const documentElement = { dataset: {} as Record<string, string> };
    const context = {
      document: { documentElement },
      localStorage: memoryStorage({ [THEME_STORAGE_KEY]: 'light' }),
      sessionStorage: memoryStorage(),
      Math: Object.assign(Object.create(Math), { random: () => 0 }),
    };

    // Act
    runInNewContext(themeBootScript(), context);

    // Assert
    expect(documentElement.dataset).toEqual({ theme: 'light', accent: 'green' });
  });
});
