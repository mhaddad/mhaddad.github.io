export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export const MIN_TOC_ITEMS = 2;

export function tocItems(headings: Heading[]): Heading[] {
  const sections = headings.filter((heading) => heading.depth === 2);
  return sections.length >= MIN_TOC_ITEMS ? sections : [];
}
