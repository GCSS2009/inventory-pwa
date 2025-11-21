import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
// status chip helper
function getProjectItemStatus(item, inventoryItem) {
    const required = item.required_qty;
    const allocated = item.allocated_office + item.allocated_van;
    const remainingNeeded = Math.max(required - allocated, 0);
    const stockOffice = inventoryItem?.office_qty ?? 0;
    const stockVan = inventoryItem?.van_qty ?? 0;
    const stockTotal = stockOffice + stockVan;
    if (allocated >= required) {
        return {
            label: "Allocated",
            bg: "#dcfce7",
            border: "#16a34a",
            text: "#166534",
        };
    }
    if (remainingNeeded > 0 && stockTotal === 0) {
        return {
            label: "No stock",
            bg: "#fee2e2",
            border: "#b91c1c",
            text: "#991b1b",
        };
    }
    if (remainingNeeded > 0 && stockTotal < remainingNeeded) {
        return {
            label: "Short",
            bg: "#fef3c7",
            border: "#b45309",
            text: "#92400e",
        };
    }
    if (remainingNeeded > 0 && stockTotal >= remainingNeeded) {
        return {
            label: "Can allocate",
            bg: "#eff6ff",
            border: "#2563eb",
            text: "#1d4ed8",
        };
    }
    return {
        label: "In stock",
        bg: "#f9fafb",
        border: "#d1d5db",
        text: "#4b5563",
    };
}
const ProjectsPage = ({ profile, projects, projectItems, inventory, loadingProjects, projectsError, selectedProjectId, setSelectedProjectId, newProjectName, setNewProjectName, newProjectNotes, setNewProjectNotes, creatingProject, handleCreateProject, newItemDescription, setNewItemDescription, newItemModelNumber, setNewItemModelNumber, newItemType, setNewItemType, newItemRequiredQty, setNewItemRequiredQty, savingProjectItem, handleAddProjectItem, selectedProjectItemId, setSelectedProjectItemId, allocationQty, setAllocationQty, handleAllocateToProject, handleLogout, }) => {
    const selectedProject = projects.find((p) => String(p.id) === selectedProjectId) ?? null;
    const itemsForProject = selectedProjectId === ""
        ? []
        : projectItems.filter((pi) => String(pi.project_id) === selectedProjectId);
    const inventoryByModel = React.useMemo(() => {
        const map = {};
        for (const item of inventory) {
            const key = item.model_number?.toLowerCase();
            if (key)
                map[key] = item;
        }
        return map;
    }, [inventory]);
    return (_jsxs("div", { style: {
            maxWidth: 960,
            margin: "0 auto",
            padding: "0.25rem 0.5rem 0",
        }, children: [_jsxs("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "1rem",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0 }, children: "Projects" }), _jsx("div", { style: {
                                    fontSize: "0.85rem",
                                    color: "var(--gcss-muted, #6b7280)",
                                }, children: "Track required parts per project and allocations from office & van." })] }), _jsx("button", { onClick: handleLogout, style: {
                            padding: "0.35rem 0.75rem",
                            borderRadius: 4,
                            border: "1px solid var(--gcss-border, #d1d5db)",
                            background: "var(--gcss-surface, #f9fafb)",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                        }, children: "Logout" })] }), projectsError && (_jsx("div", { style: { color: "#dc2626", marginBottom: "0.75rem" }, children: projectsError })), loadingProjects && projects.length === 0 ? (_jsx("div", { style: { marginBottom: "1rem" }, children: "Loading projects\u2026" })) : null, _jsxs("div", { style: {
                    display: "grid",
                    gridTemplateColumns: profile?.role === "admin"
                        ? "minmax(0, 2fr) minmax(0, 2fr)"
                        : "minmax(0, 1fr)",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                }, children: [_jsxs("div", { style: {
                            border: "1px solid var(--gcss-border, #d1d5db)",
                            borderRadius: 6,
                            padding: "1rem 1.25rem",
                            background: "var(--gcss-surface, #020617)",
                        }, children: [_jsx("h2", { style: { marginTop: 0, fontSize: "1rem" }, children: "Project" }), _jsx("label", { style: {
                                    display: "block",
                                    fontSize: "0.85rem",
                                    marginBottom: "0.25rem",
                                }, children: "Select project" }), _jsxs("select", { value: selectedProjectId, onChange: (e) => {
                                    setSelectedProjectId(e.target.value);
                                    setSelectedProjectItemId("");
                                    setAllocationQty("");
                                }, style: {
                                    width: "100%",
                                    padding: "0.4rem",
                                    borderRadius: 4,
                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                    fontSize: "0.85rem",
                                }, children: [_jsx("option", { value: "", children: "Select a project\u2026" }), projects.map((p) => (_jsx("option", { value: String(p.id), children: p.name }, p.id)))] }), selectedProject && (_jsxs("div", { style: {
                                    marginTop: "0.75rem",
                                    fontSize: "0.85rem",
                                    color: "var(--gcss-text, #e5e7eb)",
                                }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Created:" }), " ", new Date(selectedProject.created_at).toLocaleDateString()] }), selectedProject.notes && (_jsxs("div", { style: { marginTop: "0.25rem" }, children: [_jsx("strong", { children: "Notes:" }), " ", selectedProject.notes] }))] }))] }), profile?.role === "admin" && (_jsxs("div", { style: {
                            border: "1px solid var(--gcss-border, #d1d5db)",
                            borderRadius: 6,
                            padding: "1rem 1.25rem",
                            background: "var(--gcss-surface, #020617)",
                        }, children: [_jsx("h2", { style: { marginTop: 0, fontSize: "1rem" }, children: "New Project (Admin)" }), _jsxs("form", { onSubmit: handleCreateProject, children: [_jsxs("div", { style: { marginBottom: "0.5rem" }, children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Name" }), _jsx("input", { type: "text", value: newProjectName, onChange: (e) => setNewProjectName(e.target.value), placeholder: "e.g. TJ Maxx \u2013 Pineville", style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                    background: "var(--gcss-surface, #020617)",
                                                    color: "var(--gcss-text, #f9fafb)",
                                                } })] }), _jsxs("div", { style: { marginBottom: "0.75rem" }, children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Notes" }), _jsx("textarea", { value: newProjectNotes, onChange: (e) => setNewProjectNotes(e.target.value), rows: 3, style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                    resize: "vertical",
                                                    background: "var(--gcss-surface, #020617)",
                                                    color: "var(--gcss-text, #f9fafb)",
                                                } })] }), _jsx("button", { type: "submit", disabled: creatingProject, style: {
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: 4,
                                            border: "none",
                                            background: "#0062ff",
                                            color: "white",
                                            cursor: creatingProject ? "default" : "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                        }, children: creatingProject ? "Creating…" : "Create Project" })] })] }))] }), profile?.role === "admin" && selectedProject && (_jsxs("div", { style: {
                    border: "1px solid var(--gcss-border, #d1d5db)",
                    borderRadius: 6,
                    padding: "1rem 1.25rem",
                    marginBottom: "1.5rem",
                    background: "var(--gcss-surface, #020617)",
                }, children: [_jsx("h2", { style: { marginTop: 0, fontSize: "1rem" }, children: "Add Item to Project" }), _jsxs("form", { onSubmit: handleAddProjectItem, children: [_jsxs("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1.2fr 1.2fr 0.7fr",
                                    gap: "0.6rem",
                                    marginBottom: "0.75rem",
                                }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Description" }), _jsx("input", { type: "text", value: newItemDescription, onChange: (e) => setNewItemDescription(e.target.value), placeholder: "e.g. Addressable Smoke", style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Model" }), _jsx("input", { type: "text", value: newItemModelNumber, onChange: (e) => setNewItemModelNumber(e.target.value), placeholder: "e.g. FSP-951", style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Type" }), _jsx("input", { type: "text", value: newItemType, onChange: (e) => setNewItemType(e.target.value), placeholder: "e.g. Initiating", style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Required" }), _jsx("input", { type: "number", min: 1, value: newItemRequiredQty, onChange: (e) => setNewItemRequiredQty(e.target.value), style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                } })] })] }), _jsx("button", { type: "submit", disabled: savingProjectItem, style: {
                                    padding: "0.45rem 0.9rem",
                                    borderRadius: 4,
                                    border: "none",
                                    background: "#0062ff",
                                    color: "white",
                                    cursor: savingProjectItem ? "default" : "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                }, children: savingProjectItem ? "Saving…" : "Add Item" })] })] })), _jsx("h2", { style: { fontSize: "1rem" }, children: "Project Items" }), !selectedProject ? (_jsx("div", { style: { fontSize: "0.9rem", color: "var(--gcss-muted, #6b7280)" }, children: "Select a project to view and allocate parts." })) : itemsForProject.length === 0 ? (_jsx("div", { style: { fontSize: "0.9rem", color: "var(--gcss-muted, #6b7280)" }, children: "No items added for this project yet." })) : (_jsxs(_Fragment, { children: [profile?.role && (_jsxs("div", { style: {
                            border: "1px solid var(--gcss-border, #d1d5db)",
                            borderRadius: 6,
                            padding: "0.75rem 1rem",
                            marginBottom: "1rem",
                            background: "var(--gcss-surface, #020617)",
                            maxWidth: 800,
                        }, children: [_jsx("h3", { style: {
                                    marginTop: 0,
                                    marginBottom: "0.5rem",
                                    fontSize: "0.95rem",
                                }, children: "Allocate Stock to Project" }), _jsxs("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1fr 0.9fr",
                                    gap: "0.6rem",
                                    alignItems: "end",
                                }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Project item" }), _jsxs("select", { value: selectedProjectItemId === ""
                                                    ? ""
                                                    : selectedProjectItemId, onChange: (e) => setSelectedProjectItemId(e.target.value ? Number(e.target.value) : ""), style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                }, children: [_jsx("option", { value: "", children: "Select an item\u2026" }), itemsForProject.map((pi) => (_jsxs("option", { value: pi.id, children: [pi.description, " (", pi.model_number, ")"] }, pi.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                    display: "block",
                                                    fontSize: "0.8rem",
                                                    marginBottom: "0.25rem",
                                                }, children: "Quantity to allocate" }), _jsx("input", { type: "number", min: 1, value: allocationQty, onChange: (e) => setAllocationQty(e.target.value), style: {
                                                    width: "100%",
                                                    padding: "0.4rem",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                    fontSize: "0.85rem",
                                                } })] }), _jsxs("div", { style: {
                                            display: "flex",
                                            gap: "0.4rem",
                                            justifyContent: "flex-end",
                                            flexWrap: "wrap",
                                        }, children: [_jsx("button", { type: "button", onClick: () => handleAllocateToProject("office"), disabled: !selectedProjectItemId || !allocationQty, style: {
                                                    padding: "0.4rem 0.7rem",
                                                    borderRadius: 4,
                                                    border: "1px solid #ccc",
                                                    background: "#e0f2fe",
                                                    cursor: selectedProjectItemId && allocationQty
                                                        ? "pointer"
                                                        : "not-allowed",
                                                    fontSize: "0.8rem",
                                                }, children: "From Office" }), _jsx("button", { type: "button", onClick: () => handleAllocateToProject("van"), disabled: !selectedProjectItemId || !allocationQty, style: {
                                                    padding: "0.4rem 0.7rem",
                                                    borderRadius: 4,
                                                    border: "1px solid #ccc",
                                                    background: "#fef9c3",
                                                    cursor: selectedProjectItemId && allocationQty
                                                        ? "pointer"
                                                        : "not-allowed",
                                                    fontSize: "0.8rem",
                                                }, children: "From Van" })] })] })] })), _jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { style: {
                                minWidth: 650,
                                borderCollapse: "collapse",
                                fontSize: "0.85rem",
                            }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thLeft, children: "Description" }), _jsx("th", { style: thLeft, children: "Model" }), _jsx("th", { style: thLeft, children: "Type" }), _jsx("th", { style: thRight, children: "Required" }), _jsx("th", { style: thRight, children: "Alloc (Off)" }), _jsx("th", { style: thRight, children: "Alloc (Van)" }), _jsx("th", { style: thRight, children: "Office" }), _jsx("th", { style: thRight, children: "Van" }), _jsx("th", { style: thCenter, children: "Status" })] }) }), _jsx("tbody", { children: itemsForProject.map((pi) => {
                                        const inv = inventory.find((i) => i.id === pi.item_id) ||
                                            inventoryByModel[pi.model_number.toLowerCase()];
                                        const status = getProjectItemStatus(pi, inv);
                                        return (_jsxs("tr", { children: [_jsx("td", { style: td, children: pi.description }), _jsx("td", { style: td, children: pi.model_number }), _jsx("td", { style: td, children: pi.type }), _jsx("td", { style: tdRight, children: pi.required_qty }), _jsx("td", { style: tdRight, children: pi.allocated_office }), _jsx("td", { style: tdRight, children: pi.allocated_van }), _jsx("td", { style: tdRight, children: inv ? inv.office_qty : "-" }), _jsx("td", { style: tdRight, children: inv ? inv.van_qty : "-" }), _jsx("td", { style: {
                                                        borderBottom: "1px solid " + (status.border || "#ccc"),
                                                        padding: "0.25rem 0.4rem",
                                                        textAlign: "center",
                                                    }, children: _jsx("span", { style: {
                                                            display: "inline-block",
                                                            padding: "0.1rem 0.4rem",
                                                            borderRadius: 999,
                                                            border: `1px solid ${status.border}`,
                                                            background: status.bg,
                                                            color: status.text,
                                                            fontSize: "0.75rem",
                                                        }, children: status.label }) })] }, pi.id));
                                    }) })] }) })] }))] }));
};
/* Table cell styles */
const thBase = {
    borderBottom: "1px solid #ddd",
    padding: "0.25rem 0.4rem",
};
const thLeft = {
    ...thBase,
    textAlign: "left",
};
const thRight = {
    ...thBase,
    textAlign: "right",
};
const thCenter = {
    ...thBase,
    textAlign: "center",
};
const td = {
    borderBottom: "1px solid #eee",
    padding: "0.25rem 0.4rem",
};
const tdRight = {
    ...td,
    textAlign: "right",
};
export default ProjectsPage;
