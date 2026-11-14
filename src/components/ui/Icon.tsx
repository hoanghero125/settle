import type { SVGProps } from "react";

export type IconName =
  | "arrow-left"
  | "arrow-right"
  | "camera"
  | "calendar"
  | "check"
  | "copy"
  | "document"
  | "refresh"
  | "share"
  | "speaker";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  title?: string;
};

/** Small, dependency-free icons so the app stays quick to open on a phone. */
export function Icon({ name, title, ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>
      {title && <title>{title}</title>}
      {name === "arrow-left" && <path {...common} d="m15 18-6-6 6-6" />}
      {name === "arrow-right" && <path {...common} d="m9 18 6-6-6-6" />}
      {name === "camera" && (
        <>
          <path {...common} d="M4 7.5h3l1.2-2h7.6l1.2 2h3A1.8 1.8 0 0 1 21.8 9.3v8.9A1.8 1.8 0 0 1 20 20H4a1.8 1.8 0 0 1-1.8-1.8V9.3A1.8 1.8 0 0 1 4 7.5Z" />
          <circle {...common} cx="12" cy="13.5" r="3.5" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect {...common} x="3.5" y="5" width="17" height="15" rx="2" />
          <path {...common} d="M7.5 3v4M16.5 3v4M3.5 10h17" />
        </>
      )}
      {name === "check" && <path {...common} d="m5 12.5 4.2 4.1L19 7" />}
      {name === "copy" && (
        <>
          <rect {...common} x="8" y="8" width="11.5" height="12" rx="2" />
          <path {...common} d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" />
        </>
      )}
      {name === "document" && (
        <>
          <path {...common} d="M6 3.5h8l4 4v13H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
          <path {...common} d="M14 3.5v4h4M8 12h8M8 16h6" />
        </>
      )}
      {name === "refresh" && <path {...common} d="M19 7v4h-4M5 17v-4h4m-3.4-4.1A7 7 0 0 1 19 11m-.6 4.1A7 7 0 0 1 5 13" />}
      {name === "share" && (
        <>
          <circle {...common} cx="18" cy="5" r="2.2" />
          <circle {...common} cx="6" cy="12" r="2.2" />
          <circle {...common} cx="18" cy="19" r="2.2" />
          <path {...common} d="m8 10.9 7.9-4.7M8 13.1l7.9 4.7" />
        </>
      )}
      {name === "speaker" && (
        <>
          <path {...common} d="M4 10v4h3l4 3V7L7 10H4Z" />
          <path {...common} d="M15 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10" />
        </>
      )}
    </svg>
  );
}
