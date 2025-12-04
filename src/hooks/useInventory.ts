// src/hooks/useInventory.ts
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type {
  InventoryItem,
  ChangeEntry,
  AdjustAction,
  Profile,
} from "../types";

interface UseInventoryOptions {
  profile: Profile | null;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  sessionUserId: string | null;
}

export function useInventory({
  profile,
  showToast,
  sessionUserId,
}: UseInventoryOptions) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const [changes, setChanges] = useState<ChangeEntry[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [changesError, setChangesError] = useState<string | null>(null);

  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<string>("");

  // ---------- Loaders ----------
  const loadInventory = async () => {
    setLoadingInventory(true);
    setInventoryError(null);
    const { data, error } = await supabase
      .from("inventory_items")
      .select(
        "id, description, type, model_number, manufacturer, category, office_qty, van_qty"
      )
      .order("description", { ascending: true });

    if (error) {
      setInventoryError(error.message);
      setInventory([]);
      showToast("Error loading inventory: " + error.message, "error");
    } else if (data) {
      setInventory(data as InventoryItem[]);
    }
    setLoadingInventory(false);
  };

  const loadChanges = async () => {
    setLoadingChanges(true);
    setChangesError(null);

    const base = supabase
      .from("inventory_changes")
      .select(
        "id, created_at, user_email, role, description, model_number, from_location, to_location, quantity"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    const query =
      profile?.role === "admin"
        ? base
        : base.eq("user_email", profile?.email ?? "");

    const { data, error } = await query;

    if (error) {
      setChangesError(error.message);
      setChanges([]);
      showToast("Error loading change history: " + error.message, "error");
    } else if (data) {
      setChanges(data as ChangeEntry[]);
    }
    setLoadingChanges(false);
  };

  useEffect(() => {
    if (!sessionUserId) {
      setInventory([]);
      setChanges([]);
      return;
    }
    void loadInventory();
    void loadChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUserId, profile?.role, profile?.email]);

  // ---------- Adjust handler ----------
  const handleAdjust = async (action: AdjustAction) => {
    if (!selectedItemId || !quantity) return;
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) return;

    const item = inventory.find((i) => i.id === selectedItemId);
    if (!item) return;

    let newOffice = item.office_qty;
    let newVan = item.van_qty;
    let fromLocation: string | null = null;
    let toLocation: string | null = null;

    switch (action) {
      case "office_to_van":
        if (item.office_qty < qty) {
          showToast("Not enough office stock.", "error");
          return;
        }
        newOffice -= qty;
        newVan += qty;
        fromLocation = "office";
        toLocation = "van";
        break;

      case "van_to_office":
        if (item.van_qty < qty) {
          showToast("Not enough van stock.", "error");
          return;
        }
        newVan -= qty;
        newOffice += qty;
        fromLocation = "van";
        toLocation = "office";
        break;

      case "van_to_used":
        if (item.van_qty < qty) {
          showToast("Not enough van stock.", "error");
          return;
        }
        newVan -= qty;
        fromLocation = "van";
        toLocation = "used";
        break;

      case "add_office":
        newOffice += qty;
        fromLocation = "new";
        toLocation = "office";
        break;
    }

    const { error: invErr } = await supabase
      .from("inventory_items")
      .update({ office_qty: newOffice, van_qty: newVan })
      .eq("id", item.id);

    if (invErr) {
      showToast("Error updating inventory: " + invErr.message, "error");
      return;
    }

    await supabase.from("inventory_changes").insert({
      user_id: sessionUserId,
      user_email: profile?.email ?? null,
      role: profile?.role ?? null,
      item_id: item.id,
      description: item.description,
      model_number: item.model_number,
      from_location: fromLocation,
      to_location: toLocation,
      quantity: qty,
    });

    await Promise.all([loadInventory(), loadChanges()]);

    setQuantity("");
    showToast("Inventory updated.", "success");
  };

  return {
    // state
    inventory,
    loadingInventory,
    inventoryError,
    changes,
    loadingChanges,
    changesError,
    selectedItemId,
    quantity,

    // setters
    setSelectedItemId,
    setQuantity,

    // actions
    handleAdjust,
    loadChanges,
  };
}
