import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const Sidebar = ({ activePage, setActivePage, theme, setTheme, profile, session, isMobile, }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navItems = [
        { key: "inventory", label: "Inventory" },
        { key: "projects", label: "Projects" },
        { key: "timesheet", label: "Timesheet" },
    ];
    const handleNavClick = (key) => {
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
        return (_jsxs("header", { style: {
                width: "100%",
                boxSizing: "border-box",
                background: "var(--gcss-surface, #020617)",
                borderBottom: "1px solid var(--gcss-border, #1f2937)",
                padding: "0.5rem 0.75rem",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }, children: [_jsxs("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                    }, children: [_jsx("button", { type: "button", onClick: () => setMobileOpen((v) => !v), style: {
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
                            }, children: "\u2630" }), _jsxs("div", { style: { flex: 1, overflow: "hidden" }, children: [_jsx("div", { style: {
                                        fontWeight: 700,
                                        fontSize: "0.95rem",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }, children: "GCSS Technician" }), _jsxs("div", { style: {
                                        fontSize: "0.7rem",
                                        color: "var(--gcss-muted, #9ca3af)",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }, children: [session?.user.email ?? profile?.email ?? "Logged in", profile?.role ? ` (${profile.role})` : ""] })] }), _jsx("button", { type: "button", onClick: toggleTheme, style: {
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
                            }, title: "Toggle light / dark theme", children: theme === "light" ? "🌙" : "☀️" })] }), mobileOpen && (_jsxs("nav", { style: {
                        marginTop: "0.5rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px solid var(--gcss-border, #1f2937)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                    }, children: [navItems.map((item) => {
                            const isActive = activePage === item.key;
                            return (_jsx("button", { type: "button", onClick: () => handleNavClick(item.key), style: {
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
                                }, children: item.label }, item.key));
                        }), _jsx("div", { style: {
                                marginTop: "0.35rem",
                                fontSize: "0.7rem",
                                color: "var(--gcss-muted, #9ca3af)",
                            }, children: "GCSS Inventory \u2022 v0.9.0" })] }))] }));
    }
    // ---------- Desktop sidebar ----------
    return (_jsxs("aside", { style: {
            width: 230,
            background: "var(--gcss-surface, #020617)",
            borderRight: "1px solid var(--gcss-border, #1f2937)",
            padding: "1rem 0.75rem 0.75rem",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
        }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            marginBottom: "0.15rem",
                        }, children: "GCSS Technician" }), _jsx("div", { style: {
                            fontSize: "0.8rem",
                            color: "var(--gcss-muted, #9ca3af)",
                            marginBottom: "0.25rem",
                        }, children: session?.user.email ?? profile?.email ?? "Logged in" }), profile?.role && (_jsxs("div", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: ["Role: ", _jsx("span", { style: { fontWeight: 600 }, children: profile.role })] }))] }), _jsx("nav", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: navItems.map((item) => {
                    const isActive = activePage === item.key;
                    return (_jsx("button", { type: "button", onClick: () => handleNavClick(item.key), style: {
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
                        }, children: item.label }, item.key));
                }) }), _jsxs("div", { style: { marginTop: "auto" }, children: [_jsxs("button", { type: "button", onClick: toggleTheme, style: {
                            width: "100%",
                            padding: "0.4rem 0.6rem",
                            borderRadius: 6,
                            border: "1px solid var(--gcss-border, #4b5563)",
                            background: "transparent",
                            color: "var(--gcss-text, #e5e7eb)",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            marginBottom: "0.5rem",
                        }, children: ["Theme: ", theme === "light" ? "Light" : "Dark"] }), _jsx("div", { style: {
                            fontSize: "0.75rem",
                            color: "var(--gcss-muted, #9ca3af)",
                        }, children: "GCSS Inventory \u2022 v0.9.0" })] })] }));
};
export default Sidebar;
