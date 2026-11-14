import { describe, expect, it } from "vitest";
import { deriveDeadlineTiming } from "./deadline-timing";

describe("deriveDeadlineTiming", () => {
  it("derives urgency from calendar days in the phone time zone", () => {
    expect(deriveDeadlineTiming("2026-11-18", "2026-11-14T10:00:00+09:00", "Asia/Tokyo")).toEqual({
      urgency: "act_now",
      remindAt: "2026-11-15T09:00:00+09:00",
    });

    expect(deriveDeadlineTiming("2026-12-10", "2026-11-14T10:00:00+09:00", "Asia/Tokyo")).toEqual({
      urgency: "has_deadline",
      remindAt: "2026-12-07T09:00:00+09:00",
    });
  });

  it("uses the next future local 09:00 when the three-day reminder has passed", () => {
    expect(deriveDeadlineTiming("2026-11-16", "2026-11-14T08:00:00+09:00", "Asia/Tokyo")).toEqual({
      urgency: "act_now",
      remindAt: "2026-11-14T09:00:00+09:00",
    });
  });

  it("uses the offset in force on the reminder date", () => {
    expect(deriveDeadlineTiming("2026-11-05", "2026-10-30T10:00:00-04:00", "America/New_York")).toEqual({
      urgency: "act_now",
      remindAt: "2026-11-02T09:00:00-05:00",
    });
  });

  it("does not produce a schedule for malformed dates or time zones", () => {
    expect(deriveDeadlineTiming("2026-02-30", "2026-11-14T10:00:00+09:00", "Asia/Tokyo")).toBeNull();
    expect(deriveDeadlineTiming("2026-11-18", "2026-11-14T10:00:00+09:00", "not/a-zone")).toBeNull();
  });
});
