// src/components/Sidebar.tsx
import React from "react";
import type { Session } from "@supabase/supabase-js";

type PageKey = "inventory" | "projects" | "timesheet";
type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface SidebarProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  activePage: "inventory" | "projects" | "timesheet";
  onChangePage: (page: "inventory" | "projects" | "timesheet") => void;
  profile: Profile | null;
  isMobile: boolean;
  appVersion: string;
}


const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  theme,
  setTheme,
  profile,
  session,
  isMobile,
}) => {
  const email = profile?.email ?? session?.user.email ?? "";
  const role = profile?.role ?? "viewer";

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const navButtonStyle = (page: PageKey): React.CSSProperties => ({
    width: "100%",
    textAlign: "left",
    padding: "0.45rem 0.75rem",
    borderRadius: 4,
    border: "none",
    marginBottom: "0.25rem",
    fontSize: "0.85rem",
    cursor: "pointer",
    background:
      activePage === page
        ? "rgba(37, 99, 235, 0.35)"
        : "transparent",
    color:
      activePage === page
        ? "#e5e7eb"
        : "var(--gcss-sidebar-text, #e5e7eb)",
  });

  return (
    <aside
      style={{
        width: isMobile ? "100%" : 220,
        background: "var(--gcss-sidebar-bg, #020617)",
        color: "var(--gcss-sidebar-text, #e5e7eb)",
        padding: isMobile ? "0.75rem 0.75rem 0.75rem" : "0.75rem",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile
          ? "none"
          : "1px solid var(--gcss-border, #1f2937)",
      }}
    >
      {/* Header / Identity */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          GCSS Technician
        </div>
        {email && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--gcss-sidebar-muted, #9ca3af)",
            }}
          >
            {email}
          </div>
        )}
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--gcss-sidebar-muted, #9ca3af)",
          }}
        >
          Role: {role}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ marginBottom: "auto" }}>
        <button
          type="button"
          style={navButtonStyle("inventory")}
          onClick={() => setActivePage("inventory")}
        >
          Inventory
        </button>
        <button
          type="button"
          style={navButtonStyle("projects")}
          onClick={() => setActivePage("projects")}
        >
          Projects
        </button>
        <button
          type="button"
          style={navButtonStyle("timesheet")}
          onClick={() => setActivePage("timesheet")}
        >
          Timesheet
        </button>
      </nav>

      {/* Footer: theme toggle + version label */}
      <div style={{ marginTop: "1rem", fontSize: "0.75rem" }}>
        <button
          type="button"
          onClick={handleToggleTheme}
          style={{
            width: "100%",
            padding: "0.4rem 0.6rem",
            borderRadius: 4,
            border: "1px solid var(--gcss-border, #4b5563)",
            background: "var(--gcss-sidebar-accent, #111827)",
            color: "var(--gcss-sidebar-text, #e5e7eb)",
            fontSize: "0.75rem",
            cursor: "pointer",
            marginBottom: "0.4rem",
          }}
        >
          Theme: {theme === "light" ? "Light" : "Dark"}
        </button>
        <div
  style={{
    marginTop: "auto",
    fontSize: "0.7rem",
    color: "var(--gcss-muted, #9ca3af)",
    paddingTop: "0.75rem",
  }}
>
  <div>GCSS Inventory</div>
  <div>v{appVersion}</div>
</div>


        <div
          style={{
            color: "var(--gcss-sidebar-muted, #9ca3af)",
            fontSize: "0.7rem",
          }}
        >
          GCSS Inventory v0.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
