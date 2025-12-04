import React from "react";

interface Props {
  handleLogout: () => void;
}

const TimesheetHeader: React.FC<Props> = ({ handleLogout }) => {
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
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#dc2626",
          color: "white",
          padding: "0.4rem 1rem",
          borderRadius: "12px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default TimesheetHeader;
