import { supabase } from "./supabaseClient";

export type InventoryItem = {
  id: number;
  category: string | null;
  description: string | null;
  type: string | null;
  model_number: string | null;
  manufacturer: string | null;
  office_quantity: number | null;
  van_quantity: number | null;
  upcoming_adjustments: number | null;
};

export async function fetchInventory(): Promise<InventoryItem[]> {
  console.log("fetchInventory: calling Supabase…");

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("category", { ascending: true })
    .order("description", { ascending: true });

  if (error) {
    console.error("fetchInventory error:", error);
    throw error;
  }

  console.log("fetchInventory: got rows:", data?.length ?? 0);
  return data ?? [];
}
