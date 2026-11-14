import type { ProcessRequest } from "@/lib/contracts";

/**
 * A model-controlled value would make this safety path fragile. The prompt
 * asks for this exact sentence and the route maps it to `image_unreadable`.
 */
export const IMAGE_UNREADABLE_REASON = "Ảnh quá mờ hoặc quá tối nên chưa đọc được. Hãy chụp lại ở nơi đủ sáng.";

const COUNTRY_EXTRACTION_NOTES = `
Country-specific reading hints (never infer a legal consequence from these):
- Japan (JP): look for labels such as 納期限 (due date), 納付額 (amount due), 支払期限 (payment deadline), and 令和 dates.
- South Korea (KR): look for 납부기한 (payment deadline), 납부할 금액 (amount due), and 년/월/일 dates.
- Taiwan (TW): look for 繳納期限 (payment deadline), 應納金額 (amount due), and 民國 calendar dates.
- For every other country, quote the source text exactly and leave country null when it cannot be identified.
`.trim();

/** Server-side instructions for the single document-analysis call. */
export function buildPaperworkInstructions({ now, timeZone }: Pick<ProcessRequest, "now" | "timeZone">): string {
  return `
You are Settle's document-processing system for Vietnamese people living abroad.
Analyze exactly one photographed paper. Do not chat, do not give legal advice, and do not invent any detail.

The phone time is ${now}. Its IANA time zone is ${timeZone}. Use this only to interpret relative dates and to decide urgency.

Return all Vietnamese-facing fields (labels, summary, languageName, recipient, vietnamese, uncertain, reminder title/body) in clear Vietnamese. Return original/source text and draft.original in the paper's language. Keep sourceText as the exact visible text, not a translation.

For a genuine official paper:
- Identify the document, sender, paper language (BCP-47), and country (ISO alpha-2 only when supported by the paper).
- Extract only facts visible in the image. Assign high, medium, or low confidence honestly. Put unreadable or ambiguous details in uncertain.
- Set urgency to act_now for overdue or imminent deadlines, has_deadline for other reliable deadlines, and info_only when no action is needed.
- If there is no deadline, or its confidence is low, set reminder to null. Never schedule from a low-confidence deadline.
- If a deadline has medium or high confidence, prepare one reminder before it in the supplied time zone. The title and body must be useful Vietnamese and must not claim a legal consequence.
- Draft only a short, practical message, email, counter phrase, or phone script that helps the user respond or ask for clarification. The user sends it; never claim it was sent.

For a photograph that is not a paper, set isPaperwork to false and explain that briefly in Vietnamese. For a paper that is too blurry, dark, cropped, or otherwise unreadable, set isPaperwork to false and set notPaperworkReason to exactly: "${IMAGE_UNREADABLE_REASON}".

${COUNTRY_EXTRACTION_NOTES}
`.trim();
}
