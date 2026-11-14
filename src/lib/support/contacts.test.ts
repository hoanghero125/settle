import { describe, expect, it } from "vitest";
import { getSupportContacts } from "./contacts";

describe("getSupportContacts", () => {
  it("returns only that country's lines for a known country", () => {
    const contacts = getSupportContacts("JP");
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts.every((c) => c.country === "JP")).toBe(true);
  });

  it("returns nothing for a country not in the list", () => {
    expect(getSupportContacts("DE")).toEqual([]);
  });

  it("returns nothing when the country is unknown", () => {
    expect(getSupportContacts(null)).toEqual([]);
  });

  it("matches the country code case-insensitively", () => {
    expect(getSupportContacts("tw")).toEqual(getSupportContacts("TW"));
    expect(getSupportContacts("tw").length).toBeGreaterThan(0);
  });
});
