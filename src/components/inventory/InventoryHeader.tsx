// src/components/inventory/InventoryHeader.tsx
import React from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "../../types";

interface Props {
  session: Session | null;
  profile: Profile | null;
}

const InventoryHeader: React.FC<Props> = ({ session, profile }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: "1rem",
      gap: "0.75rem",
      flexWrap: "wrap",
    }}
  >
    <div>
      <h1 style={{ margin: 0 }}>Inventory</h1>
      {profile && (
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--gcss-muted)",
          }}
        >
          Logged in as <strong>{profile.email ?? session?.user.email}</strong>{" "}
          <span style={{ color: "var(--gcss-muted)" }}>({profile.role})</span>
        </div>
      )}
    </div>
  </div>
);

export default InventoryHeader;
