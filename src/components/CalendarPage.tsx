// src/components/CalendarPage.tsx
import React, { useMemo, useState } from "react";
import type { Profile, WorkItem } from "../types";
import { useWorkItems } from "../hooks/useWorkItems";
import WorkItemForm from "./WorkItemForm";

interface CalendarPageProps {
  profile: Profile | null;
  employees: Profile[];
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function itemHasUser(item: WorkItem, email: string): boolean {
  if (!item.technician_email) return false;
  const parts = item.technician_email
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.includes(email);
}

const CalendarPage: React.FC<CalendarPageProps> = ({ profile, employees }) => {
  const { workItems, loading, error, saveWorkItem, deleteWorkItem } =
    useWorkItems({ profile });

  const [current, setCurrent] = useState<Partial<WorkItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

  const isAdmin = profile?.role === "admin";
  const userEmail = profile?.email || null;

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const filteredItems = useMemo(() => {
    if (isAdmin || !userEmail) return workItems;
    return workItems.filter((w) => itemHasUser(w, userEmail));
  }, [workItems, isAdmin, userEmail]);

  const itemsByDay = useMemo(() => {
    const map: Record<string, WorkItem[]> = {};
    for (const day of weekDays) {
      const key = day.toISOString().slice(0, 10);
      map[key] = [];
    }

    for (const item of filteredItems) {
      const iso = item.start_time || item.created_at;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) continue;
      map[key].push(item);
    }

    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const ta = new Date(a.start_time || a.created_at).getTime();
        const tb = new Date(b.start_time || b.created_at).getTime();
        return ta - tb;
      });
    }

    return map;
  }, [weekDays, filteredItems]);

  async function handleSave(outlookBody: string) {
    if (!current) return;
    try {
      setSaving(true);
      await saveWorkItem(current, outlookBody);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isAdmin) return;
    if (!current || !current.id) return;

    const confirmDelete = window.confirm(
      "Delete this job and remove its Outlook event? This cannot be undone."
    );
    if (!confirmDelete) return;

    const item = workItems.find((w) => w.id === current.id);
    if (!item) return;

    try {
      setSaving(true);
      await deleteWorkItem(item);
      setCurrent(null);
    } finally {
      setSaving(false);
    }
  }

  function handleCreateForDay(day: Date) {
    if (!isAdmin) return;

    const base = new Date(day);
    base.setHours(8, 0, 0, 0);
    const startIso = base.toISOString(); // UTC

    const end = new Date(base);
    end.setHours(end.getHours() + 1);
    const endIso = end.toISOString(); // UTC

    const blank: Partial<WorkItem> = {
      work_type: "service_call",
      title: "",
      customer_name: "",
      onsite_contact_name: "",
      onsite_contact_phone: "",
      progress_percent: 0,
      service_note: "",
      service_resolution_notes: "",
      additional_parts: "",
      sales_opportunity: "",
      inspection_special_notes: "",
      inspection_resolution_notes: "",
      installation_note: "",
      installation_resolution_notes: "",
      start_time: startIso,
      end_time: endIso,
      technician_email: "",
    };

    setCurrent(blank);
  }

  function formatDayHeader(d: Date) {
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatWeekRange() {
    const end = addDays(weekStart, 6);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString(
      undefined,
      opts
    )} – ${end.toLocaleDateString(undefined, opts)}`;
  }

  function formatTime(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const borderColor = "var(--gcss-border, #e5e7eb)";
  const surfaceStrong = "var(--gcss-surface-strong, #020617)";
  const onSurface = "var(--gcss-on-surface, #e5e7eb)";

  const leftStyle: React.CSSProperties = {
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    background: surfaceStrong,
    color: onSurface,
    width: "100%",
    boxSizing: "border-box",
  };

  const rightStyle: React.CSSProperties = {
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    padding: "0.75rem",
    background: surfaceStrong,
    color: onSurface,
    marginTop: "1rem",
    width: "100%",
    boxSizing: "border-box",
    // allow the wide form content to be fully visible
    overflowX: "auto",
  };

  const weekGridOuter: React.CSSProperties = {
    width: "100%",
    overflowX: "auto",
  };

  const weekGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(120px, 1fr))",
    columnGap: "0.5rem",
    alignItems: "stretch",
    minWidth: 900, // original value that matched your calendar layout
  };

  const dayColumnBase: React.CSSProperties = {
    border: `1px solid ${borderColor}`,
    borderRadius: 6,
    padding: "0.4rem",
    display: "flex",
    flexDirection: "column",
    minHeight: 150,
    background: surfaceStrong,
  };

  const hasCurrentSelection = !!current;

  return (
    // vertical stack, full width
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* Calendar block */}
      <div style={leftStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              type="button"
              style={{
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                borderRadius: 4,
                border: `1px solid ${borderColor}`,
                background: surfaceStrong,
                color: onSurface,
                cursor: "pointer",
              }}
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              ← Previous
            </button>
            <button
              type="button"
              style={{
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                borderRadius: 4,
                border: `1px solid ${borderColor}`,
                background: surfaceStrong,
                color: onSurface,
                cursor: "pointer",
              }}
              onClick={() => setWeekStart(startOfWeek(new Date()))}
            >
              This Week
            </button>
            <button
              type="button"
              style={{
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                borderRadius: 4,
                border: `1px solid ${borderColor}`,
                background: surfaceStrong,
                color: onSurface,
                cursor: "pointer",
              }}
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              Next →
            </button>
          </div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
            {formatWeekRange()}
          </div>
        </div>

        <div style={weekGridOuter}>
          <div style={weekGrid}>
            {weekDays.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const items = itemsByDay[key] ?? [];
              const isToday = new Date().toDateString() === day.toDateString();

              const dayColumnStyle: React.CSSProperties = {
                ...dayColumnBase,
                borderColor: isToday ? "#ef4444" : borderColor,
                background: isToday
                  ? "rgba(248,113,113,0.18)"
                  : surfaceStrong,
              };

              return (
                <div key={key} style={dayColumnStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {formatDayHeader(day)}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.1rem 0.35rem",
                          borderRadius: 4,
                          border: `1px solid ${borderColor}`,
                          background: surfaceStrong,
                          color: onSurface,
                          cursor: "pointer",
                        }}
                        onClick={() => handleCreateForDay(day)}
                      >
                        + New
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      overflowY: "auto",
                    }}
                  >
                    {items.length === 0 && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--gcss-muted, #9ca3af)",
                          fontStyle: "italic",
                        }}
                      >
                        No jobs
                      </div>
                    )}
                    {items.map((item) => {
                      const selected = current && current.id === item.id;
                      const timeLabel = formatTime(item.start_time);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "0.2rem 0.25rem",
                            borderRadius: 4,
                            border: `1px solid ${
                              selected ? "#dc2626" : borderColor
                            }`,
                            background: selected
                              ? "rgba(248,113,113,0.25)"
                              : surfaceStrong,
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            color: onSurface,
                          }}
                          onClick={() => setCurrent(item)}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {timeLabel && `${timeLabel} `}
                            {item.title || "(Untitled)"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.65rem",
                              color: "var(--gcss-muted, #9ca3af)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.customer_name} · {item.work_type} ·{" "}
                            {item.progress_percent ?? 0}%
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {loading && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--gcss-muted, #9ca3af)",
            }}
          >
            Loading jobs…
          </p>
        )}
        {error && (
          <p style={{ fontSize: "0.75rem", color: "#f97316" }}>{error}</p>
        )}
      </div>

      {/* Form block BELOW calendar */}
      {hasCurrentSelection && (
        <div style={rightStyle}>
          <WorkItemForm
            profile={profile}
            employees={employees}
            isAdmin={isAdmin}
            value={current || {}}
            onChange={setCurrent}
            onSave={handleSave}
            saving={saving}
          />

          {isAdmin && current && current.id && (
            <div style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.8rem",
                  borderRadius: 4,
                  border: "1px solid #dc2626",
                  background: "#dc2626",
                  color: "#f9fafb",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                Delete Job
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
