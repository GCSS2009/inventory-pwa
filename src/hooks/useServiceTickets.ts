// src/hooks/useServiceTickets.ts
import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import type {
  Profile,
  NewServiceTicketPayload,
  ServiceTicket,
} from "../types";

interface UseServiceTicketsArgs {
  session: Session | null;
  profile: Profile | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface UseServiceTicketsResult {
  saving: boolean;
  saveTicket: (payload: NewServiceTicketPayload) => Promise<ServiceTicket | null>;
}

export function useServiceTickets({
  session,
  profile,
  showToast,
}: UseServiceTicketsArgs): UseServiceTicketsResult {
  const [saving, setSaving] = useState(false);

  const saveTicket = async (
    payload: NewServiceTicketPayload
  ): Promise<ServiceTicket | null> => {
    if (!session || !profile) {
      showToast("You must be logged in to save a service ticket.", "error");
      return null;
    }

    setSaving(true);

    try {
      // 1) Insert main ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("service_tickets")
        .insert({
          customer_name: payload.customer_name || null,
          address: payload.address || null,
          city: payload.city || null,
          state: payload.state || null,
          zip: payload.zip || null,

          billing_email: payload.billing_email || null,
          billing_address: payload.billing_address || null,
          billing_city: payload.billing_city || null,
          billing_state: payload.billing_state || null,
          billing_zip: payload.billing_zip || null,

          customer_po: payload.customer_po || null,
          technician: payload.technician || null,
          service_work: payload.service_work || null,

          material_total: payload.material_total,
          labor_total: payload.labor_total,
          grand_total: payload.grand_total,

          signature_name: payload.signature_name || null,
          signature_date: payload.signature_date || null,
          // signature (image) will be wired later
        })
        .select("*")
        .single();

      if (ticketError || !ticketData) {
        console.error("Error creating service ticket:", ticketError);
        showToast(
          "Error creating service ticket: " + (ticketError?.message ?? "Unknown error"),
          "error"
        );
        setSaving(false);
        return null;
      }

      const ticket = ticketData as ServiceTicket;
      const ticketId = ticket.id;

      // 2) Insert materials (if any)
      if (payload.materials.length > 0) {
        const materialsPayload = payload.materials.map((m, idx) => ({
          ticket_id: ticketId,
          inventory_item_id: m.inventory_item_id,
          qty: m.qty,
          description: m.description,
          cost: m.cost,
          total: m.total,
          order_index: idx,
        }));

        const { error: matError } = await supabase
          .from("service_ticket_materials")
          .insert(materialsPayload);

        if (matError) {
          console.error("Error inserting service ticket materials:", matError);
          showToast(
            "Error saving materials for ticket: " + matError.message,
            "error"
          );
          // still continue, ticket exists
        }
      }

      // 3) Insert labor rows (if any)
      if (payload.labor.length > 0) {
        const laborPayload = payload.labor.map((l, idx) => ({
          ticket_id: ticketId,
          tech_initials: l.tech_initials,
          date: l.date,
          tech_count: l.tech_count,
          rate: l.rate,
          time_in: l.time_in,
          time_out: l.time_out,
          total_hours: l.total_hours,
          total_labor: l.total_labor,
          order_index: idx,
        }));

        const { error: laborError } = await supabase
          .from("service_ticket_labor")
          .insert(laborPayload);

        if (laborError) {
          console.error("Error inserting service ticket labor:", laborError);
          showToast(
            "Error saving labor for ticket: " + laborError.message,
            "error"
          );
        }
      }

      showToast("Service ticket saved.", "success");
      setSaving(false);
      return ticket;
    } catch (err) {
      console.error("Unexpected error in saveTicket:", err);
      showToast("Unexpected error saving service ticket.", "error");
      setSaving(false);
      return null;
    }
  };

  return {
    saving,
    saveTicket,
  };
}
