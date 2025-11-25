import React from "react";

type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface CurrentClockIn {
  id: number;
  start_time: string;
  project: string | null;
  work_type: string | null;
}

interface TimesheetEntry {
  id: number;
  created_at?: string;
  work_date: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
  clock_in: string | null;
  clock_out: string | null;
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
  onDownloadTimesheet: () => void;

  handleLogout: () => void;
}

// shared input style so it respects theme variables
const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.6rem",
  borderRadius: 4,
  border: "1px solid var(--gcss-border, #d1d5db)",
  fontSize: "0.85rem",
  background: "var(--gcss-input-bg, var(--gcss-surface, #020617))",
  color: "var(--gcss-text, #111827)",
};

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
  handleLogout,
}) => {
  const totalHours = entries.reduce(
    (sum, e) => sum + (e.hours ?? 0),
    0
  );

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate + "T00:00:00");
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString();
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "1.25rem 1rem 1.5rem",
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
              <strong>{profile.email}</strong>{" "}
              <span style={{ color: "var(--gcss-muted, #6b7280)" }}>
                ({profile.role})
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.35rem 0.85rem",
            borderRadius: 999,
            border: "none",
            background: "#dc2626",
            color: "#fef2f2",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div
          style={{
            color: "#dc2626",
            marginBottom: "0.75rem",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Current status card */}
      <div
        style={{
          border: "1px solid var(--gcss-border, #1f2937)",
          borderRadius: 6,
          padding: "1rem 1.25rem",
          background: "var(--gcss-surface, #020617)",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>
          Current status
        </h2>

        <div style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
          {currentClockIn ? (
            <>
              You are currently{" "}
              <span style={{ color: "#22c55e", fontWeight: 600 }}>
                clocked in
              </span>{" "}
              since{" "}
              <strong>{formatTime(currentClockIn.start_time)}</strong>.
            </>
          ) : (
            <>You are currently clocked out.</>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.4fr auto",
            gap: "0.75rem",
            alignItems: "end",
            maxWidth: 750,
          }}
        >
          {/* Project / Location */}
          <div>
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
              style={inputBase}
            />
          </div>

          {/* Work type */}
          <div>
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
              style={inputBase}
            >
              <option value="Install">Install</option>
              <option value="Service">Service</option>
              <option value="Programming">Programming</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Clock in / out button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {currentClockIn ? (
              <button
                type="button"
                onClick={onClockOut}
                style={{
                  padding: "0.55rem 1.4rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#ef4444",
                  color: "#fef2f2",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Clock Out
              </button>
            ) : (
              <button
                type="button"
                onClick={onClockIn}
                style={{
                  padding: "0.55rem 1.4rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#16a34a",
                  color: "#f0fdf4",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Clock In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekly summary + export */}
      <div
        style={{
          border: "1px solid var(--gcss-border, #1f2937)",
          borderRadius: 6,
          padding: "0.9rem 1.1rem",
          background: "var(--gcss-surface, #020617)",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1.25rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>
            Weekly Timesheet
          </h2>
          <div
            style={{
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            Total hours for selected week:{" "}
            <strong>{totalHours.toFixed(2)}</strong>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                marginBottom: "0.2rem",
              }}
            >
              Week ending (Sunday)
            </div>
            <input
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              style={{
                ...inputBase,
                maxWidth: 220,
              }}
            />
          </div>

          <button
            type="button"
            onClick={onDownloadTimesheet}
            style={{
              padding: "0.55rem 1.2rem",
              borderRadius: 999,
              border: "none",
              background: "#2563eb",
              color: "#eff6ff",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Download GCSS Timesheet
          </button>
        </div>
      </div>

      {/* Entries table */}
      <div>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Entries for selected week
        </h2>

        {loadingEntries ? (
          <div>Loading entries…</div>
        ) : entries.length === 0 ? (
          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--gcss-muted, #6b7280)",
            }}
          >
            No entries for this week.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
                minWidth: 720,
              }}
            >
              <thead>
                <tr>
                  {["Date", "Project / Location", "Type", "Clock in", "Clock out", "Hours"].map(
                    (label) => (
                      <th
                        key={label}
                        style={{
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
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderBottom:
                          "1px solid var(--gcss-border, #e5e7eb)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(entry.work_date)}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderBottom:
                          "1px solid var(--gcss-border, #e5e7eb)",
                      }}
                    >
                      {entry.project ?? ""}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderBottom:
                          "1px solid var(--gcss-border, #e5e7eb)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.work_type ?? ""}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderBottom:
                          "1px solid var(--gcss-border, #e5e7eb)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTime(entry.clock_in)}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderBottom:
                          "1px solid var(--gcss-border, #e5e7eb)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTime(entry.clock_out)}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0.6rem",
                        borderBottom:
                          "1px solid var(--gcss-border, #e5e7eb)",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(entry.hours ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetPage;
