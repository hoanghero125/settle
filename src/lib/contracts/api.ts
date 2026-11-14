import { z } from "zod";
import { PaperworkAnalysisSchema } from "./paperwork";

/** POST /api/process */
export const ProcessRequestSchema = z.object({
  /** JPEG data URL, already downscaled on the phone (see src/lib/image/downscale.ts). */
  image: z.string().startsWith("data:image/"),
  /** The phone's current time, ISO 8601 with offset, so relative deadlines resolve correctly. */
  now: z.string(),
  /** IANA time zone of the phone, e.g. "Asia/Tokyo". */
  timeZone: z.string(),
});
export type ProcessRequest = z.infer<typeof ProcessRequestSchema>;

export const ProcessResponseSchema = z.object({
  analysis: PaperworkAnalysisSchema,
});
export type ProcessResponse = z.infer<typeof ProcessResponseSchema>;

/** POST /api/speech/speak — responds with audio/mpeg. */
export const SpeakRequestSchema = z.object({
  text: z.string().min(1).max(1000),
  /** BCP-47 tag: "vi" for the summary, the paper's language for drafts. */
  language: z.string(),
});
export type SpeakRequest = z.infer<typeof SpeakRequestSchema>;

/** POST /api/feedback — anonymous; no document content is ever sent. */
export const FeedbackRequestSchema = z.object({
  verdict: z.enum(["up", "down"]),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

export const ApiErrorCodeSchema = z.enum([
  "bad_request",
  "image_unreadable",
  "timeout",
  "rate_limited",
  "model_refused",
  "invalid_model_output",
  "not_configured",
  "not_implemented",
  "network",
  "internal",
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

/** Every route answers failures with this shape, so the UI never has to guess. */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: ApiErrorCodeSchema,
    /** Vietnamese, ready to show to the user. */
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  bad_request: "Ảnh gửi lên chưa đúng định dạng. Hãy chụp lại.",
  image_unreadable: "Ảnh quá mờ hoặc quá tối nên chưa đọc được. Hãy chụp lại ở nơi đủ sáng.",
  timeout: "Xử lý lâu hơn dự kiến. Hãy thử lại.",
  rate_limited: "Hệ thống đang quá tải. Hãy thử lại sau ít phút.",
  model_refused: "Settle không xử lý được giấy tờ này. Hãy nhờ người biết tiếng xem giúp.",
  invalid_model_output: "Kết quả trả về bị lỗi. Hãy thử lại.",
  not_configured: "Máy chủ chưa được cấu hình khóa OpenAI hoặc tên model.",
  not_implemented: "Tính năng này chưa được nối.",
  network: "Không có kết nối mạng. Hãy kiểm tra mạng rồi thử lại.",
  internal: "Có lỗi xảy ra. Hãy thử lại.",
};
