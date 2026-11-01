import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.ts";
import { TONES, type GenerateMessageInput } from "../message-tones";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `Você escreve cartas de aniversário em português do Brasil.
Regras:
- Escreva de 3 a 4 parágrafos curtos, separados por uma linha em branco.
- Fale diretamente com a pessoa aniversariante (use "você").
- Mencione os interesses dela de forma natural e criativa, sem listar.
- Não escreva título, saudação inicial do tipo "Querido(a)", nem assinatura no final: o app já mostra isso.
- Não use markdown, asteriscos, hashtags ou emojis em excesso (no máximo um ou dois emojis, só se combinar com o tom).
- Responda somente com o texto da carta.`;

function friendlyError(status: number | undefined): { status: number; message: string } {
  if (status === 429) return { status, message: "Muitos pedidos ao mesmo tempo. Espere alguns segundos e tente de novo." };
  if (status === 402) return { status, message: "Os créditos de IA acabaram. Adicione créditos ao seu espaço de trabalho para continuar gerando mensagens." };
  if (status === 403) return { status, message: "A geração com IA não está disponível no momento para este app." };
  if (status === 400) return { status, message: "Não foi possível gerar com essas informações. Tente encurtar os interesses." };
  return { status: status && status >= 500 ? 502 : 500, message: "A IA não respondeu agora. Tente de novo em instantes." };
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function handleGenerateMessage(request: Request): Promise<Response> {
  let input: GenerateMessageInput;
  try {
    input = (await request.json()) as GenerateMessageInput;
  } catch {
    return json({ error: "Pedido inválido." }, 400);
  }
  const name = String(input?.name ?? "").trim().slice(0, 60);
  const interests = String(input?.interests ?? "").trim().slice(0, 500);
  const tone = TONES.find((t) => t.id === input?.tone) ?? TONES[0];
  if (!name) return json({ error: "Escreva o nome do aniversariante." }, 400);
  if (!interests) return json({ error: "Conte pelo menos um interesse da pessoa." }, 400);

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json({ error: "A IA ainda não está configurada neste app." }, 500);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: `Nome do aniversariante: ${name}\nInteresses e coisas que a pessoa ama: ${interests}\nTom desejado: ${tone.label} — ${tone.prompt}`,
      },
    ],
    maxRetries: 0,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  // Read until the first text (or error) before sending headers, so failures keep their real status.
  const iterator = result.fullStream[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  let first: string | null = null;
  try {
    while (first === null) {
      const { value, done } = await iterator.next();
      if (done) break;
      if (value.type === "error") throw value.error;
      if (value.type === "text-delta" && value.text) first = value.text;
    }
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    const status = APICallError.isInstance(error) ? error.statusCode : undefined;
    console.error("generate-message failed", status, error);
    const e = friendlyError(status);
    return json({ error: e.message }, e.status);
  }
  if (first === null) return json({ error: "A IA não conseguiu escrever essa mensagem. Tente outros interesses." }, 422);

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(first!));
      try {
        while (true) {
          const { value, done } = await iterator.next();
          if (done) break;
          if (value.type === "text-delta") controller.enqueue(encoder.encode(value.text));
          if (value.type === "error") throw value.error;
        }
        controller.close();
      } catch (error) {
        console.error("generate-message stream failed", error);
        controller.error(error);
      }
    },
    cancel() {
      void iterator.return?.();
    },
  });

  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" });
  const runId = runIdFetch.getRunId();
  if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
  return new Response(body, { headers });
}
