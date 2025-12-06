// src/components/ServiceTicketPage.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  CSSProperties,
} from "react";
import type { Profile, NewServiceTicketPayload } from "../types";
import { supabase } from "../supabaseClient";
import { generateServiceTicketPdfFromPayload } from "../pdf/serviceTicketPdf";

interface Props {
  profile: Profile | null;
  saving: boolean;
  onSaveTicket: (payload: NewServiceTicketPayload) => Promise<void | unknown>;
  handleLogout: () => void;
}

interface InventoryItemForDropdown {
  id: number;
  model_number: string | null;
  description: string | null;
  service_price: number | null;
}

type MaterialRow = {
  inventory_item_id: number;
  qty: number;
  description: string;
  cost: number;
  total: number;
};

type LaborRow = {
  tech_initials: string;
  date: string;
  tech_count: number;
  rate: number;
  time_in: string;
  time_out: string;
  total_hours: number;
  total_labor: number;
};

const EDGE_FUNCTION_URL =
  "https://jylxizselxfrwhvgjqqi.supabase.co/functions/v1/upload-service-ticket";

const ServiceTicketPage: React.FC<Props> = ({
  profile,
  handleLogout,
}) => {
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItemForDropdown[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Header / customer info
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");

  const [customerPO, setCustomerPO] = useState("");
  const [technician, setTechnician] = useState("");
  const [serviceWork, setServiceWork] = useState("");

  // Materials
  const [materials, setMaterials] = useState<MaterialRow[]>([]);

  // Labor
  const [labor, setLabor] = useState<LaborRow[]>([]);

  // Signature fields
  const [signatureName, setSignatureName] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Signature modal / canvas
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (profile?.full_name && !technician) {
      setTechnician(profile.full_name);
    }
  }, [profile, technician]);

  // Load inventory for dropdown
  useEffect(() => {
    const loadInventory = async () => {
      setLoadingInventory(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select("id, model_number, description, service_price")
        .order("description", { ascending: true });

      if (error) {
        console.error(
          "Error loading inventory_items for service tickets:",
          error
        );
      } else {
        setInventoryItems((data || []) as InventoryItemForDropdown[]);
      }
      setLoadingInventory(false);
    };

    void loadInventory();
  }, []);

  const materialTotal = useMemo(
    () => materials.reduce((sum, m) => sum + (m.total || 0), 0),
    [materials]
  );

  const laborTotal = useMemo(
    () => labor.reduce((sum, l) => sum + (l.total_labor || 0), 0),
    [labor]
  );

  const grandTotal = useMemo(
    () => materialTotal + laborTotal,
    [materialTotal, laborTotal]
  );

  const addMaterialRow = () => {
    setMaterials((prev) => [
      ...prev,
      {
        inventory_item_id: 0,
        qty: 1,
        description: "",
        cost: 0,
        total: 0,
      },
    ]);
  };

  const updateMaterialRow = (index: number, partial: Partial<MaterialRow>) => {
    setMaterials((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], ...partial };
      const qty = Number(row.qty || 0);
      const cost = Number(row.cost || 0);
      row.total = qty * cost;
      copy[index] = row;
      return copy;
    });
  };

  const removeMaterialRow = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMaterialInventorySelect = (
    index: number,
    inventoryId: number
  ) => {
    const item = inventoryItems.find((i) => i.id === inventoryId);
    if (!item) return;

    updateMaterialRow(index, {
      inventory_item_id: inventoryId,
      description: item.description ?? "",
      cost: item.service_price ?? 0,
    });
  };

  const computeHours = (timeIn: string, timeOut: string): number => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(":").map(Number);
    const [outH, outM] = timeOut.split(":").map(Number);
    if (
      Number.isNaN(inH) ||
      Number.isNaN(inM) ||
      Number.isNaN(outH) ||
      Number.isNaN(outM)
    ) {
      return 0;
    }
    const start = inH * 60 + inM;
    const end = outH * 60 + outM;
    const diffMinutes = Math.max(0, end - start);
    const rawHours = diffMinutes / 60;
    const rounded = Math.round(rawHours * 4) / 4; // increments of .25
    return rounded;
  };

  const addLaborRow = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    setLabor((prev) => [
      ...prev,
      {
        tech_initials: "",
        date: dateStr,
        tech_count: 1,
        rate: 140,
        time_in: "",
        time_out: "",
        total_hours: 0,
        total_labor: 0,
      },
    ]);
  };

  const updateLaborRow = (index: number, partial: Partial<LaborRow>) => {
    setLabor((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], ...partial };

      if (partial.tech_count != null) {
        row.rate = partial.tech_count === 2 ? 170 : 140;
      }

      const rate = Number(row.rate || 0);
      const hours = computeHours(row.time_in, row.time_out);
      row.total_hours = hours;
      row.total_labor = rate * hours;

      copy[index] = row;
      return copy;
    });
  };

  const removeLaborRow = (index: number) => {
    setLabor((prev) => prev.filter((_, i) => i !== index));
  };

  // -------- Signature drawing helpers --------
  const openSignatureModal = () => {
    setIsSignatureModalOpen(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }, 0);
  };

  const closeSignatureModal = () => {
    setIsSignatureModalOpen(false);
    setIsDrawing(false);
  };

  const handleSignatureClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleSignatureStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleSignatureMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
  };

  const handleSignatureSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      closeSignatureModal();
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
    closeSignatureModal();
  };

  const buildPayload = (): NewServiceTicketPayload => {
    const payload: NewServiceTicketPayload = {
      customer_name: customerName,
      address,
      city,
      state: stateVal,
      zip,
      billing_email: billingEmail,
      billing_address: billingAddress,
      billing_city: billingCity,
      billing_state: billingState,
      billing_zip: billingZip,
      customer_po: customerPO,
      technician,
      service_work: serviceWork,
      materials,
      labor,
      material_total: materialTotal,
      labor_total: laborTotal,
      grand_total: grandTotal,
      signature_name: signatureName,
      signature_date: signatureDate,
      signature: signatureDataUrl || undefined,
    };

    console.log("Service ticket payload going to PDF:", payload);
    return payload;
  };

  const handleExportPdf = async () => {
    const payload = buildPayload();

    try {
      const pdfBytes = await generateServiceTicketPdfFromPayload(payload);

      const safeName =
        customerName.trim().replace(/[\\/:*?"<>|]/g, "_") || "customer";
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const fileName = `${safeName} ${yyyy}-${mm}-${dd}.pdf`;

      // 1) Upload to Supabase Edge function (OneDrive backend) FIRST
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
            "X-Filename": fileName,
          },
          body: pdfBytes,
        });

        console.log("upload-service-ticket status:", response.status);
        const text = await response.text();
        console.log("upload-service-ticket body:", text);
      } catch (err) {
        console.error("OneDrive upload failed (network):", err);
      }

      // 2) Local download / open AFTER upload
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      // new tab so iOS doesn't kill the JS context
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating service ticket PDF:", err);
    }
  };

  // shared grid styles
  const materialGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "0.5fr 2fr 0.8fr 0.8fr 0.4fr",
    alignItems: "center",
    columnGap: "0.5rem",
  };

  const laborGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.6fr 1.4fr 1fr 1fr 0.9fr 1.1fr 0.4fr",
    alignItems: "center",
    columnGap: "0.5rem",
  };

  return (
    <div
      className="page service-ticket-page"
      style={{ padding: "0 0.75rem 1.25rem" }}
    >
      <div style={{ width: "100%", maxWidth: 960 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "0.75rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.4rem" }}>Service Ticket</h1>
          <div style={{ flex: 1 }} />
          {profile && (
            <div style={{ fontSize: "0.85rem" }}>
              {profile.email ?? "Unknown user"}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: 999,
              border: "1px solid var(--gcss-border, #4b5563)",
              background: "transparent",
              color: "var(--gcss-fg, #f9fafb)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Logout
          </button>
        </div>

        {/* Customer Info */}
        <section className="card">
          <h2>Customer Info</h2>
          <div className="grid-two">
            <div>
              <label>Customer Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label>Technician</label>
              <input
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-two">
            <div>
              <label>Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid-three">
              <div>
                <label>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label>State</label>
                <input
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                />
              </div>
              <div>
                <label>Zip</label>
                <input value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid-two">
            <div>
              <label>Billing Email</label>
              <input
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Customer PO #</label>
              <input
                value={customerPO}
                onChange={(e) => setCustomerPO(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Billing Address (if different)</label>
            <input
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
            <div className="grid-three">
              <div>
                <label>City</label>
                <input
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                />
              </div>
              <div>
                <label>State</label>
                <input
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                />
              </div>
              <div>
                <label>Zip</label>
                <input
                  value={billingZip}
                  onChange={(e) => setBillingZip(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Service Work Performed */}
        <section className="card">
          <h2>Service Work Performed</h2>
          <textarea
            rows={5}
            value={serviceWork}
            onChange={(e) => setServiceWork(e.target.value)}
          />
        </section>

        {/* Materials Used */}
        <section className="card">
          <div className="card-header-row">
            <h2>Materials Used</h2>
            <button type="button" onClick={addMaterialRow}>
              + Add Material
            </button>
          </div>

          {loadingInventory && <div>Loading inventory…</div>}

          <div className="table materials-table">
            <div className="table-header" style={materialGridStyle}>
              <span>Qty</span>
              <span>Item</span>
              <span>Cost</span>
              <span>Total</span>
              <span />
            </div>

            {materials.map((row, index) => (
              <div
                key={index}
                className="table-row"
                style={materialGridStyle}
              >
                <span>
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={row.qty}
                    onChange={(e) =>
                      updateMaterialRow(index, { qty: Number(e.target.value) })
                    }
                  />
                </span>
                <span>
                  <select
                    value={row.inventory_item_id || 0}
                    onChange={(e) =>
                      handleMaterialInventorySelect(
                        index,
                        Number(e.target.value)
                      )
                    }
                  >
                    <option value={0}>Select item…</option>
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.model_number
                          ? `${item.model_number} | ${
                              item.description ?? ""
                            }`
                          : item.description ?? ""}
                      </option>
                    ))}
                  </select>
                </span>
                <span>
                  <input
                    type="number"
                    step={0.01}
                    value={row.cost}
                    onChange={(e) =>
                      updateMaterialRow(index, { cost: Number(e.target.value) })
                    }
                  />
                </span>
                <span>{row.total.toFixed(2)}</span>
                <span>
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(index)}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}

            <div className="table-footer" style={materialGridStyle}>
              <span />
              <span />
              <span>Material Total</span>
              <span>{materialTotal.toFixed(2)}</span>
              <span />
            </div>
          </div>
        </section>

        {/* Labor */}
        <section className="card">
          <div className="card-header-row">
            <h2>Labor</h2>
            <button type="button" onClick={addLaborRow}>
              + Add Labor
            </button>
          </div>

          <div className="table labor-table">
            <div className="table-header" style={laborGridStyle}>
              <span>Tech / Date</span>
              <span>Rate/Hr</span>
              <span>Time In</span>
              <span>Time Out</span>
              <span>Total Hours</span>
              <span>Total Labor</span>
              <span />
            </div>

            {labor.map((row, index) => (
              <div key={index} className="table-row" style={laborGridStyle}>
                <span>
                  <input
                    placeholder="Initials"
                    value={row.tech_initials}
                    onChange={(e) =>
                      updateLaborRow(index, { tech_initials: e.target.value })
                    }
                    style={{ width: "4rem", marginRight: "0.5rem" }}
                  />
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) =>
                      updateLaborRow(index, { date: e.target.value })
                    }
                  />
                </span>
                <span>
                  <select
                    value={row.tech_count}
                    onChange={(e) =>
                      updateLaborRow(index, {
                        tech_count: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>1 Tech ($140/hr)</option>
                    <option value={2}>2 Techs ($170/hr)</option>
                  </select>
                </span>
                <span>
                  <input
                    type="time"
                    value={row.time_in}
                    onChange={(e) =>
                      updateLaborRow(index, { time_in: e.target.value })
                    }
                  />
                </span>
                <span>
                  <input
                    type="time"
                    value={row.time_out}
                    onChange={(e) =>
                      updateLaborRow(index, { time_out: e.target.value })
                    }
                  />
                </span>
                <span>{row.total_hours.toFixed(2)}</span>
                <span>{row.total_labor.toFixed(2)}</span>
                <span>
                  <button
                    type="button"
                    onClick={() => removeLaborRow(index)}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}

            <div className="table-footer" style={laborGridStyle}>
              <span />
              <span />
              <span />
              <span>Labor Totals</span>
              <span />
              <span>{laborTotal.toFixed(2)}</span>
              <span />
            </div>
          </div>
        </section>

        {/* Totals + Signature */}
        <section className="card">
          <h2>Summary & Authorization</h2>

          <div className="grid-two">
            <div>
              <div className="summary-row">
                <span>Material Total</span>
                <span>{materialTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Labor Totals</span>
                <span>{laborTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <strong>Labor & Material Total</strong>
                <strong>{grandTotal.toFixed(2)}</strong>
              </div>
            </div>
            <div>
              <label>Name Printed (Customer)</label>
              <input
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
              />
              <label>Date</label>
              <input
                type="date"
                value={signatureDate}
                onChange={(e) => setSignatureDate(e.target.value)}
              />

              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <button type="button" onClick={openSignatureModal}>
                  Capture Signature
                </button>
                {signatureDataUrl && (
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    Signature captured
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="button-row"
            style={{ marginTop: "1rem", gap: "0.75rem" }}
          >
            <button type="button" onClick={handleExportPdf}>
              Export PDF
            </button>
          </div>
        </section>

        {/* Signature Modal */}
        {isSignatureModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "var(--gcss-bg, #111827)",
                padding: "1rem",
                borderRadius: 8,
                width: "90%",
                maxWidth: 500,
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                Customer Signature
              </h3>
              <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                Sign inside the box below.
              </p>
              <div
                style={{
                  border: "1px solid #4b5563",
                  borderRadius: 4,
                  background: "#ffffff",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  style={{
                    width: "100%",
                    height: "200px",
                    touchAction: "none",
                  }}
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onMouseLeave={handleSignatureEnd}
                  onTouchStart={handleSignatureStart}
                  onTouchMove={handleSignatureMove}
                  onTouchEnd={handleSignatureEnd}
                />
              </div>
              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <button type="button" onClick={handleSignatureClear}>
                  Clear
                </button>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <button type="button" onClick={closeSignatureModal}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleSignatureSave}>
                    Save Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTicketPage;
