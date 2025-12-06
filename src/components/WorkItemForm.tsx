// src/components/WorkItemForm.tsx
import React, { useMemo, useState } from "react";
import type { Profile, WorkItem, WorkType } from "../types";

interface WorkItemFormProps {
  profile: Profile | null;
  employees: Profile[];
  isAdmin: boolean;
  value: Partial<WorkItem>;
  onChange: (next: Partial<WorkItem>) => void;
  onSave: (outlookBody: string) => Promise<void>;
  saving: boolean;
}

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  service_call: "Service Call",
  installation: "Installation",
  inspection: "Inspection",
};

// ---------- helpers for UTC <-> datetime-local ----------

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Convert a stored UTC ISO string -> "yyyy-MM-ddTHH:mm" in **local time**
 * for <input type="datetime-local" />.
 */
function utcIsoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return (
    `${d.getFullYear()}-` +
    `${pad2(d.getMonth() + 1)}-` +
    `${pad2(d.getDate())}T` +
    `${pad2(d.getHours())}:` +
    `${pad2(d.getMinutes())}`
  );
}

/**
 * Convert "yyyy-MM-ddTHH:mm" (interpreted as **local time**) -> UTC ISO string.
 */
function localInputToUtcIso(input: string): string | null {
  if (!input) return null;
  const [datePart, timePart] = input.split("T");
  if (!datePart || !timePart) return null;

  const [yStr, mStr, dStr] = datePart.split("-");
  const [hStr, minStr] = timePart.split(":");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const hh = Number(hStr);
  const mm = Number(minStr);

  if (
    Number.isNaN(y) ||
    Number.isNaN(m) ||
    Number.isNaN(d) ||
    Number.isNaN(hh) ||
    Number.isNaN(mm)
  ) {
    return null;
  }

  const localDate = new Date(y, m - 1, d, hh, mm, 0, 0); // local time
  return localDate.toISOString(); // converts to UTC iso
}

// --------------------------------------------------------

