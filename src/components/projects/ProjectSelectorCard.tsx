import React from "react";
import type { Project } from "../../types";

interface Props {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (value: string) => void;
  setSelectedProjectItemId: (value: string) => void;
  setAllocationQty: (value: string) => void;
}

const ProjectSelectorCard: React.FC<Props> = ({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  setSelectedProjectItemId,
  setAllocationQty,
}) => {
  const selectedProject =
    projects.find((p) => String(p.id) === selectedProjectId) ?? null;

  return (
    <div
      style={{
        border: "1px solid var(--gcss-border, #d1d5db)",
        borderRadius: 6,
        padding: "1rem 1.25rem",
        background: "var(--gcss-surface, #020617)",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Project</h2>
      <label
        style={{
          display: "block",
          fontSize: "0.85rem",
          marginBottom: "0.25rem",
        }}
      >
        Select project
      </label>
      <select
        className="projects-select"
        value={selectedProjectId}
        onChange={(e) => {
          setSelectedProjectId(e.target.value);
          // when switching projects, clear selection & qty for allocation
          setSelectedProjectItemId("");
          setAllocationQty("");
        }}
        style={{
          width: "100%",
          padding: "0.4rem",
          borderRadius: 4,
          border: "1px solid var(--gcss-border, #d1d5db)",
          fontSize: "0.85rem",
        }}
      >
        <option
          value=""
          style={{ color: "#111827", backgroundColor: "#ffffff" }}
        >
          Select a project…
        </option>
        {projects.map((p) => (
          <option
            key={p.id}
            value={String(p.id)}
            style={{ color: "#111827", backgroundColor: "#ffffff" }}
          >
            {p.name}
          </option>
        ))}
      </select>

      {selectedProject && (
        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.85rem",
            color: "var(--gcss-text, #e5e7eb)",
          }}
        >
          <div>
            <strong>Created:</strong>{" "}
            {new Date(selectedProject.created_at).toLocaleDateString()}
          </div>
          {selectedProject.notes && (
            <div style={{ marginTop: "0.25rem" }}>
              <strong>Notes:</strong> {selectedProject.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelectorCard;
