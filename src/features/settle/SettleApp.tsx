"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { ApiClientError, processPaperwork, sendFeedback, speak as requestSpeech } from "@/lib/api-client";
import type { Draft, PaperworkAnalysis, StoredTask } from "@/lib/contracts";
import { downscaleImage } from "@/lib/image/downscale";
import { hapticTap, onBackButton, shareText } from "@/lib/native";
import {
  applyAutoReminder,
  isDemoMode,
  scheduleDemoReminder,
  shouldAutoSchedule,
  undoReminder as undoScheduledReminder,
} from "@/lib/native/reminders";
import { createTask, loadTasks, saveTasks, sortTasks } from "@/lib/store/tasks";
import { getSupportContacts } from "@/lib/support/contacts";
import { ProcessingErrorScreen } from "@/features/processing/ProcessingErrorScreen";
import { ProcessingScreen } from "@/features/processing/ProcessingScreen";
import { DraftDisplayScreen } from "@/features/result/DraftDisplayScreen";
import { ResultScreen, type ReminderStatus } from "@/features/result/ResultScreen";
import { TaskBrowseScreen } from "@/features/tasks/TaskBrowseScreen";
import { TaskListScreen } from "@/features/tasks/TaskListScreen";

type ResultState = {
  name: "result";
  analysis: PaperworkAnalysis;
  taskId: string | null;
  reminderStatus: ReminderStatus;
  returnTo: "tasks" | "all-tasks";
};

type DraftState = Omit<ResultState, "name"> & { name: "draft"; draft: Draft };

type Screen =
  | { name: "tasks" }
  | { name: "all-tasks" }
  | { name: "processing"; image: string | null }
  | ResultState
  | DraftState
  | { name: "error"; message: string; image: string | null };

const GENERIC_ERROR = "Có lỗi xảy ra. Hãy thử lại.";

