import { StoredTaskSchema, type PaperworkAnalysis, type StoredTask } from "@/lib/contracts";

/**
 * The "Việc giấy tờ" list. It lives on the phone only (localStorage inside the
 * app's WebView), which is why it survives closing and reopening the app and
 * why no document ever needs to be stored on a server.
 */

const KEY = "settle.tasks.v1";

export function loadTasks(): StoredTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    // Drop rows written by an older, incompatible build instead of crashing.
    return raw.flatMap((row) => {
      const parsed = StoredTaskSchema.safeParse(row);
      return parsed.success ? [parsed.data] : [];
    });
  } catch {
    return [];
  }
}

export function saveTasks(tasks: StoredTask[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function createTask(analysis: PaperworkAnalysis): StoredTask {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    analysis,
    reminderId: null,
    done: false,
  };
}

/** Open tasks first, nearest deadline on top; tasks without a deadline go last. */
export function sortTasks(tasks: StoredTask[]): StoredTask[] {
  const rank = (task: StoredTask) => task.analysis.deadline?.date ?? "9999-12-31";
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || rank(a).localeCompare(rank(b)));
}
