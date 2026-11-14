import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SettleLogo } from "@/components/ui/SettleLogo";

type ProcessingErrorScreenProps = {
  message: string;
  canRetry: boolean;
  onRetry: () => void;
  onCaptureAgain: () => void;
  onBack: () => void;
};

export function ProcessingErrorScreen({ message, canRetry, onRetry, onCaptureAgain, onBack }: ProcessingErrorScreenProps) {
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
          <p className="text-base font-medium text-ink-soft">Cần chụp lại</p>
        </div>
        <SettleLogo size="sm" />
      </header>

      <section className="flex flex-1 flex-col justify-center py-8" aria-live="assertive">
        <div className="rounded-sheet border border-amber bg-amber-wash p-5">
          <h1 className="text-xl font-semibold text-amber">Chưa đọc được giấy tờ</h1>
          <p className="mt-2 text-lg leading-relaxed text-amber">{message}</p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          {canRetry && (
            <Button onClick={onRetry}>
              <Icon name="refresh" className="size-5" />
              Thử lại
            </Button>
          )}
          <Button variant={canRetry ? "quiet" : "primary"} onClick={onCaptureAgain}>
            <Icon name="camera" className="size-5" />
            Chụp lại
          </Button>
        </div>
      </section>
    </div>
  );
}
