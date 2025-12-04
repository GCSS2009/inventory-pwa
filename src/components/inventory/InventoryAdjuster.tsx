// src/components/inventory/InventoryAdjuster.tsx
import React from "react";
import type { Profile, InventoryItem, ChangeEntry } from "../../types";
import type { AdjustAction } from "../../types";

interface Props {
  profile: Profile | null;
  inventory: InventoryItem[];
  selectedItemId: number | "";
  setSelectedItemId: (value: number | "") => void;
  quantity: string;
  setQuantity: (value: string) => void;
  handleAdjust: (a: AdjustAction) => void;
}

const btnBase = (on: boolean, bg: string) => ({
  padding: "0.4rem 0.7rem",
  borderRadius: 999,
  border: "1px solid var(--gcss-border)",
  fontSize: "0.8rem",
  cursor: on ? "pointer" : "not-allowed",
  opacity: on ? 1 : 0.5,
  background: on ? bg : "var(--gcss-surface)",
});

const InventoryAdjuster: React.FC<Props> = ({
  profile,
  inventory,
  selectedItemId,
  setSelectedItemId,
  quantity,
  setQuantity,
  handleAdjust,
}) => {
  const selected = inventory.find((i) => i.id === selectedItemId) ?? null;

  return (
    <div
      style={{
        border: "1px solid var(--gcss-border)",
        borderRadius: 6,
        padding: "0.9rem 1rem",
        background: "var(--gcss-surface)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1rem" }}>Adjust Stock</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: "0.75rem",
          marginTop: "0.75rem",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "0.85rem" }}>Item</label>
          <select
            value={selectedItemId || ""}
            onChange={(e) =>
              setSelectedItemId(e.target.value ? Number(e.target.value) : "")
            }
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border)",
              fontSize: "0.85rem",
            }}
          >
            <option value="">Select an item…</option>
            {inventory.map((i) => (
              <option key={i.id} value={i.id}>
                {i.description} ({i.model_number}) – {i.manufacturer}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem" }}>Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border)",
            }}
          />
        </div>
      </div>

      {selected && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          <strong>Current:</strong> Office: {selected.office_qty} | Van:{" "}
          {selected.van_qty}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.75rem" }}>
        <button
          onClick={() => handleAdjust("office_to_van")}
          disabled={!selected || !quantity}
          style={btnBase(!!selected && !!quantity, "#e0ecff")}
        >
          Office → Van
        </button>

        <button
          onClick={() => handleAdjust("van_to_office")}
          disabled={!selected || !quantity}
          style={btnBase(!!selected && !!quantity, "#e0ffe5")}
        >
          Van → Office
        </button>

        <button
          onClick={() => handleAdjust("van_to_used")}
          disabled={!selected || !quantity}
          style={btnBase(!!selected && !!quantity, "#ffecec")}
        >
          Van → Used
        </button>

        {profile?.role === "admin" && (
          <button
            onClick={() => handleAdjust("add_office")}
            disabled={!selected || !quantity}
            style={{ ...btnBase(!!selected && !!quantity, "#0062ff"), color: "white", marginLeft: "auto" }}
          >
            Add to Office (Admin)
          </button>
        )}
      </div>
    </div>
  );
};

export default InventoryAdjuster;
