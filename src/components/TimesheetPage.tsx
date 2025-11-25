import React from "react";
import type { Session } from "@supabase/supabase-js";

// Keep these structurally identical to App.tsx
type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface TimesheetEntry {
  id: number;
  created_at: string;
  work_date: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
  clock_in: string | null;
  clock_out: string | null;
}

interface CurrentClockIn {
  id: number;
  start_time: string;
  project: string | null;
  work_type: string | null;
}

interface TimesheetPageProps {
  profile: Profile | null;
  weekEnding: string;
  setWeekEnding: (value: string) => void;

  entries: TimesheetEntry[];
  loadingEntries: boolean;
  error: string | null;

  currentClockIn: CurrentClockIn | null;
  tsProject: string;
  setTsProject: (value: string) => void;
  tsWorkType: string;
  setTsWorkType: (value: string) => void;

  onClockIn: () => void | Promise<void>;
  onClockOut: () => void | Promise<void>;
  onDownloadTimesheet: () => void | Promise<void> | void;
}

function formatRoundedTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const intervalMs = 15 * 60 * 1000;
  const rounded = Math.round(d.getTime() / intervalMs) * intervalMs;
  const rd = new Date(rounded);

  return rd.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

const TimesheetPage: React.FC<TimesheetPageProps> = ({
  profile,
  weekEnding,
  setWeekEnding,
  entries,
  loadingEntries,
  error,
  currentClockIn,
  tsProject,
  setTsProject,
  tsWorkType,
  setTsWorkType,
  onClockIn,
  onClockOut,
  onDownloadTimesheet,
}) => {
  const totalHours = React.useMemo(() => {
    return entries.reduce((sum, e) => sum + (e.hours ?? 0), 0);
  }, [entries]);

  const isClockedIn = !!currentClockIn;

  return (
    <div
      style={{
        padding: "1.25rem 1rem 1.5rem",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "1rem",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Timesheet</h1>
          {profile && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--gcss-muted, #6b7280)",
              }}
            >
              Logged in as{" "}
              <strong>{profile.email ?? ""}</strong>{" "}
              <span style={{ color: "var(--gcss-muted, #6b7280)" }}>
                ({profile.role})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      <section
        style={{
          border: "1px solid var(--gcss-border, #374151)",
          borderRadius: 6,
          padding: "0.9rem 1rem",
          marginBottom: "1.25rem",
          background: "var(--gcss-surface, #020617)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1rem", marginBottom: "0.35rem" }}>
          Current status
        </h2>
        <div
          style={{
            fontSize: "0.9rem",
            marginBottom: "0.75rem",
            color: "var(--gcss-muted, #9ca3af)",
          }}
        >
          {isClockedIn ? (
            <>
              You are currently{" "}
              <span style={{ color: "#22c55e", fontWeight: 600 }}>
                clocked in
              </span>{" "}
              since{" "}
              <strong>
                {formatRoundedTime(currentClockIn?.start_time ?? null)}
              </strong>
              .
            </>
          ) : (
            <>
              You are currently{" "}
              <span style={{ color: "#ef4444", fontWeight: 600 }}>
                clocked out.
              </span>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          {!isClockedIn && (
            <button
              type="button"
              onClick={() => void onClockIn()}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: 999,
                border: "none",
                background: "#22c55e",
                color: "#022c22",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Clock In
            </button>
          )}

          {isClockedIn && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  flex: 1,
                  minWidth: 260,
                }}
              >
                <div style={{ minWidth: 180 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Project / Location
                  </label>
                  <input
                    type="text"
                    value={tsProject}
                    onChange={(e) => setTsProject(e.target.value)}
                    placeholder="e.g. Lake Forest, Office, etc."
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.55rem",
                      borderRadius: 4,
                      border: "1px solid var(--gcss-border, #4b5563)",
                      background: "var(--gcss-input-bg, #020617)",
                      color: "var(--gcss-text, #e5e7eb)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div style={{ minWidth: 150 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Work type
                  </label>
                  <select
                    value={tsWorkType}
                    onChange={(e) => setTsWorkType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.55rem",
                      borderRadius: 4,
                      border: "1px solid var(--gcss-border, #4b5563)",
                      background: "var(--gcss-input-bg, #020617)",
                      color: "var(--gcss-text, #e5e7eb)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="Install">Install</option>
                    <option value="Service">Service</option>
                    <option value="Programming">Programming</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void onClockOut()}
                style={{
                  padding: "0.5rem 1.1rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#ef4444",
                  color: "#fef2f2",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Clock Out
              </button>
            </>
          )}
        </div>
      </section>

      {/* Weekly Timesheet */}
      <section
        style={{
          border: "1px solid var(--gcss-border, #374151)",
          borderRadius: 6,
          padding: "0.9rem 1rem",
          marginBottom: "1.25rem",
          background: "var(--gcss-surface, #020617)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <div>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "0.3rem",
                fontSize: "1rem",
              }}
            >
              Weekly Timesheet
            </h2>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--gcss-muted, #9ca3af)",
              }}
            >
              Total hours for selected week:{" "}
              <strong>{totalHours.toFixed(2)}</strong>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  marginBottom: "0.25rem",
                }}
              >
                Week ending (Sunday)
              </label>
              <input
                type="date"
                value={weekEnding}
                onChange={(e) => setWeekEnding(e.target.value)}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: 4,
                  border: "1px solid var(--gcss-border, #4b5563)",
                  background: "var(--gcss-input-bg, #020617)",
                  color: "var(--gcss-text, #e5e7eb)",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => void onDownloadTimesheet()}
              style={{
                alignSelf: "flex-end",
                padding: "0.5rem 1.1rem",
                borderRadius: 999,
                border: "none",
                background: "#2563eb",
                color: "#eff6ff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Download GCSS Timesheet
            </button>
          </div>
        </div>
      </section>

      {/* Entries */}
      <section>
        <h2
          style={{
            fontSize: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          Entries for selected week
        </h2>

        {error && (
          <div
            style={{
              marginBottom: "0.5rem",
              color: "#f97316",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {loadingEntries ? (
          <div>Loading entries…</div>
        ) : entries.length === 0 ? (
          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--gcss-muted, #9ca3af)",
            }}
          >
            No entries found for this week.
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--gcss-border, #374151)",
              borderRadius: 6,
              overflow: "hidden",
              background: "var(--gcss-surface, #020617)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Date",
                      "Project / Location",
                      "Type",
                      "Clock in",
                      "Clock out",
                      "Hours",
                    ].map((label) => (
                      <th
                        key={label}
                        style={{
                          position: "sticky",
                          top: 0,
                          background:
                            "var(--gcss-surface-strong, #020617)",
                          color: "var(--gcss-on-surface, #e5e7eb)",
                          fontWeight: 600,
                          padding: "0.45rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #4b5563)",
                          textAlign:
                            label === "Hours" ? "right" : "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td
                        style={{
                          padding: "0.35rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #111827)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(entry.work_date)}
                      </td>
                      <td
                        style={{
                          padding: "0.35rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #111827)",
                          minWidth: 140,
                        }}
                      >
                        {entry.project ?? ""}
                      </td>
                      <td
                        style={{
                          padding: "0.35rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #111827)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.work_type ?? ""}
                      </td>
                      <td
                        style={{
                          padding: "0.35rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #111827)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRoundedTime(entry.clock_in)}
                      </td>
                      <td
                        style={{
                          padding: "0.35rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #111827)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRoundedTime(entry.clock_out)}
                      </td>
                      <td
                        style={{
                          padding: "0.35rem 0.6rem",
                          borderBottom:
                            "1px solid var(--gcss-border, #111827)",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.hours != null
                          ? entry.hours.toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimesheetPage;
