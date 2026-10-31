export type LetterSearch = { para?: string; de?: string; msg?: string };

export function parseLetterSearch(search: Record<string, unknown>): LetterSearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.slice(0, 3000) : undefined);
  return { para: str(search.para), de: str(search.de), msg: str(search.msg) };
}
