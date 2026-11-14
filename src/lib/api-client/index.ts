import {
  API_ERROR_MESSAGES,
  ApiErrorSchema,
  ProcessResponseSchema,
  type ApiErrorCode,
  type PaperworkAnalysis,
  type ProcessRequest,
} from "@/lib/contracts";

/** What the UI catches. `message` is Vietnamese and safe to show as is. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string = API_ERROR_MESSAGES[code],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";
const TIMEOUT_MS = 45_000;

async function postJson(path: string, body: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
    throw new ApiClientError(timedOut ? "timeout" : "network");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = ApiErrorSchema.safeParse(payload);
    if (failure.success) throw new ApiClientError(failure.data.error.code, failure.data.error.message);
    throw new ApiClientError("internal");
  }
  return payload;
}

/** Sends a downscaled photo and returns what Settle worked out and prepared. */
export async function processPaperwork(image: string): Promise<PaperworkAnalysis> {
  if (USE_MOCKS) {
    const { residentTaxJa } = await import("@/fixtures/analyses");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return residentTaxJa;
  }

  const request: ProcessRequest = {
    image,
    now: new Date().toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const parsed = ProcessResponseSchema.safeParse(await postJson("/api/process", request));
  if (!parsed.success) throw new ApiClientError("invalid_model_output");
  return parsed.data.analysis;
}
