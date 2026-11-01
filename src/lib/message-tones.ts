export const TONES = [
  { id: "carinhoso", label: "Carinhoso", icon: "♡", prompt: "afetuoso, acolhedor e sincero" },
  { id: "divertido", label: "Divertido", icon: "😄", prompt: "bem-humorado, leve e brincalhão, com piadinhas gentis" },
  { id: "emocionante", label: "Emocionante", icon: "🥹", prompt: "profundo, tocante e emotivo" },
  { id: "poetico", label: "Poético", icon: "✒︎", prompt: "lírico, com imagens bonitas e ritmo de poesia em prosa" },
  { id: "formal", label: "Formal", icon: "🎩", prompt: "respeitoso, elegante e cordial, adequado para colegas ou chefes" },
] as const;

export type ToneId = (typeof TONES)[number]["id"];
export type GenerateMessageInput = { name: string; interests: string; tone: ToneId };
