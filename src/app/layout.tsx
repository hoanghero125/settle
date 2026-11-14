import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

// Drawn for Vietnamese: its diacritics stay legible at large sizes.
// Japanese, Korean and Chinese text falls back to the phone's own CJK font.
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Settle",
  applicationName: "Settle",
  description:
    "Chụp giấy tờ bằng bất kỳ ngôn ngữ nào. Settle xếp hồ sơ, đặt nhắc hạn và soạn sẵn phần trả lời.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f5f9",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
