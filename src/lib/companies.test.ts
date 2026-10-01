import { describe, expect, it } from 'vitest';
import { CompanyValidationError, companiesByGroup, validateCompanies, type CompanyEntry } from './companies';

function company(id: string, data: Partial<CompanyEntry['data']> = {}): CompanyEntry {
  return { id, data: { order: 1, group: 'founded', year: 2008, ...data } };
}

describe('validateCompanies', () => {
  it('deve aceitar as empresas quando cada uma tem máscara e as cofundadas têm ano', () => {
    // Arrange
    const companies = [company('webgoal'), company('tugagil', { order: 2, group: 'board', year: undefined })];

    // Act
    const run = () => validateCompanies(companies, new Set(['webgoal', 'tugagil']));

    // Assert
    expect(run).not.toThrow();
  });

  it('deve listar os problemas quando falta o ano numa cofundada ou falta a máscara', () => {
    // Arrange
    const companies = [company('webgoal', { year: undefined }), company('granatum', { order: 2 })];

    // Act
    const run = () => validateCompanies(companies, new Set(['webgoal']));

    // Assert
    expect(run).toThrow(CompanyValidationError);
    try {
      run();
    } catch (error) {
      const { problems } = error as CompanyValidationError;
      expect(problems).toEqual([
        'webgoal: empresa cofundada precisa de year',
        'granatum: falta a máscara src/assets/companies/mono/granatum.png (rode npm run assets)',
      ]);
    }
  });
});

describe('companiesByGroup', () => {
  it('deve separar cofundadas e conselhos na ordem quando recebe a lista misturada', () => {
    // Arrange
    const companies = [
      company('tugagil', { order: 8, group: 'board' }),
      company('granatum', { order: 2 }),
      company('alianca', { order: 6, group: 'board' }),
      company('webgoal', { order: 1 }),
    ];

    // Act
    const groups = companiesByGroup(companies);

    // Assert
    expect(groups.founded.map((entry) => entry.id)).toEqual(['webgoal', 'granatum']);
    expect(groups.board.map((entry) => entry.id)).toEqual(['alianca', 'tugagil']);
  });
});
