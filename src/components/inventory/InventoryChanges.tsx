// src/components/inventory/InventoryChanges.tsx
import React from "react";
import type { ChangeEntry } from "../../types";

interface Props {
  changes: ChangeEntry[];
  loading: boolean;
  onRefresh?: () => void;
}

const InventoryChanges: React.FC<Props> = ({ changes, loading, onRefresh }) => (
  <div style={{ marginTop: "1.5rem" }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
      <h2 style={{ fontSize: "1rem", margin: 0 }}>Recent Changes</h2>

      {onRefresh && (
        <button
          onClick={() => void onRefresh()}
          style={{
            marginLeft: "0.5rem",
            padding: "0.25rem 0.6rem",
            borderRadius: 999,
            border: "1px solid var(--gcss-border)",
            background: "var(--gcss-surface)",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      )}
    </div>

    {loading ? (
      <div>Loading change history…</div>
    ) : !changes.length ? (
      <div style={{ fontSize: "0.85rem", color: "var(--gcss-muted)" }}>No recent changes.</div>
    ) : (
      <div
        style={{
          border: "1px solid var(--gcss-border)",
          borderRadius: 6,
          padding: "0.6rem 0.75rem",
          maxHeight: 260,
          overflowY: "auto",
          background: "var(--gcss-surface)",
          fontSize: "0.8rem",
        }}
      >
        {changes.slice(0, 50).map((c) => (
          <div key={c.id} style={{ padding: "0.25rem 0", borderBottom: "1px solid var(--gcss-border)" }}>
            <div style={{ fontWeight: 500 }}>{c.description}</div>
            <div style={{ color: "#6b7280" }}>
              {c.from_location} → {c.to_location} · qty {c.quantity ?? 0}
            </div>
            <div style={{ color: "#9ca3af" }}>
              {new Date(c.created_at).toLocaleString()} · {c.user_email ?? "Unknown"}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default InventoryChanges;
