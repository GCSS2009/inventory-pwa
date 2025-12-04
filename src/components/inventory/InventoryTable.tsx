// src/components/inventory/InventoryTable.tsx
import React from "react";
import type { InventoryItem } from "../../types";

interface Props {
  grouped: Record<string, Record<string, InventoryItem[]>>;
  loading: boolean;
  filterCount: number;
}

const InventoryTable: React.FC<Props> = ({ grouped, loading, filterCount }) => {
  if (loading) return <div>Loading inventory…</div>;

  if (!filterCount)
    return <div style={{ fontSize: "0.9rem", color: "var(--gcss-muted)" }}>No inventory items found.</div>;

  return (
    <>
      {Object.entries(grouped).map(([category, byMfg]) => (
        <div key={category} style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem" }}>{category}</h3>

          {Object.entries(byMfg).map(([mfg, items]) => (
            <div key={mfg}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{mfg}</div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Description", "Type", "Model", "Office", "Van"].map((label) => (
                        <th
                          key={label}
                          style={{
                            padding: "0.4rem 0.55rem",
                            background: "var(--gcss-surface-strong)",
                            textAlign: label === "Office" || label === "Van" ? "right" : "left",
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: "0.35rem 0.55rem" }}>{item.description}</td>
                        <td style={{ padding: "0.35rem 0.55rem" }}>{item.type}</td>
                        <td style={{ padding: "0.35rem 0.55rem" }}>{item.model_number}</td>
                        <td style={{ padding: "0.35rem 0.55rem", textAlign: "right" }}>{item.office_qty}</td>
                        <td style={{ padding: "0.35rem 0.55rem", textAlign: "right" }}>{item.van_qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default InventoryTable;
