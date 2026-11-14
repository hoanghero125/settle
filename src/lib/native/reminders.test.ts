import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notPaperwork, residentTaxJa } from "@/fixtures/analyses";
import type { PaperworkAnalysis, StoredTask } from "@/lib/contracts";
import { cancelReminder, scheduleReminder } from "./index";
import {
  applyAutoReminder,
  isDemoMode,
  reminderIdFor,
  scheduleDemoReminder,
  shouldAutoSchedule,
  undoReminder,
} from "./reminders";

vi.mock("./index", () => ({ scheduleReminder: vi.fn(), cancelReminder: vi.fn() }));

const schedule = vi.mocked(scheduleReminder);
const cancel = vi.mocked(cancelReminder);

// Before residentTaxJa's remindAt (2026-11-27T09:00:00+09:00).
const NOW = new Date("2026-11-14T10:00:00.000Z");
const MAX_INT32 = 2 ** 31 - 1;

const withDeadline = (confidence: "high" | "medium" | "low"): PaperworkAnalysis => ({
  ...residentTaxJa,
  deadline: { ...residentTaxJa.deadline!, confidence },
});

const task = (analysis: PaperworkAnalysis = residentTaxJa, reminderId: number | null = null): StoredTask => ({
  id: "task-1",
  createdAt: NOW.toISOString(),
  analysis,
  reminderId,
  done: false,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("shouldAutoSchedule", () => {
  it("allows a high- or medium-confidence deadline with a future reminder", () => {
    expect(shouldAutoSchedule(residentTaxJa, NOW)).toBe(true);
    expect(shouldAutoSchedule(withDeadline("medium"), NOW)).toBe(true);
  });

  it("never schedules a low-confidence deadline", () => {
    expect(shouldAutoSchedule(withDeadline("low"), NOW)).toBe(false);
  });

  it("needs both a reminder and a deadline", () => {
    expect(shouldAutoSchedule({ ...residentTaxJa, reminder: null }, NOW)).toBe(false);
    expect(shouldAutoSchedule({ ...residentTaxJa, deadline: null }, NOW)).toBe(false);
  });

  it("rejects something that is not paperwork", () => {
    expect(shouldAutoSchedule({ ...residentTaxJa, isPaperwork: false }, NOW)).toBe(false);
    expect(shouldAutoSchedule(notPaperwork, NOW)).toBe(false);
  });

  it("rejects a reminder time that is now, past, or unreadable", () => {
    const remindAt = new Date(residentTaxJa.reminder!.remindAt);
    expect(shouldAutoSchedule(residentTaxJa, remindAt)).toBe(false);
    expect(shouldAutoSchedule(residentTaxJa, new Date(remindAt.getTime() + 1))).toBe(false);
    const unreadable = { ...residentTaxJa, reminder: { ...residentTaxJa.reminder!, remindAt: "cuối tháng" } };
    expect(shouldAutoSchedule(unreadable, NOW)).toBe(false);
  });
});

describe("reminderIdFor", () => {
  it("is stable for the same task id and differs between ids", () => {
    expect(reminderIdFor("task-1")).toBe(reminderIdFor("task-1"));
    expect(reminderIdFor("task-1")).not.toBe(reminderIdFor("task-2"));
  });

  it("is always a positive 32-bit signed integer", () => {
    const ids = ["", "a", "task-1", "x".repeat(500), ...Array.from({ length: 2000 }, () => crypto.randomUUID())];
    for (const id of ids) {
      const value = reminderIdFor(id);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(MAX_INT32);
    }
  });
});

describe("applyAutoReminder", () => {
  it("schedules the analysis's reminder and returns a copy with reminderId", async () => {
    schedule.mockResolvedValue(true);
    const original = task();

    const result = await applyAutoReminder(original, NOW);

    expect(schedule).toHaveBeenCalledWith({
      id: reminderIdFor("task-1"),
      title: residentTaxJa.reminder!.title,
      body: residentTaxJa.reminder!.body,
      at: new Date(residentTaxJa.reminder!.remindAt),
    });
    expect(result).toEqual({ ...original, reminderId: reminderIdFor("task-1") });
    expect(original.reminderId).toBeNull();
  });

  it("leaves the task unchanged when scheduling returns false", async () => {
    schedule.mockResolvedValue(false);
    const original = task();
    expect(await applyAutoReminder(original, NOW)).toBe(original);
  });

  it("leaves the task unchanged and does not throw when scheduling rejects", async () => {
    schedule.mockRejectedValue(new Error("plugin missing"));
    const original = task();
    expect(await applyAutoReminder(original, NOW)).toBe(original);
  });

  it("does not schedule twice for a task that already has a reminderId", async () => {
    const original = task(residentTaxJa, 42);
    expect(await applyAutoReminder(original, NOW)).toBe(original);
    expect(schedule).not.toHaveBeenCalled();
  });

  it("does not schedule when the analysis is not eligible", async () => {
    const original = task(withDeadline("low"));
    expect(await applyAutoReminder(original, NOW)).toBe(original);
    expect(schedule).not.toHaveBeenCalled();
  });
});

describe("undoReminder", () => {
  it("cancels the reminder and clears reminderId", async () => {
    cancel.mockResolvedValue(undefined);
    const result = await undoReminder(task(residentTaxJa, 42));
    expect(cancel).toHaveBeenCalledWith(42);
    expect(result.reminderId).toBeNull();
  });

  it("does nothing when no reminder was scheduled", async () => {
    const original = task();
    expect(await undoReminder(original)).toBe(original);
    expect(cancel).not.toHaveBeenCalled();
  });

  it("keeps reminderId when cancelling fails", async () => {
    cancel.mockRejectedValue(new Error("boom"));
    const original = task(residentTaxJa, 42);
    expect(await undoReminder(original)).toBe(original);
  });
});

describe("scheduleDemoReminder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("schedules the real reminder text 30 seconds from now under a separate id", async () => {
    schedule.mockResolvedValue(true);
    expect(await scheduleDemoReminder(task())).toBe(true);

    const input = schedule.mock.calls[0][0];
    expect(input.title).toBe(residentTaxJa.reminder!.title);
    expect(input.body).toBe(residentTaxJa.reminder!.body);
    expect(input.at).toEqual(new Date(NOW.getTime() + 30_000));
    expect(input.id).not.toBe(reminderIdFor("task-1"));
    expect(input.id).toBeGreaterThan(2 ** 30);
    expect(input.id).toBeLessThanOrEqual(MAX_INT32);
  });

  it("falls back to the document type without a reminder", async () => {
    schedule.mockResolvedValue(true);
    await scheduleDemoReminder(task({ ...residentTaxJa, reminder: null }), 5);
    const input = schedule.mock.calls[0][0];
    expect(input.title).toBe(residentTaxJa.docType);
    expect(input.at).toEqual(new Date(NOW.getTime() + 5_000));
  });

  it("returns false when scheduling rejects", async () => {
    schedule.mockRejectedValue(new Error("boom"));
    expect(await scheduleDemoReminder(task())).toBe(false);
  });
});

describe("isDemoMode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is false during server rendering", () => {
    expect(isDemoMode()).toBe(false);
  });

  it("reads demo=1 from the query string", () => {
    vi.stubGlobal("window", { location: { search: "?demo=1" } });
    expect(isDemoMode()).toBe(true);
    vi.stubGlobal("window", { location: { search: "?demo=0" } });
    expect(isDemoMode()).toBe(false);
  });
});
