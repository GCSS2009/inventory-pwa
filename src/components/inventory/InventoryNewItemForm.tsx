// src/components/inventory/InventoryNewItemForm.tsx
import React from "react";
import type { InventoryCategory } from "../../types";

interface Props {
  newItemCategory: InventoryCategory;
  setNewItemCategory: (v: InventoryCategory) => void;
  newItemDescription: string;
  setNewItemDescription: (v: string) => void;
  newItemType: string;
  setNewItemType: (v: string) => void;
  newItemModelNumber: string;
  setNewItemModelNumber: (v: string) => void;
  newItemManufacturer: string;
  setNewItemManufacturer: (v: string) => void;
  newItemOfficeQty: string;
  setNewItemOfficeQty: (v: string) => void;
  newItemVanQty: string;
  setNewItemVanQty: (v: string) => void;
  creatingItem: boolean;
  handleCreateItem: (e: React.FormEvent) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem",
  borderRadius: 4,
  border: "1px solid var(--gcss-border)",
  fontSize: "0.85rem",
};

const InventoryNewItemForm: React.FC<Props> = ({
  newItemCategory,
  setNewItemCategory,
  newItemDescription,
  setNewItemDescription,
  newItemType,
  setNewItemType,
  newItemModelNumber,
  setNewItemModelNumber,
  newItemManufacturer,
  setNewItemManufacturer,
  newItemOfficeQty,
  setNewItemOfficeQty,
  newItemVanQty,
  setNewItemVanQty,
  creatingItem,
  handleCreateItem,
}) => (
  <div
    style={{
      border: "1px solid var(--gcss-border)",
      borderRadius: 6,
      padding: "0.9rem 1rem",
      background: "var(--gcss-surface)",
    }}
  >
    <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Add New Inventory Item</h2>

    <form onSubmit={handleCreateItem}>
      <div style={{ display: "grid", gap: "0.6rem", marginBottom: "0.75rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem" }}>Category</label>
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
            style={inputStyle}
          >
            <option value="Fire Control">Fire Control</option>
            <option value="Addressable">Addressable</option>
            <option value="Notification">Notification</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.8rem" }}>Description</label>
          <input value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem" }}>Type</label>
          <input value={newItemType} onChange={(e) => setNewItemType(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem" }}>Model Number</label>
          <input value={newItemModelNumber} onChange={(e) => setNewItemModelNumber(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem" }}>Manufacturer</label>
          <input value={newItemManufacturer} onChange={(e) => setNewItemManufacturer(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem" }}>Office Qty</label>
            <input type="number" value={newItemOfficeQty} onChange={(e) => setNewItemOfficeQty(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem" }}>Van Qty</label>
            <input type="number" value={newItemVanQty} onChange={(e) => setNewItemVanQty(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={creatingItem}
        style={{
          padding: "0.45rem 1rem",
          borderRadius: 4,
          border: "none",
          background: "#0062ff",
          color: "white",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        {creatingItem ? "Saving…" : "Add Item"}
      </button>
    </form>
  </div>
);

export default InventoryNewItemForm;
