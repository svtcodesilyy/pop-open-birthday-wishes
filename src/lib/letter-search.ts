import { deflateSync, inflateSync } from "fflate";
import { DEFAULT_MESSAGE, DEFAULT_SIGNATURE } from "@/lib/default-message";

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
  c?: string | undefined;
  para?: string | undefined;
  de?: string | undefined;
  msg?: string | undefined;
  cor?: ColorId | undefined;
  estilo?: StyleId | undefined;
  tema?: ThemeId | undefined;
};

const SEARCH_FIELDS = ["para", "de", "msg", "cor", "estilo", "tema"] as const;

function pick<T extends readonly { id: string }[]>(
  list: T,
  v: unknown,
): T[number]["id"] | undefined {
  return list.find((o) => o.id === v)?.id;
}

function expandCompactSearch(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "string" || value.length > 12000 || !/^[\w-]+$/.test(value))
    return undefined;

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder().decode(inflateSync(bytes, { out: new Uint8Array(10000) }));
    const compact: unknown = JSON.parse(decoded);
    if (!Array.isArray(compact) || compact.length !== SEARCH_FIELDS.length) return undefined;

    return Object.fromEntries(
      SEARCH_FIELDS.map((field, index) => {
        const fieldValue = compact[index];
        if (field === "cor" || field === "estilo" || field === "tema") {
          const options = field === "cor" ? COLORS : field === "estilo" ? STYLES : THEMES;
          return [field, typeof fieldValue === "number" ? options[fieldValue - 1]?.id : undefined];
        }
        return [field, fieldValue];
      }),
    );
  } catch {
    return undefined;
  }
}

export function parseLetterSearch(search: Record<string, unknown>): LetterSearch {
  const compact = expandCompactSearch(search["c"]);
  const source = compact ?? search;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.slice(0, 3000) : undefined);
  return {
    c: compact && typeof search["c"] === "string" ? search["c"] : undefined,
    para: str(source["para"]),
    de: str(source["de"]),
    msg: str(source["msg"]),
    cor: pick(COLORS, source["cor"]),
    estilo: pick(STYLES, source["estilo"]),
    tema: pick(THEMES, source["tema"]),
  };
}

export function encodeLetterSearch(search: LetterSearch): string {
  const compact = [
    search.para ?? "",
    search.de === DEFAULT_SIGNATURE ? "" : (search.de ?? ""),
    search.msg === DEFAULT_MESSAGE ? "" : (search.msg ?? ""),
    search.cor && search.cor !== COLORS[0].id
      ? COLORS.findIndex((option) => option.id === search.cor) + 1
      : 0,
    search.estilo && search.estilo !== STYLES[0].id
      ? STYLES.findIndex((option) => option.id === search.estilo) + 1
      : 0,
    search.tema && search.tema !== THEMES[0].id
      ? THEMES.findIndex((option) => option.id === search.tema) + 1
      : 0,
  ];
  const compressed = deflateSync(new TextEncoder().encode(JSON.stringify(compact)), { level: 9 });
  let binary = "";
  for (let index = 0; index < compressed.length; index += 0x8000) {
    binary += String.fromCharCode(...compressed.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
