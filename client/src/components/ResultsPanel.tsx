import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FOIRGauge from "./FOIRGauge";
import AmortizationChart from "./AmortizationChart";
import MoratoriumChart from "./MoratoriumChart";
import { formatINR, getRiskBandInfo } from "../utils/helpers";
import { useWizardStore, useAuthStore } from "../store";
import api from "../services/api";
import toast from "react-hot-toast";
import type { WizardResults } from "../store";

interface ResultsPanelProps {
  results: WizardResults;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const { summary, inflatedCostBreakdown, moratoriumBreakdown, amortizationSchedule } = results;
  const { step1, step2, planName, setPlanName } = useWizardStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const bandInfo = getRiskBandInfo(summary.riskBand);

  const handleSavePlan = async () => {
    if (!isAuthenticated()) {
      toast.error("Please log in to save your plan");
      navigate("/login");
      return;
    }
    if (!planName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/plans", {
        name: planName,
        ...step1,
        ...step2,
      });
      toast.success("Plan saved! View it in your dashboard.");
      navigate("/dashboard");
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === "PLAN_LIMIT_REACHED") {
        toast.error("Free tier allows 1 saved plan. Upgrade to Plus or Pro!");
      } else {
        toast.error(err.response?.data?.error || "Failed to save plan");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeInUp">
      {/* Risk band hero */}
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${bandInfo.color}18 0%, transparent 70%)`,
          borderRadius: "var(--radius-lg)",
          marginBottom: "32px",
          border: `1px solid ${bandInfo.color}25`,
        }}
      >
        <FOIRGauge foir={summary.foir} riskBand={summary.riskBand} size={240} />
        <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "0.9rem" }}>
          {bandInfo.description}
        </p>
      </div>

      {/* Key metrics grid */}
      <div className="grid-4" style={{ marginBottom: "32px" }}>
        <div className="metric-card">
          <div className="metric-label">Monthly EMI</div>
          <div className="metric-value" style={{ color: "var(--primary)" }}>
            {formatINR(summary.emi)}
          </div>
          <div className="metric-sub">starting after moratorium</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Inflated Cost</div>
          <div className="metric-value">{formatINR(summary.totalInflatedExpense, true)}</div>
          <div className="metric-sub">tuition + living (inflation-adjusted)</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Moratorium Interest</div>
          <div className="metric-value" style={{ color: "#f97316" }}>
            +{formatINR(summary.interestAccruedDuringMoratorium, true)}
          </div>
          <div className="metric-sub">accrued before repayment starts</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Repayment</div>
          <div className="metric-value">{formatINR(summary.totalRepayment, true)}</div>
          <div className="metric-sub">
            inc. {formatINR(summary.totalInterestPaid, true)} interest
          </div>
        </div>
      </div>

      {/* Salary vs EMI bar */}
      <div className="card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Income vs Loan Obligation</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            EMI {formatINR(summary.emi)}/mo
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Salary {formatINR(summary.estimatedMonthlySalary)}/mo
          </span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(summary.foir, 100)}%`,
              background: `linear-gradient(90deg, ${bandInfo.color}cc, ${bandInfo.color})`,
              borderRadius: "999px",
              transition: "width 1s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>0%</span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            30% Safe · 45% Moderate
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>100%</span>
        </div>
      </div>

      {/* Charts */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <MoratoriumChart
          breakdown={moratoriumBreakdown}
          principal={step2?.principal || 0}
          accrualType={step2?.accrualType || "COMPOUND"}
        />
      </div>

      <div className="card" style={{ marginBottom: "32px" }}>
        <AmortizationChart schedule={amortizationSchedule} />
      </div>

      {/* Inflated cost breakdown */}
      <div className="card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Year-by-Year Inflated Cost Breakdown</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {inflatedCostBreakdown.map((row) => (
            <div
              key={row.year}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Year {row.year}</span>
              <div style={{ display: "flex", gap: "24px" }}>
                <span style={{ color: "var(--primary-light)", fontSize: "0.875rem" }}>
                  Tuition: {formatINR(row.tuition)}
                </span>
                <span style={{ color: "#8b8aa0", fontSize: "0.875rem" }}>
                  Living: {formatINR(row.living)}
                </span>
                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                  Total: {formatINR(row.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save plan section */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(108,71,255,0.12), rgba(108,71,255,0.04))",
          border: "1px solid rgba(108,71,255,0.25)",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>💾 Save This Plan</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
          {isAuthenticated()
            ? user?.tier === "FREE"
              ? "Save this plan to revisit it later. Upgrade to Plus or Pro for unlimited saves + AI risk reports."
              : "Save this plan to your dashboard. Plus & Pro users get AI-powered risk reports."
            : "Create a free account to save and compare multiple loan scenarios."}
        </p>

        {isAuthenticated() ? (
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              id="plan-name-input"
              type="text"
              className="form-input"
              placeholder="e.g. MS Computer Science - IIT Delhi"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              aria-label="Plan name"
            />
            <button
              className="btn btn-primary"
              onClick={handleSavePlan}
              disabled={saving}
              style={{ flexShrink: 0 }}
            >
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Create Free Account
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/login")}>
              Log In
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p
        style={{
          textAlign: "center",
          color: "var(--text-dim)",
          fontSize: "0.75rem",
          marginTop: "24px",
          lineHeight: 1.6,
        }}
      >
        ⚠️ EduCap provides estimates and financial education, not licensed financial advice.
        All projections are based on inputs provided and carry inherent assumptions about future inflation and salary outcomes.
        Consult a certified financial advisor before making borrowing decisions.
      </p>
    </div>
  );
}
