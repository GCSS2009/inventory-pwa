import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/InventoryPage.tsx
import React from "react";
const InventoryPage = ({ session, profile, inventory, loadingInventory, inventoryError, changes, loadingChanges, changesError, selectedItemId, setSelectedItemId, quantity, setQuantity, newItemCategory, setNewItemCategory, newItemDescription, setNewItemDescription, newItemType, setNewItemType, newItemModelNumber, setNewItemModelNumber, newItemManufacturer, setNewItemManufacturer, newItemOfficeQty, setNewItemOfficeQty, newItemVanQty, setNewItemVanQty, creatingItem, handleCreateItem, handleAdjust, handleLogout, onRefreshHistory, }) => {
    const selectedItem = inventory.find((i) => i.id === selectedItemId) ?? null;
    const groupedByCategory = React.useMemo(() => {
        const map = {};
        for (const item of inventory) {
            const cat = item.category || "Uncategorized";
            const mfg = item.manufacturer || "Unknown";
            if (!map[cat])
                map[cat] = {};
            if (!map[cat][mfg])
                map[cat][mfg] = [];
            map[cat][mfg].push(item);
        }
        return map;
    }, [inventory]);
    return (_jsxs("div", { style: {
            padding: "1.25rem 1rem 1.5rem",
            maxWidth: 1200,
            margin: "0 auto",
        }, children: [_jsxs("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "1rem",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0 }, children: "Inventory" }), profile && (_jsxs("div", { style: {
                                    fontSize: "0.85rem",
                                    color: "var(--gcss-muted, #6b7280)",
                                }, children: ["Logged in as", " ", _jsx("strong", { children: profile.email ?? session?.user.email }), " ", _jsxs("span", { style: { color: "#888" }, children: ["(", profile.role, ")"] })] }))] }), _jsx("button", { onClick: handleLogout, style: {
                            padding: "0.35rem 0.75rem",
                            borderRadius: 4,
                            border: "1px solid var(--gcss-border, #d1d5db)",
                            background: "var(--gcss-surface, #f9fafb)",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                        }, children: "Logout" })] }), inventoryError && (_jsx("div", { style: { color: "#dc2626", marginBottom: "0.5rem", fontSize: "0.85rem" }, children: inventoryError })), changesError && (_jsx("div", { style: { color: "#dc2626", marginBottom: "0.5rem", fontSize: "0.85rem" }, children: changesError })), _jsxs("div", { style: {
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.8fr)",
                    gap: "1rem",
                }, children: [_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [_jsxs("div", { style: {
                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                    borderRadius: 6,
                                    padding: "0.9rem 1rem",
                                    background: "var(--gcss-surface, #f9fafb)",
                                }, children: [_jsx("h2", { style: { marginTop: 0, fontSize: "1rem" }, children: "Adjust Stock" }), _jsxs("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
                                            gap: "0.75rem",
                                            alignItems: "center",
                                            marginBottom: "0.75rem",
                                        }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                            display: "block",
                                                            fontSize: "0.85rem",
                                                            marginBottom: "0.25rem",
                                                        }, children: "Item" }), _jsxs("select", { value: selectedItemId === "" ? "" : selectedItemId, onChange: (e) => {
                                                            const val = e.target.value;
                                                            setSelectedItemId(val ? Number(val) : "");
                                                        }, style: {
                                                            width: "100%",
                                                            padding: "0.4rem",
                                                            borderRadius: 4,
                                                            border: "1px solid var(--gcss-border, #d1d5db)",
                                                            fontSize: "0.85rem",
                                                        }, children: [_jsx("option", { value: "", children: "Select an item\u2026" }), inventory.map((item) => (_jsxs("option", { value: item.id, children: [item.description, " (", item.model_number, ") \u2013", " ", item.manufacturer] }, item.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                            display: "block",
                                                            fontSize: "0.85rem",
                                                            marginBottom: "0.25rem",
                                                        }, children: "Quantity" }), _jsx("input", { type: "number", min: 1, value: quantity, onChange: (e) => setQuantity(e.target.value), style: {
                                                            width: "100%",
                                                            padding: "0.4rem",
                                                            borderRadius: 4,
                                                            border: "1px solid var(--gcss-border, #d1d5db)",
                                                            fontSize: "0.85rem",
                                                        } })] })] }), selectedItem && (_jsxs("div", { style: {
                                            fontSize: "0.8rem",
                                            marginBottom: "0.75rem",
                                            color: "var(--gcss-muted, #6b7280)",
                                        }, children: [_jsx("strong", { children: "Current:" }), " ", _jsxs("span", { style: { marginRight: "1rem" }, children: ["Office: ", selectedItem.office_qty] }), _jsxs("span", { children: ["Van: ", selectedItem.van_qty] })] })), _jsxs("div", { style: {
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "0.4rem",
                                        }, children: [_jsx("button", { onClick: () => handleAdjust("office_to_van"), disabled: !selectedItem || !quantity, style: adjustButtonStyle(!!selectedItem && !!quantity, "#e0ecff"), children: "Office \u2192 Van" }), _jsx("button", { onClick: () => handleAdjust("van_to_office"), disabled: !selectedItem || !quantity, style: adjustButtonStyle(!!selectedItem && !!quantity, "#e0ffe5"), children: "Van \u2192 Office" }), _jsx("button", { onClick: () => handleAdjust("van_to_used"), disabled: !selectedItem || !quantity, style: adjustButtonStyle(!!selectedItem && !!quantity, "#ffecec"), children: "Van \u2192 Used" }), profile?.role === "admin" && (_jsx("button", { onClick: () => handleAdjust("add_office"), disabled: !selectedItem || !quantity, style: {
                                                    ...adjustButtonStyle(!!selectedItem && !!quantity, "#0062ff"),
                                                    color: "white",
                                                    borderColor: "#004aad",
                                                    marginLeft: "auto",
                                                }, children: "Add to Office (Admin)" }))] })] }), profile?.role === "admin" && (_jsxs("div", { style: {
                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                    borderRadius: 6,
                                    padding: "0.9rem 1rem",
                                    background: "var(--gcss-surface, #f9fafb)",
                                }, children: [_jsx("h2", { style: { marginTop: 0, fontSize: "1rem" }, children: "Add New Inventory Item" }), _jsxs("form", { onSubmit: handleCreateItem, children: [_jsxs("div", { style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "minmax(0, 1fr)",
                                                    gap: "0.6rem",
                                                    marginBottom: "0.75rem",
                                                }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                                    display: "block",
                                                                    fontSize: "0.8rem",
                                                                    marginBottom: "0.25rem",
                                                                }, children: "Category" }), _jsxs("select", { value: newItemCategory, onChange: (e) => setNewItemCategory(e.target.value), style: {
                                                                    width: "100%",
                                                                    padding: "0.4rem",
                                                                    borderRadius: 4,
                                                                    border: "1px solid var(--gcss-border, #d1d5db)",
                                                                    fontSize: "0.85rem",
                                                                }, children: [_jsx("option", { value: "Fire Control", children: "Fire Control" }), _jsx("option", { value: "Addressable", children: "Addressable" }), _jsx("option", { value: "Notification", children: "Notification" }), _jsx("option", { value: "Miscellaneous", children: "Miscellaneous" })] })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                                    display: "block",
                                                                    fontSize: "0.8rem",
                                                                    marginBottom: "0.25rem",
                                                                }, children: "Description" }), _jsx("input", { type: "text", value: newItemDescription, onChange: (e) => setNewItemDescription(e.target.value), placeholder: "e.g. Addressable Smoke Detector", style: newItemInputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                                    display: "block",
                                                                    fontSize: "0.8rem",
                                                                    marginBottom: "0.25rem",
                                                                }, children: "Type" }), _jsx("input", { type: "text", value: newItemType, onChange: (e) => setNewItemType(e.target.value), placeholder: "e.g. Initiating", style: newItemInputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                                    display: "block",
                                                                    fontSize: "0.8rem",
                                                                    marginBottom: "0.25rem",
                                                                }, children: "Model Number" }), _jsx("input", { type: "text", value: newItemModelNumber, onChange: (e) => setNewItemModelNumber(e.target.value), placeholder: "e.g. FSP-951", style: newItemInputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                                    display: "block",
                                                                    fontSize: "0.8rem",
                                                                    marginBottom: "0.25rem",
                                                                }, children: "Manufacturer" }), _jsx("input", { type: "text", value: newItemManufacturer, onChange: (e) => setNewItemManufacturer(e.target.value), placeholder: "e.g. Gamewell-FCI", style: newItemInputStyle })] }), _jsxs("div", { style: {
                                                            display: "grid",
                                                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                                            gap: "0.6rem",
                                                        }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                                            display: "block",
                                                                            fontSize: "0.8rem",
                                                                            marginBottom: "0.25rem",
                                                                        }, children: "Starting Office Qty" }), _jsx("input", { type: "number", min: 0, value: newItemOfficeQty, onChange: (e) => setNewItemOfficeQty(e.target.value), style: newItemInputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                                            display: "block",
                                                                            fontSize: "0.8rem",
                                                                            marginBottom: "0.25rem",
                                                                        }, children: "Starting Van Qty" }), _jsx("input", { type: "number", min: 0, value: newItemVanQty, onChange: (e) => setNewItemVanQty(e.target.value), style: newItemInputStyle })] })] })] }), _jsx("button", { type: "submit", disabled: creatingItem, style: {
                                                    padding: "0.45rem 0.9rem",
                                                    borderRadius: 4,
                                                    border: "none",
                                                    background: "#0062ff",
                                                    color: "white",
                                                    cursor: creatingItem ? "default" : "pointer",
                                                    fontSize: "0.85rem",
                                                    fontWeight: 600,
                                                }, children: creatingItem ? "Saving…" : "Add Item" })] })] }))] }), _jsxs("div", { children: [_jsx("h2", { style: { fontSize: "1rem", marginBottom: "0.5rem" }, children: "Inventory Items" }), loadingInventory ? (_jsx("div", { children: "Loading inventory\u2026" })) : inventory.length === 0 ? (_jsx("div", { style: {
                                    fontSize: "0.9rem",
                                    color: "var(--gcss-muted, #6b7280)",
                                }, children: "No inventory items found." })) : (Object.entries(groupedByCategory).map(([category, byManufacturer]) => (_jsxs("div", { style: { marginBottom: "1rem" }, children: [_jsx("h3", { style: {
                                            marginBottom: "0.35rem",
                                            fontSize: "0.95rem",
                                        }, children: category }), Object.entries(byManufacturer).map(([mfg, itemsForMfg]) => (_jsxs("div", { style: { marginBottom: "0.75rem" }, children: [_jsx("div", { style: {
                                                    fontWeight: 600,
                                                    fontSize: "0.9rem",
                                                    marginBottom: "0.25rem",
                                                    color: "var(--gcss-text, #111827)",
                                                }, children: mfg }), _jsx("div", { style: {
                                                    overflowX: "auto",
                                                    borderRadius: 4,
                                                }, children: _jsxs("table", { style: {
                                                        width: "100%",
                                                        borderCollapse: "collapse",
                                                        fontSize: "0.85rem",
                                                        minWidth: 520,
                                                    }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thLeft, children: "Description" }), _jsx("th", { style: thLeft, children: "Type" }), _jsx("th", { style: thLeft, children: "Model" }), _jsx("th", { style: thRight, children: "Office" }), _jsx("th", { style: thRight, children: "Van" })] }) }), _jsx("tbody", { children: itemsForMfg.map((item) => (_jsxs("tr", { children: [_jsx("td", { style: td, children: item.description }), _jsx("td", { style: td, children: item.type }), _jsx("td", { style: td, children: item.model_number }), _jsx("td", { style: tdRight, children: item.office_qty }), _jsx("td", { style: tdRight, children: item.van_qty })] }, item.id))) })] }) })] }, mfg)))] }, category)))), _jsxs("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginTop: "1.25rem",
                                    marginBottom: "0.3rem",
                                }, children: [_jsx("h2", { style: { fontSize: "1rem", margin: 0 }, children: "Change History" }), onRefreshHistory && (_jsx("button", { type: "button", onClick: onRefreshHistory, style: {
                                            padding: "0.25rem 0.5rem",
                                            fontSize: "0.75rem",
                                            borderRadius: 999,
                                            border: "1px solid var(--gcss-border, #d1d5db)",
                                            background: "var(--gcss-surface, #f9fafb)",
                                            cursor: "pointer",
                                        }, children: "Refresh" }))] }), loadingChanges ? (_jsx("div", { children: "Loading change history\u2026" })) : changes.length === 0 ? (_jsxs("div", { style: {
                                    fontSize: "0.9rem",
                                    color: "var(--gcss-muted, #6b7280)",
                                }, children: ["No changes logged yet.", _jsx("br", {}), _jsx("span", { style: { fontSize: "0.8rem", color: "#888" }, children: "Admins see all users' changes. Techs only see their own entries (enforced by RLS)." })] })) : (_jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { style: {
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        fontSize: "0.8rem",
                                        marginTop: "0.3rem",
                                        minWidth: 520,
                                    }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thLeft, children: "Time" }), _jsx("th", { style: thLeft, children: "User" }), _jsx("th", { style: thLeft, children: "Item" }), _jsx("th", { style: thLeft, children: "From \u2192 To" }), _jsx("th", { style: thRight, children: "Qty" })] }) }), _jsx("tbody", { children: changes.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: td, children: new Date(row.created_at).toLocaleString() }), _jsxs("td", { style: td, children: [row.user_email, " ", row.role ? (_jsxs("span", { style: { color: "#777" }, children: ["(", row.role, ")"] })) : null] }), _jsxs("td", { style: td, children: [row.description, " ", row.model_number ? `(${row.model_number})` : ""] }), _jsxs("td", { style: td, children: [row.from_location, " \u2192 ", row.to_location] }), _jsx("td", { style: tdRight, children: row.quantity })] }, row.id))) })] }) }))] })] })] }));
};
const adjustButtonStyle = (enabled, bg) => ({
    padding: "0.4rem 0.75rem",
    borderRadius: 4,
    border: "1px solid #ccc",
    background: enabled ? bg : "#f3f4f6",
    cursor: enabled ? "pointer" : "not-allowed",
    fontSize: "0.8rem",
});
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
const td = {
    borderBottom: "1px solid #eee",
    padding: "0.25rem 0.4rem",
};
const tdRight = {
    ...td,
    textAlign: "right",
};
const newItemInputStyle = {
    width: "100%",
    padding: "0.4rem",
    borderRadius: 4,
    border: "1px solid var(--gcss-border, #d1d5db)",
    fontSize: "0.85rem",
};
export default InventoryPage;
