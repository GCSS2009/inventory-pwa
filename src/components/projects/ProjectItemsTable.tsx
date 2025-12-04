import React from "react";
import type { ProjectItem, InventoryItem } from "../../types";

interface Props {
  itemsForProject: ProjectItem[];
  inventory: InventoryItem[];
}

function getProjectItemStatus(
  item: ProjectItem,
  inventoryItem: InventoryItem | undefined
) {
  const required = item.required_qty;
  const allocated = item.allocated_office + item.allocated_van;
  const remainingNeeded = Math.max(required - allocated, 0);

  const stockOffice = inventoryItem?.office_qty ?? 0;
  const stockVan = inventoryItem?.van_qty ?? 0;
  const stockTotal = stockOffice + stockVan;

  if (allocated >= required) {
    return {
      label: "Allocated",
      bg: "#dcfce7",
      border: "#16a34a",
      text: "#166534",
    };
  }

  if (remainingNeeded > 0 && stockTotal === 0) {
    return {
      label: "No stock",
      bg: "#fee2e2",
      border: "#b91c1c",
      text: "#991b1b",
    };
  }

  if (remainingNeeded > 0 && stockTotal < remainingNeeded) {
    return {
      label: "Short",
      bg: "#fef3c7",
      border: "#b45309",
      text: "#92400e",
    };
  }

  if (remainingNeeded > 0 && stockTotal >= remainingNeeded) {
    return {
      label: "Can allocate",
      bg: "#eff6ff",
      border: "#2563eb",
      text: "#1d4ed8",
    };
  }

  return {
    label: "In stock",
    bg: "#f9fafb",
    border: "#d1d5db",
    text: "#4b5563",
  };
}

const thBase: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  padding: "0.25rem 0.4rem",
};
const thLeft: React.CSSProperties = { ...thBase, textAlign: "left" };
const thRight: React.CSSProperties = { ...thBase, textAlign: "right" };
const thCenter: React.CSSProperties = { ...thBase, textAlign: "center" };

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "0.25rem 0.4rem",
};
const tdRight: React.CSSProperties = { ...td, textAlign: "right" };

const ProjectItemsTable: React.FC<Props> = ({ itemsForProject, inventory }) => {
  const inventoryByModel = React.useMemo(() => {
    const map: Record<string, InventoryItem> = {};
    for (const item of inventory) {
      const key = item.model_number?.toLowerCase();
      if (key) map[key] = item;
    }
    return map;
  }, [inventory]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          minWidth: 650,
          borderCollapse: "collapse",
          fontSize: "0.85rem",
        }}
      >
        <thead>
          <tr>
            <th style={thLeft}>Description</th>
            <th style={thLeft}>Model</th>
            <th style={thLeft}>Type</th>
            <th style={thRight}>Required</th>
            <th style={thRight}>Alloc (Off)</th>
            <th style={thRight}>Alloc (Van)</th>
            <th style={thRight}>Office</th>
            <th style={thRight}>Van</th>
            <th style={thCenter}>Status</th>
          </tr>
        </thead>
        <tbody>
          {itemsForProject.map((pi) => {
            const inv =
              inventory.find((i) => i.id === pi.item_id) ||
              inventoryByModel[pi.model_number.toLowerCase()];
            const status = getProjectItemStatus(pi, inv);

            return (
              <tr key={pi.id}>
                <td style={td}>{pi.description}</td>
                <td style={td}>{pi.model_number}</td>
                <td style={td}>{pi.type}</td>
                <td style={tdRight}>{pi.required_qty}</td>
                <td style={tdRight}>{pi.allocated_office}</td>
                <td style={tdRight}>{pi.allocated_van}</td>
                <td style={tdRight}>{inv ? inv.office_qty : "-"}</td>
                <td style={tdRight}>{inv ? inv.van_qty : "-"}</td>
                <td
                  style={{
                    borderBottom: "1px solid " + (status.border || "#ccc"),
                    padding: "0.25rem 0.4rem",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 999,
                      border: `1px solid ${status.border}`,
                      background: status.bg,
                      color: status.text,
                      fontSize: "0.75rem",
                    }}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectItemsTable;
