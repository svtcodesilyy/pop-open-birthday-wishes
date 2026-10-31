import { createFileRoute } from "@tanstack/react-router";
import { BirthdayLetter } from "@/components/BirthdayLetter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uma carta para você — Feliz Aniversário" },
      { name: "description", content: "Abra a carta e receba uma mensagem especial de feliz aniversário, com música e confetes." },
      { property: "og:title", content: "Uma carta para você — Feliz Aniversário" },
      { property: "og:description", content: "Abra a carta e receba uma mensagem especial de feliz aniversário." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BirthdayLetter,
});
