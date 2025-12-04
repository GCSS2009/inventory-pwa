import React from "react";
import type { Profile } from "../../types";

interface Props {
  profile: Profile | null;
  handleLogout: () => void;
}

const ProjectsHeader: React.FC<Props> = ({ profile, handleLogout }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "1rem",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ margin: 0 }}>Projects</h1>
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--gcss-muted, #6b7280)",
          }}
        >
          Track required parts per project and allocations from office & van.
        </div>
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
  );
};

export default ProjectsHeader;
