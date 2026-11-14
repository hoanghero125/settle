import { z } from "zod";

/**
 * The contract between the AI route and the UI. Both sides import from here.
 *
 * Every field is required and uses `.nullable()` instead of `.optional()`:
 * OpenAI structured outputs reject optional fields.
 */

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

/** act_now: overdue or due within days. has_deadline: a date exists. info_only: nothing to do. */
export const UrgencySchema = z.enum(["act_now", "has_deadline", "info_only"]);
export type Urgency = z.infer<typeof UrgencySchema>;

export const KeyFactSchema = z.object({
  /** Vietnamese label, e.g. "Số tiền phải nộp". */
  label: z.string(),
  /** Value as the user should read it, e.g. "34.500 yên". */
  value: z.string(),
  /** The exact text on the paper this came from, in the paper's language. */
  sourceText: z.string(),
  confidence: ConfidenceSchema,
});
export type KeyFact = z.infer<typeof KeyFactSchema>;

export const DeadlineSchema = z.object({
  /** ISO date, YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Vietnamese label, e.g. "Hạn nộp". */
  label: z.string(),
  sourceText: z.string(),
  confidence: ConfidenceSchema,
});
export type Deadline = z.infer<typeof DeadlineSchema>;

/** A reminder the app schedules on its own. Null when the deadline is missing or low-confidence. */
export const ReminderSchema = z.object({
  /** ISO 8601 date-time with offset. */
  remindAt: z.string(),
  title: z.string(),
  body: z.string(),
});
export type Reminder = z.infer<typeof ReminderSchema>;

export const DraftKindSchema = z.enum(["message", "email", "counter_phrase", "phone_script"]);
export type DraftKind = z.infer<typeof DraftKindSchema>;

/** Something the AI wrote for the user to send or say. The user always presses send. */
export const DraftSchema = z.object({
  kind: DraftKindSchema,
  /** Who it is for, in Vietnamese, e.g. "Nhân viên quầy thuế". */
  recipient: z.string(),
  /** The text in the paper's language. */
  original: z.string(),
  /** What it means, in Vietnamese. */
  vietnamese: z.string(),
});
export type Draft = z.infer<typeof DraftSchema>;

export const PaperworkAnalysisSchema = z.object({
  /** False for a photo that is not an official paper; the UI then shows notPaperworkReason. */
  isPaperwork: z.boolean(),
  notPaperworkReason: z.string().nullable(),
  /** BCP-47 tag of the paper's language, e.g. "ja". Also used for text-to-speech. */
  language: z.string(),
  /** Vietnamese name of that language, e.g. "Tiếng Nhật". */
  languageName: z.string(),
  /** ISO 3166-1 alpha-2 country the paper is from, when it can be told. */
  country: z.string().nullable(),
  /** Short Vietnamese name of the paper, e.g. "Giấy báo nộp thuế cư trú". */
  docType: z.string(),
  sender: z.string(),
  urgency: UrgencySchema,
  /** One or two plain Vietnamese sentences. */
  summary: z.string(),
  keyFacts: z.array(KeyFactSchema),
  deadline: DeadlineSchema.nullable(),
  reminder: ReminderSchema.nullable(),
  drafts: z.array(DraftSchema),
  /** Things the AI could not read or is unsure of, for the user to have checked. */
  uncertain: z.array(z.string()),
});
export type PaperworkAnalysis = z.infer<typeof PaperworkAnalysisSchema>;

/** One row of the "Việc giấy tờ" list, kept on the phone only. */
export const StoredTaskSchema = z.object({
  id: z.string(),
  /** ISO 8601 date-time. */
  createdAt: z.string(),
  analysis: PaperworkAnalysisSchema,
  /** Id of the local notification, when one was scheduled. */
  reminderId: z.number().int().nullable(),
  done: z.boolean(),
});
export type StoredTask = z.infer<typeof StoredTaskSchema>;

/** A verified support line. Phone numbers come only from this list, never from the model. */
export const SupportContactSchema = z.object({
  country: z.string(),
  organization: z.string(),
  phone: z.string(),
  hours: z.string().nullable(),
  /** The official page the number was copied from. */
  source: z.url(),
});
export type SupportContact = z.infer<typeof SupportContactSchema>;