const WorkItemForm: React.FC<WorkItemFormProps> = ({
  profile,
  employees,
  isAdmin,
  value,
  onChange,
  onSave,
  saving,
}) => {
  const workItem = value ?? {};
  const role = profile?.role;

  const technicianEmails = useMemo(() => {
    if (!workItem.technician_email) return [];
    return workItem.technician_email
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [workItem.technician_email]);

  const [newTechEmail, setNewTechEmail] = useState<string>("");

  function updateField<K extends keyof WorkItem>(key: K, val: WorkItem[K]) {
    onChange({
      ...workItem,
      [key]: val,
    });
  }

  function setTechnicianEmails(list: string[]) {
    updateField("technician_email", list.join(", "));
  }

  function handleAddTech() {
    const email = newTechEmail.trim();
    if (!email) return;
    if (technicianEmails.includes(email)) {
      setNewTechEmail("");
      return;
    }
    setTechnicianEmails([...technicianEmails, email]);
    setNewTechEmail("");
  }

  function handleAddTechFromDropdown(e: React.ChangeEvent<HTMLSelectElement>) {
    const email = e.target.value;
    if (!email) return;
    if (technicianEmails.includes(email)) return;
    setTechnicianEmails([...technicianEmails, email]);
  }

  function handleRemoveTech(email: string) {
    setTechnicianEmails(technicianEmails.filter((t) => t !== email));
  }

  const work_type: WorkType =
    (workItem.work_type as WorkType) ?? "service_call";

  const previewBody = useMemo(() => {
    const lines: string[] = [];

    // Address + Maps link
    const addrParts = [
      workItem.address ?? "",
      workItem.city ?? "",
      workItem.state ?? "",
      workItem.zip ?? "",
    ]
      .map((p) => p.trim())
      .filter(Boolean);

    const addressLine = addrParts.join(", ");
    const mapsUrl =
      addrParts.length > 0
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            addressLine
          )}`
        : "";

    if (addressLine) {
      lines.push(`Address: ${addressLine}`);
      if (mapsUrl) {
        lines.push(`Maps: ${mapsUrl}`);
      }
      lines.push("");
    }

    if (work_type === "service_call") {
      lines.push(`Service Note: ${workItem.service_note ?? ""}`.trim());
      lines.push("");
      lines.push("On-Site Contact:");
      lines.push(`• Name: ${workItem.onsite_contact_name ?? ""}`);
      lines.push(`• Phone Number: ${workItem.onsite_contact_phone ?? ""}`);
      lines.push("");
      lines.push(
        "-----------------------------------------------------------------------------------------------------------------------------------------"
      );
      lines.push(`Progress Entry: ${workItem.progress_percent ?? 0}%`);
      lines.push("");
      lines.push(
        `Progress/Resolution Notes: ${
          workItem.service_resolution_notes ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        `Additional Parts Needed: ${
          workItem.additional_parts ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        `Sales Opportunity: ${workItem.sales_opportunity ?? ""}`.trim()
      );
    } else if (work_type === "installation") {
      lines.push(
        `Installation Note: ${workItem.installation_note ?? ""}`.trim()
      );
      lines.push("");
      lines.push("On-Site Contact:");
      lines.push(`• Name: ${workItem.onsite_contact_name ?? ""}`);
      lines.push(`• Phone Number: ${workItem.onsite_contact_phone ?? ""}`);
      lines.push("");
      lines.push(
        "-----------------------------------------------------------------------------------------------------------------------------------------"
      );
      lines.push(`Progress Entry: ${workItem.progress_percent ?? 0}%`);
      lines.push("");
      lines.push(
        `Resolution Notes: ${
          workItem.installation_resolution_notes ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        `Additional Parts Needed: ${
          workItem.additional_parts ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        `Sales Opportunity: ${workItem.sales_opportunity ?? ""}`.trim()
      );
    } else {
      // inspection
      lines.push("Inspection");
      lines.push("");
      lines.push("On-Site Contact:");
      lines.push(`• Name: ${workItem.onsite_contact_name ?? ""}`);
      lines.push(`• Phone Number: ${workItem.onsite_contact_phone ?? ""}`);
      lines.push("");
      lines.push(
        `Special Notes: ${
          workItem.inspection_special_notes ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        "-----------------------------------------------------------------------------------------------------------------------------------------"
      );
      lines.push(`Progress Entry: ${workItem.progress_percent ?? 0}%`);
      lines.push("");
      lines.push(
        `Progress/Resolution Notes: ${
          workItem.inspection_resolution_notes ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        `Additional Parts Needed: ${
          workItem.additional_parts ?? ""
        }`.trim()
      );
      lines.push("");
      lines.push(
        `Sales Opportunity?: ${workItem.sales_opportunity ?? ""}`.trim()
      );
    }

    return lines.join("\n");
  }, [work_type, workItem]);

  const readonly = !isAdmin && role !== "admin";

  return (
    <div
      className="text-sm w-full max-w-4xl mx-auto"
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      <h2 className="text-base font-semibold mb-1">
        {workItem.id ? "Edit Job" : "New Job"}
      </h2>

      {/* Work type & customer */}
      <div className="grid grid-cols-1 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">Work Type</span>
          <select
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            value={work_type}
            disabled={readonly}
            onChange={(e) =>
              updateField("work_type", e.target.value as WorkType)
            }
          >
            <option value="service_call">Service Call</option>
            <option value="installation">Installation</option>
            <option value="inspection">Inspection</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">Customer / Location</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            value={workItem.customer_name ?? ""}
            disabled={readonly}
            onChange={(e) => updateField("customer_name", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">
            Title (Calendar Subject)
          </span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            value={workItem.title ?? ""}
            disabled={readonly}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">Address</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={workItem.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">City</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={workItem.city ?? ""}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">State</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={workItem.state ?? ""}
            onChange={(e) => updateField("state", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">ZIP</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={workItem.zip ?? ""}
            onChange={(e) => updateField("zip", e.target.value)}
          />
        </label>
      </div>

      {/* Timing (UTC storage, local input) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">Start Time</span>
          <input
            type="datetime-local"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={utcIsoToLocalInput(workItem.start_time as string | null)}
            onChange={(e) =>
              updateField("start_time", localInputToUtcIso(e.target.value))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">End Time</span>
          <input
            type="datetime-local"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={utcIsoToLocalInput(workItem.end_time as string | null)}
            onChange={(e) =>
              updateField("end_time", localInputToUtcIso(e.target.value))
            }
          />
        </label>
      </div>

      {/* On-site contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">On-Site Contact Name</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            value={workItem.onsite_contact_name ?? ""}
            disabled={readonly}
            onChange={(e) =>
              updateField("onsite_contact_name", e.target.value)
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">On-Site Contact Phone</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            value={workItem.onsite_contact_phone ?? ""}
            disabled={readonly}
            onChange={(e) =>
              updateField("onsite_contact_phone", e.target.value)
            }
          />
        </label>
      </div>

      {/* Technicians */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-300">Technicians</span>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-xs"
            disabled={readonly}
            onChange={handleAddTechFromDropdown}
            value=""
          >
            <option value="">Select technician…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.email ?? ""}>
                {emp.full_name ?? emp.email ?? emp.id}
              </option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Add email manually"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-xs"
            disabled={readonly}
            value={newTechEmail}
            onChange={(e) => setNewTechEmail(e.target.value)}
          />
          <button
            type="button"
            className="px-2 py-1 rounded bg-slate-700 text-slate-100 text-xs"
            disabled={readonly}
            onClick={handleAddTech}
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {technicianEmails.length === 0 && (
            <span className="text-xs text-slate-400 italic">
              No technicians assigned
            </span>
          )}
          {technicianEmails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-100 text-xs"
            >
              {email}
              {!readonly && (
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-200"
                  onClick={() => handleRemoveTech(email)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Progress / sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">Progress (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={workItem.progress_percent ?? 0}
            onChange={(e) =>
              updateField(
                "progress_percent",
                Number.isNaN(Number(e.target.value))
                  ? 0
                  : Number(e.target.value)
              )
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-300">Sales Opportunity</span>
          <input
            type="text"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm"
            disabled={readonly}
            value={workItem.sales_opportunity ?? ""}
            onChange={(e) =>
              updateField("sales_opportunity", e.target.value)
            }
          />
        </label>
      </div>

      {/* Work-type specific notes */}
      {work_type === "service_call" && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">Service Note</span>
            <textarea
              className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
              disabled={readonly}
              value={workItem.service_note ?? ""}
              onChange={(e) =>
                updateField("service_note", e.target.value)
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">
              Progress / Resolution Notes
            </span>
            <textarea
              className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
              disabled={readonly}
              value={workItem.service_resolution_notes ?? ""}
              onChange={(e) =>
                updateField("service_resolution_notes", e.target.value)
              }
            />
          </label>
        </>
      )}

      {work_type === "installation" && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">Installation Note</span>
            <textarea
              className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
              disabled={readonly}
              value={workItem.installation_note ?? ""}
              onChange={(e) =>
                updateField("installation_note", e.target.value)
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">Resolution Notes</span>
            <textarea
              className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
              disabled={readonly}
              value={workItem.installation_resolution_notes ?? ""}
              onChange={(e) =>
                updateField(
                  "installation_resolution_notes",
                  e.target.value
                )
              }
            />
          </label>
        </>
      )}

      {work_type === "inspection" && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">Special Notes</span>
            <textarea
              className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
              disabled={readonly}
              value={workItem.inspection_special_notes ?? ""}
              onChange={(e) =>
                updateField(
                  "inspection_special_notes",
                  e.target.value
                )
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">
              Progress / Resolution Notes
            </span>
            <textarea
              className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
              disabled={readonly}
              value={workItem.inspection_resolution_notes ?? ""}
              onChange={(e) =>
                updateField(
                  "inspection_resolution_notes",
                  e.target.value
                )
              }
            />
          </label>
        </>
      )}

      {/* Additional parts */}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-300">Additional Parts Needed</span>
        <textarea
          className="border border-slate-600 rounded px-2 py-1 bg-slate-900 text-slate-100 text-sm min-h-[60px]"
          disabled={readonly}
          value={workItem.additional_parts ?? ""}
          onChange={(e) =>
            updateField("additional_parts", e.target.value)
          }
        />
      </label>

      {/* Preview */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-300">Outlook Body Preview</span>
        <pre className="border border-slate-700 rounded px-2 py-2 bg-slate-950 text-xs text-slate-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
          {previewBody}
        </pre>
      </div>

      {isAdmin && (
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded bg-red-600 text-white text-sm disabled:opacity-60"
          disabled={saving}
          onClick={() => void onSave(previewBody)}
        >
          {saving ? "Saving..." : "Save Job"}
        </button>
      )}
    </div>
  );
};

export default WorkItemForm;
