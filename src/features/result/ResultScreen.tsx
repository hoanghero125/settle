import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SettleLogo } from "@/components/ui/SettleLogo";
import { Stamp } from "@/components/ui/Stamp";
import { confidenceLabel, draftActionLabel, formatFullDate } from "@/features/shared/presentation";
import type { Draft, PaperworkAnalysis, StoredTask, SupportContact } from "@/lib/contracts";

export type ReminderStatus = "scheduled" | "not-needed" | "needs-check" | "not-scheduled" | "not-available" | "cancelled";

type ResultScreenProps = {
  analysis: PaperworkAnalysis;
  task: StoredTask | null;
  reminderStatus: ReminderStatus;
  speaking: boolean;
  speechNotice: string;
  demoReminderNotice: string;
  showDemoReminder: boolean;
  supportContacts: SupportContact[];
  onBack: () => void;
  onUndoFiling: () => void;
  onUndoReminder: () => void;
  onShareDraft: (draft: Draft) => void;
  onSpeak: (text: string, language: string) => void;
  onScheduleDemoReminder: () => void;
};

export function ResultScreen({
  analysis,
  task,
  reminderStatus,
  speaking,
  speechNotice,
  demoReminderNotice,
  showDemoReminder,
  supportContacts,
  onBack,
  onUndoFiling,
  onUndoReminder,
  onShareDraft,
  onSpeak,
  onScheduleDemoReminder,
}: ResultScreenProps) {
  if (!analysis.isPaperwork) {
    return <NotPaperworkScreen message={analysis.notPaperworkReason ?? "Ảnh này không phải giấy tờ."} onBack={onBack} />;
  }

  const deadlineNeedsCheck = analysis.deadline?.confidence === "low";
  const reminder = reminderCopy(reminderStatus, analysis.deadline?.date);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-full text-carbon active:bg-line"
            aria-label="Quay lại Việc giấy tờ"
          >
            <Icon name="arrow-left" className="size-6" />
          </button>
          <p className="text-base font-medium text-ink-soft">Kết quả đã sẵn sàng</p>
        </div>
        <SettleLogo size="sm" />
      </header>

      <section className="mt-5">
        <Stamp urgency={analysis.urgency} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{analysis.docType}</h1>
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">{analysis.sender}</p>
        <div className="mt-5 border-l-4 border-carbon pl-4">
          <p className="text-lg leading-relaxed">{analysis.summary}</p>
          <button
            type="button"
            onClick={() => onSpeak(analysis.summary, "vi")}
            disabled={speaking}
            className="mt-3 inline-flex min-h-14 items-center gap-2 px-1 text-base font-semibold text-carbon active:text-carbon-deep disabled:opacity-50"
          >
            <Icon name="speaker" className="size-5" />
            {speaking ? "Đang phát" : "Nghe tóm tắt"}
          </button>
        </div>
        {speechNotice && <p className="mt-3 text-base leading-relaxed text-amber" role="status">{speechNotice}</p>}
      </section>

      <section className="mt-8" aria-labelledby="settle-done-heading">
        <h2 id="settle-done-heading" className="text-xl font-semibold">Settle đã làm</h2>
        <div className="mt-3 space-y-3">
          <ActionCard
            icon="document"
            title={task ? "Đã xếp vào Việc giấy tờ" : "Đã bỏ khỏi Việc giấy tờ"}
            detail={task ? "Việc này sẽ còn ở đây sau khi bạn đóng app." : "Giấy tờ này không còn trong danh sách trên máy."}
            action={
              task ? (
                <Button variant="quiet" className="mt-3 w-full" onClick={onUndoFiling}>
                  Hoàn tác xếp hồ sơ
                </Button>
              ) : undefined
            }
          />
          <ActionCard
            icon="calendar"
            title={reminder.title}
            detail={reminder.detail}
            tone={reminder.tone}
            action={
              task ? (
                <div className="mt-3 grid gap-2">
                  {reminderStatus === "scheduled" && task.reminderId !== null && (
                    <Button variant="quiet" className="w-full" onClick={onUndoReminder}>
                      Hoàn tác nhắc hạn
                    </Button>
                  )}
                  {showDemoReminder && (
                    <Button variant="quiet" className="w-full" onClick={onScheduleDemoReminder}>
                      Thử nhắc sau 30 giây
                    </Button>
                  )}
                  {demoReminderNotice && <p className="text-center text-base text-ink-soft" role="status">{demoReminderNotice}</p>}
                </div>
              ) : undefined
            }
          />
          <ActionCard
            icon="check"
            title={analysis.drafts.length > 0 ? `Đã soạn sẵn ${analysis.drafts.length} phần trả lời` : "Chưa cần soạn phần trả lời"}
            detail={analysis.drafts.length > 0 ? "Bạn chọn khi nào và cách gửi. Settle không tự gửi thay bạn." : "Giấy tờ này chỉ để bạn biết thông tin."}
          />
        </div>
      </section>

      {deadlineNeedsCheck && analysis.deadline && (
        <section className="mt-6 rounded-sheet border border-amber bg-amber-wash p-5" aria-label="Hạn chót cần kiểm tra">
          <p className="text-lg font-semibold text-amber">Hạn chót cần kiểm tra</p>
          <p className="mt-1 text-lg leading-relaxed text-amber">
            Settle đọc được {formatFullDate(analysis.deadline.date)}, nhưng chữ trên giấy chưa đủ rõ nên chưa đặt nhắc.
          </p>
          <p className="mt-3 text-base leading-relaxed text-amber">“{analysis.deadline.sourceText}”</p>
        </section>
      )}

      {(analysis.keyFacts.length > 0 || analysis.deadline) && (
        <section className="mt-8" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-xl font-semibold">Chi tiết trên giấy</h2>
          <dl className="mt-3 divide-y divide-line rounded-sheet border border-line bg-sheet px-5">
            {analysis.keyFacts.map((fact) => (
              <div key={`${fact.label}-${fact.sourceText}`} className="py-4">
                <dt className="text-base text-ink-soft">{fact.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{fact.value}</dd>
                <dd className="mt-2 text-base leading-relaxed text-ink-soft">“{fact.sourceText}”</dd>
                {fact.confidence !== "high" && (
                  <dd className="mt-2 text-base font-medium text-amber">{confidenceLabel(fact.confidence)}</dd>
                )}
              </div>
            ))}
            {analysis.deadline && (
              <div className="py-4">
                <dt className="text-base text-ink-soft">{analysis.deadline.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{formatFullDate(analysis.deadline.date)}</dd>
                <dd className="mt-2 text-base leading-relaxed text-ink-soft">“{analysis.deadline.sourceText}”</dd>
                {analysis.deadline.confidence !== "high" && (
                  <dd className="mt-2 text-base font-medium text-amber">{confidenceLabel(analysis.deadline.confidence)}</dd>
                )}
              </div>
            )}
          </dl>
        </section>
      )}

      {analysis.uncertain.length > 0 && (
        <section className="mt-6 rounded-sheet border border-amber bg-amber-wash p-5" aria-labelledby="check-heading">
          <h2 id="check-heading" className="text-lg font-semibold text-amber">Hãy kiểm tra lại</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-lg leading-relaxed text-amber">
            {analysis.uncertain.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {supportContacts.length > 0 && (
        <section className="mt-8" aria-labelledby="support-heading">
          <h2 id="support-heading" className="text-xl font-semibold">Nơi có thể hỗ trợ</h2>
          <p className="mt-1 text-base leading-relaxed text-ink-soft">Số điện thoại đã được Settle kiểm tra từ nguồn chính thức.</p>
          <div className="mt-3 space-y-3">
            {supportContacts.map((contact) => (
              <article key={`${contact.organization}-${contact.phone}`} className="rounded-sheet border border-line bg-sheet p-5">
                <h3 className="text-lg font-semibold leading-snug">{contact.organization}</h3>
                {contact.hours && <p className="mt-2 text-base leading-relaxed text-ink-soft">{contact.hours}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href={`tel:${contact.phone}`} className="inline-flex min-h-14 items-center text-lg font-semibold text-carbon active:text-carbon-deep">
                    Gọi {contact.phone}
                  </a>
                  <a href={contact.source} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center text-base font-semibold text-carbon active:text-carbon-deep">
                    Xem nguồn chính thức
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {analysis.drafts.length > 0 && (
        <section className="mt-8" aria-labelledby="drafts-heading">
          <h2 id="drafts-heading" className="text-xl font-semibold">Phần trả lời đã soạn</h2>
          <div className="mt-3 space-y-3">
            {analysis.drafts.map((draft) => (
              <article key={`${draft.kind}-${draft.recipient}-${draft.original}`} className="rounded-sheet border border-line bg-sheet p-5">
                <p className="text-base font-medium text-ink-soft">Cho {draft.recipient}</p>
                <p className="mt-3 text-3xl font-semibold leading-snug">{draft.original}</p>
                <p className="mt-4 border-t border-line pt-4 text-lg leading-relaxed text-ink-soft">{draft.vietnamese}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={() => onShareDraft(draft)}>
                    <Icon name="share" className="size-5" />
                    {draftActionLabel(draft.kind)}
                  </Button>
                  <Button variant="quiet" onClick={() => onSpeak(draft.original, analysis.language)} disabled={speaking}>
                    <Icon name="speaker" className="size-5" />
                    {speaking ? "Đang phát" : "Nghe câu này"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  detail,
  action,
  tone = "settled",
}: {
  icon: "document" | "calendar" | "check";
  title: string;
  detail: string;
  action?: ReactNode;
  tone?: "settled" | "amber";
}) {
  const isAmber = tone === "amber";
  return (
    <article className={isAmber ? "rounded-sheet border border-amber bg-amber-wash p-5" : "rounded-sheet border border-line bg-sheet p-5"}>
      <div className="flex items-start gap-3">
        <span className={isAmber ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-amber text-white" : "flex size-9 shrink-0 items-center justify-center rounded-full bg-settled-wash text-settled"}>
          <Icon name={icon} className="size-5" />
        </span>
        <div>
          <h3 className={isAmber ? "text-lg font-semibold text-amber" : "text-lg font-semibold"}>{title}</h3>
          <p className={isAmber ? "mt-1 text-base leading-relaxed text-amber" : "mt-1 text-base leading-relaxed text-ink-soft"}>{detail}</p>
        </div>
      </div>
      {action}
    </article>
  );
}

function reminderCopy(status: ReminderStatus, deadline: string | undefined) {
  if (status === "scheduled") {
    return { title: `Đã đặt nhắc ${deadline ? formatFullDate(deadline) : "hạn chót"}`, detail: "Settle sẽ nhắc trên điện thoại trước hạn.", tone: "settled" as const };
  }
  if (status === "needs-check") {
    return { title: "Chưa đặt nhắc hạn", detail: "Hạn chót đọc chưa chắc chắn nên cần bạn kiểm tra trên giấy.", tone: "amber" as const };
  }
  if (status === "not-scheduled") {
    return { title: "Mở bằng app để nhận nhắc hạn", detail: "Settle đã nhận ra hạn nhưng trang web không thể đặt thông báo trên điện thoại.", tone: "amber" as const };
  }
  if (status === "not-available") {
    return { title: "Chưa đặt nhắc hạn", detail: "Giấy tờ này chưa có thời điểm nhắc hợp lệ để đặt tự động.", tone: "amber" as const };
  }
  if (status === "cancelled") {
    return { title: "Đã hoàn tác nhắc hạn", detail: "Thông báo này sẽ không hiện trên điện thoại.", tone: "amber" as const };
  }
  return { title: "Chưa cần đặt nhắc", detail: "Giấy tờ này chưa có hạn chót để theo dõi.", tone: "settled" as const };
}

function NotPaperworkScreen({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-full text-carbon active:bg-line"
            aria-label="Quay lại Việc giấy tờ"
          >
            <Icon name="arrow-left" className="size-6" />
          </button>
          <p className="text-base font-medium text-ink-soft">Kết quả đã sẵn sàng</p>
        </div>
        <SettleLogo size="sm" />
      </header>
      <section className="flex flex-1 flex-col justify-center py-8">
        <div className="rounded-sheet border border-amber bg-amber-wash p-5">
          <h1 className="text-xl font-semibold text-amber">Chưa thấy giấy tờ trong ảnh</h1>
          <p className="mt-2 text-lg leading-relaxed text-amber">{message}</p>
        </div>
        <Button className="mt-6 w-full" onClick={onBack}>
          Về Việc giấy tờ
        </Button>
      </section>
    </div>
  );
}
