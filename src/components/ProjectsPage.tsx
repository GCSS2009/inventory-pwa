import React from "react";

type UserRole = "admin" | "tech" | "viewer";

interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
}

interface Project {
  id: number | string;
  name: string;
  notes: string | null;
  created_at: string;
}

interface ProjectItem {
  id: number;
  project_id: number | string;
  item_id: number | null;
  description: string;
  model_number: string;
  type: string;
  required_qty: number;
  allocated_office: number;
  allocated_van: number;
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

interface ProjectsPageProps {
  profile: Profile | null;

  projects: Project[];
  projectItems: ProjectItem[];
  inventory: InventoryItem[];

  loadingProjects: boolean;
  projectsError: string | null;

  selectedProjectId: string;
  setSelectedProjectId: (value: string) => void;

  newProjectName: string;
  setNewProjectName: (value: string) => void;
  newProjectNotes: string;
  setNewProjectNotes: (value: string) => void;
  creatingProject: boolean;
  handleCreateProject: (
    e: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>;

  newItemDescription: string;
  setNewItemDescription: (value: string) => void;
  newItemModelNumber: string;
  setNewItemModelNumber: (value: string) => void;
  newItemType: string;
  setNewItemType: (value: string) => void;
  newItemRequiredQty: string;
  setNewItemRequiredQty: (value: string) => void;
  savingProjectItem: boolean;
  handleAddProjectItem: (
    e: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>;

  selectedProjectItemId: number | "";
  setSelectedProjectItemId: (value: number | "") => void;
  allocationQty: string;
  setAllocationQty: (value: string) => void;
  handleAllocateToProject: (
    source: "office" | "van"
  ) => void | Promise<void>;

  handleLogout: () => void;
}

// status chip helper
function getProjectItemStatus(
  item: ProjectItem,
  inventoryItem: InventoryItem | undefined
) {
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

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  profile,

  projects,
  projectItems,
  inventory,

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

  selectedProjectItemId,
  setSelectedProjectItemId,
  allocationQty,
  setAllocationQty,
  handleAllocateToProject,

  handleLogout,
}) => {
  const selectedProject =
    projects.find((p) => String(p.id) === selectedProjectId) ?? null;

  const itemsForProject =
    selectedProjectId === ""
      ? []
      : projectItems.filter(
          (pi) => String(pi.project_id) === selectedProjectId
        );

  const inventoryByModel = React.useMemo(() => {
    const map: Record<string, InventoryItem> = {};
    for (const item of inventory) {
      const key = item.model_number?.toLowerCase();
      if (key) map[key] = item;
    }
    return map;
  }, [inventory]);

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0.25rem 0.5rem 0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "1rem",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--gcss-muted, #6b7280)",
            }}
          >
            Track required parts per project and allocations from office & van.
          </div>
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

      {/* Error / loading */}
      {projectsError && (
        <div style={{ color: "#dc2626", marginBottom: "0.75rem" }}>
          {projectsError}
        </div>
      )}
      {loadingProjects && projects.length === 0 ? (
        <div style={{ marginBottom: "1rem" }}>Loading projects…</div>
      ) : null}

