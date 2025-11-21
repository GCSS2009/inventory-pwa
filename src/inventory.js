import { supabase } from "./supabaseClient";
export async function fetchInventory() {
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
