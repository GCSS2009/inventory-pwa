import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

import { supabase } from "./supabaseClient";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import InventoryPage from "./components/InventoryPage";
import ProjectsPage from "./components/ProjectsPage";
import TimesheetPage from "./components/TimesheetPage";

// ======================
// Types
// ======================
type PageKey = "inventory" | "projects" | "timesheet";
type UserRole = "admin" | "tech" | "viewer";
type InventoryCategory =
  | "Fire Control"
  | "Addressable"
  | "Notification"
  | "Miscellaneous";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface InventoryItem {
  id: number;
  description: string;
  type: string;
  model_number: string;
  manufacturer: string;
  category: string | null;
  office_qty: number;
  van_qty: number;
}

interface ChangeEntry {
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

interface Project {
  id: number | string;
  name: string;
  notes: string | null;
  created_at: string;
}

interface ProjectItem {
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

interface TimesheetRow {
  id: number;
  created_at: string;
  work_date: string;
  project: string | null;
  work_type: string | null;
  hours_decimal: number | null;
  clock_in: string;
  clock_out: string | null;
}

interface TimesheetEntry {
  id: number;
  created_at: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
}

interface CurrentClockIn {
  id: number;
  start_time: string;
  project: string | null;
  work_type: string | null;
}

type AdjustAction =
  | "office_to_van"
  | "van_to_office"
  | "van_to_used"
  | "add_office";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// ======================
// Helpers
// ======================
function getWeekRange(weekEnding: string) {
  const end = new Date(weekEnding + "T00:00:00");
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
}

function todayAsDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ======================
// App Component
// ======================
const App: React.FC = () => {
  // ---------- Auth / Session ----------
  const [session, setSession] = useState<Session | null>(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // ---------- Profile ----------
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ---------- Theme ----------
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // ---------- Layout (mobile vs desktop) ----------
  const [isMobile, setIsMobile] = useState(false);

  // ---------- Navigation ----------
  const [activePage, setActivePage] = useState<PageKey>("inventory");

  // ---------- Inventory ----------
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const [changes, setChanges] = useState<ChangeEntry[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [changesError, setChangesError] = useState<string | null>(null);

  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<string>("");

  // Add-new-inventory-item state (admin)
  const [newInvCategory, setNewInvCategory] =
    useState<InventoryCategory>("Fire Control");
  const [newInvDescription, setNewInvDescription] = useState("");
  const [newInvType, setNewInvType] = useState("");
  const [newInvModelNumber, setNewInvModelNumber] = useState("");
  const [newInvManufacturer, setNewInvManufacturer] = useState("");
  const [newInvOfficeQty, setNewInvOfficeQty] = useState("0");
  const [newInvVanQty, setNewInvVanQty] = useState("0");
  const [creatingInvItem, setCreatingInvItem] = useState(false);

  // ---------- Projects ----------
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectNotes, setNewProjectNotes] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemModelNumber, setNewItemModelNumber] = useState("");
  const [newItemType, setNewItemType] = useState("");
  const [newItemRequiredQty, setNewItemRequiredQty] = useState("");
  const [savingProjectItem, setSavingProjectItem] = useState(false);

  const [selectedProjectItemId, setSelectedProjectItemId] = useState<
    number | ""
  >("");
  const [allocationQty, setAllocationQty] = useState<string>("");

  // ---------- Timesheet ----------
  const [weekEnding, setWeekEnding] = useState<string>(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    const diff = (7 - day) % 7;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + diff);
    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, "0");
    const date = String(sunday.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  });

  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>(
    []
  );
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [, setTimesheetError] = useState<string | null>(null);

  const [currentClockIn, setCurrentClockIn] =
    useState<CurrentClockIn | null>(null);
  const [tsProject, setTsProject] = useState("");
  const [tsWorkType, setTsWorkType] = useState("Install");

  // ---------- Toasts ----------
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ======================
  // Effects: Session & Theme
  // ======================
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        setSession(data.session ?? null);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        if (!session) {
          setProfile(null);
          setInventory([]);
          setChanges([]);
          setProjects([]);
          setProjectItems([]);
          setTimesheetEntries([]);
          setCurrentClockIn(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("gcss-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gcss-theme", theme);
  }, [theme]);

