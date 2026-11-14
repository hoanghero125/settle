import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  PaperworkAnalysisSchema,
  type ApiErrorCode,
  type PaperworkAnalysis,
  type ProcessRequest,
} from "@/lib/contracts";
import { getOpenAI } from "./client";
import { getVisionModel } from "./models";
import { buildPaperworkInstructions, IMAGE_UNREADABLE_REASON } from "./prompt";

/** A known processing failure that a route can translate with errorResponse. */
export class PaperworkProcessingError extends Error {
  constructor(public readonly code: ApiErrorCode) {
    super(code);
    this.name = "PaperworkProcessingError";
  }
}

function toErrorCode(error: unknown): ApiErrorCode {
  if (error instanceof PaperworkProcessingError) return error.code;
  if (error instanceof OpenAI.RateLimitError) return "rate_limited";
  if (error instanceof OpenAI.APIConnectionTimeoutError) return "timeout";
  if (error instanceof OpenAI.APIConnectionError) return "network";
  if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
    return "not_configured";
  }
  if (error instanceof OpenAI.BadRequestError) return "bad_request";
  if (error instanceof OpenAI.UnprocessableEntityError) return "image_unreadable";
  return "internal";
}

function wasRefused(response: { output: Array<{ type: string; content?: Array<{ type: string }> }> }): boolean {
  return response.output.some(
    (item) => item.type === "message" && item.content?.some((content) => content.type === "refusal"),
  );
}

/** The route, not the model, is the final safety gate for automatic reminders. */
function applyReminderSafety(analysis: PaperworkAnalysis): PaperworkAnalysis {
  if (!analysis.deadline || analysis.deadline.confidence === "low") {
    return { ...analysis, reminder: null };
  }
  return analysis;
}

/**
 * Performs the one OpenAI call for a document. Responses are not stored by the
 * API and no image or model output is logged by this module.
 */
export async function analyzePaperwork(request: ProcessRequest): Promise<PaperworkAnalysis> {
  const client = getOpenAI();
  const model = getVisionModel();
  if (!client || !model) throw new PaperworkProcessingError("not_configured");

  try {
    const response = await client.responses.parse({
      model,
      store: false,
      instructions: buildPaperworkInstructions(request),
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Process this photographed paper." },
            { type: "input_image", image_url: request.image, detail: "high" },
          ],
        },
      ],
      text: { format: zodTextFormat(PaperworkAnalysisSchema, "paperwork_analysis") },
    });

    if (wasRefused(response)) throw new PaperworkProcessingError("model_refused");
    if (!response.output_parsed) throw new PaperworkProcessingError("invalid_model_output");

    // Parse again at the boundary: the contract, not an SDK type, is authoritative.
    const parsed = PaperworkAnalysisSchema.safeParse(response.output_parsed);
    if (!parsed.success) throw new PaperworkProcessingError("invalid_model_output");
    if (!parsed.data.isPaperwork && !parsed.data.notPaperworkReason) {
      throw new PaperworkProcessingError("invalid_model_output");
    }
    if (parsed.data.notPaperworkReason === IMAGE_UNREADABLE_REASON) {
      throw new PaperworkProcessingError("image_unreadable");
    }

    return applyReminderSafety(parsed.data);
  } catch (error) {
    throw new PaperworkProcessingError(toErrorCode(error));
  }
}
