export const COLORS = [
  { id: "rose", label: "Rosé" },
  { id: "oceano", label: "Oceano" },
  { id: "floresta", label: "Floresta" },
  { id: "champanhe", label: "Champanhe" },
] as const;

export const STYLES = [
  { id: "classico", label: "Clássico", icon: "✉︎", hint: "Selo de cera" },
  { id: "correio", label: "Correio", icon: "✈︎", hint: "Bordas listradas e selo postal" },
  { id: "laco", label: "Laço", icon: "🎀", hint: "Fita de presente" },
] as const;

export const THEMES = [
  { id: "confetes", label: "Confetes", icon: "🎊" },
  { id: "coracoes", label: "Corações", icon: "♥" },
  { id: "estrelas", label: "Estrelas", icon: "✦" },
  { id: "baloes", label: "Balões", icon: "🎈" },
] as const;

export type ColorId = (typeof COLORS)[number]["id"];
export type StyleId = (typeof STYLES)[number]["id"];
export type ThemeId = (typeof THEMES)[number]["id"];

export type LetterSearch = {
  para?: string | undefined;
  de?: string | undefined;
  msg?: string | undefined;
  cor?: ColorId | undefined;
  estilo?: StyleId | undefined;
  tema?: ThemeId | undefined;
};

function pick<T extends readonly { id: string }[]>(list: T, v: unknown): T[number]["id"] | undefined {
  return list.find((o) => o.id === v)?.id;
}

export function parseLetterSearch(search: Record<string, unknown>): LetterSearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.slice(0, 3000) : undefined);
  return {
    para: str(search["para"]),
    de: str(search["de"]),
    msg: str(search["msg"]),
    cor: pick(COLORS, search["cor"]),
    estilo: pick(STYLES, search["estilo"]),
    tema: pick(THEMES, search["tema"]),
  };
}
