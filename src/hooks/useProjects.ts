// src/hooks/useProjects.ts
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import type {
  Profile,
  Project,
  ProjectItem,
  InventoryItem,
} from "../types";

type ToastType = "success" | "error" | "info";

interface UseProjectsOptions {
  session: Session | null;
  profile: Profile | null;
  inventory: InventoryItem[];
  showToast: (message: string, type?: ToastType) => void;
}

export function useProjects({
  session,
  profile,
  inventory,
  showToast,
}: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectNotes, setNewProjectNotes] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemModelNumber, setNewItemModelNumber] = useState("");
  const [newItemType, setNewItemType] = useState("");
  const [newItemRequiredQty, setNewItemRequiredQty] = useState("");
  const [savingProjectItem, setSavingProjectItem] = useState(false);

  const loadProjectsAndItems = async () => {
    setLoadingProjects(true);
    setProjectsError(null);

    const [projRes, itemsRes] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, notes, created_at")
        .order("created_at", { ascending: true }),
      supabase
        .from("project_items")
        .select(
          "id, project_id, item_id, description, model_number, type, required_qty, allocated_office, allocated_van"
        )
        .order("project_id", { ascending: true }),
    ]);

    if (projRes.error) {
      setProjectsError(projRes.error.message);
      setProjects([]);
      showToast("Error loading projects: " + projRes.error.message, "error");
    } else if (projRes.data) {
      setProjects(projRes.data as Project[]);
    }

    if (itemsRes.error) {
      setProjectsError((prev) => prev ?? itemsRes.error!.message);
      setProjectItems([]);
      showToast(
        "Error loading project items: " + itemsRes.error.message,
        "error"
      );
    } else if (itemsRes.data) {
      setProjectItems(itemsRes.data as ProjectItem[]);
    }

    setLoadingProjects(false);
  };

  useEffect(() => {
    if (!session?.user) {
      setProjects([]);
      setProjectItems([]);
      return;
    }
    void loadProjectsAndItems();
  }, [session?.user?.id]);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);

    const { error } = await supabase.from("projects").insert({
      name: newProjectName.trim(),
      notes: newProjectNotes.trim() || null,
    });

    if (error) {
      showToast("Error creating project: " + error.message, "error");
      setCreatingProject(false);
      return;
    }

    setNewProjectName("");
    setNewProjectNotes("");
    setCreatingProject(false);
    showToast("Project created.", "success");
    await loadProjectsAndItems();
  };

  const handleAddProjectItem = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast("Select a project first.", "error");
      return;
    }

    const desc = newItemDescription.trim();
    const model = newItemModelNumber.trim();
    const type = newItemType.trim();
    const required = parseInt(newItemRequiredQty, 10) || 0;

    if (!desc || !model || !type || required <= 0) {
      showToast(
        "Description, type, model, and required quantity are needed.",
        "error"
      );
      return;
    }

    setSavingProjectItem(true);

    const { error } = await supabase.from("project_items").insert({
      project_id: Number(selectedProjectId),
      item_id: null,
      description: desc,
      model_number: model,
      type,
      required_qty: required,
      allocated_office: 0,
      allocated_van: 0,
    });

    if (error) {
      showToast("Error adding project item: " + error.message, "error");
      setSavingProjectItem(false);
      return;
    }

    setNewItemDescription("");
    setNewItemModelNumber("");
    setNewItemType("");
    setNewItemRequiredQty("");
    setSavingProjectItem(false);
    showToast("Project item added.", "success");
    await loadProjectsAndItems();
  };

  /**
   * Allocation: take raw string IDs/qty from UI, validate here.
   */
  const handleAllocateToProject = async (
    from: "office" | "van",
    projectItemIdRaw: string,
    qtyRaw: string
  ) => {
    // Only show this toast if the raw value is *actually* empty
    if (!projectItemIdRaw) {
      showToast("Select a project item first.", "error");
      return;
    }

    const qtyNum = parseInt(qtyRaw, 10);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      showToast("Enter a valid allocation quantity.", "error");
      return;
    }

    // Find the project item by string ID match
    const pItem = projectItems.find(
      (pi) => String(pi.id) === String(projectItemIdRaw)
    );
    if (!pItem) {
      showToast("Project item not found.", "error");
      return;
    }

    const matchingInventory = inventory.find((i) => {
      const invModel = i.model_number?.toLowerCase().trim();
      const projModel = pItem.model_number?.toLowerCase().trim();
      return !!invModel && !!projModel && invModel === projModel;
    });

    if (!matchingInventory) {
      showToast(
        "No inventory item with that model number found to allocate.",
        "error"
      );
      return;
    }

    let newOffice = matchingInventory.office_qty;
    let newVan = matchingInventory.van_qty;

    if (from === "office") {
      if (newOffice < qtyNum) {
        showToast("Not enough office stock to allocate.", "error");
        return;
      }
      newOffice -= qtyNum;
    } else {
      if (newVan < qtyNum) {
        showToast("Not enough van stock to allocate.", "error");
        return;
      }
      newVan -= qtyNum;
    }

    const updates: Partial<ProjectItem> = {};
    if (from === "office") {
      updates.allocated_office = pItem.allocated_office + qtyNum;
    } else {
      updates.allocated_van = pItem.allocated_van + qtyNum;
    }

    const { error: invErr } = await supabase
      .from("inventory_items")
      .update({
        office_qty: newOffice,
        van_qty: newVan,
      })
      .eq("id", matchingInventory.id);

    if (invErr) {
      showToast("Error updating inventory: " + invErr.message, "error");
      return;
    }

    const { error: pErr } = await supabase
      .from("project_items")
      .update(updates)
      .eq("id", pItem.id);

    if (pErr) {
      showToast("Error updating project item: " + pErr.message, "error");
      return;
    }

    await supabase.from("inventory_changes").insert({
      user_id: profile?.id ?? null,
      user_email: profile?.email ?? null,
      role: profile?.role ?? null,
      item_id: matchingInventory.id,
      description: matchingInventory.description,
      model_number: matchingInventory.model_number,
      from_location: from,
      to_location: `project:${pItem.project_id}`,
      quantity: qtyNum,
    });

    showToast("Allocated to project.", "success");
    await loadProjectsAndItems();
  };

  return {
    projects,
    projectItems,
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

    loadProjectsAndItems,
  };
}
