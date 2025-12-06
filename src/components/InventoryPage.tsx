// src/components/InventoryPage.tsx
import React from "react";
import type { Session } from "@supabase/supabase-js";
import type {
  Profile,
  InventoryItem,
  ChangeEntry,
  InventoryCategory,
  AdjustAction,
} from "../types";

import InventoryHeader from "./inventory/InventoryHeader";
import InventoryAdjuster from "./inventory/InventoryAdjuster";
import InventoryNewItemForm from "./inventory/InventoryNewItemForm";
import InventoryTable from "./inventory/InventoryTable";
import InventoryChanges from "./inventory/InventoryChanges";

interface Props {
  session: Session | null;
  profile: Profile | null;

  inventory: InventoryItem[];
  loadingInventory: boolean;
  inventoryError: string | null;

  changes: ChangeEntry[];
  loadingChanges: boolean;
  changesError: string | null;

  selectedItemId: number | "";
  setSelectedItemId: (v: number | "") => void;

  quantity: string;
  setQuantity: (v: string) => void;

  // New item (admin)
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

  handleAdjust: (action: AdjustAction) => void;

  onRefreshHistory?: () => Promise<void>;
}

const InventoryPage: React.FC<Props> = ({
  session,
  profile,
  inventory,
  loadingInventory,
  inventoryError,
  changes,
  loadingChanges,
  changesError,

  selectedItemId,
  setSelectedItemId,
  quantity,
  setQuantity,

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

  handleAdjust,
  onRefreshHistory,
}) => {
  const [filter, setFilter] = React.useState("");

  const filtered = React.useMemo(() => {
    const t = filter.trim().toLowerCase();
    if (!t) return inventory;

    return inventory.filter((i) =>
      [i.description, i.model_number, i.type, i.manufacturer]
        .join(" ")
        .toLowerCase()
        .includes(t)
    );
  }, [filter, inventory]);

  const grouped = React.useMemo(() => {
    const map: Record<string, Record<string, InventoryItem[]>> = {};

    for (const item of filtered) {
      const cat = item.category || "Uncategorized";
      const mfg = item.manufacturer || "Unknown";
      if (!map[cat]) map[cat] = {};
      if (!map[cat][mfg]) map[cat][mfg] = [];
      map[cat][mfg].push(item);
    }
    return map;
  }, [filtered]);

  return (
    <div style={{ padding: "0 0.75rem 1.25rem", // no top padding, just sides & bottom maxWidth: 1200,
       }}>
      <InventoryHeader session={session} profile={profile}  />

      {inventoryError && <div style={{ color: "red" }}>{inventoryError}</div>}
      {changesError && <div style={{ color: "red" }}>{changesError}</div>}

      {/* Adjust stock */}
      <InventoryAdjuster
        profile={profile}
        inventory={inventory}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        quantity={quantity}
        setQuantity={setQuantity}
        handleAdjust={handleAdjust}
      />

      {/* Add item (admins) */}
      {profile?.role === "admin" && (
        <InventoryNewItemForm
          newItemCategory={newItemCategory}
          setNewItemCategory={setNewItemCategory}
          newItemDescription={newItemDescription}
          setNewItemDescription={setNewItemDescription}
          newItemType={newItemType}
          setNewItemType={setNewItemType}
          newItemModelNumber={newItemModelNumber}
          setNewItemModelNumber={setNewItemModelNumber}
          newItemManufacturer={newItemManufacturer}
          setNewItemManufacturer={setNewItemManufacturer}
          newItemOfficeQty={newItemOfficeQty}
          setNewItemOfficeQty={setNewItemOfficeQty}
          newItemVanQty={newItemVanQty}
          setNewItemVanQty={setNewItemVanQty}
          creatingItem={creatingItem}
          handleCreateItem={handleCreateItem}
        />
      )}

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search inventory…"
          style={{
            padding: "0.35rem 0.6rem",
            borderRadius: 999,
            border: "1px solid var(--gcss-border)",
            fontSize: "0.8rem",
            marginBottom: "0.5rem",
            minWidth: 220,
          }}
        />
      </div>

      <InventoryTable grouped={grouped} loading={loadingInventory} filterCount={filtered.length} />

      <InventoryChanges changes={changes} loading={loadingChanges} onRefresh={onRefreshHistory} />
    </div>
  );
};

export default InventoryPage;
