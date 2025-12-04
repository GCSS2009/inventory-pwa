// src/components/Sidebar.tsx
import React from "react";

type PageKey = "inventory" | "projects" | "timesheet" | "pricing" | "service" | "calendar";
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
}

const Sidebar: React.FC<SidebarProps> = ({
  theme,
  onThemeChange,
  activePage,
  onChangePage,
  profile,
  isMobile,
  appVersion,
}) => {
  const navItems: { key: PageKey; label: string }[] = [
    { key: "inventory", label: "Inventory" },
    { key: "projects", label: "Projects" },
    { key: "timesheet", label: "Timesheets" },
    { key: "service", label: "Service Tickets" },
    { key: "calendar", label: "Calendar" }, // ✅ new
    { key: "pricing", label: "Pricing" },
  ];

  const handleToggleTheme = () => {
    onThemeChange(theme === "light" ? "dark" : "light");
  };

  const containerStyle: React.CSSProperties = isMobile
    ? {
        width: "100%",
        borderBottom: "1px solid var(--gcss-border, #e5e7eb)",
        background: "var(--gcss-surface-strong, #020617)",
        color: "var(--gcss-on-surface, #e5e7eb)",
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
        borderRight: "1px solid var(--gcss-border, #e5e7eb)",
        background: "var(--gcss-surface-strong, #020617)",
        color: "var(--gcss-on-surface, #e5e7eb)",
        padding: "1rem 0.9rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      };

  return (
    <aside style={containerStyle}>
      {/* Brand + user info */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          alignItems: isMobile ? "center" : "flex-start",
          justifyContent: "space-between",
          gap: isMobile ? "0.75rem" : "0.25rem",
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
            GCSS Inventory
          </div>
          {profile && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--gcss-muted, #9ca3af)",
                marginTop: isMobile ? 0 : "0.15rem",
              }}
            >
              {profile.email ?? "Unknown user"}{" "}
              <span style={{ opacity: 0.8 }}>({profile.role})</span>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={handleToggleTheme}
          style={{
            borderRadius: 999,
            border: "1px solid var(--gcss-border, #4b5563)",
            padding: "0.15rem 0.6rem",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background:
              theme === "dark"
                ? "rgba(15,23,42,0.8)"
                : "rgba(249,250,251,0.06)",
            color: "inherit",
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
                border: "1px solid var(--gcss-border, #4b5563)",
                background: isActive
                  ? "rgba(220,38,38,0.9)" // 🔴 red active background
                  : "transparent",
                color: isActive
                  ? "#f9fafb"
                  : "var(--gcss-on-surface, #e5e7eb)",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                boxShadow: isActive
                  ? "0 0 0 1px rgba(248,113,113,0.5)" // 🔴 soft red halo
                  : "none",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer: version (desktop only pinned at bottom, mobile inline) */}
      {!isMobile && (
        <div
          style={{
            marginTop: "auto",
            fontSize: "0.7rem",
            color: "var(--gcss-muted, #9ca3af)",
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
            marginLeft: "auto",
            fontSize: "0.7rem",
            color: "var(--gcss-muted, #9ca3af)",
          }}
        >
          v{appVersion}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
