import { FeedbackRequestSchema } from "@/lib/contracts";
import { errorResponse } from "@/lib/server/respond";

/**
 * POST /api/feedback — anonymous thumbs up/down and a usage counter.
 *
 * Stub. The implementation (issue "AI: feedback counter") increments counters
 * only. It must never receive or store document content.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = FeedbackRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("bad_request");

  return errorResponse("not_implemented");
}
