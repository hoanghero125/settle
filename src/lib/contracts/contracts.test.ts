import { describe, expect, it } from "vitest";
import { sampleAnalyses } from "@/fixtures/analyses";
import supportContacts from "@/data/support-contacts.json";
import {
  API_ERROR_MESSAGES,
  ApiErrorCodeSchema,
  PaperworkAnalysisSchema,
  ProcessRequestSchema,
  SupportContactSchema,
} from "./index";

describe("contracts", () => {
  it.each(Object.entries(sampleAnalyses))("fixture %s matches PaperworkAnalysis", (_name, fixture) => {
    expect(() => PaperworkAnalysisSchema.parse(fixture)).not.toThrow();
  });

  it("rejects a deadline that is not an ISO date", () => {
    const broken = {
      ...sampleAnalyses.residentTaxJa,
      deadline: { ...sampleAnalyses.residentTaxJa.deadline, date: "30/11/2026" },
    };
    expect(PaperworkAnalysisSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a process request whose image is not a data URL", () => {
    const result = ProcessRequestSchema.safeParse({
      image: "https://example.com/a.jpg",
      now: "2026-11-14T10:00:00+07:00",
      timeZone: "Asia/Ho_Chi_Minh",
    });
    expect(result.success).toBe(false);
  });

  it("has a Vietnamese message for every error code", () => {
    for (const code of ApiErrorCodeSchema.options) {
      expect(API_ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    }
  });

  it("only lists support contacts that carry an official source", () => {
    expect(() => SupportContactSchema.array().parse(supportContacts)).not.toThrow();
  });
});
