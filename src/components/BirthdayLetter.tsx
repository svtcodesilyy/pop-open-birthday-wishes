import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DEFAULT_MESSAGE, DEFAULT_SIGNATURE } from "@/lib/default-message";
import {
  playMelody,
  playPaperRustle,
  playSealCrack,
  playSparkle,
  playThud,
  setMuted,
  stopMelody,
} from "@/lib/sounds";
import type { ColorId, StyleId, ThemeId } from "@/lib/letter-search";

type Confetto = { id: number; left: number; delay: number; duration: number; color: number; size: number; rotate: number; shape: "rect" | "circle" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export { DEFAULT_MESSAGE };

type Props = {
  name?: string | undefined;
  signature?: string | undefined;
  message?: string | undefined;
  color?: ColorId | undefined;
  envelopeStyle?: StyleId | undefined;
  theme?: ThemeId | undefined;
  showEditLink?: boolean;
};

const FLOATERS: Record<ThemeId, string[]> = {
  confetes: ["♥", "✦", "✦"],
  coracoes: ["♥", "♡", "♥"],
  estrelas: ["✦", "✧", "⋆"],
  baloes: ["○", "♥", "✦"],
};
const PARTICLE_COUNT: Record<ThemeId, number> = { confetes: 90, coracoes: 45, estrelas: 60, baloes: 22 };

export function BirthdayLetter({
  name,
  signature,
  message,
  color = "rose",
  envelopeStyle = "classico",
  theme = "confetes",
  showEditLink,
}: Props) {
  const paragraphs = (message?.trim() || DEFAULT_MESSAGE).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const [flapOpen, setFlapOpen] = useState(false);
  const [letterUp, setLetterUp] = useState(false);
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [confetti, setConfetti] = useState<Confetto[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = async () => {
    if (busy || flapOpen) return;
    setBusy(true);
    playSealCrack();
    await wait(150);
    playPaperRustle(0.6);
    setFlapOpen(true);
    await wait(750);
    playPaperRustle(0.9, 0.18);
    setLetterUp(true);
    await wait(1100);
    setReading(true);
    playSparkle();
    setConfetti(
      Array.from({ length: PARTICLE_COUNT[theme] }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: theme === "baloes" ? 6 + Math.random() * 4 : theme === "estrelas" ? 4 + Math.random() * 4 : 3 + Math.random() * 3,
        color: (i % 5) + 1,
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      })),
    );
    timers.current.push(window.setTimeout(() => playMelody(), 700));
    timers.current.push(window.setTimeout(() => setConfetti([]), theme === "baloes" ? 12000 : 9000));
    setBusy(false);
  };

  const close = async () => {
    if (busy) return;
    setBusy(true);
    stopMelody();
    playPaperRustle(0.5, 0.16);
    setReading(false);
    setConfetti([]);
    await wait(600);
    playPaperRustle(0.8, 0.16);
    setLetterUp(false);
    await wait(900);
    setFlapOpen(false);
    await wait(550);
    playThud();
    setBusy(false);
  };

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  };

  return (
    <main className="scene" data-color={color} data-theme={theme}>
      <div className="scene-glow" aria-hidden />
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="floater"
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 1.3) % 9}s`, animationDuration: `${9 + (i % 5) * 2}s`, fontSize: `${12 + (i % 4) * 6}px` }}
        >
          {FLOATERS[theme][i % 3]}
        </span>
      ))}

      {showEditLink && (
        <Link to="/criar" className="edit-link">✎ Personalizar carta</Link>
      )}

      <button onClick={toggleMute} className="sound-toggle" aria-label={muted ? "Ligar som" : "Desligar som"}>
        {muted ? "🔇" : "🔊"}
      </button>

      <div className={`stage ${reading ? "is-reading" : ""}`}>
        <p className="hint">{flapOpen ? "\u00a0" : "Você recebeu uma carta…"}</p>

        <div
          className="envelope"
          data-style={envelopeStyle}
          data-flap={flapOpen ? "open" : "closed"}
          data-letter={letterUp ? "up" : "down"}
          onClick={open}
          role="button"
          tabIndex={0}
          aria-label="Abrir a carta"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
        >
          <div className="env-back" />
          <div className="env-letter">
            <span className="env-letter-title">{name?.trim() ? `Para ${name.trim()}` : "Para você"}</span>
            <span className="env-letter-lines" />
          </div>
          <div className="env-front" />
          {envelopeStyle === "correio" && (
            <>
              <div className="env-airmail" aria-hidden />
              <div className="env-stamp" aria-hidden>
                <span>♥</span>
              </div>
            </>
          )}
          <div className="env-flap" />
          {envelopeStyle === "laco" ? (
            <div className="env-ribbon" aria-hidden>
              <span className="env-ribbon-h" />
              <span className="env-ribbon-v" />
              <span className="env-bow">
                <span className="env-bow-loop is-left" />
                <span className="env-bow-loop is-right" />
                <span className="env-bow-knot" />
              </span>
            </div>
          ) : (
            <div className="env-seal" aria-hidden>
              <span>♥</span>
            </div>
          )}
        </div>

        <p className="hint hint-small">{flapOpen ? "\u00a0" : envelopeStyle === "laco" ? "Toque no laço para abrir" : "Toque no selo para abrir"}</p>
      </div>

      <div className={`letter-overlay ${reading ? "is-open" : ""}`} aria-hidden={!reading}>
        <article className="letter-paper">
          <div className="letter-ornament">✦ ✦ ✦</div>
          <h1 className="letter-title">Feliz Aniversário!</h1>
          {name?.trim() && <p className="letter-name">{name.trim()}</p>}
          <div className="letter-body">
            {paragraphs.map((p, i) => (
              <p key={i} style={{ animationDelay: `${1.1 + i * 0.4}s` }}>{p}</p>
            ))}
          </div>
          <p className="letter-sign" style={{ animationDelay: `${1.3 + paragraphs.length * 0.4}s` }}>
            {signature?.trim() || DEFAULT_SIGNATURE}
          </p>
          <button className="letter-close" onClick={close} tabIndex={reading ? 0 : -1}>
            Guardar a carta
          </button>
        </article>
      </div>

      <div className="confetti-layer" aria-hidden>
        {confetti.map((c) => {
          const base = { left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s` };
          if (theme === "confetes")
            return (
              <span
                key={c.id}
                className={`particle confetto c-${c.color} ${c.shape === "circle" ? "is-circle" : ""}`}
                style={{ ...base, width: c.size, height: c.shape === "circle" ? c.size : c.size * 0.45, rotate: `${c.rotate}deg` }}
              />
            );
          if (theme === "baloes")
            return (
              <span key={c.id} className={`particle balloon c-${c.color}`} style={{ ...base, width: c.size * 3.2, height: c.size * 3.9 }} />
            );
          return (
            <span key={c.id} className={`particle glyph is-${theme} c-${c.color}`} style={{ ...base, fontSize: c.size * 2 }}>
              {theme === "coracoes" ? (c.shape === "circle" ? "♥" : "❤") : c.shape === "circle" ? "✦" : "★"}
            </span>
          );
        })}
      </div>
    </main>
  );
}
