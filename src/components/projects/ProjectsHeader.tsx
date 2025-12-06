import React from "react";
import type { Profile } from "../../types";

interface Props {
  profile: Profile | null;
}

const ProjectsHeader: React.FC<Props> = ({ profile }) => {
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
    </div>
  );
};

export default ProjectsHeader;