import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TONES, type ToneId } from "@/lib/message-tones";
import { DEFAULT_MESSAGE } from "@/components/BirthdayLetter";
import { COLORS, STYLES, THEMES, type ColorId, type StyleId, type ThemeId } from "@/lib/letter-search";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Personalizar carta de aniversário" },
      { name: "description", content: "Escreva o nome, a mensagem e a assinatura da sua carta de aniversário e compartilhe o link." },
      { property: "og:title", content: "Personalizar carta de aniversário" },
      { property: "og:description", content: "Crie sua carta de aniversário personalizada e compartilhe." },
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
  const [interests, setInterests] = useState("");
  const [tone, setTone] = useState<ToneId>("carinhoso");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    setAiError("");
    if (!para.trim()) return setAiError("Escreva o nome do aniversariante primeiro.");
    if (!interests.trim()) return setAiError("Conte pelo menos um interesse da pessoa.");
    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);
    const previous = msg;
    try {
      const res = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: para, interests, tone }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setAiError(data?.error ?? "Não foi possível gerar a mensagem agora.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      setMsg("");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMsg(text);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAiError("A conexão caiu durante a geração. Tente de novo.");
      }
      setMsg((m) => (m.trim() ? m : previous));
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };
  useEffect(() => setOrigin(window.location.origin), []);

  const search = { para: para.trim() || undefined, de: de.trim() || undefined, msg: msg.trim() || undefined, cor, estilo, tema };
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
    } catch { /* user cancelled share */ return; }
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
          <input className="editor-input" value={para} onChange={(e) => setPara(e.target.value)} placeholder="Ex.: Maria" maxLength={60} />
        </label>
        <section className="ai-panel" aria-label="Escrever com IA">
          <div className="ai-panel-head">
            <span className="ai-panel-title">✨ Escrever com IA</span>
            <span className="editor-hint">Conte do que a pessoa gosta e escolha o tom.</span>
          </div>
          <label className="editor-label">
            Interesses
            <textarea
              className="editor-input"
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Ex.: ama gatos, café, viajar para a praia e séries de comédia"
              maxLength={500}
            />
          </label>
          <div className="editor-group">
            <span className="editor-group-title">Tom da mensagem</span>
            <div className="editor-options">
              {TONES.map((o) => (
                <button key={o.id} type="button" className="editor-option" aria-pressed={tone === o.id} onClick={() => setTone(o.id)}>
                  <span aria-hidden>{o.icon}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="editor-actions">
            {generating ? (
              <button type="button" className="editor-btn editor-btn-ghost" onClick={() => abortRef.current?.abort()}>
                Parar
              </button>
            ) : (
              <button type="button" className="editor-btn editor-btn-primary" onClick={generate}>
                {msg === DEFAULT_MESSAGE ? "Gerar mensagem" : "Gerar nova mensagem"}
              </button>
            )}
          </div>
          {generating && <p className="ai-status">Escrevendo sua mensagem…</p>}
          {aiError && <p className="ai-error" role="alert">{aiError}</p>}
        </section>
        <label className="editor-label">
          Texto da carta <span className="editor-hint">Deixe uma linha em branco para separar parágrafos.</span>
          <textarea className="editor-input" rows={9} value={msg} readOnly={generating} onChange={(e) => setMsg(e.target.value)} maxLength={2000} />
        </label>
        <label className="editor-label">
          Assinatura
          <input className="editor-input" value={de} onChange={(e) => setDe(e.target.value)} placeholder="Ex.: Com amor, João" maxLength={80} />
        </label>
        <div className="editor-group">
          <span className="editor-group-title">Cores</span>
          <div className="editor-options">
            {COLORS.map((o) => (
              <button key={o.id} type="button" className="editor-option" aria-pressed={cor === o.id} onClick={() => setCor(o.id)}>
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
              <button key={o.id} type="button" className="editor-option" aria-pressed={estilo === o.id} onClick={() => setEstilo(o.id)} title={o.hint}>
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
              <button key={o.id} type="button" className="editor-option" aria-pressed={tema === o.id} onClick={() => setTema(o.id)}>
                <span aria-hidden>{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-actions">
          <Link to="/" search={search} className="editor-btn editor-btn-ghost">Ver prévia</Link>
          <button type="button" onClick={copy} className="editor-btn editor-btn-primary">
            {copied ? "Link copiado! ✓" : "Compartilhar link"}
          </button>
        </div>
        {origin && <p className="editor-link">{link}</p>}
      </div>
    </main>
  );
}
