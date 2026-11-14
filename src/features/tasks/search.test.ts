import { describe, expect, it } from "vitest";
import { residentTaxJa } from "@/fixtures/analyses";
import type { StoredTask } from "@/lib/contracts";
import { taskMatchesQuery } from "./search";

const task: StoredTask = {
  id: "resident-tax",
  createdAt: "2026-11-14T10:00:00.000Z",
  analysis: residentTaxJa,
  reminderId: null,
  done: false,
};

describe("taskMatchesQuery", () => {
  it("matches Vietnamese text without its accents", () => {
    expect(taskMatchesQuery(task, "giay bao nop thue")).toBe(true);
  });

  it("matches a deadline in the compact Vietnamese date form", () => {
    expect(taskMatchesQuery(task, "30/11")).toBe(true);
  });

  it("matches a human priority term", () => {
    expect(taskMatchesQuery(task, "uu tien cao")).toBe(true);
  });
});
