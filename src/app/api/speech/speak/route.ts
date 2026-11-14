import { APIError } from "openai";
import type { SpeechCreateParams } from "openai/resources/audio/speech";
import { getOpenAI } from "@/lib/ai/client";
import { getModels } from "@/lib/ai/models";
import { SpeakRequestSchema } from "@/lib/contracts";
import { mapOpenAIError } from "@/lib/server/openai-errors";
import { errorResponse } from "@/lib/server/respond";

/** Accepted by every speech model, including tts-1. Override with OPENAI_TTS_VOICE. */
const DEFAULT_VOICE: SpeechCreateParams["voice"] = "coral";

/**
 * POST /api/speech/speak — text in, audio/mpeg out.
 *
 * Reads the Vietnamese summary aloud, or a drafted sentence in the paper's
 * language for a counter clerk. The text is never logged.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = SpeakRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("bad_request");

  const openai = getOpenAI();
  const models = getModels();
  if (!openai || !models) return errorResponse("not_configured");

  try {
    const speech = await openai.audio.speech.create({
      model: models.speech,
      input: parsed.data.text,
      voice: process.env.OPENAI_TTS_VOICE?.trim() || DEFAULT_VOICE,
      response_format: "mp3",
    });
    // Buffered rather than piped, so a failure mid-body still reaches errorResponse.
    const audio = await speech.arrayBuffer();
    return new Response(audio, {
      headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
    });
  } catch (error) {
    const code = mapOpenAIError(error);
    // Code and HTTP status only: the SDK's message may echo the request.
    console.error("speech failed", { code, status: error instanceof APIError ? error.status : undefined });
    return errorResponse(code);
  }
}
