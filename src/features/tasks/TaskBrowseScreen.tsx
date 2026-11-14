"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { StoredTask } from "@/lib/contracts";
import { TaskCard } from "@/features/tasks/TaskListScreen";
import { taskMatchesQuery } from "@/features/tasks/search";

type TaskBrowseScreenProps = {
  tasks: StoredTask[];
  onBack: () => void;
  onOpenTask: (task: StoredTask) => void;
  onToggleDone: (task: StoredTask) => void;
};

export function TaskBrowseScreen({ tasks, onBack, onOpenTask, onToggleDone }: TaskBrowseScreenProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => tasks.filter((task) => taskMatchesQuery(task, query)), [query, tasks]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 flex min-h-14 items-center gap-1 px-2 text-lg font-semibold text-carbon active:text-carbon-deep"
        >
          <Icon name="arrow-left" className="size-5" />
          Trang chủ
        </button>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Tất cả việc</h1>
          <span className="pb-1 text-base font-semibold text-ink-soft">{tasks.length} việc</span>
        </div>
        <label className="relative mt-5 block">
          <span className="sr-only">Tìm việc giấy tờ</span>
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tên, từ khóa, hạn, ưu tiên"
            className="min-h-14 w-full rounded-sheet border border-line bg-sheet py-3 pl-12 pr-4 text-lg text-ink outline-none placeholder:text-ink-soft focus:border-carbon"
          />
        </label>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto py-6" aria-live="polite">
        {results.length > 0 ? (
          <ul className="space-y-3" aria-label="Tất cả việc giấy tờ">
            {results.map((task) => (
              <TaskCard key={task.id} task={task} onOpenTask={onOpenTask} onToggleDone={onToggleDone} />
            ))}
          </ul>
        ) : (
          <div className="flex min-h-56 items-center justify-center rounded-sheet border border-line bg-sheet p-5 text-center">
            <div>
              <p className="text-lg font-semibold">Không tìm thấy việc phù hợp</p>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">Thử tên giấy tờ, ngày hạn hoặc “ưu tiên cao”.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
