import { createFileRoute } from "@tanstack/react-router";
import { handleGenerateMessage } from "@/lib/ai/birthday-message.server";

export const Route = createFileRoute("/api/generate-message")({
  server: { handlers: { POST: ({ request }) => handleGenerateMessage(request) } },
});
