// src/components/InventoryPage.tsx
import React from "react";
import type { Session } from "@supabase/supabase-js";

type UserRole = "admin" | "tech" | "viewer";

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

type AdjustAction =
  | "office_to_van"
  | "van_to_office"
  | "van_to_used"
  | "add_office";

type InventoryCategory =
  | "Fire Control"
  | "Addressable"
  | "Notification"
  | "Miscellaneous";

interface InventoryPageProps {
  session: Session | null;
  profile: Profile | null;

  inventory: InventoryItem[];
  loadingInventory: boolean;
  inventoryError: string | null;

  changes: ChangeEntry[];
  loadingChanges: boolean;
  changesError: string | null;

  selectedItemId: number | "";
  setSelectedItemId: (value: number | "") => void;

  quantity: string;
  setQuantity: (value: string) => void;

  // NEW ITEM (admin)
  newItemCategory: InventoryCategory;
  setNewItemCategory: (value: InventoryCategory) => void;
  newItemDescription: string;
  setNewItemDescription: (value: string) => void;
  newItemType: string;
  setNewItemType: (value: string) => void;
  newItemModelNumber: string;
  setNewItemModelNumber: (value: string) => void;
  newItemManufacturer: string;
  setNewItemManufacturer: (value: string) => void;
  newItemOfficeQty: string;
  setNewItemOfficeQty: (value: string) => void;
  newItemVanQty: string;
  setNewItemVanQty: (value: string) => void;
  creatingItem: boolean;
  handleCreateItem: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;

  handleAdjust: (action: AdjustAction) => void | Promise<void>;
  handleLogout: () => void;

  // optional history refresh from App
  onRefreshHistory?: () => Promise<void>;
}

const newItemInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem",
  borderRadius: 4,
  border: "1px solid var(--gcss-border, #d1d5db)",
  fontSize: "0.85rem",
};

function adjustButtonStyle(
  enabled: boolean,
  bg: string
): React.CSSProperties {
  return {
    padding: "0.4rem 0.7rem",
    borderRadius: 999,
    border: "1px solid var(--gcss-border, #9ca3af)",
    fontSize: "0.8rem",
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.5,
    background: enabled ? bg : "var(--gcss-surface, #e5e7eb)",
    whiteSpace: "nowrap",
  };
}