  // Mobile layout detector
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ======================
  // Effects: Profile & Data
  // ======================
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      setProfileError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        setProfileError(error.message);
      } else if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role as UserRole,
        });
      }
    };

    loadProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session) return;
    loadInventory();
    loadChanges();
    loadProjectsAndItems();
    loadTimesheetForWeek(weekEnding);
    loadCurrentClockIn();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    loadTimesheetForWeek(weekEnding);
  }, [session, weekEnding]);

  // ======================
  // Data Loaders
  // ======================
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

  const loadProjectsAndItems = async () => {
    setLoadingProjects(true);
    setProjectsError(null);

    const [projRes, itemsRes] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, notes, created_at")
        .order("created_at", { ascending: true }),
      supabase
        .from("project_items")
        .select(
          "id, project_id, item_id, description, model_number, type, required_qty, allocated_office, allocated_van"
        )
        .order("project_id", { ascending: true }),
    ]);

    if (projRes.error) {
      setProjectsError(projRes.error.message);
      setProjects([]);
      showToast("Error loading projects: " + projRes.error.message, "error");
    } else if (projRes.data) {
      setProjects(projRes.data as Project[]);
    }

    if (itemsRes.error) {
      setProjectsError((prev) => prev ?? itemsRes.error!.message);
      setProjectItems([]);
      showToast(
        "Error loading project items: " + itemsRes.error.message,
        "error"
      );
    } else if (itemsRes.data) {
      setProjectItems(itemsRes.data as ProjectItem[]);
    }

    setLoadingProjects(false);
  };

  const loadTimesheetForWeek = async (weekEndStr: string) => {
    setLoadingEntries(true);
    setTimesheetError(null);

    const { start, end } = getWeekRange(weekEndStr);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("timesheet_entries")
      .select(
        "id, created_at, work_date, project, work_type, hours_decimal, clock_in, clock_out"
      )
      .eq("user_id", session?.user.id ?? "")
      .gte("work_date", startStr)
      .lte("work_date", endStr)
      .order("work_date", { ascending: true });

    if (error) {
      setTimesheetError(error.message);
      setTimesheetEntries([]);
      showToast("Error loading timesheet: " + error.message, "error");
    } else if (data) {
      const mapped: TimesheetEntry[] = (data as TimesheetRow[]).map((row) => ({
        id: row.id,
        created_at: row.created_at,
        project: row.project,
        work_type: row.work_type,
        hours: row.hours_decimal,
      }));
      setTimesheetEntries(mapped);
    }

    setLoadingEntries(false);
  };

  const loadCurrentClockIn = async () => {
    if (!session?.user) {
      setCurrentClockIn(null);
      return;
    }

    const { data, error } = await supabase
      .from("timesheet_entries")
      .select("id, clock_in, project, work_type, clock_out")
      .eq("user_id", session.user.id)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("Error loading current clock-in:", error.message);
      return;
    }

    if (!data) {
      setCurrentClockIn(null);
    } else {
      setCurrentClockIn({
        id: data.id,
        start_time: data.clock_in,
        project: data.project,
        work_type: data.work_type,
      });
      setTsProject(data.project ?? "");
      setTsWorkType(data.work_type ?? "Install");
    }
  };

  // ======================
  // Auth Handlers
  // ======================
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) {
      setAuthError(error.message);
      showToast("Login failed: " + error.message, "error");
    } else if (data.session) {
      setSession(data.session);
      showToast("Logged in successfully.", "success");
    }

    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    showToast("Logged out.", "info");
  };

  // ======================
  // Inventory Handlers
  // ======================
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
      user_id: session?.user.id ?? null,
      user_email: profile?.email ?? session?.user.email ?? null,
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

  const handleCreateInventoryItem = async () => {
    if (!profile || profile.role !== "admin") {
      showToast("Only admins can add inventory items.", "error");
      return;
    }

    const description = newInvDescription.trim();
    const type = newInvType.trim();
    const model = newInvModelNumber.trim();
    const manufacturer = newInvManufacturer.trim();

    if (!description || !type || !model) {
      showToast(
        "Description, type, and model number are required for new items.",
        "error"
      );
      return;
    }

    const officeQty = parseInt(newInvOfficeQty, 10) || 0;
    const vanQty = parseInt(newInvVanQty, 10) || 0;

    if (officeQty < 0 || vanQty < 0) {
      showToast("Quantities cannot be negative.", "error");
      return;
    }

    setCreatingInvItem(true);

    const { data, error } = await supabase
      .from("inventory_items")
      .insert({
        description,
        type,
        model_number: model,
        manufacturer: manufacturer || "",
        category: newInvCategory,
        office_qty: officeQty,
        van_qty: vanQty,
      })
      .select("id")
      .single();

    if (error) {
      setCreatingInvItem(false);
      showToast("Error creating item: " + error.message, "error");
      return;
    }

    if (officeQty > 0) {
      await supabase.from("inventory_changes").insert({
        user_id: session?.user.id ?? null,
        user_email: profile?.email ?? session?.user.email ?? null,
        role: profile?.role ?? null,
        item_id: data.id,
        description,
        model_number: model,
        from_location: "new",
        to_location: "office",
        quantity: officeQty,
      });
    }

    if (vanQty > 0) {
      await supabase.from("inventory_changes").insert({
        user_id: session?.user.id ?? null,
        user_email: profile?.email ?? session?.user.email ?? null,
        role: profile?.role ?? null,
        item_id: data.id,
        description,
        model_number: model,
        from_location: "new",
        to_location: "van",
        quantity: vanQty,
      });
    }

    await Promise.all([loadInventory(), loadChanges()]);

    setNewInvDescription("");
    setNewInvType("");
    setNewInvModelNumber("");
    setNewInvManufacturer("");
    setNewInvOfficeQty("0");
    setNewInvVanQty("0");
    setCreatingInvItem(false);
    showToast("Inventory item created.", "success");
  };

  // ======================
  // Project Handlers
  // ======================
  const handleCreateProject = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);

    const { error } = await supabase.from("projects").insert({
      name: newProjectName.trim(),
      notes: newProjectNotes.trim() || null,
    });

    if (error) {
      showToast("Error creating project: " + error.message, "error");
    } else {
      setNewProjectName("");
      setNewProjectNotes("");
      await loadProjectsAndItems();
      showToast("Project created.", "success");
    }

    setCreatingProject(false);
  };

  const handleAddProjectItem = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast("Select a project first.", "error");
      return;
    }
    const required = parseInt(newItemRequiredQty, 10);
    if (!Number.isFinite(required) || required <= 0) {
      showToast("Required quantity must be a positive number.", "error");
      return;
    }

    setSavingProjectItem(true);

    const { error } = await supabase.from("project_items").insert({
      project_id: selectedProjectId,
      description: newItemDescription.trim(),
      model_number: newItemModelNumber.trim(),
      type: newItemType.trim(),
      required_qty: required,
      allocated_office: 0,
      allocated_van: 0,
    });

    if (error) {
      showToast("Error adding project item: " + error.message, "error");
    } else {
      setNewItemDescription("");
      setNewItemModelNumber("");
      setNewItemType("");
      setNewItemRequiredQty("");
      await loadProjectsAndItems();
      showToast("Project item added.", "success");
    }

    setSavingProjectItem(false);
  };

  const handleAllocateToProject = async (source: "office" | "van") => {
    if (!selectedProjectItemId || !allocationQty) return;
    const qty = parseInt(allocationQty, 10);
    if (!Number.isFinite(qty) || qty <= 0) return;

    const pItem = projectItems.find((pi) => pi.id === selectedProjectItemId);
    if (!pItem) return;

    const inv =
      inventory.find((i) => i.id === pItem.item_id) ||
      inventory.find(
        (i) =>
          i.model_number.toLowerCase() ===
          pItem.model_number.toLowerCase()
      );

    if (!inv) {
      showToast(
        "No matching inventory item found for this project item.",
        "error"
      );
      return;
    }

    if (source === "office") {
      if (inv.office_qty < qty) {
        showToast("Not enough office stock.", "error");
        return;
      }
    } else {
      if (inv.van_qty < qty) {
        showToast("Not enough van stock.", "error");
        return;
      }
    }

    const currentlyAllocated =
      pItem.allocated_office + pItem.allocated_van;
    if (currentlyAllocated + qty > pItem.required_qty) {
      showToast("Cannot allocate more than required.", "error");
      return;
    }

    let newAllocatedOffice = pItem.allocated_office;
    let newAllocatedVan = pItem.allocated_van;
    let newOfficeInv = inv.office_qty;
    let newVanInv = inv.van_qty;

    if (source === "office") {
      newAllocatedOffice += qty;
      newOfficeInv -= qty;
    } else {
      newAllocatedVan += qty;
      newVanInv -= qty;
    }

    const { error: projErr } = await supabase
      .from("project_items")
      .update({
        allocated_office: newAllocatedOffice,
        allocated_van: newAllocatedVan,
      })
      .eq("id", pItem.id);

    if (projErr) {
      showToast(
        "Error updating project allocation: " + projErr.message,
        "error"
      );
      return;
    }

    const { error: invErr } = await supabase
      .from("inventory_items")
      .update({ office_qty: newOfficeInv, van_qty: newVanInv })
      .eq("id", inv.id);

    if (invErr) {
      showToast(
        "Error updating inventory after allocation: " + invErr.message,
        "error"
      );
      return;
    }

    await Promise.all([loadProjectsAndItems(), loadInventory()]);
    setAllocationQty("");
    showToast("Allocation saved.", "success");
  };

  // ======================
  // Timesheet Handlers
  // ======================
  const handleClockIn = async () => {
    if (!session?.user) return;

    if (currentClockIn) {
      showToast("You are already clocked in.", "error");
      return;
    }

    const now = new Date();
    const workDate = todayAsDateString();

    const { error } = await supabase.from("timesheet_entries").insert({
      user_id: session.user.id,
      work_date: workDate,
      clock_in: now.toISOString(),
      clock_out: null,
      project: tsProject.trim() || null,
      work_type: tsWorkType || null,
      hours_decimal: null,
    });

    if (error) {
      showToast("Error clocking in: " + error.message, "error");
      return;
    }

    setTsProject("");
    await loadCurrentClockIn();
    await loadTimesheetForWeek(weekEnding);
    showToast("Clocked in.", "success");
  };

  const handleClockOut = async () => {
    if (!currentClockIn) return;

    const finalProject =
      tsProject.trim() || currentClockIn.project?.trim() || "";
    const finalWorkType =
      tsWorkType.trim() || currentClockIn.work_type?.trim() || "";

    if (!finalProject) {
      showToast("Enter a project/location before clocking out.", "error");
      return;
    }

    if (!finalWorkType) {
      showToast("Select a work type before clocking out.", "error");
      return;
    }

    const now = new Date();
    const start = new Date(currentClockIn.start_time);
    const diffMs = now.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    const { error } = await supabase
      .from("timesheet_entries")
      .update({
        clock_out: now.toISOString(),
        hours_decimal: hours,
        project: finalProject,
        work_type: finalWorkType,
      })
      .eq("id", currentClockIn.id);

    if (error) {
      showToast("Error clocking out: " + error.message, "error");
      return;
    }

    setCurrentClockIn(null);
    setTsProject("");
    setTsWorkType("Install");
    await loadTimesheetForWeek(weekEnding);
    showToast("Clocked out.", "success");
  };

  const downloadTimesheet = () => {
    if (!timesheetEntries.length) {
      showToast("No entries to export.", "info");
      return;
    }

    const sheetData = timesheetEntries.map((row) => ({
      Date: new Date(row.created_at).toLocaleDateString(),
      Project: row.project ?? "",
      WorkType: row.work_type ?? "",
      Hours: row.hours ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timesheet");

    const fileName = `gcss_timesheet_${weekEnding}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast("Timesheet downloaded.", "success");
  };

  const totalHours = timesheetEntries.reduce(
    (sum, row) => sum + (row.hours ?? 0),
    0
  );

  // ======================
  // Auth Gate
  // ======================
  if (!session) {
    return (
      <AuthScreen
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        handleLogin={handleLogin}
        authError={authError ?? profileError}
        authLoading={authLoading}
      />
    );
  }

  // ======================
  // Main Shell
  // ======================
  const isLoadingOverlay =
    loadingInventory || loadingProjects || loadingEntries;

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          minHeight: "100vh",
          background: "var(--gcss-bg)",
          color: "var(--gcss-text)",
        }}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          theme={theme}
          setTheme={setTheme}
          profile={profile}
          session={session}
          isMobile={isMobile}
        />

        <main
          style={{
            flex: 1,
            background: "var(--gcss-surface)",
            padding: isMobile
              ? "0.75rem 0.5rem 1.5rem"
              : "1.25rem 1.5rem 2rem",
            boxSizing: "border-box",
          }}
        >
          {activePage === "inventory" && (
            <InventoryPage
              session={session}
              profile={profile}
              inventory={inventory}
              loadingInventory={loadingInventory}
              inventoryError={inventoryError}
              changes={changes}
              loadingChanges={loadingChanges}
              changesError={changesError}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              quantity={quantity}
              setQuantity={setQuantity}
              handleAdjust={handleAdjust}
              handleLogout={handleLogout}
              creatingItem={creatingInvItem}
              newItemCategory={newInvCategory}
              setNewItemCategory={setNewInvCategory}
              newItemDescription={newInvDescription}
              setNewItemDescription={setNewInvDescription}
              newItemType={newInvType}
              setNewItemType={setNewInvType}
              newItemModelNumber={newInvModelNumber}
              setNewItemModelNumber={setNewInvModelNumber}
              newItemManufacturer={newInvManufacturer}
              setNewItemManufacturer={setNewInvManufacturer}
              newItemOfficeQty={newInvOfficeQty}
              setNewItemOfficeQty={setNewInvOfficeQty}
              newItemVanQty={newInvVanQty}
              setNewItemVanQty={setNewInvVanQty}
              handleCreateItem={handleCreateInventoryItem}
              onRefreshHistory={loadChanges}
            />
          )}

          {activePage === "projects" && (
            <ProjectsPage
              profile={profile}
              projects={projects}
              projectItems={projectItems}
              inventory={inventory}
              loadingProjects={loadingProjects}
              projectsError={projectsError}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
              newProjectNotes={newProjectNotes}
              setNewProjectNotes={setNewProjectNotes}
              creatingProject={creatingProject}
              handleCreateProject={handleCreateProject}
              newItemDescription={newItemDescription}
              setNewItemDescription={setNewItemDescription}
              newItemModelNumber={newItemModelNumber}
              setNewItemModelNumber={setNewItemModelNumber}
              newItemType={newItemType}
              setNewItemType={setNewItemType}
              newItemRequiredQty={newItemRequiredQty}
              setNewItemRequiredQty={setNewItemRequiredQty}
              savingProjectItem={savingProjectItem}
              handleAddProjectItem={handleAddProjectItem}
              selectedProjectItemId={selectedProjectItemId}
              setSelectedProjectItemId={setSelectedProjectItemId}
              allocationQty={allocationQty}
              setAllocationQty={setAllocationQty}
              handleAllocateToProject={handleAllocateToProject}
              handleLogout={handleLogout}
            />
          )}

          {activePage === "timesheet" && (
            <TimesheetPage
              session={session}
              profile={profile}
              currentClockIn={currentClockIn}
              selectedProject={tsProject}
              setSelectedProject={setTsProject}
              selectedWorkType={tsWorkType}
              setSelectedWorkType={setTsWorkType}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              weekEnding={weekEnding}
              setWeekEnding={setWeekEnding}
              entries={timesheetEntries}
              loadingEntries={loadingEntries}
              totalHours={totalHours}
              downloadTimesheet={downloadTimesheet}
            />
          )}
        </main>
      </div>

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          top: "0.75rem",
          right: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 10000,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: 4,
              fontSize: "0.85rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
              color: "#f9fafb",
              background:
                t.type === "success"
                  ? "#16a34a"
                  : t.type === "error"
                  ? "#dc2626"
                  : "#2563eb",
              maxWidth: 260,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {isLoadingOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            color: "#e5e7eb",
            fontSize: "1rem",
            backdropFilter: "blur(2px)",
          }}
        >
          Loading data…
        </div>
      )}
    </div>
  );
};

export default App;
