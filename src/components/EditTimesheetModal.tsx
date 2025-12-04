import React, { useState } from "react";
import type { TimesheetEntry } from "../App";

interface EditTimesheetModalProps {
  entry: TimesheetEntry;
  onCancel: () => void;
  onSave: (entry: TimesheetEntry) => void;
}

function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromLocalDateTimeInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function calculateHours(clockIn: string | null, clockOut: string | null): number {
  if (!clockIn || !clockOut) return 0;
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / 1000 / 60 / 60) * 100) / 100;
}

const EditTimesheetModal: React.FC<EditTimesheetModalProps> = ({
  entry,
  onCancel,
  onSave,
}) => {
  const [workDate, setWorkDate] = useState(entry.work_date);
  const [project, setProject] = useState(entry.project ?? "");
  const [workType, setWorkType] = useState(entry.work_type ?? "");
  const [clockInLocal, setClockInLocal] = useState(
    toLocalDateTimeInput(entry.clock_in)
  );
  const [clockOutLocal, setClockOutLocal] = useState(
    toLocalDateTimeInput(entry.clock_out)
  );

  const handleSave = () => {
    const clockInIso = fromLocalDateTimeInput(clockInLocal);
    const clockOutIso = fromLocalDateTimeInput(clockOutLocal);
    const hours = calculateHours(clockInIso, clockOutIso);

    const updated: TimesheetEntry = {
      ...entry,
      work_date: workDate,
      project: project || null,
      work_type: workType || null,
      clock_in: clockInIso,
      clock_out: clockOutIso,
      hours,
    };

    onSave(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Edit timesheet entry
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
              Date
            </label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
              Project / Location / Description
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
              Work type
            </label>
            <input
              type="text"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              placeholder="Install, Service, etc."
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
              Clock in
            </label>
            <input
              type="datetime-local"
              value={clockInLocal}
              onChange={(e) => setClockInLocal(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
              Clock out
            </label>
            <input
              type="datetime-local"
              value={clockOutLocal}
              onChange={(e) => setClockOutLocal(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border)",
              background: "transparent",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: 4,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontSize: "0.85rem",
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTimesheetModal;
