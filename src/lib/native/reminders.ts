import type { PaperworkAnalysis, StoredTask } from "@/lib/contracts";
import { cancelReminder, scheduleReminder } from "./index";

/**
 * Settle schedules the deadline reminder by itself and offers an undo.
 * A low-confidence deadline never auto-schedules. None of these functions
 * throw: a failed schedule must not break the main flow.
 */

/** Real reminder ids fall in 1..2^30-1. */
const REAL_ID_SPAN = 0x3fffffff;
/** Demo ids are shifted into 2^30+1..2^31-1, so they never collide with a real id. */
const DEMO_ID_OFFSET = 0x40000000;

/**
 * True when the analysis carries a reminder the app may schedule on its own.
 * `remindAt` is parsed with `Date.parse`: a string without an offset is read
 * as the phone's local time.
 */
export function shouldAutoSchedule(analysis: PaperworkAnalysis, now: Date): boolean {
  const { isPaperwork, reminder, deadline } = analysis;
  if (!isPaperwork || !reminder || !deadline || deadline.confidence === "low") return false;
  // NaN (an unreadable date) compares false.
  return Date.parse(reminder.remindAt) > now.getTime();
}

/** A stable Android notification id (positive 32-bit int) for a task. */
export function reminderIdFor(taskId: string): number {
  // FNV-1a, 32-bit.
  let hash = 0x811c9dc5;
  for (let i = 0; i < taskId.length; i++) {
    hash ^= taskId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ((hash >>> 0) % REAL_ID_SPAN) + 1;
}

/** Schedules the task's reminder when allowed. Returns a copy with `reminderId` set, or the task unchanged. */
export async function applyAutoReminder(task: StoredTask, now: Date = new Date()): Promise<StoredTask> {
  const { reminder } = task.analysis;
  if (task.reminderId !== null || !reminder || !shouldAutoSchedule(task.analysis, now)) return task;

  const id = reminderIdFor(task.id);
  try {
    const scheduled = await scheduleReminder({
      id,
      title: reminder.title,
      body: reminder.body,
      at: new Date(reminder.remindAt),
    });
    return scheduled ? { ...task, reminderId: id } : task;
  } catch {
    return task;
  }
}

/** Undo for applyAutoReminder. If cancelling fails, the task is returned unchanged (the reminder may still fire). */
export async function undoReminder(task: StoredTask): Promise<StoredTask> {
  if (task.reminderId === null) return task;
  try {
    await cancelReminder(task.reminderId);
    return { ...task, reminderId: null };
  } catch {
    return task;
  }
}

/** A one-off notification `seconds` from now with the task's reminder text, for showing the flow live. */
export async function scheduleDemoReminder(task: StoredTask, seconds = 30): Promise<boolean> {
  const { reminder, docType, summary } = task.analysis;
  try {
    return await scheduleReminder({
      id: reminderIdFor(task.id) + DEMO_ID_OFFSET,
      title: reminder?.title ?? docType,
      body: reminder?.body ?? summary,
      at: new Date(Date.now() + seconds * 1000),
    });
  } catch {
    return false;
  }
}

/** True when the page was opened with `?demo=1`. */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}
