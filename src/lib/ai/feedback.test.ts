import { describe, expect, it } from "vitest";
import { createFeedbackCounter } from "./feedback";

describe("feedback counter", () => {
  it("counts only anonymous verdicts", () => {
    const counter = createFeedbackCounter();

    counter.record("up");
    counter.record("up");
    counter.record("down");

    expect(counter.snapshot()).toEqual({ up: 2, down: 1 });
  });

  it("returns a copy rather than exposing mutable internal state", () => {
    const counter = createFeedbackCounter();
    const snapshot = counter.snapshot();
    snapshot.up = 99;

    expect(counter.snapshot()).toEqual({ up: 0, down: 0 });
  });
});
