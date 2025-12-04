import React from "react";
import type { CurrentClockIn, TimesheetEntry } from "../types";
import type { Profile } from "../types";

import TimesheetHeader from "./timesheet/TimesheetHeader";
import TimesheetControls from "./timesheet/TimesheetControls";
import TimesheetCurrentShift from "./timesheet/TimesheetCurrentShift";
import TimesheetEntriesTable from "./timesheet/TimesheetEntriesTable";

interface Props {
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
  onClockIn: () => void;
  onClockOut: () => void;
  onDownloadTimesheet: () => void;
  handleLogout: () => void;
  employees: Profile[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  onEditEntry: (entry: TimesheetEntry) => void;
}

const TimesheetPage: React.FC<Props> = (props) => {
  const {
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
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    onEditEntry,
  } = props;

  const isAdmin = profile?.role === "admin";
  const viewingOtherUser = isAdmin && selectedEmployeeId !== "self";
  const totalHours = entries.reduce((sum, e) => sum + (e.hours ?? 0), 0);

  return (
    <div className="gcss-card" style={{ padding: "1rem" }}>
      <TimesheetHeader handleLogout={handleLogout} />

      <TimesheetControls
        profile={profile}
        weekEnding={weekEnding}
        setWeekEnding={setWeekEnding}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        setSelectedEmployeeId={setSelectedEmployeeId}
        onDownloadTimesheet={onDownloadTimesheet}
      />

      <TimesheetCurrentShift
        viewingOtherUser={viewingOtherUser}
        currentClockIn={currentClockIn}
        tsProject={tsProject}
        setTsProject={setTsProject}
        tsWorkType={tsWorkType}
        setTsWorkType={setTsWorkType}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
      />

      <TimesheetEntriesTable
        entries={entries}
        loading={loadingEntries}
        error={error}
        isAdmin={isAdmin}
        totalHours={totalHours}
        onEditEntry={onEditEntry}
      />
    </div>
  );
};

export default TimesheetPage;
