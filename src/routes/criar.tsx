import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MESSAGE } from "@/components/BirthdayLetter";
import {
  COLORS,
  STYLES,
  THEMES,
  type ColorId,
  type StyleId,
  type ThemeId,
} from "@/lib/letter-search";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Personalizar carta de aniversário" },
      {
        name: "description",
        content:
          "Escreva o nome, a mensagem e a assinatura da sua carta de aniversário e compartilhe o link.",
      },
      { property: "og:title", content: "Personalizar carta de aniversário" },
      {
        property: "og:description",
        content: "Crie sua carta de aniversário personalizada e compartilhe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Criar,
});

function Criar() {
  const [para, setPara] = useState("");
  const [de, setDe] = useState("Com todo carinho, ♥");
  const [msg, setMsg] = useState(DEFAULT_MESSAGE);
  const [cor, setCor] = useState<ColorId>("rose");
  const [estilo, setEstilo] = useState<StyleId>("classico");
  const [tema, setTema] = useState<ThemeId>("confetes");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);

  const search = {
    para: para.trim() || undefined,
    de: de.trim() || undefined,
    msg: msg.trim() || undefined,
    cor,
    estilo,
    tema,
  };
  const link = useMemo(() => {
    const q = new URLSearchParams();
    if (search.para) q.set("para", search.para);
    if (search.de) q.set("de", search.de);
    if (search.msg) q.set("msg", search.msg);
    q.set("cor", cor);
    q.set("estilo", estilo);
    q.set("tema", tema);
    return `${origin}/?${q.toString()}`;
  }, [origin, search.para, search.de, search.msg, cor, estilo, tema]);

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
