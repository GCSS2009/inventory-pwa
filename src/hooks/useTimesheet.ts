// src/hooks/useTimesheet.ts
import { useEffect, useState, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import type {
  Profile,
  TimesheetEntry,
  CurrentClockIn,
  TimesheetRow,
} from "../types";
import { generateTimesheetPdf } from "../utils/generateTimesheetPdf";

// Helpers
function getWeekRange(weekEnding: string) {
  const end = new Date(weekEnding + "T00:00:00");
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
}

function todayAsDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRoundedTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const intervalMs = 15 * 60 * 1000;
  const rounded = Math.round(d.getTime() / intervalMs) * intervalMs;
  const rd = new Date(rounded);

  return rd.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface UseTimesheetArgs {
  session: Session | null;
  profile: Profile | null;
  employees: Profile[];
  selectedEmployeeId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function useTimesheet({
  session,
  profile,
  employees,
  selectedEmployeeId,
  showToast,
}: UseTimesheetArgs) {
  // Week ending, default to upcoming Sunday
  const [weekEnding, setWeekEnding] = useState<string>(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    const diff = (7 - day) % 7;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + diff);
    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, "0");
    const date = String(sunday.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  });

  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [timesheetError, setTimesheetError] = useState<string | null>(null);

  const [currentClockIn, setCurrentClockIn] =
    useState<CurrentClockIn | null>(null);
  const [tsProject, setTsProject] = useState("");
  const [tsWorkType, setTsWorkType] = useState("Install");

  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);

  // Guard to prevent overlapping loads and toast spam
  const isLoadingTimesheetRef = useRef(false);

  // Load current clock in
  const loadCurrentClockIn = async () => {
    if (!session?.user) {
      setCurrentClockIn(null);
      return;
    }

    const { data, error } = await supabase
      .from("timesheet_entries")
      .select("id, clock_in, project, work_type, clock_out")
      .eq("user_id", session.user.id)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("Error loading current clock-in:", error.message);
      return;
    }

    if (!data) {
      setCurrentClockIn(null);
    } else {
      setCurrentClockIn({
        id: data.id,
        start_time: data.clock_in,
        project: data.project,
        work_type: data.work_type,
      });
      setTsProject(data.project ?? "");
      setTsWorkType(data.work_type ?? "Install");
    }
  };

  // Core loader with guard
  const loadTimesheetForWeek = async (
    weekEndStr: string,
    targetUserId?: string
  ) => {
    if (!session?.user) {
      setEntries([]);
      setTimesheetError(null);
      return;
    }

    if (isLoadingTimesheetRef.current) {
      return;
    }
    isLoadingTimesheetRef.current = true;

    setLoadingEntries(true);
    setTimesheetError(null);

    try {
      const { start, end } = getWeekRange(weekEndStr);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      const baseUserId = session.user.id;
      const userId = targetUserId ?? baseUserId;

      if (!userId) {
        setEntries([]);
        return;
      }

      const { data, error } = await supabase
        .from("timesheet_entries")
        .select(
          "id, created_at, work_date, project, work_type, hours_decimal, clock_in, clock_out"
        )
        .eq("user_id", userId)
        .gte("work_date", startStr)
        .lte("work_date", endStr)
        .order("work_date", { ascending: true });

      if (error) {
        console.error("Error loading timesheet:", error);
        setTimesheetError(error.message);
        setEntries([]);
        showToast("Error loading timesheet: " + error.message, "error");
      } else if (data) {
        const mapped: TimesheetEntry[] = (data as TimesheetRow[]).map((row) => ({
          id: row.id,
          created_at: row.created_at,
          work_date: row.work_date,
          project: row.project,
          work_type: row.work_type,
          hours: row.hours_decimal,
          clock_in: row.clock_in,
          clock_out: row.clock_out,
        }));
        setEntries(mapped);
      }
    } catch (err: any) {
      console.error("Unexpected error loading timesheet:", err);
      const msg =
        err?.message && typeof err.message === "string"
          ? err.message
          : "Failed to fetch timesheet entries.";
      setTimesheetError(msg);
      setEntries([]);
      showToast("Error loading timesheet: " + msg, "error");
    } finally {
      setLoadingEntries(false);
      isLoadingTimesheetRef.current = false;
    }
  };

  // Effect: load timesheet when week / employee changes
  useEffect(() => {
    if (!session?.user) return;

    const baseUserId = session.user.id;
    const targetUserId =
      profile?.role === "admin" && selectedEmployeeId !== "self"
        ? selectedEmployeeId
        : baseUserId;

    loadTimesheetForWeek(weekEnding, targetUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, profile?.role, selectedEmployeeId, weekEnding]);

  // Effect: load current clock in when session changes
  useEffect(() => {
    if (!session?.user) {
      setCurrentClockIn(null);
      return;
    }
    void loadCurrentClockIn();
  }, [session?.user?.id]);

  // Handlers
  const onClockIn = async () => {
    if (!session?.user) {
      showToast("You must be logged in to clock in.", "error");
      return;
    }
    if (currentClockIn) {
      showToast("You are already clocked in.", "error");
      return;
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("timesheet_entries")
      .insert({
        user_id: session.user.id,
        work_date: todayAsDateString(),
        project: null,
        work_type: null,
        hours_decimal: null,
        clock_in: nowIso,
        clock_out: null,
      })
      .select("id, clock_in, project, work_type")
      .single();

    if (error) {
      showToast("Error clocking in: " + error.message, "error");
      return;
    }

    setCurrentClockIn({
      id: data.id,
      start_time: data.clock_in,
      project: data.project,
      work_type: data.work_type,
    });
    setTsProject("");
    setTsWorkType("Install");
    showToast("Clocked in at " + formatRoundedTime(nowIso) + ".", "success");

    await loadTimesheetForWeek(weekEnding, session.user.id);
  };

  const onClockOut = async () => {
    if (!session?.user || !currentClockIn) {
      showToast("You are not currently clocked in.", "error");
      return;
    }

    const now = new Date();
    const start = new Date(currentClockIn.start_time);
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.round((diffMs / 1000 / 60 / 60) * 100) / 100;

    const nowIso = now.toISOString();

    const { error } = await supabase
      .from("timesheet_entries")
      .update({
        work_date: todayAsDateString(),
        project: tsProject.trim() || null,
        work_type: tsWorkType.trim() || null,
        hours_decimal: hours,
        clock_out: nowIso,
      })
      .eq("id", currentClockIn.id);

    if (error) {
      showToast("Error clocking out: " + error.message, "error");
      return;
    }

    showToast(
      `Clocked out at ${formatRoundedTime(
        nowIso
      )}. Total: ${hours.toFixed(2)} hours.`,
      "success"
    );

    setCurrentClockIn(null);
    setTsProject("");
    setTsWorkType("Install");

    const baseUserId = session.user.id;
    const targetUserId =
      profile?.role === "admin" && selectedEmployeeId !== "self"
        ? selectedEmployeeId
        : baseUserId;

    await loadTimesheetForWeek(weekEnding, targetUserId);
    await loadCurrentClockIn();
  };

  const onDownloadTimesheet = async () => {
    if (!entries.length) {
      showToast("No entries to export for this week.", "info");
      return;
    }

    if (!session) {
      showToast("You must be logged in to download a timesheet.", "error");
      return;
    }

    let targetProfile: Profile | null = profile;

    if (profile?.role === "admin" && selectedEmployeeId !== "self") {
      const selected = employees.find((e) => e.id === selectedEmployeeId);
      if (selected) {
        targetProfile = selected;
      }
    }

    const fallbackEmail =
      targetProfile?.email ?? session.user.email ?? "employee@gcss-llc.com";

    let employeeName: string;

    if (targetProfile?.full_name && targetProfile.full_name.trim()) {
      employeeName = targetProfile.full_name.trim();
    } else {
      const rawFromEmail =
        fallbackEmail.split("@")[0].replace(/\./g, " ").replace(/_/g, " ") ||
        "Employee";
      employeeName = rawFromEmail
        .split(" ")
        .filter(Boolean)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");
    }

    const { start, end } = getWeekRange(weekEnding);

    try {
      await generateTimesheetPdf({
        templateUrl: "/gcss-timesheet-template.pdf",
        employeeName,
        weekStart: start,
        weekEnd: end,
        entries: entries.map((entry) => ({
          workDate: entry.work_date,
          project: entry.project ?? "",
          workType: entry.work_type ?? "",
          clockIn: entry.clock_in,
          clockOut: entry.clock_out,
          hours: entry.hours ?? 0,
        })),
      });

      showToast("GCSS timesheet PDF downloaded.", "success");
    } catch (err) {
      console.error("Error generating PDF timesheet:", err);
      showToast("Failed to generate PDF timesheet.", "error");
    }
  };

  const onEditEntry = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
  };

  const cancelEditEntry = () => {
    setEditingEntry(null);
  };

  const onSaveEditedEntry = async (updated: TimesheetEntry) => {
    const { error } = await supabase
      .from("timesheet_entries")
      .update({
        work_date: updated.work_date,
        project: updated.project,
        work_type: updated.work_type,
        hours_decimal: updated.hours,
        clock_in: updated.clock_in,
        clock_out: updated.clock_out,
      })
      .eq("id", updated.id);

    if (error) {
      showToast("Error updating entry: " + error.message, "error");
      return;
    }

    setEditingEntry(null);

    if (!session?.user) return;

    const baseUserId = session.user.id;
    const targetUserId =
      profile?.role === "admin" && selectedEmployeeId !== "self"
        ? selectedEmployeeId
        : baseUserId;

    await loadTimesheetForWeek(weekEnding, targetUserId);
    showToast("Timesheet entry updated.", "success");
  };

  return {
    weekEnding,
    setWeekEnding,
    entries,
    loadingEntries,
    timesheetError,
    currentClockIn,
    tsProject,
    setTsProject,
    tsWorkType,
    setTsWorkType,
    editingEntry,
    onClockIn,
    onClockOut,
    onDownloadTimesheet,
    onEditEntry,
    cancelEditEntry,
    onSaveEditedEntry,
  };
}