      {/* Project selection + create */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            profile?.role === "admin"
              ? "minmax(0, 2fr) minmax(0, 2fr)"
              : "minmax(0, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Project selection */}
        <div
          style={{
            border: "1px solid var(--gcss-border, #d1d5db)",
            borderRadius: 6,
            padding: "1rem 1.25rem",
            background: "var(--gcss-surface, #020617)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Project</h2>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Select project
          </label>
          <select
            className="projects-select"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedProjectItemId("");
              setAllocationQty("");
            }}
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: 4,
              border: "1px solid var(--gcss-border, #d1d5db)",
              fontSize: "0.85rem",

            }}
          >
            <option
              value=""
              style={{
                color: "#111827",
                backgroundColor: "#ffffff",
              }}
            >
              Select a project…
            </option>
            {projects.map((p) => (
              <option
                key={p.id}
                value={String(p.id)}
                style={{
                  color: "#111827",
                  backgroundColor: "#ffffff",
                }}
              >
                {p.name}
              </option>
            ))}
          </select>

          {selectedProject && (
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                color: "var(--gcss-text, #e5e7eb)",
              }}
            >
              <div>
                <strong>Created:</strong>{" "}
                {new Date(
                  selectedProject.created_at
                ).toLocaleDateString()}
              </div>
              {selectedProject.notes && (
                <div style={{ marginTop: "0.25rem" }}>
                  <strong>Notes:</strong> {selectedProject.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* New project (admin) */}
        {profile?.role === "admin" && (
          <div
            style={{
              border: "1px solid var(--gcss-border, #d1d5db)",
              borderRadius: 6,
              padding: "1rem 1.25rem",
              background: "var(--gcss-surface, #020617)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "1rem" }}>
              New Project (Admin)
            </h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: "0.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. TJ Maxx – Pineville"
                  style={{
                    width: "100%",
                    padding: "0.4rem",
                    borderRadius: 4,
                    border: "1px solid var(--gcss-border, #d1d5db)",
                    fontSize: "0.85rem",
                    background: "var(--gcss-surface, #020617)",
                    color: "var(--gcss-text, #f9fafb)",
                  }}
                />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={newProjectNotes}
                  onChange={(e) => setNewProjectNotes(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.4rem",
                    borderRadius: 4,
                    border: "1px solid var(--gcss-border, #d1d5db)",
                    fontSize: "0.85rem",
                    resize: "vertical",
                    background: "var(--gcss-surface, #020617)",
                    color: "var(--gcss-text, #f9fafb)",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={creatingProject}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 4,
                  border: "none",
                  background: "#0062ff",
                  color: "white",
                  cursor: creatingProject ? "default" : "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {creatingProject ? "Creating…" : "Create Project"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add item to project (admin only) */}
      {profile?.role === "admin" && selectedProject && (
        <div
          style={{
            border: "1px solid var(--gcss-border, #d1d5db)",
            borderRadius: 6,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            background: "var(--gcss-surface, #020617)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1rem" }}>
            Add Item to Project
          </h2>
          <form onSubmit={handleAddProjectItem}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr 1.2fr 0.7fr",
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
                  Description
                </label>
                <input
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="e.g. Addressable Smoke"
                  style={{
                    width: "100%",
                    padding: "0.4rem",
                    borderRadius: 4,
                    border: "1px solid var(--gcss-border, #d1d5db)",
                    fontSize: "0.85rem",
                  }}
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
                  Model
                </label>
                <input
                  type="text"
                  value={newItemModelNumber}
                  onChange={(e) =>
                    setNewItemModelNumber(e.target.value)
                  }
                  placeholder="e.g. FSP-951"
                  style={{
                    width: "100%",
                    padding: "0.4rem",
                    borderRadius: 4,
                    border: "1px solid var(--gcss-border, #d1d5db)",
                    fontSize: "0.85rem",
                  }}
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
                  style={{
                    width: "100%",
                    padding: "0.4rem",
                    borderRadius: 4,
                    border: "1px solid var(--gcss-border, #d1d5db)",
                    fontSize: "0.85rem",
                  }}
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
                  Required
                </label>
                <input
                  type="number"
                  min={1}
                  value={newItemRequiredQty}
                  onChange={(e) =>
                    setNewItemRequiredQty(e.target.value)
                  }
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
            <button
              type="submit"
              disabled={savingProjectItem}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: 4,
                border: "none",
                background: "#0062ff",
                color: "white",
                cursor: savingProjectItem ? "default" : "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {savingProjectItem ? "Saving…" : "Add Item"}
            </button>
          </form>
        </div>
      )}

      {/* Project items & allocation */}
      <h2 style={{ fontSize: "1rem" }}>Project Items</h2>
      {!selectedProject ? (
        <div style={{ fontSize: "0.9rem", color: "var(--gcss-muted, #6b7280)" }}>
          Select a project to view and allocate parts.
        </div>
      ) : itemsForProject.length === 0 ? (
        <div style={{ fontSize: "0.9rem", color: "var(--gcss-muted, #6b7280)" }}>
          No items added for this project yet.
        </div>
      ) : (
        <>
          {/* Allocation bar */}
          {profile?.role && (
            <div
              style={{
                border: "1px solid var(--gcss-border, #d1d5db)",
                borderRadius: 6,
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                background: "var(--gcss-surface, #020617)",
                maxWidth: 800,
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Allocate Stock to Project
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 0.9fr",
                  gap: "0.6rem",
                  alignItems: "end",
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
                    Project item
                  </label>
                  <select
                    className="projects-select"
                    value={
                      selectedProjectItemId === ""
                        ? ""
                        : selectedProjectItemId
                    }
                    onChange={(e) =>
                      setSelectedProjectItemId(
                        e.target.value ? Number(e.target.value) : ""
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
                    <option
                      value=""
                      style={{
                        color: "#111827",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      Select an item…
                    </option>
                    {itemsForProject.map((pi) => (
                      <option
                        key={pi.id}
                        value={pi.id}
                        style={{
                          color: "#111827",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        {pi.description} ({pi.model_number})
                      </option>
                    ))}
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
                    Quantity to allocate
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={allocationQty}
                    onChange={(e) => setAllocationQty(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.4rem",
                      borderRadius: 4,
                      border: "1px solid var(--gcss-border, #d1d5db)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.4rem",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleAllocateToProject("office")}
                    disabled={!selectedProjectItemId || !allocationQty}
                    style={{
                      padding: "0.4rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: "#e0f2fe",
                      cursor:
                        selectedProjectItemId && allocationQty
                          ? "pointer"
                          : "not-allowed",
                      fontSize: "0.8rem",
                    }}
                  >
                    From Office
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAllocateToProject("van")}
                    disabled={!selectedProjectItemId || !allocationQty}
                    style={{
                      padding: "0.4rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: "#fef9c3",
                      cursor:
                        selectedProjectItemId && allocationQty
                          ? "pointer"
                          : "not-allowed",
                      fontSize: "0.8rem",
                    }}
                  >
                    From Van
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                minWidth: 650,
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr>
                  <th style={thLeft}>Description</th>
                  <th style={thLeft}>Model</th>
                  <th style={thLeft}>Type</th>
                  <th style={thRight}>Required</th>
                  <th style={thRight}>Alloc (Off)</th>
                  <th style={thRight}>Alloc (Van)</th>
                  <th style={thRight}>Office</th>
                  <th style={thRight}>Van</th>
                  <th style={thCenter}>Status</th>
                </tr>
              </thead>
              <tbody>
                {itemsForProject.map((pi) => {
                  const inv =
                    inventory.find((i) => i.id === pi.item_id) ||
                    inventoryByModel[pi.model_number.toLowerCase()];
                  const status = getProjectItemStatus(pi, inv);

                  return (
                    <tr key={pi.id}>
                      <td style={td}>{pi.description}</td>
                      <td style={td}>{pi.model_number}</td>
                      <td style={td}>{pi.type}</td>
                      <td style={tdRight}>{pi.required_qty}</td>
                      <td style={tdRight}>{pi.allocated_office}</td>
                      <td style={tdRight}>{pi.allocated_van}</td>
                      <td style={tdRight}>
                        {inv ? inv.office_qty : "-"}
                      </td>
                      <td style={tdRight}>{inv ? inv.van_qty : "-"}</td>
                      <td
                        style={{
                          borderBottom:
                            "1px solid " + (status.border || "#ccc"),
                          padding: "0.25rem 0.4rem",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.1rem 0.4rem",
                            borderRadius: 999,
                            border: `1px solid ${status.border}`,
                            background: status.bg,
                            color: status.text,
                            fontSize: "0.75rem",
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

/* Table cell styles */
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
const thCenter: React.CSSProperties = {
  ...thBase,
  textAlign: "center",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "0.25rem 0.4rem",
};
const tdRight: React.CSSProperties = {
  ...td,
  textAlign: "right",
};

export default ProjectsPage;
