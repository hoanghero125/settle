import { describe, expect, it } from "vitest";
import { healthInsuranceKo, notPaperwork, residentTaxJa } from "@/fixtures/analyses";
import type { StoredTask } from "@/lib/contracts";
import { sortTasks } from "./tasks";

const task = (id: string, analysis: StoredTask["analysis"], done = false): StoredTask => ({
  id,
  createdAt: "2026-11-14T10:00:00.000Z",
  analysis,
  reminderId: null,
  done,
});

describe("sortTasks", () => {
  it("puts the nearest deadline first and tasks without a deadline last", () => {
    const sorted = sortTasks([task("none", notPaperwork), task("dec", healthInsuranceKo), task("nov", residentTaxJa)]);
    expect(sorted.map((t) => t.id)).toEqual(["nov", "dec", "none"]);
  });

  it("moves finished tasks below open ones", () => {
    const sorted = sortTasks([task("done-nov", residentTaxJa, true), task("open-dec", healthInsuranceKo)]);
    expect(sorted.map((t) => t.id)).toEqual(["open-dec", "done-nov"]);
  });
});
