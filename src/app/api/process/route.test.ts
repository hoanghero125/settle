import { describe, expect, it } from "vitest";
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
});
