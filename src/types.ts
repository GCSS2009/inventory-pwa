// src/types.ts

export type UserRole = "admin" | "tech" | "viewer";

// Basic profile
export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

// Inventory item stored in Supabase
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

// Inventory change history row
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

// Project header
export interface Project {
  id: number | string;
  name: string;
  notes: string | null;
  created_at: string;
}

// Project item / required part
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

// Timesheet entry as used in the UI
export interface TimesheetEntry {
  id: number;
  created_at: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
}

// Active clock-in session
export interface CurrentClockIn {
  id: number;
  start_time: string;
  project: string | null;
  work_type: string | null;
}
