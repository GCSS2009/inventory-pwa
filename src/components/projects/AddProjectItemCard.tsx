import React from "react";

interface Props {
  visible: boolean;
  newItemDescription: string;
  setNewItemDescription: (v: string) => void;
  newItemModelNumber: string;
  setNewItemModelNumber: (v: string) => void;
  newItemType: string;
  setNewItemType: (v: string) => void;
  newItemRequiredQty: string;
  setNewItemRequiredQty: (v: string) => void;
  savingProjectItem: boolean;
  handleAddProjectItem: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddProjectItemCard: React.FC<Props> = ({
  visible,
  newItemDescription,
  setNewItemDescription,
  newItemModelNumber,
  setNewItemModelNumber,
  newItemType,
  setNewItemType,
  newItemRequiredQty,
  setNewItemRequiredQty,
  savingProjectItem,
  handleAddProjectItem,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        border: "1px solid var(--gcss-border, #d1d5db)",
        borderRadius: 6,
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        background: "var(--gcss-surface, #020617)",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Add Item to Project</h2>
      <form onSubmit={handleAddProjectItem}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1.2fr 0.7fr",
            gap: "0.6rem",
            marginBottom: "0.75rem",
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
              Description
            </label>
            <input
              type="text"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              placeholder="e.g. Addressable Smoke"
              style={{
                width: "100%",
                padding: "0.4rem",
                borderRadius: 4,
                border: "1px solid var(--gcss-border, #d1d5db)",
                fontSize: "0.85rem",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                marginBottom: "0.25rem",
              }}
            >
              Model
            </label>
            <input
              type="text"
              value={newItemModelNumber}
              onChange={(e) => setNewItemModelNumber(e.target.value)}
              placeholder="e.g. FSP-951"
              style={{
                width: "100%",
                padding: "0.4rem",
                borderRadius: 4,
                border: "1px solid var(--gcss-border, #d1d5db)",
                fontSize: "0.85rem",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                marginBottom: "0.25rem",
              }}
            >
              Type
            </label>
            <input
              type="text"
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value)}
              placeholder="e.g. Initiating"
              style={{
                width: "100%",
                padding: "0.4rem",
                borderRadius: 4,
                border: "1px solid var(--gcss-border, #d1d5db)",
                fontSize: "0.85rem",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                marginBottom: "0.25rem",
              }}
            >
              Required
            </label>
            <input
              type="number"
              min={1}
              value={newItemRequiredQty}
              onChange={(e) => setNewItemRequiredQty(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem",
                borderRadius: 4,
                border: "1px solid var(--gcss-border, #d1d5db)",
                fontSize: "0.85rem",
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingProjectItem}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: 4,
            border: "none",
            background: "#0062ff",
            color: "white",
            cursor: savingProjectItem ? "default" : "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {savingProjectItem ? "Saving…" : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default AddProjectItemCard;
