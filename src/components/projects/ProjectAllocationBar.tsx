import React from "react";
import type { ProjectItem } from "../../types";

interface Props {
  visible: boolean;
  itemsForProject: ProjectItem[];
  // now a string, not number | ""
  selectedProjectItemId: string;
  setSelectedProjectItemId: (v: string) => void;
  allocationQty: string;
  setAllocationQty: (v: string) => void;
  handleAllocateToProject: (source: "office" | "van") => void | Promise<void>;
}

const ProjectAllocationBar: React.FC<Props> = ({
  visible,
  itemsForProject,
  selectedProjectItemId,
  setSelectedProjectItemId,
  allocationQty,
  setAllocationQty,
  handleAllocateToProject,
}) => {
  if (!visible) return null;

  const qtyNumber = Number(allocationQty);
  const isQtyValid = Number.isFinite(qtyNumber) && qtyNumber > 0;
  const isItemSelected = !!selectedProjectItemId;
  const isDisabled = !isItemSelected || !isQtyValid;

  return (
    <div
      style={{
        border: "1px solid var(--gcss-border, #d1d5db)",
        borderRadius: 6,
        padding: "0.75rem 1rem",
        marginBottom: "1rem",
        background: "var(--gcss-surface, #020617)",
        maxWidth: 800,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "0.5rem",
          fontSize: "0.95rem",
        }}
      >
        Allocate Stock to Project
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 0.9fr",
          gap: "0.6rem",
          alignItems: "end",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              marginBottom: "0.25rem",
            }}
          >
            Project item
          </label>
          <select
            className="projects-select"
            value={selectedProjectItemId}
            onChange={(e) => setSelectedProjectItemId(e.target.value)}
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
              Select an item…
            </option>
            {itemsForProject.map((pi) => (
              <option
                key={pi.id}
                value={String(pi.id)}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
              >
                {pi.description} ({pi.model_number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              marginBottom: "0.25rem",
            }}
          >
            Quantity to allocate
          </label>
          <input
            type="number"
            min={1}
            value={allocationQty}
            onChange={(e) => setAllocationQty(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border, #d1d5db)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => handleAllocateToProject("office")}
            disabled={isDisabled}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: isDisabled ? "#e5e7eb" : "#e0f2fe",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
            }}
          >
            From Office
          </button>
          <button
            type="button"
            onClick={() => handleAllocateToProject("van")}
            disabled={isDisabled}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: isDisabled ? "#e5e7eb" : "#fef9c3",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
            }}
          >
            From Van
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAllocationBar;
