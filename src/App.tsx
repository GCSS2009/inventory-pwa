import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./supabaseClient";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import InventoryPage from "./components/InventoryPage";
import ProjectsPage from "./components/ProjectsPage";
import TimesheetPage from "./components/TimesheetPage";
import EditTimesheetModal from "./components/EditTimesheetModal";
import PricingPage from "./components/PricingPage";
import ServiceTicketPage from "./components/ServiceTicketPage";
import CalendarPage from "./components/CalendarPage"; // ✅ NEW

import { usePushSubscription } from "./hooks/usePushSubscription";
import { useInventory } from "./hooks/useInventory";
import { useTimesheet } from "./hooks/useTimesheet";
import { useProjects } from "./hooks/useProjects";
import { useServiceTickets } from "./hooks/useServiceTickets";

import { APP_VERSION } from "./version";

import type {
  PageKey,
  UserRole,
  InventoryCategory,
  Profile,
  TimesheetEntry,
  CurrentClockIn,
  Toast,
  Platform,
} from "./types";

export type { TimesheetEntry, CurrentClockIn };

// ======================
// Platform helper
// ======================
function detectPlatform(): Platform {
  if (typeof window === "undefined") return "android_web";

  const ua = window.navigator.userAgent.toLowerCase();
  const isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  const isIOS = /iphone|ipad|ipod/.test(ua);

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

  // ---------- Layout ----------
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------- Navigation ----------
  const [activePage, setActivePage] = useState<PageKey>("inventory");

  // ---------- Add-new-inventory-item state ----------
  const [newInvCategory, setNewInvCategory] =
    useState<InventoryCategory>("Fire Control");
  const [newInvDescription, setNewInvDescription] = useState("");
  const [newInvType, setNewInvType] = useState("");
  const [newInvModelNumber, setNewInvModelNumber] = useState("");
  const [newInvManufacturer, setNewInvManufacturer] = useState("");
  const [newInvOfficeQty, setNewInvOfficeQty] = useState("0");
  const [newInvVanQty, setNewInvVanQty] = useState("0");
  const [creatingInvItem, setCreatingInvItem] = useState(false);

  // ---------- Employees ----------
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("self");

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

  // ---------- Inventory hook ----------
  const {
    inventory,
    loadingInventory,
    inventoryError,
    changes,
    loadingChanges,
    changesError,
    selectedItemId,
    quantity,
    setSelectedItemId,
    setQuantity,
    handleAdjust,
    loadChanges,
  } = useInventory({
    profile,
    showToast,
    sessionUserId: session?.user?.id ?? null,
  });

  // ---------- Timesheet hook ----------
  const {
    weekEnding,
    setWeekEnding,
    entries: timesheetEntries,
    loadingEntries,
    timesheetError,
    currentClockIn,
    tsProject,
    setTsProject,
    tsWorkType,
    setTsWorkType,
    editingEntry,
    onClockIn,
    onClockOut,
    onDownloadTimesheet,
    onEditEntry,
    cancelEditEntry,
    onSaveEditedEntry,
  } = useTimesheet({
    session,
    profile,
    employees,
    selectedEmployeeId,
    showToast,
  });

  // ---------- Projects hook ----------
  const {
    projects,
    projectItems,
    loadingProjects,
    projectsError,
    selectedProjectId,
    setSelectedProjectId,
    newProjectName,
    setNewProjectName,
    newProjectNotes,
    setNewProjectNotes,
    creatingProject,
    handleCreateProject,
    newItemDescription,
    setNewItemDescription,
    newItemModelNumber,
    setNewItemModelNumber,
    newItemType,
    setNewItemType,
    newItemRequiredQty,
    setNewItemRequiredQty,
    savingProjectItem,
    handleAddProjectItem,
    handleAllocateToProject,
    loadProjectsAndItems,
  } = useProjects({
    session,
    profile,
    inventory,
    showToast,
  });

  // ---------- Service Tickets hook ----------
  const {
    saving: savingServiceTicket,
    saveTicket,
  } = useServiceTickets({
    session,
    profile,
    showToast,
  });

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
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
  // Effects: Profile & Employees
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
        .select("id, email, role, full_name")
        .eq("id", session.user.id)
        .single();

      if (error) {
        setProfileError(error.message);
      } else if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role as UserRole,
          full_name: data.full_name ?? null,
        });
      }
    };

    loadProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user || profile?.role !== "admin") {
      setEmployees([]);
      setSelectedEmployeeId("self");
      return;
    }

    const loadEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, role, full_name")
          .order("email", { ascending: true });

        if (error) {
          console.error("Error loading employees:", error.message);
          return;
        }

        setEmployees(
          (data ?? []).map((row: any) => ({
            id: row.id,
            email: row.email,
            role: row.role as UserRole,
            full_name: row.full_name ?? null,
          }))
        );
      } catch (err) {
        console.error("Unexpected error loading employees", err);
      }
    };

    loadEmployees();
  }, [session?.user?.id, profile?.role]);

  // ======================
  // Auth Handlers
  // ======================
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message);
        showToast("Login failed: " + error.message, "error");
        alert("Login failed: " + error.message);
      } else if (data.session) {
        setSession(data.session);
        showToast("Logged in successfully.", "success");
      } else {
        const msg = "Login failed: no session returned from Supabase.";
        setAuthError(msg);
        showToast(msg, "error");
        alert(msg);
      }
    } catch (err) {
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
        user_id: session?.user?.id ?? null,
        user_email: profile?.email ?? session?.user?.email ?? null,
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
        user_id: session?.user?.id ?? null,
        user_email: profile?.email ?? session?.user?.email ?? null,
        role: profile?.role ?? null,
        item_id: data.id,
        description,
        model_number: model,
        from_location: "new",
        to_location: "van",
        quantity: vanQty,
      });
    }

    await loadChanges();

    setNewInvDescription("");
    setNewInvType("");
    setNewInvModelNumber("");
    setNewInvManufacturer("");
    setNewInvOfficeQty("0");
    setNewInvVanQty("0");
    setCreatingInvItem(false);
    showToast("Inventory item created.", "success");
  };

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

  const isAdmin = profile?.role === "admin";

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
            padding: isMobile ? "0.25rem 0.75rem 0.75rem" : "0.5rem 1.25rem 1.25rem",
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
              handleAllocateToProject={handleAllocateToProject}
              handleLogout={handleLogout}
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
              onClockIn={onClockIn}
              onClockOut={onClockOut}
              onDownloadTimesheet={onDownloadTimesheet}
              handleLogout={handleLogout}
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              setSelectedEmployeeId={setSelectedEmployeeId}
              onEditEntry={isAdmin ? onEditEntry : () => {}}
            />
          )}

          {activePage === "service" && (
            <ServiceTicketPage
              profile={profile}
              saving={savingServiceTicket}
              onSaveTicket={async (payload) => {
                await saveTicket(payload);
              }}
              handleLogout={handleLogout}
            />
          )}

          {/* ✅ NEW: Calendar page hook-in (no behavior changed elsewhere) */}
          {activePage === "calendar" && (
            <CalendarPage profile={profile} employees={employees} />
          )}

          {activePage === "pricing" && <PricingPage session={session} />}
        </main>
      </div>

      {renderToasts()}

      {editingEntry && (
        <EditTimesheetModal
          entry={editingEntry}
          onCancel={cancelEditEntry}
          onSave={onSaveEditedEntry}
        />
      )}
    </div>
  );
};

export default App;
