import type { CapacitorConfig } from "@capacitor/cli";

// The APK is a native shell around the deployed web app. APP_URL is read when
// `npx cap sync android` runs (CI passes it), so shipping a feature is a Vercel
// deploy, not an APK rebuild. Without APP_URL the shell shows capacitor-shell/index.html.
const appUrl = process.env.APP_URL?.trim();

const config: CapacitorConfig = {
  appId: "app.settle.mobile",
  appName: "Settle",
  webDir: "capacitor-shell",
  ...(appUrl ? { server: { url: appUrl, androidScheme: "https" } } : {}),
  plugins: {
    SplashScreen: { launchAutoHide: true, launchShowDuration: 600, backgroundColor: "#F2F5F9" },
    LocalNotifications: { iconColor: "#2F4BD8" },
  },
};

export default config;
