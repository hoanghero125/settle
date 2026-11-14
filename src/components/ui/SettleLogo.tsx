type SettleLogoProps = {
  className?: string;
  label?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
};

/**
 * Settle's mark: a document becomes a completed task. It remains legible as
 * an Android app icon, a navigation mark, or beside a single task action.
 */
export function SettleLogo({ className = "", label = false, size = "md" }: SettleLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg className={`${sizes[size]} shrink-0 text-carbon`} viewBox="0 0 48 48" role="img" aria-label="Settle">
        <rect width="48" height="48" rx="14" fill="currentColor" />
        <g transform="translate(2 0)">
          <path d="M15 11.5h12.8l5.2 5.2v16.8A3.5 3.5 0 0 1 29.5 37h-15a3.5 3.5 0 0 1-3.5-3.5V15A3.5 3.5 0 0 1 14.5 11.5H15Z" fill="var(--color-sheet)" />
          <path d="M27.5 11.5v6h5.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m17 27 3.8 3.7L28.5 23" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      {label && (
        <span className="leading-tight">
          <span className="block text-lg font-bold tracking-tight">Settle</span>
          <span className="block text-sm text-ink-soft">Việc giấy tờ</span>
        </span>
      )}
    </span>
  );
}
