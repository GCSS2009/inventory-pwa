// src/components/PricingPage.tsx
import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

interface PricingPageProps {
  session: Session | null;
}

interface PricingItem {
  id: string;
  description: string;
  model_number: string;
  manufacturer: string;
  service_price: number | null;
  dealer_price: number | null;
  dealer_source: string | null;
  dealer_last_checked: string | null; // ISO string
}

// Decide whether to use Honeywell or ADI for a given item.
// You can tweak this logic later as you see how your data is stored.
function detectVendor(item: PricingItem): "honeywell" | "adi" {
  const m = (item.manufacturer || "").toLowerCase();
  const model = (item.model_number || "").toLowerCase();

  // Rough heuristics for FCI → Honeywell
  if (
    m.includes("fci") ||
    m.includes("gamewell") ||
    m.includes("gamewell-fci") ||
    model.startsWith("fci")
  ) {
    return "honeywell";
  }

  // Everything else → ADI
  return "adi";
}

const PricingPage: React.FC<PricingPageProps> = ({ session }) => {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savingServiceId, setSavingServiceId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Load inventory items with pricing fields
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("inventory_items")
          .select(
            "id, description, model_number, manufacturer, service_price, dealer_price, dealer_source, dealer_last_checked"
          )
          .order("description", { ascending: true });

        if (error) {
          setError(error.message);
          setItems([]);
        } else {
          setItems(
            (data ?? []).map((row: any) => ({
              id: String(row.id),
              description: row.description ?? "",
              model_number: row.model_number ?? "",
              manufacturer: row.manufacturer ?? "",
              service_price:
                row.service_price !== null ? Number(row.service_price) : null,
              dealer_price:
                row.dealer_price !== null ? Number(row.dealer_price) : null,
              dealer_source: row.dealer_source,
              dealer_last_checked: row.dealer_last_checked,
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load pricing data.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatPrice = (value: number | null) => {
    if (value == null || Number.isNaN(value)) return "-";
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  // Handle changing your manual service price
  const handleServicePriceChange = async (
    id: string,
    value: string
  ): Promise<void> => {
    const num = value.trim() === "" ? null : Number(value);
    if (value.trim() !== "" && Number.isNaN(num)) {
      alert("Service price must be a number.");
      return;
    }

    setSavingServiceId(id);

    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({ service_price: num })
        .eq("id", Number(id)); // id is stored as string here, cast back to number

      if (error) {
        console.error("Error updating service price:", error.message);
        alert("Failed to update service price: " + error.message);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, service_price: num } : item
        )
      );
    } finally {
      setSavingServiceId(null);
    }
  };

  const computeSuggestedSell = (dealerPrice: number | null) => {
    if (dealerPrice == null || Number.isNaN(dealerPrice)) return null;
    return dealerPrice * 1.5; // 50% markup
  };

  // Call backend to refresh dealer price for a single item
  const handleRefreshDealerPrice = async (item: PricingItem) => {
    if (!item.model_number) {
      alert("Item has no model number to look up.");
      return;
    }

    const backendBase = import.meta.env.VITE_PRICING_BACKEND_URL as
      | string
      | undefined;

    if (!backendBase) {
      alert(
        "VITE_PRICING_BACKEND_URL is not set. Configure it in your .env file."
      );
      return;
    }

    const vendor = detectVendor(item);

    setRefreshingId(item.id);

    try {
      const res = await fetch(
        backendBase.replace(/\/$/, "") + "/dealer-price",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_number: item.model_number,
            vendor,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", res.status, text);
        alert("Failed to refresh dealer price: " + res.status);
        return;
      }

      const data = await res.json();

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                dealer_price:
                  data.dealer_price != null
                    ? Number(data.dealer_price)
                    : row.dealer_price,
                dealer_source: data.dealer_source ?? vendor,
                dealer_last_checked:
                  data.dealer_last_checked ?? row.dealer_last_checked,
              }
            : row
        )
      );
    } catch (err: any) {
      console.error("Error calling pricing backend:", err);
      alert("Error calling pricing backend: " + err.message);
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="page pricing-page">
      <header className="page-header">
        <h1>Pricing</h1>
        <p className="page-subtitle">
          View inventory with your pricing, dealer pricing, and suggested sell.
        </p>
      </header>

      <section className="card">
        <div className="card-body">
          {error && (
            <div
              style={{
                marginBottom: "0.75rem",
                color: "#dc2626",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          {loading && <p>Loading pricing data…</p>}

          {!loading && items.length === 0 && !error && (
            <p>No inventory items found.</p>
          )}

          {!loading && items.length > 0 && (
            <div className="table-responsive">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Model / Part #</th>
                    <th>Manufacturer</th>
                    <th>Your Service Price</th>
                    <th>Dealer Price</th>
                    <th>Suggested Sell (50% markup)</th>
                    <th>Dealer Source</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const suggested = computeSuggestedSell(item.dealer_price);
                    const vendor = detectVendor(item);

                    return (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td>{item.model_number}</td>
                        <td>{item.manufacturer || "-"}</td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={
                              item.service_price != null
                                ? item.service_price.toString()
                                : ""
                            }
                            onBlur={(e) =>
                              handleServicePriceChange(
                                item.id,
                                e.target.value
                              )
                            }
                            style={{
                              width: "6rem",
                              fontSize: "0.8rem",
                              padding: "0.15rem 0.25rem",
                            }}
                            disabled={savingServiceId === item.id}
                          />
                        </td>
                        <td>{formatPrice(item.dealer_price)}</td>
                        <td>
                          {suggested != null ? formatPrice(suggested) : "-"}
                        </td>
                        <td>{item.dealer_source || vendor}</td>
                        <td>{formatDate(item.dealer_last_checked)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRefreshDealerPrice(item)}
                            disabled={refreshingId === item.id}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.2rem 0.5rem",
                              cursor:
                                refreshingId === item.id
                                  ? "default"
                                  : "pointer",
                            }}
                          >
                            {refreshingId === item.id
                              ? "Refreshing..."
                              : "Refresh dealer price"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
