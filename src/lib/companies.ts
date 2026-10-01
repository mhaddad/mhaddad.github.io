// Empresas e organizações (src/content/companies/companies.yaml).

export const companyGroups = ['founded', 'board'] as const;
export type CompanyGroup = (typeof companyGroups)[number];

export interface CompanyData {
  order: number;
  group: CompanyGroup;
  year?: number;
}

export interface CompanyEntry<TData extends CompanyData = CompanyData> {
  id: string;
  data: TData;
}

export class CompanyValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Empresas inválidas:\n- ${problems.join('\n- ')}`);
    this.name = 'CompanyValidationError';
  }
}

/** `masks`: IDs com máscara monocromática em src/assets/companies/mono/. */
export function validateCompanies(companies: CompanyEntry[], masks: Set<string>): void {
  const problems: string[] = [];

  for (const { id, data } of sortCompanies(companies)) {
    if (data.group === 'founded' && data.year === undefined) problems.push(`${id}: empresa cofundada precisa de year`);
    if (!masks.has(id)) problems.push(`${id}: falta a máscara src/assets/companies/mono/${id}.png (rode npm run assets)`);
  }

  if (problems.length > 0) throw new CompanyValidationError(problems);
}

export function sortCompanies<T extends CompanyEntry>(companies: T[]): T[] {
  return [...companies].sort((a, b) => a.data.order - b.data.order);
}

export function companiesByGroup<T extends CompanyEntry>(companies: T[]): Record<CompanyGroup, T[]> {
  const sorted = sortCompanies(companies);
  return {
    founded: sorted.filter((company) => company.data.group === 'founded'),
    board: sorted.filter((company) => company.data.group === 'board'),
  };
}
