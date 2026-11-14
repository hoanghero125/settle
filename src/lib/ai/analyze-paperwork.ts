import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";
import {
  PaperworkAnalysisSchema,
  type ApiErrorCode,
  type PaperworkAnalysis,
  type ProcessRequest,
} from "@/lib/contracts";
import { getOpenAI } from "./client";
import { getModels } from "./models";
import { buildPaperworkInstructions, IMAGE_UNREADABLE_REASON } from "./prompt";
import { deriveDeadlineTiming } from "./deadline-timing";
import { mapOpenAIError } from "@/lib/server/openai-errors";

/** A known processing failure that a route can translate with errorResponse. */
export class PaperworkProcessingError extends Error {
  constructor(public readonly code: ApiErrorCode) {
    super(code);
    this.name = "PaperworkProcessingError";
  }
}

function wasRefused(response: { output: Array<{ type: string; content?: Array<{ type: string }> }> }): boolean {
  return response.output.some(
    (item) => item.type === "message" && item.content?.some((content) => content.type === "refusal"),
  );
}

/** The route, not the model, is the final safety gate for deadline-driven fields. */
function applyDeadlineTiming(analysis: PaperworkAnalysis, request: ProcessRequest): PaperworkAnalysis {
  if (!analysis.isPaperwork || !analysis.deadline) {
    return { ...analysis, urgency: "info_only", reminder: null };
  }

  const timing = deriveDeadlineTiming(analysis.deadline.date, request.now, request.timeZone);
  if (!timing) return { ...analysis, urgency: "info_only", reminder: null };

  if (analysis.deadline.confidence === "low") {
    return { ...analysis, urgency: timing.urgency, reminder: null };
  }

  return {
    ...analysis,
    urgency: timing.urgency,
    reminder: analysis.reminder
      ? { ...analysis.reminder, remindAt: timing.remindAt }
      : {
          remindAt: timing.remindAt,
          title: "Nhắc hạn giấy tờ",
          body: "Hãy kiểm tra lại giấy tờ và hoàn tất đúng hạn.",
        },
  };
}

/**
 * Performs the one OpenAI call for a document. Responses are not stored by the
 * API and no image or model output is logged by this module.
 */
export async function analyzePaperwork(request: ProcessRequest): Promise<PaperworkAnalysis> {
  const client = getOpenAI();
  const models = getModels();
  if (!client || !models) throw new PaperworkProcessingError("not_configured");

  const signal = AbortSignal.timeout(40_000);

  try {
    // Structured-output parse failures are the only retryable model result.
    for (let attempt = 0; attempt < 2; attempt++) {
      let response;
      try {
        response = await client.responses.parse(
          {
            model: models.vision,
            store: false,
            reasoning: { effort: "low" },
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
          },
          { signal },
        );
      } catch (error) {
        if (error instanceof ZodError) {
          if (attempt === 1) throw new PaperworkProcessingError("invalid_model_output");
          continue;
        }
        throw error;
      }

      if (wasRefused(response)) throw new PaperworkProcessingError("model_refused");
      const parsed = PaperworkAnalysisSchema.safeParse(response.output_parsed);
      if (parsed.success && (parsed.data.isPaperwork || parsed.data.notPaperworkReason)) {
        if (parsed.data.notPaperworkReason === IMAGE_UNREADABLE_REASON) {
          throw new PaperworkProcessingError("image_unreadable");
        }
        return applyDeadlineTiming(parsed.data, request);
      }
      if (attempt === 1) throw new PaperworkProcessingError("invalid_model_output");
    }

    throw new PaperworkProcessingError("invalid_model_output");
  } catch (error) {
    if (error instanceof PaperworkProcessingError) throw error;
    if (signal.aborted) throw new PaperworkProcessingError("timeout");
    throw new PaperworkProcessingError(mapOpenAIError(error));
  }
}
