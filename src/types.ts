// src/types.ts

// Pages
export type PageKey =
  | "inventory"
  | "projects"
  | "timesheet"
  | "pricing"
  | "service"
  | "calendar";

// Roles
export type UserRole = "admin" | "tech" | "viewer";

// Inventory
export type InventoryCategory =
  | "Fire Control"
  | "Addressable"
  | "Notification"
  | "Miscellaneous";

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  full_name?: string | null; // from Supabase profiles.full_name
}

export interface InventoryItem {
  id: number;
  description: string;
  type: string;
  model_number: string;
  manufacturer: string;
  category: string | null;
  office_qty: number;
  van_qty: number;
}

export interface ChangeEntry {
  id: number;
  created_at: string;
  user_email: string | null;
  role: string | null;
  description: string | null;
  model_number: string | null;
  from_location: string | null;
  to_location: string | null;
  quantity: number | null;
}

// Projects
export interface Project {
  id: number | string;
  name: string;
  notes: string | null;
  created_at: string;
}

export interface ProjectItem {
  id: number;
  project_id: number | string;
  item_id: number | null;
  description: string;
  model_number: string;
  type: string;
  required_qty: number;
  allocated_office: number;
  allocated_van: number;
}

// Timesheets
export interface TimesheetRow {
  id: number;
  created_at: string;
  work_date: string;
  project: string | null;
  work_type: string | null;
  hours_decimal: number | null;
  clock_in: string;
  clock_out: string | null;
}

export interface TimesheetEntry {
  id: number;
  created_at: string;
  work_date: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
  clock_in: string | null;
  clock_out: string | null;
}

export interface CurrentClockIn {
  id: number;
  start_time: string;
  project: string | null;
  work_type: string | null;
}

// Inventory adjustment actions
export type AdjustAction =
  | "office_to_van"
  | "van_to_office"
  | "van_to_used"
  | "add_office";

// Toasts
export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// Service Tickets

export interface ServiceTicket {
  id: string;
  customer_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  billing_email: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip: string | null;

  customer_po: string | null;
  technician: string | null;
  service_work: string | null;

  material_total: number | null;
  labor_total: number | null;
  grand_total: number | null;

  signature: string | null; // base64 image (later)
  signature_name: string | null;
  signature_date: string | null;

  created_at: string;
}

export interface ServiceTicketMaterial {
  id: string;
  ticket_id: string;
  inventory_item_id: number;
  qty: number;
  description: string | null;
  cost: number | null;
  total: number | null;
  order_index: number | null;
}

export interface ServiceTicketLabor {
  id: string;
  ticket_id: string;
  tech_initials: string | null;
  date: string | null;
  tech_count: number | null; // 1 or 2
  rate: number | null; // 140 or 170
  time_in: string | null; // "08:00"
  time_out: string | null; // "10:15"
  total_hours: number | null;
  total_labor: number | null;
  order_index: number | null;
}

export interface NewServiceTicketPayload {
  customer_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;

  customer_po: string;
  technician: string;
  service_work: string;

  materials: {
    inventory_item_id: number;
    qty: number;
    description: string;
    cost: number;
    total: number;
  }[];

  labor: {
    tech_initials: string;
    date: string;
    tech_count: number;
    rate: number;
    time_in: string;
    time_out: string;
    total_hours: number;
    total_labor: number;
  }[];

  material_total: number;
  labor_total: number;
  grand_total: number;

  signature_name: string;
  signature_date: string;
  // optional base64 image for signature
  signature?: string | null;
}

// ✅ Calendar / Work Items (added for Calendar page & Outlook integration)

export type WorkType = "service_call" | "installation" | "inspection";

export interface WorkItem {
  id: string;
  outlook_event_id: string | null;
  calendar_owner_email: string | null;

  customer_name: string;
  title: string; // e.g. "Upper Pontalba – Service Call"
  work_type: WorkType;

  technician_email: string | null;
  onsite_contact_name: string | null;
  onsite_contact_phone: string | null;

  // When is this scheduled?
  start_time: string | null; // ISO string, e.g. 2025-12-03T08:00:00Z
  end_time: string | null; // optional for now

  progress_percent: number | null;
  additional_parts: string | null;
  sales_opportunity: string | null;

  // Service call specific
  service_note: string | null;
  service_resolution_notes: string | null;

  // Installation specific
  installation_note: string | null;
  installation_resolution_notes: string | null;

  // Inspection specific
  inspection_special_notes: string | null;
  inspection_resolution_notes: string | null;

  created_at: string;
  updated_at: string;
}

// Platform detection
export type Platform = "android_apk" | "android_web" | "ios_pwa";
