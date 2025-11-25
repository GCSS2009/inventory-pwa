import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

import { supabase } from "./supabaseClient";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import InventoryPage from "./components/InventoryPage";
import ProjectsPage from "./components/ProjectsPage";
import TimesheetPage from "./components/TimesheetPage";
import { usePushSubscription } from "./hooks/usePushSubscription";

import { APP_VERSION } from "./version";

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
  work_date: string;
  project: string | null;
  work_type: string | null;
  hours: number | null;
  clock_in: string | null;
  clock_out: string | null;
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

type Platform = "android_apk" | "android_web" | "ios_pwa";

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

function formatRoundedTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const intervalMs = 15 * 60 * 1000;
  const rounded = Math.round(d.getTime() / intervalMs) * intervalMs;
  const rd = new Date(rounded);

  return rd.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "android_web";

  const ua = window.navigator.userAgent.toLowerCase();
  const isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  const isIOS = /iphone|ipad|ipod/.test(ua);

  // If you ever build a special APK version, you can key off env var here
  // if (import.meta.env.VITE_IS_APK === "true") return "android_apk";

  if (isStandalone && isIOS) return "ios_pwa";
  if (isStandalone) return "android_web";
  return "android_web";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [timesheetError, setTimesheetError] = useState<string | null>(null);

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
  // Effects: Session & Push
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

  // Push subscription hook at top level (rule of hooks compliant)
  let platform: Platform = "android_web";
  if (typeof window !== "undefined") {
    platform = detectPlatform();
  }
  usePushSubscription(session?.user?.id, platform);

  // ======================
  // Effects: Theme & Layout
  // ======================
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

  // Mobile layout detector – treat anything non-classic-desktop as mobile
  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;

      const ua = window.navigator.userAgent.toLowerCase();

      const isWindows = ua.includes("windows nt");
      const isMacDesktop =
        ua.includes("macintosh") &&
        !ua.includes("iphone") &&
        !ua.includes("ipad");
      const isLinuxDesktop = ua.includes("x11") || ua.includes("linux x86_64");

      const isDesktopOS = isWindows || isMacDesktop || isLinuxDesktop;

      const mobile = !isDesktopOS;
      setIsMobile(mobile);
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
        work_date: row.work_date,
        project: row.project,
        work_type: row.work_type,
        hours: row.hours_decimal,
        clock_in: row.clock_in,
        clock_out: row.clock_out,
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

    console.log("[Auth] Starting login with:", authEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      console.log("[Auth] Supabase response:", { data, error });

      if (error) {
        console.error("[Auth] Login error:", error);
        setAuthError(error.message);
        showToast("Login failed: " + error.message, "error");
        alert("Login failed: " + error.message);
      } else if (data.session) {
        console.log("[Auth] Login success, got session:", data.session);
        setSession(data.session);
        showToast("Logged in successfully.", "success");
      } else {
        console.error("[Auth] No session returned from Supabase");
        const msg = "Login failed: no session returned from Supabase.";
        setAuthError(msg);
        showToast(msg, "error");
        alert(msg);
      }
    } catch (err) {
      console.error("[Auth] Unexpected login error:", err);
      const msg = "Unexpected error during login. See console for details.";
      setAuthError(msg);
      showToast(msg, "error");
      alert(msg);
    } finally {
      setAuthLoading(false);
    }
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
  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);

    const { error } = await supabase.from("projects").insert({
      name: newProjectName.trim(),
      notes: newProjectNotes.trim() || null,
    });

    if (error) {
      showToast("Error creating project: " + error.message, "error");
      setCreatingProject(false);
      return;
    }

    setNewProjectName("");
    setNewProjectNotes("");
    setCreatingProject(false);
    showToast("Project created.", "success");
    await loadProjectsAndItems();
  };

  const handleAddProjectItem = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast("Select a project first.", "error");
      return;
    }

    const desc = newItemDescription.trim();
    const model = newItemModelNumber.trim();
    const type = newItemType.trim();
    const required = parseInt(newItemRequiredQty, 10) || 0;

    if (!desc || !model || !type || required <= 0) {
      showToast(
        "Description, type, model, and required quantity are needed.",
        "error"
      );
      return;
    }

    setSavingProjectItem(true);

    const { error } = await supabase.from("project_items").insert({
      project_id: Number(selectedProjectId),
      item_id: null,
      description: desc,
      model_number: model,
      type,
      required_qty: required,
      allocated_office: 0,
      allocated_van: 0,
    });

    if (error) {
      showToast("Error adding project item: " + error.message, "error");
      setSavingProjectItem(false);
      return;
    }

    setNewItemDescription("");
    setNewItemModelNumber("");
    setNewItemType("");
    setNewItemRequiredQty("");
    setSavingProjectItem(false);
    showToast("Project item added.", "success");
    await loadProjectsAndItems();
  };

  const handleAllocateToProject = async (from: "office" | "van") => {
    if (!selectedProjectItemId) {
      showToast("Select a project item first.", "error");
      return;
    }

    const qty = parseInt(allocationQty, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      showToast("Enter a valid allocation quantity.", "error");
      return;
    }

    const pItem = projectItems.find((pi) => pi.id === selectedProjectItemId);
    if (!pItem) {
      showToast("Project item not found.", "error");
      return;
    }

    const matchingInventory = inventory.find(
      (i) =>
        i.model_number.toLowerCase() === pItem.model_number.toLowerCase()
    );

    if (!matchingInventory) {
      showToast(
        "No inventory item with that model number found to allocate.",
        "error"
      );
      return;
    }

    let newOffice = matchingInventory.office_qty;
    let newVan = matchingInventory.van_qty;

    if (from === "office") {
      if (newOffice < qty) {
        showToast("Not enough office stock to allocate.", "error");
        return;
      }
      newOffice -= qty;
    } else {
      if (newVan < qty) {
        showToast("Not enough van stock to allocate.", "error");
        return;
      }
      newVan -= qty;
    }

    const updates: Partial<ProjectItem> = {};
    if (from === "office") {
      updates.allocated_office = pItem.allocated_office + qty;
    } else {
      updates.allocated_van = pItem.allocated_van + qty;
    }

    const { error: invErr } = await supabase
      .from("inventory_items")
      .update({ office_qty: newOffice, van_qty: newVan })
      .eq("id", matchingInventory.id);

    if (invErr) {
      showToast("Error updating inventory: " + invErr.message, "error");
      return;
    }

    const { error: pErr } = await supabase
      .from("project_items")
      .update(updates)
      .eq("id", pItem.id);

    if (pErr) {
      showToast("Error updating project item: " + pErr.message, "error");
      return;
    }

    await supabase.from("inventory_changes").insert({
      user_id: session?.user.id ?? null,
      user_email: profile?.email ?? session?.user.email ?? null,
      role: profile?.role ?? null,
      item_id: matchingInventory.id,
      description: matchingInventory.description,
      model_number: matchingInventory.model_number,
      from_location: from,
      to_location: `project:${pItem.project_id}`,
      quantity: qty,
    });

    setAllocationQty("");
    showToast("Allocated to project.", "success");
    await Promise.all([loadInventory(), loadProjectsAndItems()]);
  };

  // ======================
  // Timesheet Handlers
  // ======================
  const handleClockIn = async () => {
    if (!session?.user) {
      showToast("You must be logged in to clock in.", "error");
      return;
    }
    if (currentClockIn) {
      showToast("You are already clocked in.", "error");
      return;
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("timesheet_entries")
      .insert({
        user_id: session.user.id,
        work_date: todayAsDateString(),
        project: null,
        work_type: null,
        hours_decimal: null,
        clock_in: nowIso,
        clock_out: null,
      })
      .select("id, clock_in, project, work_type")
      .single();

    if (error) {
      showToast("Error clocking in: " + error.message, "error");
      return;
    }

    setCurrentClockIn({
      id: data.id,
      start_time: data.clock_in,
      project: data.project,
      work_type: data.work_type,
    });
    setTsProject("");
    setTsWorkType("Install");
    showToast(
      "Clocked in at " + formatRoundedTime(nowIso) + ".",
      "success"
    );
    await loadTimesheetForWeek(weekEnding);
  };

  const handleClockOut = async () => {
    if (!session?.user || !currentClockIn) {
      showToast("You are not currently clocked in.", "error");
      return;
    }

    const now = new Date();
    const start = new Date(currentClockIn.start_time);
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.round((diffMs / 1000 / 60 / 60) * 100) / 100;

    const nowIso = now.toISOString();

    const { error } = await supabase
      .from("timesheet_entries")
      .update({
        work_date: todayAsDateString(),
        project: tsProject.trim() || null,
        work_type: tsWorkType.trim() || null,
        hours_decimal: hours,
        clock_out: nowIso,
      })
      .eq("id", currentClockIn.id);

    if (error) {
      showToast("Error clocking out: " + error.message, "error");
      return;
    }

    showToast(
      `Clocked out at ${formatRoundedTime(
        nowIso
      )}. Total: ${hours.toFixed(2)} hours.`,
      "success"
    );

    setCurrentClockIn(null);
    setTsProject("");
    setTsWorkType("Install");
    await loadTimesheetForWeek(weekEnding);
    await loadCurrentClockIn();
  };

  const handleDownloadTimesheet = () => {
    if (!timesheetEntries.length) {
      showToast("No entries to export for this week.", "info");
      return;
    }

    const rows = timesheetEntries.map((entry, index) => ({
      "#": index + 1,
      Date: entry.work_date,
      Project: entry.project ?? "",
      Type: entry.work_type ?? "",
      "Clock in": formatRoundedTime(entry.clock_in),
      "Clock out": formatRoundedTime(entry.clock_out),
      Hours: entry.hours ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timesheet");

    XLSX.writeFile(wb, `gcss-timesheet-${weekEnding}.xlsx`);
  };

  // ======================
  // Render Helpers
  // ======================
  const renderToasts = () => (
    <div
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {toasts.map((t) => {
        let bg = "rgba(15,23,42,0.95)";
        if (t.type === "success") bg = "rgba(22,163,74,0.95)";
        if (t.type === "error") bg = "rgba(220,38,38,0.95)";
        return (
          <div
            key={t.id}
            style={{
              minWidth: 220,
              maxWidth: 320,
              padding: "0.6rem 0.8rem",
              borderRadius: 6,
              background: bg,
              color: "#f9fafb",
              boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
              fontSize: "0.85rem",
            }}
          >
            {t.message}
          </div>
        );
      })}
    </div>
  );

  // ======================
  // Render
  // ======================
  if (!session) {
    return (
      <div className="app-root" style={{ minHeight: "100vh" }}>
        <AuthScreen
          email={authEmail}
          password={authPassword}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onSubmit={handleLogin}
          loading={authLoading}
          error={authError}
        />
        {renderToasts()}
      </div>
    );
  }

  return (
    <div className="app-root" style={{ minHeight: "100vh" }}>
      <div
        className={`app-shell ${
          isMobile ? "app-shell--mobile" : "app-shell--desktop"
        }`}
      >
        {isMobile && (
          <header className="mobile-header">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              ☰
            </button>

            <div className="header-title">GCSS</div>

            <button
              className="theme-btn"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </header>
        )}

        {isMobile ? (
          sidebarOpen && (
            <Sidebar
              theme={theme}
              onThemeChange={setTheme}
              activePage={activePage}
              onChangePage={(page) => {
                setActivePage(page);
                setSidebarOpen(false);
              }}
              profile={profile}
              isMobile={true}
              appVersion={APP_VERSION}
            />
          )
        ) : (
          <Sidebar
            theme={theme}
            onThemeChange={setTheme}
            activePage={activePage}
            onChangePage={setActivePage}
            profile={profile}
            isMobile={false}
            appVersion={APP_VERSION}
          />
        )}

        <main
          style={{
            flex: 1,
            padding: isMobile ? "0.75rem" : "1.25rem",
            overflowX: "hidden",
          }}
        >
          {profileError && (
            <div
              style={{
                marginBottom: "0.75rem",
                color: "#dc2626",
                fontSize: "0.85rem",
              }}
            >
              {profileError}
            </div>
          )}

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
              creatingItem={creatingInvItem}
              handleCreateItem={(e) => {
                e.preventDefault();
                void handleCreateInventoryItem();
              }}
              handleAdjust={handleAdjust}
              handleLogout={handleLogout}
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
              reloadAll={() =>
                Promise.all([loadProjectsAndItems(), loadInventory()])
              }
            />
          )}

          {activePage === "timesheet" && (
            <TimesheetPage
              profile={profile}
              weekEnding={weekEnding}
              setWeekEnding={setWeekEnding}
              entries={timesheetEntries}
              loadingEntries={loadingEntries}
              error={timesheetError}
              currentClockIn={currentClockIn}
              tsProject={tsProject}
              setTsProject={setTsProject}
              tsWorkType={tsWorkType}
              setTsWorkType={setTsWorkType}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onDownloadTimesheet={handleDownloadTimesheet}
              handleLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {renderToasts()}
    </div>
  );
};

export default App;
