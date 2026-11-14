import { beforeEach, describe, expect, it, vi } from "vitest";
import { residentTaxJa } from "@/fixtures/analyses";
import type { ApiErrorCode, ProcessRequest } from "@/lib/contracts";
import { getOpenAI } from "./client";
import { analyzePaperwork, PaperworkProcessingError } from "./analyze-paperwork";
import { getVisionModel } from "./models";
import { IMAGE_UNREADABLE_REASON } from "./prompt";

vi.mock("./client", () => ({ getOpenAI: vi.fn() }));
vi.mock("./models", () => ({ getVisionModel: vi.fn() }));

const input: ProcessRequest = {
  image: "data:image/jpeg;base64,AA==",
  now: "2026-11-14T10:00:00+07:00",
  timeZone: "Asia/Ho_Chi_Minh",
};

const mockedGetOpenAI = vi.mocked(getOpenAI);
const mockedGetVisionModel = vi.mocked(getVisionModel);
const parse = vi.fn();
const client = { responses: { parse } };

async function expectError(promise: Promise<unknown>, code: ApiErrorCode): Promise<void> {
  await expect(promise).rejects.toEqual(expect.objectContaining<Partial<PaperworkProcessingError>>({ code }));
}

describe("analyzePaperwork", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetOpenAI.mockReturnValue(client as never);
    mockedGetVisionModel.mockReturnValue("vision-model");
  });

  it("reports missing server configuration before calling OpenAI", async () => {
    mockedGetOpenAI.mockReturnValue(null);

    await expectError(analyzePaperwork(input), "not_configured");
    expect(parse).not.toHaveBeenCalled();
  });

  it("sends one non-persisted structured vision request", async () => {
    parse.mockResolvedValue({ output: [], output_parsed: residentTaxJa });

    await expect(analyzePaperwork(input)).resolves.toEqual(residentTaxJa);
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse.mock.calls[0]?.[0]).toMatchObject({
      model: "vision-model",
      store: false,
      input: [{ content: [{ type: "input_text" }, { type: "input_image", image_url: input.image }] }],
    });
  });

  it("removes an unsafe reminder from a low-confidence deadline", async () => {
    parse.mockResolvedValue({
      output: [],
      output_parsed: {
        ...residentTaxJa,
        deadline: { ...residentTaxJa.deadline, confidence: "low" },
      },
    });

    await expect(analyzePaperwork(input)).resolves.toMatchObject({ reminder: null });
  });

  it("asks for another photo when the model marks the image unreadable", async () => {
    parse.mockResolvedValue({
      output: [],
      output_parsed: { ...residentTaxJa, isPaperwork: false, notPaperworkReason: IMAGE_UNREADABLE_REASON },
    });

    await expectError(analyzePaperwork(input), "image_unreadable");
  });

  it("maps an explicit model refusal to a typed error", async () => {
    parse.mockResolvedValue({
      output: [{ type: "message", content: [{ type: "refusal" }] }],
      output_parsed: null,
    });

    await expectError(analyzePaperwork(input), "model_refused");
  });
});
