import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "quiet";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-carbon text-white active:bg-carbon-deep",
  quiet: "text-carbon active:bg-line/60",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

/** 56px tall: comfortable for a thumb, one-handed, standing in a queue. */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-6 text-lg font-semibold transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
