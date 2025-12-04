import React from "react";
import { formatTime } from "../../utils/formatTime";
import type { CurrentClockIn } from "../../types";

interface Props {
  viewingOtherUser: boolean;
  currentClockIn: CurrentClockIn | null;
  tsProject: string;
  setTsProject: (v: string) => void;
  tsWorkType: string;
  setTsWorkType: (v: string) => void;
  onClockIn: () => void;
  onClockOut: () => void;
}

const TimesheetCurrentShift: React.FC<Props> = ({
  viewingOtherUser,
  currentClockIn,
  tsProject,
  setTsProject,
  tsWorkType,
  setTsWorkType,
  onClockIn,
  onClockOut,
}) => {
  return (
    <div className="gcss-card" style={{ padding: "0.75rem", marginBottom: "1rem" }}>
      <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
        Current shift
      </h3>

      {viewingOtherUser ? (
        <p style={{ fontSize: "0.85rem", color: "var(--gcss-muted)" }}>
          You are viewing another employee's timesheet. Clock in/out is disabled.
        </p>
      ) : currentClockIn ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
          <div style={{ fontSize: "0.9rem" }}>
            Clocked in at <strong>{formatTime(currentClockIn.start_time)}</strong>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontSize: "0.8rem", marginBottom: 4 }}>
                Project / Location / Description
              </label>
              <input
                type="text"
                value={tsProject}
                onChange={(e) => setTsProject(e.target.value)}
                placeholder="Describe where / what you did"
              />
            </div>

            <div style={{ flex: "0 0 160px" }}>
              <label style={{ fontSize: "0.8rem", marginBottom: 4 }}>
                Work type
              </label>
              <select
                value={tsWorkType}
                onChange={(e) => setTsWorkType(e.target.value)}
              >
                <option value="Install">Install</option>
                <option value="Service">Service</option>
                <option value="Programming">Programming</option>
                <option value="Testing">Testing</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={onClockOut}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 4,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            Clock out
          </button>
        </div>
      ) : (
        !viewingOtherUser && (
          <button
            onClick={onClockIn}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 4,
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontSize: "0.9rem",
            }}
          >
            Clock in
          </button>
        )
      )}
    </div>
  );
};

export default TimesheetCurrentShift;
