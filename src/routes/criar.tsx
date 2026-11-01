import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MESSAGE, DEFAULT_SIGNATURE } from "@/lib/default-message";
import {
  COLORS,
  STYLES,
  THEMES,
  encodeLetterSearch,
  type ColorId,
  type StyleId,
  type ThemeId,
} from "@/lib/letter-search";

export const Route = createFileRoute("/criar")({
  component: Criar,
});

function Criar() {
  const [para, setPara] = useState("");
  const [de, setDe] = useState(DEFAULT_SIGNATURE);
  const [msg, setMsg] = useState(DEFAULT_MESSAGE);
  const [cor, setCor] = useState<ColorId>("rose");
  const [estilo, setEstilo] = useState<StyleId>("classico");
  const [tema, setTema] = useState<ThemeId>("confetes");
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setBaseUrl(`${window.location.origin}${window.location.pathname}`), []);

  const search = {
    para: para.trim() || undefined,
    de: de.trim() || undefined,
    msg: msg.trim() || undefined,
    cor,
    estilo,
    tema,
  };
  const compactSearch = useMemo(
    () =>
      encodeLetterSearch({
        para: para.trim() || undefined,
        de: de.trim() || undefined,
        msg: msg.trim() || undefined,
        cor,
        estilo,
        tema,
      }),
    [para, de, msg, cor, estilo, tema],
  );
  const link = `${baseUrl}#/?c=${compactSearch}`;

  const copy = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Uma carta para você 💌", url: link });
        return;
      }
    } catch {
      /* user cancelled share */ return;
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="editor" data-color={cor}>
      <div className="editor-card">
        <h1 className="editor-title">Personalize sua carta</h1>
        <label className="editor-label">
          Nome do aniversariante
          <input
            className="editor-input"
            value={para}
            onChange={(e) => setPara(e.target.value)}
            placeholder="Ex.: Maria"
            maxLength={60}
          />
        </label>
        <label className="editor-label">
          Texto da carta{" "}
          <span className="editor-hint">Deixe uma linha em branco para separar parágrafos.</span>
          <textarea
            className="editor-input"
            rows={9}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            maxLength={2000}
          />
        </label>
        <label className="editor-label">
          Assinatura
          <input
            className="editor-input"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            placeholder="Ex.: Com amor, João"
            maxLength={80}
          />
        </label>
        <div className="editor-group">
          <span className="editor-group-title">Cores</span>
          <div className="editor-options">
            {COLORS.map((o) => (
              <button
                key={o.id}
                type="button"
                className="editor-option"
                aria-pressed={cor === o.id}
                onClick={() => setCor(o.id)}
              >
                <span className="editor-swatch" data-color={o.id} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-group">
          <span className="editor-group-title">Estilo do envelope</span>
          <div className="editor-options">
            {STYLES.map((o) => (
              <button
                key={o.id}
                type="button"
                className="editor-option"
                aria-pressed={estilo === o.id}
                onClick={() => setEstilo(o.id)}
                title={o.hint}
              >
                <span aria-hidden>{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-group">
          <span className="editor-group-title">Tema das animações</span>
          <div className="editor-options">
            {THEMES.map((o) => (
              <button
                key={o.id}
                type="button"
                className="editor-option"
                aria-pressed={tema === o.id}
                onClick={() => setTema(o.id)}
              >
                <span aria-hidden>{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-actions">
          <Link to="/" search={search} className="editor-btn editor-btn-ghost">
            Ver prévia
          </Link>
          <button type="button" onClick={copy} className="editor-btn editor-btn-primary">
            {copied ? "Link copiado! ✓" : "Compartilhar link"}
          </button>
        </div>
      </div>
    </main>
  );
}
