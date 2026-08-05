import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, useWizardStore } from "../store";
import api from "../services/api";
import { formatINR, getRiskBandInfo } from "../utils/helpers";
import toast from "react-hot-toast";
import SubscriptionManager from "../components/SubscriptionManager";
import PricingGrid from "../components/PricingGrid";

interface Plan {
  id: string;
  name: string;
  degree: string;
  institution: string;
  city: string;
  durationYears: number;
  principal: number;
  interestRate: number;
  moratoriumMonths: number;
  createdAt: string;
  computedResults: any;
  riskReport: {
    foirPercent: number;
    riskBand: "SAFE" | "MODERATE" | "HIGH_STRESS";
    aiSummary: string;
    mitigationSuggestions: string;
    salaryRangeMin: number;
    salaryRangeMax: number;
  } | null;
}

export default function DashboardPage() {
  const { user, isPlus, isPro } = useAuthStore();
  const { reset } = useWizardStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/plans").then(({ data }) => setPlans(data.plans)).catch(() => {
      toast.error("Failed to load plans");
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      toast.success("Plan deleted");
    } catch {
      toast.error("Failed to delete plan");
    } finally {
      setDeleting(null);
    }
  };

  const handleNewPlan = () => {
    reset();
    navigate("/wizard");
  };

  const handleExport = async (id: string) => {
    try {
      const response = await api.get(`/api/plans/${id}/export`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EduCap-Plan-${id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("PDF export requires a Plus or Pro subscription. Upgrade to download reports.");
      } else {
        toast.error("Export failed");
      }
    }
  };

  return (
    <div style={{ padding: "48px 0", minHeight: "calc(100vh - 80px)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "6px" }}>My Plans</h1>
            <p style={{ color: "var(--text-muted)" }}>
              Welcome back, <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
              {" "}·{" "}
              <span style={{ color: isPlus() ? "var(--primary-light)" : "var(--moderate)", fontWeight: 600 }}>
                {user?.tier} tier
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {plans.length >= 2 && (
              <Link to="/compare" className="btn btn-secondary" id="compare-plans-btn">
                ⚖️ Compare Plans
              </Link>
            )}
            <button className="btn btn-primary" onClick={handleNewPlan} id="new-plan-btn">
              + New Plan
            </button>
          </div>
        </div>

        {/* Subscription Manager */}
        <div style={{ marginBottom: "32px" }}>
          <SubscriptionManager />
        </div>
        
        {/* Pricing Grid */}
        <div id="pricing" style={{ marginBottom: "48px" }}>
          <PricingGrid currentTier={user?.tier} />
        </div>

        {/* Plans grid */}
        {loading ? (
          <div className="grid-2">
            {[1, 2].map((i) => (
              <div key={i} className="card" style={{ height: "200px" }}>
                <div className="loading-shimmer" style={{ height: "24px", width: "60%", marginBottom: "12px" }} />
                <div className="loading-shimmer" style={{ height: "16px", width: "40%", marginBottom: "8px" }} />
                <div className="loading-shimmer" style={{ height: "16px", width: "80%" }} />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📋</div>
            <h3 style={{ marginBottom: "8px", color: "var(--text)" }}>No plans yet</h3>
            <p style={{ marginBottom: "24px" }}>Create your first loan plan to see your risk analysis here.</p>
            <button className="btn btn-primary btn-lg" onClick={handleNewPlan} id="first-plan-btn">
              Create My First Plan →
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {plans.map((plan) => {
              const band = plan.riskReport?.riskBand;
              const bandInfo = band ? getRiskBandInfo(band) : null;
              const computed = plan.computedResults as any;

              return (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    borderLeft: bandInfo ? `3px solid ${bandInfo.color}` : undefined,
                  }}
                >
                  {/* Plan header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{plan.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {plan.degree} · {plan.institution}, {plan.city}
                      </p>
                    </div>
                    {bandInfo && (
                      <div className={`badge ${bandInfo.bgClass}`} style={{ flexShrink: 0 }}>
                        {bandInfo.emoji} {bandInfo.label}
                      </div>
                    )}
                  </div>

                  {/* Key metrics */}
                  <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>EMI</div>
                      <div style={{ fontWeight: 700, color: "var(--primary-light)" }}>
                        {formatINR(computed?.emi || 0)}/mo
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>FOIR</div>
                      <div style={{ fontWeight: 700, color: bandInfo?.color }}>
                        {plan.riskReport?.foirPercent?.toFixed(1) || "—"}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Principal</div>
                      <div style={{ fontWeight: 700 }}>{formatINR(plan.principal, true)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rate</div>
                      <div style={{ fontWeight: 700 }}>{plan.interestRate}%</div>
                    </div>
                  </div>

                  {/* Salary range */}
                  {plan.riskReport?.salaryRangeMin && (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      💼 Estimated salary: {formatINR(plan.riskReport.salaryRangeMin)}&nbsp;–&nbsp;
                      {formatINR(plan.riskReport.salaryRangeMax)}/mo
                    </div>
                  )}

                  {/* Date */}
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "16px" }}>
                    Saved {new Date(plan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleExport(plan.id)}
                      title={!isPlus() ? "Plus/Pro feature" : "Export PDF"}
                      style={{ opacity: isPlus() ? 1 : 0.5 }}
                    >
                      📄 Export PDF
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(plan.id)}
                      disabled={deleting === plan.id}
                      style={{ color: "var(--danger)", marginLeft: "auto" }}
                    >
                      {deleting === plan.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
