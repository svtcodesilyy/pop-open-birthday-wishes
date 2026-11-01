import { createFileRoute } from "@tanstack/react-router";
import { BirthdayLetter } from "@/components/BirthdayLetter";
import { parseLetterSearch } from "@/lib/letter-search";

export const Route = createFileRoute("/")({
  validateSearch: parseLetterSearch,
  component: Index,
});

function Index() {
  const { c, para, de, msg, cor, estilo, tema } = Route.useSearch();
  const shared = Boolean(c || para || de || msg || cor || estilo || tema);
  return (
    <BirthdayLetter
      name={para}
      signature={de}
      message={msg}
      color={cor}
      envelopeStyle={estilo}
      theme={tema}
      showEditLink={!shared}
    />
  );
}
