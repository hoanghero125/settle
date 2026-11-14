import {
  API_ERROR_MESSAGES,
  ApiErrorSchema,
  ProcessResponseSchema,
  type ApiErrorCode,
  type FeedbackRequest,
  type PaperworkAnalysis,
  type ProcessRequest,
  type SpeakRequest,
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

function transportError(cause: unknown): ApiClientError {
  const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
  return new ApiClientError(timedOut ? "timeout" : "network");
}

/** POSTs JSON and returns the response only if it is ok; failures throw ApiClientError. */
async function post(path: string, body: unknown): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    throw transportError(cause);
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const failure = ApiErrorSchema.safeParse(payload);
    if (failure.success) throw new ApiClientError(failure.data.error.code, failure.data.error.message);
    throw new ApiClientError("internal");
  }
  return response;
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  const response = await post(path, body);
  return response.json().catch(() => null);
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

/**
 * Reads `text` aloud. Resolves to an object URL of the mp3: play it in an
 * HTMLAudioElement after a tap, then URL.revokeObjectURL it.
 */
export async function speak(text: string, language: string): Promise<string> {
  const request: SpeakRequest = { text, language };
  const response = await post("/api/speech/speak", request);
  let audio: Blob;
  try {
    audio = await response.blob();
  } catch (cause) {
    throw transportError(cause);
  }
  return URL.createObjectURL(audio);
}

/** Sends only an anonymous verdict; no paper content leaves the device. */
export async function sendFeedback(verdict: FeedbackRequest["verdict"]): Promise<void> {
  await post("/api/feedback", { verdict } satisfies FeedbackRequest);
}
