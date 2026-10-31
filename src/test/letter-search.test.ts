import { describe, expect, it } from "vitest";
import { parseLetterSearch } from "@/lib/letter-search";

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
});
