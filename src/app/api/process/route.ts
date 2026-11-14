import { ProcessRequestSchema } from "@/lib/contracts";
import { analyzePaperwork, PaperworkProcessingError } from "@/lib/ai/analyze-paperwork";
import { errorResponse } from "@/lib/server/respond";

/**
 * POST /api/process — photo of a paper in, PaperworkAnalysis out.
 *
 * Calls the vision model once with a structured schema. Every expected failure
 * goes through errorResponse so the UI gets a typed, Vietnamese message.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = ProcessRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("bad_request");

  try {
    const analysis = await analyzePaperwork(parsed.data);
    return Response.json({ analysis });
  } catch (error) {
    if (error instanceof PaperworkProcessingError) return errorResponse(error.code);
    return errorResponse("internal");
  }
}
