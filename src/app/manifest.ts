import type { MetadataRoute } from "next";

// Lets people testing by link add Settle to their home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Settle",
    short_name: "Settle",
    description: "Chụp là xong việc giấy tờ.",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f5f9",
    theme_color: "#f2f5f9",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
