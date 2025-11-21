// src/components/TimesheetPage.tsx
import React from "react";
import type { Session } from "@supabase/supabase-js";

type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface TimesheetEntry {
  id: number;
  created_at: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
}

interface CurrentClockIn {
  id: number;
  start_time: string;
  project: string | null;
  work_type: string | null;
}

interface TimesheetPageProps {
  session: Session | null;
  profile: Profile | null;

  currentClockIn: CurrentClockIn | null;

  selectedProject: string;
  setSelectedProject: (value: string) => void;

  selectedWorkType: string;
  setSelectedWorkType: (value: string) => void;

  onClockIn: () => void;
  onClockOut: () => void;

  weekEnding: string;
  setWeekEnding: (value: string) => void;

  entries: TimesheetEntry[];
  loadingEntries: boolean;
  totalHours: number;
  downloadTimesheet: () => void;
}

const TimesheetPage: React.FC<TimesheetPageProps> = ({
  currentClockIn,
  selectedProject,
  setSelectedProject,
  selectedWorkType,
  setSelectedWorkType,
  onClockIn,
  onClockOut,
  weekEnding,
  setWeekEnding,
  entries,
  loadingEntries,
  totalHours,
  downloadTimesheet,
}) => {
  const formatClockIn = (iso: string) => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString();
    return { time, date };
  };

  // shared card style so it respects theme
  const cardStyle: React.CSSProperties = {
    border: "1px solid var(--gcss-border, #d1d5db)",
    borderRadius: 8,
    padding: "1rem 1.25rem",
    marginBottom: "1.25rem",
    background: "var(--gcss-card-bg, var(--gcss-surface))",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.45rem",
    borderRadius: 4,
    border: "1px solid var(--gcss-border, #d1d5db)",
    background: "var(--gcss-surface)",
    color: "var(--gcss-text)",
    fontSize: "0.9rem",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
  };

  const mutedText: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "var(--gcss-muted, #6b7280)",
  };

  const thBase: React.CSSProperties = {
    borderBottom: "1px solid #ddd",
    padding: "0.25rem 0.4rem",
    textAlign: "left",
  };

  const thRight: React.CSSProperties = {
    ...thBase,
    textAlign: "right",
  };

  const tdBase: React.CSSProperties = {
    borderBottom: "1px solid #eee",
    padding: "0.25rem 0.4rem",
  };

  const tdRight: React.CSSProperties = {
    ...tdBase,
    textAlign: "right",
  };

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2rem",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Timesheet</h1>
        <div style={mutedText}>
          Clock in / out and generate a GCSS-branded weekly timesheet.
        </div>
      </div>

      {/* Current Status */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Current Status
        </h2>

        {currentClockIn ? (
          <>
            <div style={{ ...mutedText, marginBottom: "0.5rem" }}>
              {(() => {
                const { time, date } = formatClockIn(
                  currentClockIn.start_time
                );
                return (
                  <>
                    You are currently{" "}
                    <strong style={{ color: "var(--gcss-text)" }}>
                      clocked in
                    </strong>{" "}
                    since {time} on {date}.
                  </>
                );
              })()}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.4fr)",
                gap: "0.75rem",
                maxWidth: 600,
                marginBottom: "0.8rem",
              }}
            >
              <div>
                <label style={labelStyle}>Project / Location</label>
                <input
                  type="text"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  placeholder="e.g. TJ Maxx – Pineville, Fire Alarm"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Work Type</label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  style={selectStyle}
                >
                  <option value="Install">Install</option>
                  <option value="Service">Service</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Programming">Programming</option>
                  <option value="Travel">Travel</option>
                  <option value="Office">Office</option>
                </select>
              </div>
            </div>

            <button
              onClick={onClockOut}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: 6,
                border: "none",
                background: "#dc2626",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Clock Out
            </button>
          </>
        ) : (
          <>
            <div style={{ ...mutedText, marginBottom: "0.75rem" }}>
              You are currently{" "}
              <strong style={{ color: "var(--gcss-text)" }}>
                clocked out.
              </strong>
            </div>
            <button
              onClick={onClockIn}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: 6,
                border: "none",
                background: "#16a34a",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Clock In
            </button>
          </>
        )}
      </section>

      {/* Weekly Timesheet */}
      <section style={{ ...cardStyle, maxWidth: 640 }}>
        <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Weekly Timesheet
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "flex-end",
            marginBottom: "0.75rem",
          }}
        >
          <div>
            <label style={labelStyle}>Week ending (Sunday)</label>
            <input
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              style={{
                ...inputStyle,
                width: "auto",
                minWidth: 180,
              }}
            />
          </div>
          <button
            onClick={downloadTimesheet}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: 6,
              border: "none",
              background: "#0062ff",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Download GCSS Timesheet
          </button>
        </div>
        <div style={mutedText}>
          Total hours for selected week:{" "}
          <strong style={{ color: "var(--gcss-text)" }}>
            {totalHours.toFixed(2)}
          </strong>
        </div>
      </section>

      {/* Entries table */}
      <section>
        <h2 style={{ marginTop: "1.5rem" }}>Entries for selected week</h2>
        {loadingEntries ? (
          <div>Loading timesheet…</div>
        ) : entries.length === 0 ? (
          <div style={mutedText}>No entries for this week yet.</div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              borderRadius: 6,
              border: "1px solid var(--gcss-border, #d1d5db)",
              background: "var(--gcss-surface)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
                minWidth: 480,
              }}
            >
              <thead>
                <tr>
                  <th style={thBase}>Date</th>
                  <th style={thBase}>Project / Location</th>
                  <th style={thBase}>Type</th>
                  <th style={thRight}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => {
                  const d = new Date(row.created_at);
                  return (
                    <tr key={row.id}>
                      <td style={tdBase}>{d.toLocaleDateString()}</td>
                      <td style={tdBase}>{row.project ?? ""}</td>
                      <td style={tdBase}>{row.work_type ?? ""}</td>
                      <td style={tdRight}>
                        {row.hours != null ? row.hours.toFixed(2) : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimesheetPage;
