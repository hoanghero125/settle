import { API_ERROR_MESSAGES, type ApiError, type ApiErrorCode } from "@/lib/contracts";

const STATUS: Record<ApiErrorCode, number> = {
  bad_request: 400,
  image_unreadable: 422,
  timeout: 504,
  rate_limited: 429,
  model_refused: 422,
  invalid_model_output: 502,
  not_configured: 503,
  not_implemented: 501,
  network: 503,
  internal: 500,
};

/** The one way a route reports failure. Keeps every error typed and in Vietnamese. */
export function errorResponse(code: ApiErrorCode): Response {
  const body: ApiError = { error: { code, message: API_ERROR_MESSAGES[code] } };
  return Response.json(body, { status: STATUS[code] });
}
