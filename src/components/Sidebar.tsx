// src/components/Sidebar.tsx
import React from "react";

type PageKey =
  | "inventory"
  | "projects"
  | "timesheet"
  | "pricing"
  | "service"
  | "calendar";
type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface SidebarProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  activePage: PageKey;
  onChangePage: (page: PageKey) => void;
  profile: Profile | null;
  isMobile: boolean;
  appVersion: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  theme,
  onThemeChange,
  activePage,
  onChangePage,
  profile,
  isMobile,
  appVersion,
  onLogout,
}) => {
  const navItems: { key: PageKey; label: string }[] = [
    { key: "inventory", label: "Inventory" },
    { key: "projects", label: "Projects" },
    { key: "timesheet", label: "Timesheets" },
    { key: "service", label: "Service Tickets" },
    { key: "calendar", label: "Calendar" },
    { key: "pricing", label: "Pricing" },
  ];

  const handleToggleTheme = () => {
    onThemeChange(theme === "light" ? "dark" : "light");
  };

  const containerStyle: React.CSSProperties = isMobile
    ? {
        width: "100%",
        borderBottom: "1px solid var(--gcss-border)",
        background: "var(--gcss-sidebar-bg)",
        color: "var(--gcss-sidebar-text)",
        padding: "0.5rem 0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }
    : {
        width: 240,
        borderRight: "1px solid var(--gcss-border)",
        background: "var(--gcss-sidebar-bg)",
        color: "var(--gcss-sidebar-text)",
        padding: "1rem 0.9rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxSizing: "border-box",
      };

  return (
    <aside style={containerStyle}>
      {/* Brand + user info + theme + logout */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          alignItems: isMobile ? "center" : "flex-start",
          justifyContent: "space-between",
          gap: isMobile ? "0.75rem" : "0.5rem",
          width: "100%",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: isMobile ? "1rem" : "1.1rem",
            }}
          >
            GCSS Operations
          </div>

          {profile && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--gcss-muted)",
                marginTop: isMobile ? 0 : "0.15rem",
              }}
            >
              {profile.email ?? "Unknown user"}{" "}
              <span style={{ opacity: 0.8 }}>({profile.role})</span>
            </div>
          )}
        </div>

        {/* Theme toggle + Logout */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.4rem",
            marginLeft: isMobile ? "auto" : 0,
          }}
        >
          <button
            type="button"
            onClick={handleToggleTheme}
            style={{
              borderRadius: 999,
              border: "1px solid var(--gcss-border)",
              padding: "0.15rem 0.6rem",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              background:
                theme === "dark"
                  ? "rgba(15,23,42,0.8)"
                  : "rgba(249,250,251,0.06)",
              color: "var(--gcss-sidebar-text)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span
              aria-hidden="true"
              style={{ fontSize: "0.85rem", lineHeight: 1 }}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
            <span>{theme === "dark" ? "Dark" : "Light"}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: "0.25rem 0.7rem",
              borderRadius: 999,
              border: "1px solid #dc2626",
              background: "#dc2626",
              color: "#f9fafb",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: isMobile ? "0.35rem" : "0.4rem",
          marginTop: isMobile ? "0.35rem" : "0.5rem",
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
      >
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChangePage(item.key)}
              style={{
                flex: isMobile ? "0 0 auto" : "none",
                width: isMobile ? "auto" : "100%",
                textAlign: isMobile ? "center" : "left",
                padding: "0.4rem 0.7rem",
                borderRadius: 999,
                border: "1px solid var(--gcss-border)",
                background: isActive ? "rgba(220,38,38,0.9)" : "transparent",
                color: isActive ? "#f9fafb" : "var(--gcss-sidebar-text)",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                boxShadow: isActive
                  ? "0 0 0 1px rgba(248,113,113,0.5)"
                  : "none",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer: version only */}
      {!isMobile && (
        <div
          style={{
            marginTop: "auto",
            fontSize: "0.7rem",
            color: "var(--gcss-muted)",
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <div>Version v{appVersion}</div>
        </div>
      )}

      {isMobile && (
        <div
          style={{
            marginTop: "0.35rem",
            fontSize: "0.7rem",
            color: "var(--gcss-muted)",
          }}
        >
          v{appVersion}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
