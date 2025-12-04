// src/hooks/usePushSubscription.ts
import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Platform } from "../types";

// VAPID public key from .env (Vite style)
const VAPID_PUBLIC_KEY = import.meta.env
  .VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Hooks up web push for PWA / browser usage.
 * Called from App with: usePushSubscription(session?.user?.id, platform)
 */
export function usePushSubscription(
  userId: string | undefined,
  platform: Platform
) {
  useEffect(() => {
    // SSR / safety
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function setup() {
      console.log("[Push] Hook run. userId:", userId, "platform:", platform);

      if (!userId) {
        console.log("[Push] No user, skipping push setup.");
        return;
      }

      // If/when you use native push via Capacitor for the APK,
      // you do NOT want web push on that path.
      if (platform === "android_apk") {
        console.log("[Push] Android APK detected, skipping web push.");
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.warn(
          "[Push] VITE_VAPID_PUBLIC_KEY is not set; skipping web push."
        );
        return;
      }

      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        console.warn(
          "[Push] This environment does not support ServiceWorker/Push/Notification."
        );
        return;
      }

      const swUrl = `${import.meta.env.BASE_URL}push-sw.js`;
      console.log("[Push] Registering service worker at:", swUrl);

      try {
        const registration = await navigator.serviceWorker.register(swUrl);

        if (cancelled) return;

        console.log(
          "[Push] Current notification permission:",
          Notification.permission
        );
        let permission = Notification.permission;

        if (permission === "default") {
          console.log("[Push] Requesting notification permission...");
          permission = await Notification.requestPermission();
          console.log("[Push] Permission result:", permission);
        }

        if (permission !== "granted") {
          console.log(
            "[Push] Notifications not granted (permission =",
            permission,
            "), skipping push subscription."
          );
          return;
        }

        if (cancelled) return;

        console.log("[Push] Checking existing push subscription...");
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          console.log("[Push] No existing subscription, creating new one...");
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          console.log("[Push] New push subscription created.");
        } else {
          console.log("[Push] Reusing existing subscription.");
        }

        if (cancelled) return;

        const json = subscription.toJSON();
        console.log("[Push] Subscription JSON:", json);

        const { endpoint, keys } = json;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
          console.error("[Push] Incomplete subscription data, not saving.");
          return;
        }

        console.log("[Push] Saving subscription to Supabase...");
        const { error } = await supabase.from("push_subscriptions").upsert(
          {
            user_id: userId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            platform,
            active: true,
          },
          {
            onConflict: "user_id,endpoint",
          }
        );

        if (error) {
          console.error("[Push] Error saving subscription:", error.message);
        } else {
          console.log("[Push] Subscription saved/updated successfully.");
        }
      } catch (err) {
        console.error("[Push] Unexpected error in push setup:", err);
      }
    }

    setup();

    return () => {
      cancelled = true;
    };
  }, [userId, platform]);
}
