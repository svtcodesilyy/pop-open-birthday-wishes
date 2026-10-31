import { createFileRoute } from "@tanstack/react-router";
import { BirthdayLetter } from "@/components/BirthdayLetter";
import { parseLetterSearch } from "@/lib/letter-search";

export const Route = createFileRoute("/")({
  validateSearch: parseLetterSearch,
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
  component: Index,
});

function Index() {
  const { para, de, msg } = Route.useSearch();
  const shared = Boolean(para || de || msg);
  return <BirthdayLetter name={para} signature={de} message={msg} showEditLink={!shared} />;
}
