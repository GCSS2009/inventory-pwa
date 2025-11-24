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
  const [inventorySearch, setInventorySearch] = React.useState("");

  const selectedItem =
    inventory.find((i) => i.id === selectedItemId) ?? null;

  const normalizedSearch = inventorySearch.trim().toLowerCase();

  const filteredInventory = React.useMemo(() => {
    if (!normalizedSearch) return inventory;

    return inventory.filter((item) => {
      const haystack = [
        item.description ?? "",
        item.type ?? "",
        item.model_number ?? "",
        item.manufacturer ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [inventory, normalizedSearch]);

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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
              <span style={{ color: "#888" }}>({profile.role})</span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.35rem 0.75rem",
            borderRadius: 999,
            border: "1px solid rgba(248,113,113,0.9)",
            background: "rgba(248,113,113,0.15)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "#fee2e2",
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

      {/* MAIN CONTENT STACK */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* ADJUST STOCK – full width */}
        <section
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
              gridTemplateColumns: isMobile
                ? "minmax(0, 1fr)"
                : "minmax(0, 1.6fr) minmax(0, 1fr)",
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
        </section>

        {/* ADD NEW ITEM (admin only) */}
        {profile?.role === "admin" && (
          <section
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
                      setNewItemCategory(
                        e.target.value as InventoryCategory
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--gcss-border, #d1d5db)",
                      fontSize: "0.85rem",
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
                    onChange={(e) =>
                      setNewItemDescription(e.target.value)
                    }
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
                      onChange={(e) =>
                        setNewItemVanQty(e.target.value)
                      }
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
          </section>
        )}

        {/* INVENTORY ITEMS + SEARCH */}
        <section>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "0.5rem",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Inventory Items</h2>

            <input
              type="text"
              placeholder="Search description, model, type..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              style={{
                flex: isMobile ? "0 0 auto" : "0 0 260px",
                padding: "0.4rem 0.6rem",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.5)",
                background: "var(--gcss-input-bg, #020617)",
                color: "var(--gcss-text, #e5e7eb)",
                fontSize: "0.9rem",
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
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: "0.85rem",
                              minWidth: 520,
                            }}
                          >
                            <thead>
                              <tr>
                                <th style={thLeft}>Description</th>
                                <th style={thLeft}>Type</th>
                                <th style={thLeft}>Model</th>
                                <th style={thRight}>Office</th>
                                <th style={thRight}>Van</th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemsForMfg.map((item) => (
                                <tr key={item.id}>
                                  <td style={td}>{item.description}</td>
                                  <td style={td}>{item.type}</td>
                                  <td style={td}>{item.model_number}</td>
                                  <td style={tdRight}>{item.office_qty}</td>
                                  <td style={tdRight}>{item.van_qty}</td>
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
        </section>

        {/* CHANGE HISTORY */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.25rem",
              marginBottom: "0.3rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Change History</h2>
            {onRefreshHistory && (
              <button
                type="button"
                onClick={onRefreshHistory}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  borderRadius: 999,
                  border: "1px solid var(--gcss-border, #d1d5db)",
                  background: "var(--gcss-surface, #f9fafb)",
                  cursor: "pointer",
                }}
              >
                Refresh
              </button>
            )}
          </div>

          {loadingChanges ? (
            <div>Loading change history…</div>
          ) : changes.length === 0 ? (
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--gcss-muted, #6b7280)",
              }}
            >
              No changes logged yet.
              <br />
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                Admins see all users&apos; changes. Techs only see their own
                entries (enforced by RLS).
              </span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.8rem",
                  marginTop: "0.3rem",
                  minWidth: 520,
                }}
              >
                <thead>
                  <tr>
                    <th style={thLeft}>Time</th>
                    <th style={thLeft}>User</th>
                    <th style={thLeft}>Item</th>
                    <th style={thLeft}>From → To</th>
                    <th style={thRight}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((row) => (
                    <tr key={row.id}>
                      <td style={td}>
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td style={td}>
                        {row.user_email}{" "}
                        {row.role ? (
                          <span style={{ color: "#777" }}>({row.role})</span>
                        ) : null}
                      </td>
                      <td style={td}>
                        {row.description}{" "}
                        {row.model_number ? `(${row.model_number})` : ""}
                      </td>
                      <td style={td}>
                        {row.from_location} → {row.to_location}
                      </td>
                      <td style={tdRight}>{row.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const adjustButtonStyle = (
  enabled: boolean,
  bg: string
): React.CSSProperties => ({
  padding: "0.4rem 0.75rem",
  borderRadius: 4,
  border: "1px solid #ccc",
  background: enabled ? bg : "#f3f4f6",
  cursor: enabled ? "pointer" : "not-allowed",
  fontSize: "0.8rem",
});

const thBase: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  padding: "0.25rem 0.4rem",
};

const thLeft: React.CSSProperties = {
  ...thBase,
  textAlign: "left",
};

const thRight: React.CSSProperties = {
  ...thBase,
  textAlign: "right",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "0.25rem 0.4rem",
};

const tdRight: React.CSSProperties = {
  ...td,
  textAlign: "right",
};

const newItemInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem",
  borderRadius: 4,
  border: "1px solid var(--gcss-border, #d1d5db)",
  fontSize: "0.85rem",
};

export default InventoryPage;
