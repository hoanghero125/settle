import { describe, expect, it, vi } from "vitest";
import { residentTaxJa } from "@/fixtures/analyses";
import { POST } from "./route";

describe("POST /api/process", () => {
  it("rejects a malformed request with the shared error response", async () => {
    const response = await POST(
      new Request("https://settle.test/api/process", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: "not-an-image" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: { code: "bad_request", message: "Ảnh gửi lên chưa đúng định dạng. Hãy chụp lại." },
    });
    expect(response.status).toBe(400);
  });

  it("returns a safe configuration error when the server has no key", async () => {
    const response = await POST(
      new Request("https://settle.test/api/process", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image: "data:image/jpeg;base64,AA==",
          now: "2026-11-14T10:00:00+07:00",
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "not_configured",
        message: "Máy chủ chưa được cấu hình khóa OpenAI hoặc tên model.",
      },
    });
    expect(response.status).toBe(503);
  });

  it("schedules the processed metric after sending a successful response", async () => {
    vi.resetModules();
    const after = vi.fn();
    const analyzePaperwork = vi.fn().mockResolvedValue(residentTaxJa);
    const incrementMetric = vi.fn().mockResolvedValue(undefined);

    class PaperworkProcessingError extends Error {}

    vi.doMock("next/server", () => ({ after }));
    vi.doMock("@/lib/ai/analyze-paperwork", () => ({ analyzePaperwork, PaperworkProcessingError }));
    vi.doMock("@/lib/ai/feedback", () => ({ incrementMetric }));

    const { POST: postWithMetrics } = await import("./route");
    const response = await postWithMetrics(
      new Request("https://settle.test/api/process", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image: "data:image/jpeg;base64,AA==",
          now: "2026-11-14T10:00:00+07:00",
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(after).toHaveBeenCalledWith(expect.any(Function));
    expect(incrementMetric).not.toHaveBeenCalled();

    vi.doUnmock("next/server");
    vi.doUnmock("@/lib/ai/analyze-paperwork");
    vi.doUnmock("@/lib/ai/feedback");
    vi.resetModules();
  });
});
