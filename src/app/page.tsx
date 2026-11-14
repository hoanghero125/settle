"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Stamp } from "@/components/ui/Stamp";
import { ApiClientError, processPaperwork } from "@/lib/api-client";
import type { PaperworkAnalysis } from "@/lib/contracts";
import { downscaleImage } from "@/lib/image/downscale";
import { scheduleReminder } from "@/lib/native";

/**
 * Scaffold screen. It proves the wiring end to end (camera → downscale →
 * api-client → typed result or typed error) and is replaced by the real
 * screens in src/features: tasks, processing, result.
 */

type Screen =
  | { name: "tasks" }
  | { name: "processing" }
  | { name: "result"; analysis: PaperworkAnalysis }
  | { name: "error"; message: string };

export default function Home() {
  const [screen, setScreen] = useState<Screen>({ name: "tasks" });
  const [notice, setNotice] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setScreen({ name: "processing" });
    try {
      const analysis = await processPaperwork(await downscaleImage(file));
      setScreen({ name: "result", analysis });
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Có lỗi xảy ra. Hãy thử lại.";
      setScreen({ name: "error", message });
    }
  }

  // Kickoff check for the installed APK. Remove once real reminders exist.
  async function testNotification() {
    const scheduled = await scheduleReminder({
      id: 1,
      title: "Settle",
      body: "Thông báo thử đã chạy.",
      at: new Date(Date.now() + 10_000),
    });
    setNotice(scheduled ? "Thông báo thử sẽ hiện sau 10 giây." : "Thông báo chỉ chạy trong app đã cài trên Android.");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header>
        <h1 className="text-3xl font-bold">Settle</h1>
        <p className="mt-1 text-lg text-ink-soft">Chụp là xong việc giấy tờ.</p>
      </header>

      <section className="flex flex-1 flex-col justify-center py-8" aria-live="polite">
        {screen.name === "tasks" && (
          <>
            <h2 className="text-xl font-semibold">Chưa có việc giấy tờ nào</h2>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">
              Chụp một tờ giấy bằng bất kỳ ngôn ngữ nào. Settle sẽ xếp hồ sơ, đặt nhắc hạn và soạn sẵn phần trả lời.
            </p>
          </>
        )}

        {screen.name === "processing" && <p className="text-xl font-semibold">Đang xử lý giấy tờ…</p>}

        {screen.name === "result" && (
          <div className="rounded-sheet border border-line bg-sheet p-5">
            {screen.analysis.isPaperwork ? (
              <>
                <Stamp urgency={screen.analysis.urgency} />
                <h2 className="mt-4 text-xl font-semibold">{screen.analysis.docType}</h2>
                <p className="mt-2 text-lg leading-relaxed">{screen.analysis.summary}</p>
              </>
            ) : (
              <p className="text-lg leading-relaxed">{screen.analysis.notPaperworkReason}</p>
            )}
          </div>
        )}

        {screen.name === "error" && (
          <div className="rounded-sheet border border-amber bg-amber-wash p-5">
            <p className="text-lg leading-relaxed text-amber">{screen.message}</p>
          </div>
        )}
      </section>

      <footer className="flex flex-col gap-2">
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
        <Button onClick={() => cameraInput.current?.click()} disabled={screen.name === "processing"}>
          Chụp giấy tờ
        </Button>
        <Button variant="quiet" onClick={testNotification}>
          Thử thông báo
        </Button>
        {notice && <p className="text-center text-base text-ink-soft">{notice}</p>}
      </footer>
    </main>
  );
}
