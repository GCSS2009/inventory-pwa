import React from "react";

interface Props {}

const TimesheetHeader: React.FC<Props> = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <h2 style={{ margin: 0 }}>Timesheets</h2>
    </div>
  );
};

export default TimesheetHeader;