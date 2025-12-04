import React, { useEffect, useState } from "react";
import type {
  Profile,
  Project,
  ProjectItem,
  InventoryItem,
} from "../types";

import ProjectsHeader from "./projects/ProjectsHeader";
import ProjectSelectorCard from "./projects/ProjectSelectorCard";
import NewProjectCard from "./projects/NewProjectCard";
import AddProjectItemCard from "./projects/AddProjectItemCard";
import ProjectAllocationBar from "./projects/ProjectAllocationBar";
import ProjectItemsTable from "./projects/ProjectItemsTable";

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

  handleAllocateToProject: (
    source: "office" | "van",
    projectItemId: string,
    qty: string
  ) => void | Promise<void>;

  handleLogout: () => void;
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

  // Local UI state for allocation (strings)
  const [selectedProjectItemId, setSelectedProjectItemId] = useState<string>("");
  const [allocationQty, setAllocationQty] = useState<string>("");

  // Reset allocation state when switching project
  useEffect(() => {
    setSelectedProjectItemId("");
    setAllocationQty("");
  }, [selectedProjectId]);

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0.25rem 0.5rem 0",
      }}
    >
      <ProjectsHeader profile={profile} handleLogout={handleLogout} />

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
        <ProjectSelectorCard
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          setSelectedProjectItemId={setSelectedProjectItemId}
          setAllocationQty={setAllocationQty}
        />

        {profile?.role === "admin" && (
          <NewProjectCard
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            newProjectNotes={newProjectNotes}
            setNewProjectNotes={setNewProjectNotes}
            creatingProject={creatingProject}
            handleCreateProject={handleCreateProject}
          />
        )}
      </div>

      {/* Add item to project (admin only) */}
      <AddProjectItemCard
        visible={profile?.role === "admin" && !!selectedProject}
        newItemDescription={newItemDescription}
        setNewItemDescription={setNewItemDescription}
        newItemModelNumber={newItemModelNumber}
        setNewItemModelNumber={setNewItemModelNumber}
        newItemType={newItemType}
        setNewItemType={setNewItemType}
        newItemRequiredQty={newItemRequiredQty}
        setNewItemRequiredQty={setNewItemRequiredQty}
        savingProjectItem={savingProjectItem}
        handleAddProjectItem={handleAddProjectItem}
      />

      {/* Project items & allocation */}
      <h2 style={{ fontSize: "1rem" }}>Project Items</h2>

      {!selectedProject ? (
        <div
          style={{
            fontSize: "0.9rem",
            color: "var(--gcss-muted, #6b7280)",
          }}
        >
          Select a project to view and allocate parts.
        </div>
      ) : itemsForProject.length === 0 ? (
        <div
          style={{
            fontSize: "0.9rem",
            color: "var(--gcss-muted, #6b7280)",
          }}
        >
          No items added for this project yet.
        </div>
      ) : (
        <>
          <ProjectAllocationBar
            visible={
              !!profile?.role && !!selectedProject && itemsForProject.length > 0
            }
            itemsForProject={itemsForProject}
            selectedProjectItemId={selectedProjectItemId}
            setSelectedProjectItemId={setSelectedProjectItemId}
            allocationQty={allocationQty}
            setAllocationQty={setAllocationQty}
            handleAllocateToProject={(source) =>
              handleAllocateToProject(
                source,
                selectedProjectItemId,
                allocationQty
              )
            }
          />

          <ProjectItemsTable
            itemsForProject={itemsForProject}
            inventory={inventory}
          />
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
