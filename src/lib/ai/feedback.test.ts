import { describe, expect, it } from "vitest";
import { getFeedbackCounts, incrementMetric } from "./feedback";

describe("feedback metrics without Redis", () => {
  it("does not fail the user flow when storage is absent", async () => {
    await expect(incrementMetric("processed")).resolves.toBeUndefined();
    await expect(incrementMetric("up")).resolves.toBeUndefined();
  });

  it("returns only anonymous aggregate defaults when storage is absent", async () => {
    await expect(getFeedbackCounts()).resolves.toEqual({ processed: 0, up: 0, down: 0 });
  });
});
