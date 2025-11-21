import React, { useState } from "react";
import type { Session } from "@supabase/supabase-js";

type PageKey = "inventory" | "projects" | "timesheet";
type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface SidebarProps {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  profile: Profile | null;
  session: Session | null;
  isMobile: boolean;
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { key: PageKey; label: string }[] = [
    { key: "inventory", label: "Inventory" },
    { key: "projects", label: "Projects" },
    { key: "timesheet", label: "Timesheet" },
  ];

  const handleNavClick = (key: PageKey) => {
    setActivePage(key);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // ---------- Mobile layout ----------
  if (isMobile) {
    return (
      <header
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "var(--gcss-surface, #020617)",
          borderBottom: "1px solid var(--gcss-border, #1f2937)",
          padding: "0.5rem 0.75rem",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              border: "1px solid var(--gcss-border, #4b5563)",
              background: "transparent",
              color: "var(--gcss-text, #e5e7eb)",
              borderRadius: 4,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              GCSS Technician
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--gcss-muted, #9ca3af)",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {session?.user.email ?? profile?.email ?? "Logged in"}
              {profile?.role ? ` (${profile.role})` : ""}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            style={{
              border: "1px solid var(--gcss-border, #4b5563)",
              background: "transparent",
              color: "var(--gcss-text, #e5e7eb)",
              borderRadius: 4,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
            title="Toggle light / dark theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {mobileOpen && (
          <nav
            style={{
              marginTop: "0.5rem",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--gcss-border, #1f2937)",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavClick(item.key)}
                  style={{
                    textAlign: "left",
                    padding: "0.45rem 0.5rem",
                    borderRadius: 4,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 600 : 400,
                    background: isActive
                      ? "rgba(59, 130, 246, 0.18)"
                      : "transparent",
                    color: "var(--gcss-text, #e5e7eb)",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "0.7rem",
                color: "var(--gcss-muted, #9ca3af)",
              }}
            >
              GCSS Inventory • v0.9.0
            </div>
          </nav>
        )}
      </header>
    );
  }

  // ---------- Desktop sidebar ----------
  return (
    <aside
      style={{
        width: 230,
        background: "var(--gcss-surface, #020617)",
        borderRight: "1px solid var(--gcss-border, #1f2937)",
        padding: "1rem 0.75rem 0.75rem",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            marginBottom: "0.15rem",
          }}
        >
          GCSS Technician
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--gcss-muted, #9ca3af)",
            marginBottom: "0.25rem",
          }}
        >
          {session?.user.email ?? profile?.email ?? "Logged in"}
        </div>
        {profile?.role && (
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Role: <span style={{ fontWeight: 600 }}>{profile.role}</span>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavClick(item.key)}
              style={{
                textAlign: "left",
                padding: "0.45rem 0.6rem",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: "0.88rem",
                fontWeight: isActive ? 600 : 400,
                background: isActive
                  ? "rgba(59, 130, 246, 0.18)"
                  : "transparent",
                color: "var(--gcss-text, #e5e7eb)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            width: "100%",
            padding: "0.4rem 0.6rem",
            borderRadius: 6,
            border: "1px solid var(--gcss-border, #4b5563)",
            background: "transparent",
            color: "var(--gcss-text, #e5e7eb)",
            cursor: "pointer",
            fontSize: "0.85rem",
            marginBottom: "0.5rem",
          }}
        >
          Theme: {theme === "light" ? "Light" : "Dark"}
        </button>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--gcss-muted, #9ca3af)",
          }}
        >
          GCSS Inventory • v0.9.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
