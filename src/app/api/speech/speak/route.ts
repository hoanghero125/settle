import { SpeakRequestSchema } from "@/lib/contracts";
import { errorResponse } from "@/lib/server/respond";

/**
 * POST /api/speech/speak — text in, audio/mpeg out.
 *
 * Stub. The implementation (issue "Platform: speech route") calls the
 * text-to-speech model named in src/lib/ai/models.ts and streams the audio back.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = SpeakRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("bad_request");

  return errorResponse("not_implemented");
}
