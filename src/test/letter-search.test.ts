import { describe, expect, it } from "vitest";
import { DEFAULT_MESSAGE, DEFAULT_SIGNATURE } from "@/lib/default-message";
import { encodeLetterSearch, parseLetterSearch } from "@/lib/letter-search";

describe("parseLetterSearch", () => {
  it("keeps valid color, envelope style and animation theme", () => {
    const r = parseLetterSearch({ cor: "oceano", estilo: "laco", tema: "baloes" });
    expect(r).toMatchObject({ cor: "oceano", estilo: "laco", tema: "baloes" });
  });

  it("ignores unknown options so the default look is used", () => {
    const r = parseLetterSearch({ cor: "roxo", estilo: "x", tema: 3 });
    expect(r.cor).toBeUndefined();
    expect(r.estilo).toBeUndefined();
    expect(r.tema).toBeUndefined();
  });

  it("round-trips a compact shared letter link", () => {
    const letter = {
      para: "Maria",
      de: "Com carinho, João",
      msg: "Hoje é um dia especial!\n\nQue seu aniversário seja cheio de alegria.",
      cor: "oceano",
      estilo: "laco",
      tema: "baloes",
    } as const;

    expect(parseLetterSearch({ c: encodeLetterSearch(letter) })).toMatchObject(letter);
  });

  it("ignores malformed compact data", () => {
    expect(parseLetterSearch({ c: "invalid-data" })).toEqual({});
  });

  it("omits the built-in message from compact links", () => {
    const compact = encodeLetterSearch({
      de: DEFAULT_SIGNATURE,
      msg: DEFAULT_MESSAGE,
      cor: "rose",
      estilo: "classico",
      tema: "confetes",
    });

    expect(compact.length).toBeLessThan(80);
    expect(parseLetterSearch({ c: compact })).toMatchObject({ c: compact });
    expect(parseLetterSearch({ c: compact }).msg).toBeUndefined();
  });
});
