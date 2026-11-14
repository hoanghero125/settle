import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("POST /api/feedback", () => {
  it("accepts an anonymous verdict without returning any user data", async () => {
    const response = await POST(
      new Request("https://settle.test/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ verdict: "up" }),
      }),
    );

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
  });

  it("rejects any body that is not the feedback contract", async () => {
    const response = await POST(
      new Request("https://settle.test/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ verdict: "up", image: "data:image/jpeg;base64,AA==" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns three zeroed aggregates when metrics storage is not configured", async () => {
    const response = await GET();

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ processed: 0, up: 0, down: 0 });
  });
});