export function SettleApp() {
  const [tasks, setTasks] = useState<StoredTask[] | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: "tasks" });
  const [speaking, setSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState("");
  const [demoReminderNotice, setDemoReminderNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState("");
  const [feedbackVerdict, setFeedbackVerdict] = useState<"up" | "down" | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const screenRef = useRef(screen);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processingRun = useRef(0);

  useEffect(() => {
    // Read phone-only storage after hydration so the server shell stays deterministic.
    const frame = window.requestAnimationFrame(() => {
      setTasks((current) => current ?? sortTasks(loadTasks()));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    return onBackButton(() => {
      const current = screenRef.current;
      if (current.name === "tasks") return false;
      if (current.name === "all-tasks") {
        setScreen({ name: "tasks" });
        return true;
      }
      if (current.name === "processing") {
        processingRun.current += 1;
        setScreen({ name: "tasks" });
        return true;
      }
      if (current.name === "draft") {
        setScreen({
          name: "result",
          analysis: current.analysis,
          taskId: current.taskId,
          reminderStatus: current.reminderStatus,
          returnTo: current.returnTo,
        });
        return true;
      }
      if (current.name === "error") {
        setScreen({ name: "tasks" });
        return true;
      }
      setScreen(current.returnTo === "all-tasks" ? { name: "all-tasks" } : { name: "tasks" });
      return true;
    });
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const updateTasks = useCallback((update: (current: StoredTask[]) => StoredTask[]) => {
    setTasks((current) => {
      const next = sortTasks(update(current ?? []));
      saveTasks(next);
      return next;
    });
  }, []);

  const processImage = useCallback(
    async (image: string, existingRun?: number) => {
      const run = existingRun ?? ++processingRun.current;
      if (run !== processingRun.current) return;
      setSpeechNotice("");
      setScreen({ name: "processing", image });
      try {
        if (!navigator.onLine) throw new ApiClientError("network");
        const analysis = await processPaperwork(image);
        if (run !== processingRun.current) return;
        if (!analysis.isPaperwork) {
          void hapticTap();
          setScreen({ name: "result", analysis, taskId: null, reminderStatus: "not-needed", returnTo: "tasks" });
          return;
        }

        const task = createTask(analysis);
        updateTasks((current) => [task, ...current]);

        const taskWithReminder = await applyAutoReminder(task);
        if (run !== processingRun.current) return;
        if (taskWithReminder.reminderId !== task.reminderId) {
          updateTasks((current) => current.map((row) => (row.id === task.id ? taskWithReminder : row)));
        }
        const reminderStatus = reminderStatusFor(analysis, taskWithReminder.reminderId);

        if (run !== processingRun.current) return;
        void hapticTap();
        setScreen({ name: "result", analysis, taskId: task.id, reminderStatus, returnTo: "tasks" });
      } catch (error) {
        if (run !== processingRun.current) return;
        const message = error instanceof ApiClientError ? error.message : GENERIC_ERROR;
        setScreen({ name: "error", message, image });
      }
    },
    [updateTasks],
  );

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const run = ++processingRun.current;
    setScreen({ name: "processing", image: null });
    try {
      const image = await downscaleImage(file);
      if (run !== processingRun.current) return;
      await processImage(image, run);
    } catch {
      if (run !== processingRun.current) return;
      setScreen({ name: "error", message: "Không thể chuẩn bị ảnh. Hãy chụp lại giấy tờ ở nơi đủ sáng.", image: null });
    }
  }

  function openCamera() {
    cameraInput.current?.click();
  }

  function chooseFromLibrary() {
    libraryInput.current?.click();
  }

  function cancelProcessing() {
    processingRun.current += 1;
    setScreen({ name: "tasks" });
  }

  function openTask(task: StoredTask, returnTo: ResultState["returnTo"] = "tasks") {
    setSpeechNotice("");
    setDemoReminderNotice("");
    setCopyNotice("");
    setFeedbackNotice("");
    setFeedbackVerdict(null);
    setScreen({
      name: "result",
      analysis: task.analysis,
      taskId: task.id,
      reminderStatus: reminderStatusFor(task.analysis, task.reminderId),
      returnTo,
    });
  }

  function toggleTaskDone(task: StoredTask) {
    updateTasks((current) => current.map((row) => (row.id === task.id ? { ...row, done: !row.done } : row)));
    void hapticTap();
  }

  async function handleUndoReminder() {
    if (screen.name !== "result" || !screen.taskId) return;
    const task = tasks?.find((row) => row.id === screen.taskId);
    if (!task?.reminderId) return;

    try {
      const updated = await undoScheduledReminder(task);
      updateTasks((current) => current.map((row) => (row.id === task.id ? updated : row)));
      setScreen((current) =>
        current.name === "result" ? { ...current, reminderStatus: updated.reminderId === null ? "cancelled" : "scheduled" } : current,
      );
    } catch {
      // The native helper is intentionally non-throwing; retain the task if a platform call fails unexpectedly.
    }
    void hapticTap();
  }

  async function undoFiling() {
    if (screen.name !== "result" || !screen.taskId) return;
    const task = tasks?.find((row) => row.id === screen.taskId);
    if (!task) return;

    const taskAfterUndo = await undoScheduledReminder(task);
    updateTasks((current) => current.filter((row) => row.id !== task.id));
    setScreen((current) =>
      current.name === "result"
        ? { ...current, taskId: null, reminderStatus: taskAfterUndo.reminderId === null ? current.reminderStatus : "cancelled" }
        : current,
    );
    void hapticTap();
  }

  async function handleSpeak(text: string, language: string) {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeechNotice("");
    setSpeaking(true);
    try {
      const url = await requestSpeech(text, language);
      const audio = new Audio(url);
      audioRef.current = audio;
      const release = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        setSpeaking(false);
      };
      audio.addEventListener("ended", release, { once: true });
      audio.addEventListener("error", release, { once: true });
      await audio.play();
    } catch (error) {
      setSpeaking(false);
      setSpeechNotice(error instanceof ApiClientError ? error.message : "Chưa phát được bản đọc. Hãy thử lại.");
    }
  }

  async function shareDraft(draft: Draft) {
    await shareText({ title: "Settle", text: draft.original });
  }

  function openDraft(draft: Draft) {
    if (screen.name !== "result") return;
    setCopyNotice("");
    setScreen({ ...screen, name: "draft", draft });
  }

  function closeDraft() {
    if (screen.name !== "draft") return;
    setScreen({
      name: "result",
      analysis: screen.analysis,
      taskId: screen.taskId,
      reminderStatus: screen.reminderStatus,
      returnTo: screen.returnTo,
    });
  }

  async function copyDraft(text: string) {
    setCopyNotice("");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard is unavailable");
      await navigator.clipboard.writeText(text);
      setCopyNotice("Đã sao chép bản gốc.");
    } catch {
      setCopyNotice("Chưa sao chép được. Hãy dùng nút chia sẻ.");
    }
  }

  async function submitFeedback(verdict: "up" | "down") {
    setFeedbackNotice("");
    try {
      await sendFeedback(verdict);
      setFeedbackVerdict(verdict);
      setFeedbackNotice("Đã ghi nhận phản hồi.");
    } catch (error) {
      setFeedbackNotice(error instanceof ApiClientError ? error.message : GENERIC_ERROR);
    }
  }

  async function scheduleDemo(task: StoredTask) {
    const scheduled = await scheduleDemoReminder(task, 30);
    setDemoReminderNotice(scheduled ? "Đã đặt nhắc thử sau 30 giây." : "Mở bằng app để nhận nhắc hạn.");
  }

  const resultLikeScreen = screen.name === "result" || screen.name === "draft";
  const visibleTask = resultLikeScreen ? tasks?.find((task) => task.id === screen.taskId) ?? null : null;
  const supportContacts = screen.name === "result" ? getSupportContacts(screen.analysis.country) : [];

  return (
    <main className="mx-auto flex h-[100svh] min-h-0 w-full max-w-md shrink-0 flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handlePhoto}
        tabIndex={-1}
      />
      <input ref={libraryInput} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} tabIndex={-1} />
      {screen.name === "tasks" && (
        <TaskListScreen
          tasks={tasks}
          onCapture={openCamera}
          onChooseFromLibrary={chooseFromLibrary}
          onOpenTask={openTask}
          onToggleDone={toggleTaskDone}
          onViewAll={() => setScreen({ name: "all-tasks" })}
        />
      )}
      {screen.name === "all-tasks" && (
        <TaskBrowseScreen
          tasks={tasks ?? []}
          onBack={() => setScreen({ name: "tasks" })}
          onOpenTask={(task) => openTask(task, "all-tasks")}
          onToggleDone={toggleTaskDone}
        />
      )}
      {screen.name === "processing" && <ProcessingScreen image={screen.image} onCancel={cancelProcessing} />}
      {screen.name === "error" && (
        <ProcessingErrorScreen
          message={screen.message}
          canRetry={screen.image !== null}
          onRetry={() => screen.image && void processImage(screen.image)}
          onCaptureAgain={openCamera}
          onBack={() => setScreen({ name: "tasks" })}
        />
      )}
      {screen.name === "draft" && (
        <DraftDisplayScreen
          draft={screen.draft}
          language={screen.analysis.language}
          speaking={speaking}
          copyNotice={copyNotice}
          onBack={closeDraft}
          onSpeak={(text, language) => void handleSpeak(text, language)}
          onCopy={(text) => void copyDraft(text)}
          onShare={(draft) => void shareDraft(draft)}
        />
      )}
      {screen.name === "result" && (
        <ResultScreen
          analysis={screen.analysis}
          task={visibleTask}
          reminderStatus={screen.reminderStatus}
          speaking={speaking}
          speechNotice={speechNotice}
          demoReminderNotice={demoReminderNotice}
          showDemoReminder={isDemoMode()}
          supportContacts={supportContacts}
          onBack={() => setScreen(screen.returnTo === "all-tasks" ? { name: "all-tasks" } : { name: "tasks" })}
          onUndoFiling={() => void undoFiling()}
          onUndoReminder={() => void handleUndoReminder()}
          onShareDraft={(draft) => void shareDraft(draft)}
          onSpeak={(text, language) => void handleSpeak(text, language)}
          onScheduleDemoReminder={() => visibleTask && void scheduleDemo(visibleTask)}
          onOpenDraft={openDraft}
          onCopyDraft={(text) => void copyDraft(text)}
          copyNotice={copyNotice}
          feedbackVerdict={feedbackVerdict}
          feedbackNotice={feedbackNotice}
          onFeedback={(verdict) => void submitFeedback(verdict)}
        />
      )}
    </main>
  );
}

function reminderStatusFor(analysis: PaperworkAnalysis, reminderId: number | null): ReminderStatus {
  if (reminderId !== null) return "scheduled";
  if (!analysis.deadline) return "not-needed";
  if (analysis.deadline.confidence === "low") return "needs-check";
  if (shouldAutoSchedule(analysis, new Date())) return "not-scheduled";
  return "not-available";
}
