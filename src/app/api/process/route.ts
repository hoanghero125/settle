import { ProcessRequestSchema } from "@/lib/contracts";
import { errorResponse } from "@/lib/server/respond";

/**
 * POST /api/process — photo of a paper in, PaperworkAnalysis out.
 *
 * Stub. The implementation (issue "AI: /api/process") calls the vision model in
 * src/lib/ai with structured output and returns ProcessResponse. Every failure
 * path must go through errorResponse so the UI gets a typed, Vietnamese error.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = ProcessRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("bad_request");

  return errorResponse("not_implemented");
}
