import { useEffect } from "react";
import { supabase } from "../supabaseClient";

// Use your VAPID public key from .env
// VITE_VAPID_PUBLIC_KEY should be defined in your Vite env.
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

export function usePushSubscription(
  userId: string | undefined,
  platform: string
) {
  useEffect(() => {
    // SSR / safety guard
    if (typeof window === "undefined") return;

    console.log("[Push] Hook run. userId:", userId, "platform:", platform);

    if (!userId) {
      console.log("[Push] No userId, skipping push setup.");
      return;
    }

    if (!("Notification" in window)) {
      console.log("[Push] Notifications not supported in this browser.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.log("[Push] Service workers not supported.");
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error(
        "[Push] Missing VITE_VAPID_PUBLIC_KEY; cannot subscribe to push."
      );
      return;
    }

    let cancelled = false;

    async function setup() {
      try {
        const swUrl = `${import.meta.env.BASE_URL}push-sw.js`;
console.log("[Push] Registering service worker at:", swUrl);

const registration = await navigator.serviceWorker.register(swUrl);


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
            "[Push] Permission not granted, aborting push subscription."
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
