import { APIConnectionError, APIConnectionTimeoutError, APIError, APIUserAbortError } from "openai";
import { describe, expect, it } from "vitest";
import { mapOpenAIError } from "./openai-errors";

/** Builds the error the SDK throws for an HTTP failure, the same way the SDK does. */
function httpError(status: number): APIError {
  return APIError.generate(status, { error: { message: "raw" } }, "raw", new Headers());
}

describe("mapOpenAIError", () => {
  it("maps a request timeout to timeout", () => {
    expect(mapOpenAIError(new APIConnectionTimeoutError())).toBe("timeout");
  });

  it("maps HTTP 429 to rate_limited", () => {
    expect(mapOpenAIError(httpError(429))).toBe("rate_limited");
  });

  it("maps a connection failure to network", () => {
    expect(mapOpenAIError(new APIConnectionError({ message: "socket hang up" }))).toBe("network");
    // What the SDK builds when no response came back at all.
    expect(mapOpenAIError(APIError.generate(undefined, undefined, "raw", undefined))).toBe("network");
  });

  it.each([400, 401, 403, 404, 422, 500, 503])("maps HTTP %i to internal", (status) => {
    expect(mapOpenAIError(httpError(status))).toBe("internal");
  });

  it("maps anything else to internal", () => {
    expect(mapOpenAIError(new APIUserAbortError())).toBe("internal");
    expect(mapOpenAIError(new Error("boom"))).toBe("internal");
    expect(mapOpenAIError("boom")).toBe("internal");
    expect(mapOpenAIError(undefined)).toBe("internal");
  });
});