const InventoryPage: React.FC<InventoryPageProps> = ({
  session,
  profile,
  inventory,
  loadingInventory,
  inventoryError,
  changes,
  loadingChanges,
  changesError,
  selectedItemId,
  setSelectedItemId,
  quantity,
  setQuantity,

  newItemCategory,
  setNewItemCategory,
  newItemDescription,
  setNewItemDescription,
  newItemType,
  setNewItemType,
  newItemModelNumber,
  setNewItemModelNumber,
  newItemManufacturer,
  setNewItemManufacturer,
  newItemOfficeQty,
  setNewItemOfficeQty,
  newItemVanQty,
  setNewItemVanQty,
  creatingItem,
  handleCreateItem,

  handleAdjust,
  handleLogout,
  onRefreshHistory,
}) => {
  const [itemFilter, setItemFilter] = React.useState("");

  const selectedItem =
    inventory.find((i) => i.id === selectedItemId) ?? null;

  const filteredInventory = React.useMemo(() => {
    const term = itemFilter.trim().toLowerCase();
    if (!term) return inventory;

    return inventory.filter((item) => {
      const haystack = [
        item.description,
        item.model_number,
        item.type,
        item.manufacturer,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [inventory, itemFilter]);

  const groupedByCategory = React.useMemo(() => {
    const map: Record<string, Record<string, InventoryItem[]>> = {};
    for (const item of filteredInventory) {
      const cat = item.category || "Uncategorized";
      const mfg = item.manufacturer || "Unknown";

      if (!map[cat]) map[cat] = {};
      if (!map[cat][mfg]) map[cat][mfg] = [];
      map[cat][mfg].push(item);
    }
    return map;
  }, [filteredInventory]);

  return (
    <div
      style={{
        padding: "1.25rem 1rem 1.5rem",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "1rem",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Inventory</h1>
          {profile && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--gcss-muted, #6b7280)",
              }}
            >
              Logged in as{" "}
              <strong>{profile.email ?? session?.user.email}</strong>{" "}
              <span style={{ color: "var(--gcss-muted, #6b7280)" }}>
                ({profile.role})
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.35rem 0.85rem",
            borderRadius: 999,
            border: "none",
            background: "#dc2626",
            color: "#fef2f2",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>

      {/* Errors */}
      {inventoryError && (
        <div
          style={{
            color: "#dc2626",
            marginBottom: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {inventoryError}
        </div>
      )}
      {changesError && (
        <div
          style={{
            color: "#dc2626",
            marginBottom: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {changesError}
        </div>
      )}

      {/* Adjust + Add stacked full-width */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        {/* Adjust Stock */}
        <div
          style={{
            border: "1px solid var(--gcss-border, #d1d5db)",
            borderRadius: 6,
            padding: "0.9rem 1rem",
            background: "var(--gcss-surface, #f9fafb)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Adjust Stock</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
              gap: "0.75rem",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  marginBottom: "0.25rem",
                }}
              >
                Item
              </label>
              <select
                value={selectedItemId === "" ? "" : selectedItemId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedItemId(val ? Number(val) : "");
                }}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: 4,
                  border: "1px solid var(--gcss-border, #d1d5db)",
                  fontSize: "0.85rem",
                  background: "var(--gcss-input-bg)",
                  color: "var(--gcss-text)",
                }}
              >
                <option value="">Select an item…</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.description} ({item.model_number}) –{" "}
                    {item.manufacturer}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  marginBottom: "0.25rem",
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: 4,
                  border: "1px solid var(--gcss-border, #d1d5db)",
                  fontSize: "0.85rem",
                }}
              />
            </div>
          </div>

          {selectedItem && (
            <div
              style={{
                fontSize: "0.8rem",
                marginBottom: "0.75rem",
                color: "var(--gcss-muted, #6b7280)",
              }}
            >
              <strong>Current:</strong>{" "}
              <span style={{ marginRight: "1rem" }}>
                Office: {selectedItem.office_qty}
              </span>
              <span>Van: {selectedItem.van_qty}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
            }}
          >
            <button
              onClick={() => handleAdjust("office_to_van")}
              disabled={!selectedItem || !quantity}
              style={adjustButtonStyle(
                !!selectedItem && !!quantity,
                "#e0ecff"
              )}
            >
              Office → Van
            </button>
            <button
              onClick={() => handleAdjust("van_to_office")}
              disabled={!selectedItem || !quantity}
              style={adjustButtonStyle(
                !!selectedItem && !!quantity,
                "#e0ffe5"
              )}
            >
              Van → Office
            </button>
            <button
              onClick={() => handleAdjust("van_to_used")}
              disabled={!selectedItem || !quantity}
              style={adjustButtonStyle(
                !!selectedItem && !!quantity,
                "#ffecec"
              )}
            >
              Van → Used
            </button>
            {profile?.role === "admin" && (
              <button
                onClick={() => handleAdjust("add_office")}
                disabled={!selectedItem || !quantity}
                style={{
                  ...adjustButtonStyle(
                    !!selectedItem && !!quantity,
                    "#0062ff"
                  ),
                  color: "white",
                  borderColor: "#004aad",
                  marginLeft: "auto",
                }}
              >
                Add to Office (Admin)
              </button>
            )}
          </div>
        </div>

        {/* Add New Item (admin only) */}
        {profile?.role === "admin" && (
          <div
            style={{
              border: "1px solid var(--gcss-border, #d1d5db)",
              borderRadius: 6,
              padding: "0.9rem 1rem",
              background: "var(--gcss-surface, #f9fafb)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "1rem" }}>
              Add New Inventory Item
            </h2>
            <form onSubmit={handleCreateItem}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gap: "0.6rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) =>
                      setNewItemCategory(e.target.value as InventoryCategory)
                    }
                    style={{
                      width: "100%",
                      padding: "0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--gcss-border, #d1d5db)",
                      fontSize: "0.85rem",
                      background: "var(--gcss-input-bg)",
                    }}
                  >
                    <option value="Fire Control">Fire Control</option>
                    <option value="Addressable">Addressable</option>
                    <option value="Notification">Notification</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="e.g. Addressable Smoke Detector"
                    style={newItemInputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Type
                  </label>
                  <input
                    type="text"
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    placeholder="e.g. Initiating"
                    style={newItemInputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={newItemModelNumber}
                    onChange={(e) =>
                      setNewItemModelNumber(e.target.value)
                    }
                    placeholder="e.g. FSP-951"
                    style={newItemInputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={newItemManufacturer}
                    onChange={(e) =>
                      setNewItemManufacturer(e.target.value)
                    }
                    placeholder="e.g. Gamewell-FCI"
                    style={newItemInputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.6rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Starting Office Qty
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newItemOfficeQty}
                      onChange={(e) =>
                        setNewItemOfficeQty(e.target.value)
                      }
                      style={newItemInputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Starting Van Qty
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newItemVanQty}
                      onChange={(e) => setNewItemVanQty(e.target.value)}
                      style={newItemInputStyle}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingItem}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: 4,
                  border: "none",
                  background: "#0062ff",
                  color: "white",
                  cursor: creatingItem ? "default" : "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {creatingItem ? "Saving…" : "Add Item"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Inventory list with search */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontSize: "1rem", margin: 0 }}>Inventory Items</h2>

          <input
            type="text"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            placeholder="Search description, model, type…"
            style={{
              minWidth: 220,
              padding: "0.35rem 0.6rem",
              borderRadius: 999,
              border: "1px solid var(--gcss-border, #d1d5db)",
              background: "var(--gcss-input-bg)",
              color: "var(--gcss-text)",
              fontSize: "0.8rem",
            }}
          />
        </div>

        {loadingInventory ? (
          <div>Loading inventory…</div>
        ) : filteredInventory.length === 0 ? (
          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--gcss-muted, #6b7280)",
            }}
          >
            No inventory items found.
          </div>
        ) : (
          Object.entries(groupedByCategory).map(
            ([category, byManufacturer]) => (
              <div key={category} style={{ marginBottom: "1rem" }}>
                <h3
                  style={{
                    marginBottom: "0.35rem",
                    fontSize: "0.95rem",
                  }}
                >
                  {category}
                </h3>
                {Object.entries(byManufacturer).map(
                  ([mfg, itemsForMfg]) => (
                    <div key={mfg} style={{ marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          marginBottom: "0.25rem",
                          color: "var(--gcss-text, #111827)",
                        }}
                      >
                        {mfg}
                      </div>
                      <div
                        style={{
                          overflowX: "auto",
                          borderRadius: 4,
                        }}
                      >
                        <table
                          className="compact"
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.85rem",
                          }}
                        >
                          <thead>
                            <tr>
                              {[
                                "Description",
                                "Type",
                                "Model",
                                "Office",
                                "Van",
                              ].map((label) => (
                                <th
                                  key={label}
                                  style={{
                                    background:
                                      "var(--gcss-surface-strong, #020617)",
                                    color:
                                      "var(--gcss-on-surface, #e5e7eb)",
                                    fontWeight: 600,
                                    padding: "0.4rem 0.55rem",
                                    borderBottom:
                                      "1px solid var(--gcss-border, #4b5563)",
                                    textAlign:
                                      label === "Office" ||
                                      label === "Van"
                                        ? "right"
                                        : "left",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {itemsForMfg.map((item) => (
                              <tr key={item.id}>
                                <td
                                  style={{
                                    padding: "0.35rem 0.55rem",
                                    borderBottom:
                                      "1px solid var(--gcss-border, #e5e7eb)",
                                  }}
                                >
                                  {item.description}
                                </td>
                                <td
                                  style={{
                                    padding: "0.35rem 0.55rem",
                                    borderBottom:
                                      "1px solid var(--gcss-border, #e5e7eb)",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.type}
                                </td>
                                <td
                                  style={{
                                    padding: "0.35rem 0.55rem",
                                    borderBottom:
                                      "1px solid var(--gcss-border, #e5e7eb)",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.model_number}
                                </td>
                                <td
                                  style={{
                                    padding: "0.35rem 0.55rem",
                                    borderBottom:
                                      "1px solid var(--gcss-border, #e5e7eb)",
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.office_qty}
                                </td>
                                <td
                                  style={{
                                    padding: "0.35rem 0.55rem",
                                    borderBottom:
                                      "1px solid var(--gcss-border, #e5e7eb)",
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.van_qty}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          )
        )}
      </div>

      {/* Optional: simple change history preview */}
      <div style={{ marginTop: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem",
            gap: "0.5rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", margin: 0 }}>Recent Changes</h2>
          {onRefreshHistory && (
            <button
              type="button"
              onClick={() => void onRefreshHistory()}
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: 999,
                border: "1px solid var(--gcss-border, #d1d5db)",
                background: "var(--gcss-surface, #f9fafb)",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          )}
        </div>

        {loadingChanges ? (
          <div>Loading change history…</div>
        ) : !changes.length ? (
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--gcss-muted, #6b7280)",
            }}
          >
            No recent changes.
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--gcss-border, #d1d5db)",
              borderRadius: 6,
              padding: "0.6rem 0.75rem",
              maxHeight: 260,
              overflowY: "auto",
              background: "var(--gcss-surface, #f9fafb)",
              fontSize: "0.8rem",
            }}
          >
            {changes.slice(0, 50).map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "0.25rem 0",
                  borderBottom:
                    "1px solid var(--gcss-border, rgba(209,213,219,0.6))",
                }}
              >
                <div style={{ fontWeight: 500 }}>
                  {c.description ?? "(item)"}{" "}
                  {c.model_number && (
                    <span style={{ color: "#6b7280" }}>
                      ({c.model_number})
                    </span>
                  )}
                </div>
                <div style={{ color: "#6b7280" }}>
                  {c.from_location} → {c.to_location} · qty{" "}
                  {c.quantity ?? 0}
                </div>
                <div style={{ color: "#9ca3af" }}>
                  {new Date(c.created_at).toLocaleString()} ·{" "}
                  {c.user_email ?? "Unknown"} ({c.role ?? "N/A"})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
