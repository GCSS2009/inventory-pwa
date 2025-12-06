// src/hooks/useWorkItems.ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Profile, WorkItem, WorkType } from "../types";

interface UseWorkItemsArgs {
  profile: Profile | null;
}

interface UseWorkItemsResult {
  workItems: WorkItem[];
  loading: boolean;
  error: string | null;
  saveWorkItem: (partial: Partial<WorkItem>, outlookBody: string) => Promise<void>;
  deleteWorkItem: (item: WorkItem) => Promise<void>;
}

export function useWorkItems(
  { profile }: UseWorkItemsArgs = { profile: null }
): UseWorkItemsResult {

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) {
      setWorkItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("work_items")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading work items:", error.message);
      setError(error.message);
    } else {
      setWorkItems((data ?? []) as WorkItem[]);
    }

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveWorkItem = useCallback(
    async (partial: Partial<WorkItem>, outlookBody: string) => {
      if (!profile) {
        throw new Error("Cannot save work item: no profile.");
      }

      const work_type: WorkType =
        (partial.work_type as WorkType) ?? "service_call";

      const payload: any = {
        customer_name: partial.customer_name ?? "",
        title: partial.title ?? "",
        work_type,
        onsite_contact_name: partial.onsite_contact_name ?? "",
        onsite_contact_phone: partial.onsite_contact_phone ?? "",
        start_time: partial.start_time ?? null,
        end_time: partial.end_time ?? null,
        technician_email: partial.technician_email ?? "",
        progress_percent:
          partial.progress_percent === undefined
            ? null
            : partial.progress_percent,
        additional_parts: partial.additional_parts ?? "",
        sales_opportunity: partial.sales_opportunity ?? "",
        service_note: partial.service_note ?? "",
        service_resolution_notes: partial.service_resolution_notes ?? "",
        installation_note: partial.installation_note ?? "",
        installation_resolution_notes:
          partial.installation_resolution_notes ?? "",
        inspection_special_notes: partial.inspection_special_notes ?? "",
        inspection_resolution_notes:
          partial.inspection_resolution_notes ?? "",

        // Address fields
        address: partial.address ?? "",
        city: partial.city ?? "",
        state: partial.state ?? "",
        zip: partial.zip ?? "",
      };

      let row: WorkItem | null = null;
      let existingId: string | undefined =
        typeof partial.id === "string" ? partial.id : undefined;
      let existingOutlookId: string | null =
        partial.outlook_event_id ?? null;

      if (existingId) {
        const { data, error } = await supabase
          .from("work_items")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingId)
          .select("*")
          .single();

        if (error) {
          console.error("Error updating work item:", error.message);
          throw error;
        }
        row = data as WorkItem;
      } else {
        const { data, error } = await supabase
          .from("work_items")
          .insert({
            ...payload,
          })
          .select("*")
          .single();

        if (error) {
          console.error("Error inserting work item:", error.message);
          throw error;
        }
        row = data as WorkItem;
        existingId = row.id;
        existingOutlookId = row.outlook_event_id ?? null;
      }

      // Call Outlook sync function (upsert)
      try {
        const { data, error } = await supabase.functions.invoke(
          "sync-outlook-event",
          {
            body: {
              mode: "upsert",
              workItem: {
                ...row,
                outlook_event_id: existingOutlookId,
              },
              outlookBody,
            },
          }
        );

        if (error) {
          console.error("Error invoking sync-outlook-event:", error);
        } else if (data && typeof data === "object" && "outlook_event_id" in data) {
          const outlook_event_id =
            (data as { outlook_event_id?: string | null }).outlook_event_id ??
            null;

          if (outlook_event_id && existingId) {
            const { error: updErr } = await supabase
              .from("work_items")
              .update({ outlook_event_id })
              .eq("id", existingId);

            if (updErr) {
              console.error(
                "Error saving outlook_event_id to work_items:",
                updErr.message
              );
            }
          }
        }
      } catch (e) {
        console.error("Unexpected error calling sync-outlook-event:", e);
      }

      await load();
    },
    [profile, load]
  );

  const deleteWorkItem = useCallback(
    async (item: WorkItem) => {
      if (!profile) {
        throw new Error("Cannot delete work item: no profile.");
      }

      // Try to delete Outlook event first (best effort)
      try {
        if (item.outlook_event_id) {
          await supabase.functions.invoke("sync-outlook-event", {
            body: {
              mode: "delete",
              workItem: {
                id: item.id,
                outlook_event_id: item.outlook_event_id,
              },
            },
          });
        }
      } catch (e) {
        console.error("Error calling sync-outlook-event (delete):", e);
        // we still proceed with DB delete; worst case Outlook keeps a stale event
      }

      const { error } = await supabase
        .from("work_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.error("Error deleting work item:", error.message);
        throw error;
      }

      await load();
    },
    [profile, load]
  );

  return {
    workItems,
    loading,
    error,
    saveWorkItem,
    deleteWorkItem,
  };
}
