import React from "react";

interface Props {
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  newProjectNotes: string;
  setNewProjectNotes: (v: string) => void;
  creatingProject: boolean;
  handleCreateProject: (e: React.FormEvent<HTMLFormElement>) => void;
}

const NewProjectCard: React.FC<Props> = ({
  newProjectName,
  setNewProjectName,
  newProjectNotes,
  setNewProjectNotes,
  creatingProject,
  handleCreateProject,
}) => {
  return (
    <div
      style={{
        border: "1px solid var(--gcss-border, #d1d5db)",
        borderRadius: 6,
        padding: "1rem 1.25rem",
        background: "var(--gcss-surface, #020617)",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "1rem" }}>New Project (Admin)</h2>
      <form onSubmit={handleCreateProject}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              marginBottom: "0.25rem",
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="e.g. TJ Maxx – Pineville"
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border, #d1d5db)",
              fontSize: "0.85rem",
              background: "var(--gcss-surface, #020617)",
              color: "var(--gcss-text, #f9fafb)",
            }}
          />
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              marginBottom: "0.25rem",
            }}
          >
            Notes
          </label>
          <textarea
            value={newProjectNotes}
            onChange={(e) => setNewProjectNotes(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border, #d1d5db)",
              fontSize: "0.85rem",
              resize: "vertical",
              background: "var(--gcss-surface, #020617)",
              color: "var(--gcss-text, #f9fafb)",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={creatingProject}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: 4,
            border: "none",
            background: "#0062ff",
            color: "white",
            cursor: creatingProject ? "default" : "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {creatingProject ? "Creating…" : "Create Project"}
        </button>
      </form>
    </div>
  );
};

export default NewProjectCard;
