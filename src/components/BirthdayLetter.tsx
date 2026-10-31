import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  playMelody,
  playPaperRustle,
  playSealCrack,
  playSparkle,
  playThud,
  setMuted,
  stopMelody,
} from "@/lib/sounds";

type Confetto = { id: number; left: number; delay: number; duration: number; color: number; size: number; rotate: number; shape: "rect" | "circle" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DEFAULT_MESSAGE = `Hoje o mundo ficou um pouquinho mais bonito, porque é o dia de celebrar você.

Que este novo ano venha cheio de sorrisos sinceros, abraços apertados, sonhos realizados e momentos que valham a pena guardar para sempre.

Obrigado por ser essa pessoa tão especial. Você merece todo o amor e toda a felicidade do mundo.`;

type Props = { name?: string; signature?: string; message?: string; showEditLink?: boolean };

export function BirthdayLetter({ name, signature, message, showEditLink }: Props) {
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
      Array.from({ length: 90 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 3 + Math.random() * 3,
        color: (i % 5) + 1,
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      })),
    );
    timers.current.push(window.setTimeout(() => playMelody(), 700));
    timers.current.push(window.setTimeout(() => setConfetti([]), 7000));
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
    <main className="scene">
      <div className="scene-glow" aria-hidden />
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="floater"
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 1.3) % 9}s`, animationDuration: `${9 + (i % 5) * 2}s`, fontSize: `${12 + (i % 4) * 6}px` }}
        >
          {i % 3 === 0 ? "♥" : "✦"}
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
          <div className="env-flap" />
          <div className="env-seal" aria-hidden>
            <span>♥</span>
          </div>
        </div>

        <p className="hint hint-small">{flapOpen ? "\u00a0" : "Toque no selo para abrir"}</p>
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
            {signature?.trim() || "Com todo carinho, ♥"}
          </p>
          <button className="letter-close" onClick={close} tabIndex={reading ? 0 : -1}>
            Guardar a carta
          </button>
        </article>
      </div>

      <div className="confetti-layer" aria-hidden>
        {confetti.map((c) => (
          <span
            key={c.id}
            className={`confetto confetto-${c.color} ${c.shape === "circle" ? "is-circle" : ""}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.shape === "circle" ? c.size : c.size * 0.45,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}
      </div>
    </main>
  );
}
