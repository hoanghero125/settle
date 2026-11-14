import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SettleLogo } from "@/components/ui/SettleLogo";
import type { StoredTask } from "@/lib/contracts";
import { deadlineStatus, formatShortDate, urgencyLabel, urgencyTone } from "@/features/shared/presentation";

type TaskListScreenProps = {
  tasks: StoredTask[] | null;
  onCapture: () => void;
  onChooseFromLibrary: () => void;
  onOpenTask: (task: StoredTask) => void;
  onToggleDone: (task: StoredTask) => void;
};

export function TaskListScreen({ tasks, onCapture, onChooseFromLibrary, onOpenTask, onToggleDone }: TaskListScreenProps) {
  const openTasks = tasks?.filter((task) => !task.done) ?? [];
  const finishedTasks = tasks?.filter((task) => task.done) ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0">
        <div className="flex items-center justify-between gap-4">
          <SettleLogo label size="md" />
          <span className="rounded-full border border-line bg-sheet px-3 py-2 text-sm font-semibold text-ink-soft">Trên máy</span>
        </div>
        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-base font-medium text-ink-soft">Hôm nay</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Việc giấy tờ</h1>
          </div>
          {openTasks.length > 0 && <p className="pb-1 text-base font-semibold text-carbon">{openTasks.length} cần xử lý</p>}
        </div>
      </header>

      <section className="min-h-0 flex-1 py-7" aria-live="polite" aria-busy={tasks === null}>
        {tasks === null && <TaskListLoading />}

        {tasks !== null && tasks.length === 0 && <EmptyState onCapture={onCapture} onChooseFromLibrary={onChooseFromLibrary} />}

        {openTasks.length > 0 && (
          <div>
            <p className="mb-3 text-base font-medium text-ink-soft">
              {openTasks.length === 1 ? "1 việc đang chờ" : `${openTasks.length} việc đang chờ`}
            </p>
            <ul className="space-y-3" aria-label="Việc giấy tờ đang chờ">
              {openTasks.map((task) => (
                <TaskCard key={task.id} task={task} onOpenTask={onOpenTask} onToggleDone={onToggleDone} />
              ))}
            </ul>
          </div>
        )}

        {finishedTasks.length > 0 && (
          <div className={openTasks.length > 0 ? "mt-8" : ""}>
            <p className="mb-3 text-base font-medium text-ink-soft">Đã xong</p>
            <ul className="space-y-3" aria-label="Việc giấy tờ đã xong">
              {finishedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onOpenTask={onOpenTask} onToggleDone={onToggleDone} />
              ))}
            </ul>
          </div>
        )}
      </section>

      {tasks !== null && tasks.length > 0 && (
        <footer className="shrink-0 border-t border-line bg-paper pb-1 pt-4">
          <Button className="w-full" onClick={onCapture}>
            <Icon name="camera" className="size-5" />
            Chụp giấy tờ
          </Button>
          <Button className="mt-2 w-full" variant="quiet" onClick={onChooseFromLibrary}>
            <Icon name="document" className="size-5" />
            Chọn ảnh từ thư viện
          </Button>
        </footer>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onOpenTask,
  onToggleDone,
}: {
  task: StoredTask;
  onOpenTask: (task: StoredTask) => void;
  onToggleDone: (task: StoredTask) => void;
}) {
  const { analysis } = task;
  const deadline = analysis.deadline;

  return (
    <li className={`rounded-sheet border border-line bg-sheet ${task.done ? "opacity-70" : ""}`}>
      <button
        type="button"
        onClick={() => onOpenTask(task)}
        className="block w-full px-5 pb-3 pt-5 text-left active:bg-paper"
        aria-label={`Mở ${analysis.docType}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${urgencyTone(analysis.urgency)}`}>
            {task.done ? "Đã xong" : urgencyLabel(analysis.urgency)}
          </span>
          {deadline && (
            <span className={deadline.confidence === "low" ? "text-base font-semibold text-amber" : "text-base font-semibold text-ink"}>
              {formatShortDate(deadline.date)}
            </span>
          )}
        </div>
        <h2 className="mt-3 text-xl font-semibold leading-snug">{analysis.docType}</h2>
        <p className="mt-1 line-clamp-2 text-base leading-relaxed text-ink-soft">{analysis.sender}</p>
        {deadline && (
          <p className={deadline.confidence === "low" ? "mt-3 text-base text-amber" : "mt-3 text-base text-ink-soft"}>
            {deadline.label}: {deadline.confidence === "low" ? "cần kiểm tra" : deadlineStatus(deadline.date)}
          </p>
        )}
      </button>
      <div className="flex items-center justify-between border-t border-line px-5 py-2">
        <span className="text-sm text-ink-soft">{task.reminderId === null ? "Chưa có nhắc hạn" : "Đã đặt nhắc"}</span>
        <button
          type="button"
          onClick={() => onToggleDone(task)}
          className="min-h-14 px-2 text-base font-semibold text-carbon active:text-carbon-deep"
        >
          {task.done ? "Mở lại việc" : "Đã xong"}
        </button>
      </div>
    </li>
  );
}

function EmptyState({ onCapture, onChooseFromLibrary }: { onCapture: () => void; onChooseFromLibrary: () => void }) {
  return (
    <div className="flex h-full min-h-80 flex-col justify-center" aria-label="Chưa có việc giấy tờ">
      <div className="rounded-sheet border border-line bg-sheet p-5">
        <div className="flex size-12 items-center justify-center rounded-xl bg-carbon/10 text-carbon">
          <Icon name="camera" className="size-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Chưa có việc cần xử lý</h2>
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">
          Chụp giấy tờ để Settle tự tìm hạn chót, xếp việc và soạn sẵn phần cần trả lời.
        </p>
        <dl className="mt-5 divide-y divide-line border-y border-line">
          <div className="flex items-center gap-3 py-3 text-base">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-settled-wash text-settled"><Icon name="check" className="size-4" /></span>
            <div><dt className="font-semibold">Đã xếp hồ sơ</dt><dd className="text-ink-soft">Lưu riêng trên máy của bạn</dd></div>
          </div>
          <div className="flex items-center gap-3 py-3 text-base">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-settled-wash text-settled"><Icon name="check" className="size-4" /></span>
            <div><dt className="font-semibold">Đã chuẩn bị hành động</dt><dd className="text-ink-soft">Nhắc hạn và bản soạn khi đủ rõ</dd></div>
          </div>
        </dl>
        <div className="mt-5 grid gap-2">
          <Button className="w-full" onClick={onCapture}><Icon name="camera" className="size-5" /> Chụp giấy tờ</Button>
          <Button className="w-full" variant="quiet" onClick={onChooseFromLibrary}><Icon name="document" className="size-5" /> Chọn ảnh từ thư viện</Button>
        </div>
      </div>
    </div>
  );
}

function TaskListLoading() {
  return (
    <div className="space-y-3" aria-label="Đang mở việc giấy tờ">
      <div className="h-36 rounded-sheet border border-line bg-sheet" />
      <div className="h-36 rounded-sheet border border-line bg-sheet" />
    </div>
  );
}
