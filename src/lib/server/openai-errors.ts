import { APIConnectionError, APIConnectionTimeoutError, RateLimitError } from "openai";
import type { ApiErrorCode } from "@/lib/contracts";

/**
 * Maps whatever an OpenAI SDK call threw to the code a route answers with
 * through errorResponse. Only the error's class is inspected: the SDK's message
 * can echo request content, so it is never read, returned or logged.
 */
export function mapOpenAIError(error: unknown): ApiErrorCode {
  // The timeout class extends the connection class, so it must be checked first.
  if (error instanceof APIConnectionTimeoutError) return "timeout";
  if (error instanceof RateLimitError) return "rate_limited";
  if (error instanceof APIConnectionError) return "network";
  return "internal";
}
