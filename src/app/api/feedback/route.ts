import { FeedbackRequestSchema } from "@/lib/contracts";
import { recordFeedback } from "@/lib/ai/feedback";
import { errorResponse } from "@/lib/server/respond";

/**
 * POST /api/feedback — anonymous thumbs up/down only. It never accepts a
 * document, prompt, or any other user content.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = FeedbackRequestSchema.safeParse(body);
  const hasOnlyVerdict =
    typeof body === "object" && body !== null && !Array.isArray(body) && Object.keys(body).length === 1 && "verdict" in body;
  if (!parsed.success || !hasOnlyVerdict) return errorResponse("bad_request");

  recordFeedback(parsed.data.verdict);
  return new Response(null, { status: 204 });
}
