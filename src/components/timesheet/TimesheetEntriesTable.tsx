import React from "react";
import type { TimesheetEntry } from "../../types";
import { formatTime } from "../../utils/formatTime";

interface Props {
  entries: TimesheetEntry[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  totalHours: number;
  onEditEntry: (entry: TimesheetEntry) => void;
}

const TimesheetEntriesTable: React.FC<Props> = ({
  entries,
  loading,
  error,
  isAdmin,
  totalHours,
  onEditEntry,
}) => {
  return (
    <div className="gcss-card" style={{ padding: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Entries for selected week</h3>
        <div style={{ fontSize: "0.9rem" }}>
          Total hours: <strong>{totalHours.toFixed(2)}</strong>
        </div>
      </div>

      {error && <div style={{ color: "#dc2626", marginBottom: "0.5rem" }}>{error}</div>}

      {loading ? (
        <p style={{ fontSize: "0.9rem" }}>Loading entries…</p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: "0.9rem" }}>No entries for this week.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>Date</th>
                <th>Project / Location</th>
                <th style={{ width: 110 }}>Work type</th>
                <th style={{ width: 110 }}>Clock in</th>
                <th style={{ width: 110 }}>Clock out</th>
                <th style={{ width: 80 }}>Hours</th>
                {isAdmin && <th style={{ width: 80 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.work_date}</td>
                  <td>{entry.project ?? ""}</td>
                  <td>{entry.work_type ?? ""}</td>
                  <td>{formatTime(entry.clock_in)}</td>
                  <td>{formatTime(entry.clock_out)}</td>
                  <td>{(entry.hours ?? 0).toFixed(2)}</td>
                  {isAdmin && (
                    <td>
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => onEditEntry(entry)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimesheetEntriesTable;
