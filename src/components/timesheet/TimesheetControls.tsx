import React from "react";
import type { Profile } from "../../types";

interface Props {
  profile: Profile | null;
  weekEnding: string;
  setWeekEnding: (v: string) => void;
  employees: Profile[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (v: string) => void;
  onDownloadTimesheet: () => void;
}

const TimesheetControls: React.FC<Props> = ({
  profile,
  weekEnding,
  setWeekEnding,
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  onDownloadTimesheet,
}) => {
  const isAdmin = profile?.role === "admin";

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        marginBottom: "1rem",
      }}
    >
      {/* Week ending selector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 160,
        }}
      >
        <label style={{ fontSize: "0.8rem", marginBottom: 4 }}>
          Week ending (Sunday)
        </label>
        <input
          type="date"
          value={weekEnding}
          onChange={(e) => setWeekEnding(e.target.value)}
        />
      </div>

      {/* Employee selector (admins only) */}
      {isAdmin && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 220,
          }}
        >
          <label style={{ fontSize: "0.8rem", marginBottom: 4 }}>
            Entries for:
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
          >
            <option value="self">My entries</option>
            {employees.map((emp) => {
              const display =
                emp.full_name?.trim()?.length
                  ? emp.full_name
                  : emp.email ?? emp.id;
              return (
                <option key={emp.id} value={emp.id}>
                  {display}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Download button */}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <button
          onClick={onDownloadTimesheet}
          style={{
            padding: "0.45rem 0.8rem",
            fontSize: "0.85rem",
            borderRadius: 4,
            border: "1px solid var(--gcss-border)",
            background: "var(--gcss-sidebar-bg)",
            color: "var(--gcss-sidebar-text)",
          }}
        >
          Download GCSS Timesheet
        </button>
      </div>
    </div>
  );
};

export default TimesheetControls;
