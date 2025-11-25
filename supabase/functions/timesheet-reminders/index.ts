import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type ReminderType = "clock_in" | "lunch" | "clock_out";

function getCurrentReminderType(date: Date): ReminderType | null {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 7:35–7:39 AM
  if (totalMinutes >= 7 * 60 + 35 && totalMinutes < 7 * 60 + 40) {
    return "clock_in";
  }

  // 12:00–12:04 PM
  if (totalMinutes >= 12 * 60 && totalMinutes < 12 * 60 + 5) {
    return "lunch";
  }

  // 4:30–4:34 PM
  if (totalMinutes >= 16 * 60 + 30 && totalMinutes < 16 * 60 + 35) {
    return "clock_out";
  }

  return null;
}

// Check timesheet state to see if a reminder makes sense
async function shouldSendReminder(
  userId: string,
  reminder: ReminderType,
  today: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("timesheet_entries")
    .select("clock_in, clock_out, work_date")
    .eq("user_id", userId)
    .eq("work_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("timesheets query error", error);
    return false;
  }

  const row = data;

  if (reminder === "clock_in") {
    return !row || !row.clock_in;
  }

  if (reminder === "lunch") {
    if (!row || !row.clock_in) return false;
    if (row.clock_out) return false;
    return true;
  }

  if (reminder === "clock_out") {
    if (!row || !row.clock_in) return false;
    if (row.clock_out) return false;
    return true;
  }

  return false;
}

function getMessage(reminder: ReminderType) {
  if (reminder === "clock_in") {
    return {
      title: "Did you forget to clock in?",
      body: "It’s around your normal start time. Don’t miss your hours.",
    };
  }
  if (reminder === "lunch") {
    return {
      title: "Lunch time?",
      body: "Hey, did you forget to clock out for lunch? Go eat!",
    };
  }
  return {
    title: "Did you forget to clock out?",
    body: "End of the day already. Make sure you clock out.",
  };
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);

    // Optional overrides for testing
    const testType = url.searchParams.get("test") as ReminderType | null;
    const force = url.searchParams.get("force") === "true";

    const nowUtc = new Date();
    // crude America/Chicago: UTC-6 (no DST handling yet)
    const nowLocal = new Date(Date.now() - 6 * 60 * 60 * 1000);

    // Determine which reminder this run should use
    let reminderType: ReminderType | null =
      testType ?? getCurrentReminderType(nowLocal);

    // If not forcing AND there's no current reminder window -> bail
    if (!force && !reminderType) {
      return new Response("No reminder window right now", { status: 200 });
    }

    // Safety: if forcing and reminderType is still null, default to clock_in
    if (!reminderType) {
      reminderType = "clock_in";
    }

    const todayStr = nowLocal.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .eq("active", true);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return new Response("Error fetching subscriptions", { status: 500 });
    }

    const msg = getMessage(reminderType);
    let sentCount = 0;

    for (const sub of subs ?? []) {
      const ok = force
        ? true
        : await shouldSendReminder(sub.user_id, reminderType, todayStr);

      if (!ok) continue;

      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(
          pushSub as any,
          JSON.stringify({
            title: msg.title,
            body: msg.body,
            data: { url: "/" },
          })
        );
        sentCount++;
      } catch (pushErr) {
        console.error("Push error, disabling subscription", pushErr);
        await supabase
          .from("push_subscriptions")
          .update({ active: false })
          .eq("id", sub.id);
      }
    }

    return new Response(
      `Sent ${sentCount} notifications for ${reminderType} (force=${force})`,
      { status: 200 }
    );
  } catch (e) {
    console.error("Function error", e);
    return new Response("Internal error", { status: 500 });
  }
});
