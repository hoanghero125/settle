import type { Urgency } from "@/lib/contracts";

type DateParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

export type DeadlineTiming = {
  urgency: Urgency;
  remindAt: string;
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const REMINDER_HOUR = 9;

function datePartsAt(instant: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) throw new RangeError(`Missing ${type} in date parts`);
    return Number(value);
  };

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

function offsetMinutesAt(instant: Date, timeZone: string): number {
  const parts = datePartsAt(instant, timeZone);
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((localAsUtc - instant.getTime()) / 60_000);
}

/** Converts a wall-clock time in an IANA zone to an instant, including DST offsets. */
function localTimeInZone(parts: DateParts, timeZone: string): Date {
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let instant = new Date(wallClockAsUtc - offsetMinutesAt(new Date(wallClockAsUtc), timeZone) * 60_000);
  const correctedOffset = offsetMinutesAt(instant, timeZone);
  instant = new Date(wallClockAsUtc - correctedOffset * 60_000);
  return instant;
}

function addCalendarDays({ year, month, day }: Pick<DateParts, "year" | "month" | "day">, days: number): DateParts {
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
    hour: REMINDER_HOUR,
    minute: 0,
    second: 0,
  };
}

function parseIsoDate(date: string): Pick<DateParts, "year" | "month" | "day"> | null {
  const match = DATE_ONLY.exec(date);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function toOffsetIsoString(instant: Date, timeZone: string): string {
  const parts = datePartsAt(instant, timeZone);
  const offset = offsetMinutesAt(instant, timeZone);
  const sign = offset >= 0 ? "+" : "-";
  const twoDigits = (value: number): string => String(Math.abs(value)).padStart(2, "0");
  const offsetHours = Math.trunc(offset / 60);
  const offsetMinutes = offset % 60;

  return `${String(parts.year).padStart(4, "0")}-${twoDigits(parts.month)}-${twoDigits(parts.day)}T${twoDigits(parts.hour)}:${twoDigits(parts.minute)}:${twoDigits(parts.second)}${sign}${twoDigits(offsetHours)}:${twoDigits(offsetMinutes)}`;
}

/**
 * Derives deadline-driven fields outside the model so all users get the same
 * seven-calendar-day urgency rule and a future 09:00 local reminder.
 */
export function deriveDeadlineTiming(deadlineDate: string, now: string, timeZone: string): DeadlineTiming | null {
  const deadline = parseIsoDate(deadlineDate);
  const nowInstant = new Date(now);
  if (!deadline || Number.isNaN(nowInstant.getTime())) return null;

  try {
    const today = datePartsAt(nowInstant, timeZone);
    const deadlineDay = Date.UTC(deadline.year, deadline.month - 1, deadline.day);
    const todayDay = Date.UTC(today.year, today.month - 1, today.day);
    const calendarDaysUntilDeadline = Math.round((deadlineDay - todayDay) / 86_400_000);
    const urgency: Urgency = calendarDaysUntilDeadline <= 7 ? "act_now" : "has_deadline";

    const scheduled = localTimeInZone(addCalendarDays(deadline, -3), timeZone);
    const todayAtNine = localTimeInZone(addCalendarDays(today, 0), timeZone);
    const nextMorning =
      todayAtNine.getTime() > nowInstant.getTime() ? todayAtNine : localTimeInZone(addCalendarDays(today, 1), timeZone);
    const reminder = scheduled.getTime() > nowInstant.getTime() ? scheduled : nextMorning;

    return { urgency, remindAt: toOffsetIsoString(reminder, timeZone) };
  } catch {
    // A malformed IANA time zone must never create a reminder with a guessed offset.
    return null;
  }
}
