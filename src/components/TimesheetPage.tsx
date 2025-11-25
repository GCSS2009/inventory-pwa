import React from "react";

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
  onDownloadTimesheet: () => void;

  handleLogout: () => void;
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

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.55rem",
  borderRadius: 4,
  border: "1px solid var(--gcss-border, #d1d5db)",
  background: "var(--gcss-input-bg, #ffffff)",
  color: "var(--gcss-text, #111827)",
  fontSize: "0.85rem",
  boxSizing: "border-box",
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
  const totalHours = React.useMemo(
    () =>
      entries.reduce((sum, e) => sum + (e.hours != null ? e.hours : 0), 0),
    [entries]
  );

  const statusText = currentClockIn
    ? `You are currently clocked in since ${formatRoundedTime(
        currentClockIn.start_time
      )}.`
    : "You are currently clocked out.";

  const statusColor = currentClockIn ? "#16a34a" : "#dc2626";

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
              <strong>{profile.email ?? ""}</strong>{" "}
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

      {/* Current status */}
      <div
        style={{
          border: "1px solid var(--gcss-border, #d1d5db)",
          borderRadius: 6,
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
          background: "var(--gcss-surface, #ffffff)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Current status</h2>
        <div
          style={{
            fontSize: "0.95rem",
            marginBottom: "0.75rem",
          }}
        >
          You are currently{" "}
          <span style={{ color: statusColor, fontWeight: 600 }}>
            {currentClockIn ? "clocked in" : "clocked out"}
          </span>
          {currentClockIn && (
            <>
              {" "}
              since{" "}
              <span style={{ fontWeight: 600 }}>
                {formatRoundedTime(currentClockIn.start_time)}
              </span>
              .
            </>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.4fr) auto",
            gap: "0.75rem",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
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

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
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
                  padding: "0.55rem 1.3rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#dc2626",
                  color: "#fef2f2",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  alignSelf: "flex-end",
                }}
              >
                Clock Out
              </button>
            ) : (
              <button
                type="button"
                onClick={onClockIn}
                style={{
                  padding: "0.55rem 1.3rem",
                  borderRadius: 999,
                  border: "none",
                  background: "#16a34a",
                  color: "#f0fdf4",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  alignSelf: "flex-end",
                }}
              >
                Clock In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekly timesheet */}
      <div
        style={{
          border: "1px solid var(--gcss-border, #d1d5db)",
          borderRadius: 6,
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          background: "var(--gcss-surface, #ffffff)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ marginTop: 0, marginBottom: "0.25rem", fontSize: "1rem" }}>
              Weekly Timesheet
            </h2>
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--gcss-muted, #6b7280)",
              }}
            >
              Total hours for selected week:{" "}
              <span style={{ fontWeight: 600 }}>{totalHours.toFixed(2)}</span>
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
                  marginBottom: "0.25rem",
                }}
              >
                Week ending (Sunday)
              </div>
              <input
                type="date"
                value={weekEnding}
                onChange={(e) => setWeekEnding(e.target.value)}
                style={inputBase}
              />
            </div>

            <button
              type="button"
              onClick={onDownloadTimesheet}
              style={{
                padding: "0.55rem 1.25rem",
                borderRadius: 999,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
              }}
            >
              Download GCSS Timesheet
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "0.75rem",
            color: "#dc2626",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Entries table */}
      <div>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Entries for selected week
        </h2>

        {loadingEntries ? (
          <div>Loading entries…</div>
        ) : !entries.length ? (
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
                minWidth: 720,
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyleLeft}>Date</th>
                  <th style={thStyleLeft}>Project / Location</th>
                  <th style={thStyleLeft}>Type</th>
                  <th style={thStyleLeft}>Clock in</th>
                  <th style={thStyleLeft}>Clock out</th>
                  <th style={thStyleRight}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={tdStyle}>
                      {e.work_date ||
                        new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>{e.project ?? ""}</td>
                    <td style={tdStyle}>{e.work_type ?? ""}</td>
                    <td style={tdStyle}>{formatRoundedTime(e.clock_in)}</td>
                    <td style={tdStyle}>{formatRoundedTime(e.clock_out)}</td>
                    <td style={tdStyleRight}>
                      {e.hours != null ? e.hours.toFixed(2) : "0.00"}
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

const thStyleBase: React.CSSProperties = {
  borderBottom: "1px solid var(--gcss-border, #d1d5db)",
  padding: "0.4rem 0.55rem",
  background: "rgba(148,163,184,0.25)",
  color: "var(--gcss-text, #111827)",
  textAlign: "left",
};

const thStyleLeft: React.CSSProperties = {
  ...thStyleBase,
  textAlign: "left",
};

const thStyleRight: React.CSSProperties = {
  ...thStyleBase,
  textAlign: "right",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--gcss-border, #e5e7eb)",
  padding: "0.35rem 0.55rem",
  whiteSpace: "nowrap",
};

const tdStyleRight: React.CSSProperties = {
  ...tdStyle,
  textAlign: "right",
};

export default TimesheetPage;
