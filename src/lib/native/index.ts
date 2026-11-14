import { Capacitor } from "@capacitor/core";

/**
 * Everything that talks to the Android shell goes through this file, so the
 * same screens also run as a plain web page for people testing by link.
 * Plugins are imported lazily: they must not load during server rendering.
 *
 * Adding a new Capacitor plugin means rebuilding and reinstalling the APK.
 */

export const isNative = (): boolean => Capacitor.isNativePlatform();

export type ReminderInput = { id: number; title: string; body: string; at: Date };

/** Schedules a phone notification. Returns false on the web or when the user denies permission. */
export async function scheduleReminder({ id, title, body, at }: ReminderInput): Promise<boolean> {
  if (!isNative()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted") permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return false;

  await LocalNotifications.schedule({
    notifications: [{ id, title, body, schedule: { at, allowWhileIdle: true } }],
  });
  return true;
}

/** Undo for scheduleReminder. */
export async function cancelReminder(id: number): Promise<void> {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

/** Opens the system share sheet. Returns false when sharing is unavailable or dismissed. */
export async function shareText(input: { title: string; text: string }): Promise<boolean> {
  try {
    if (isNative()) {
      const { Share } = await import("@capacitor/share");
      await Share.share(input);
      return true;
    }
    if (typeof navigator.share === "function") {
      await navigator.share(input);
      return true;
    }
  } catch {
    // The user closed the sheet.
  }
  return false;
}

/** A light tap, used when Settle finishes an action. */
export async function hapticTap(): Promise<void> {
  if (!isNative()) return;
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  await Haptics.impact({ style: ImpactStyle.Light });
}

/**
 * Routes Android's Back button to the app. The handler returns true when it
 * consumed the press; otherwise the app closes. Returns an unsubscribe function.
 */
export function onBackButton(handler: () => boolean): () => void {
  if (!isNative()) return () => {};
  let remove = () => {};
  let cancelled = false;

  void import("@capacitor/app").then(async ({ App }) => {
    const listener = await App.addListener("backButton", () => {
      if (!handler()) void App.exitApp();
    });
    if (cancelled) void listener.remove();
    else remove = () => void listener.remove();
  });

  return () => {
    cancelled = true;
    remove();
  };
}
