import { useEffect, useState } from "react";
import { useAuthStore } from "../store";
import api from "../services/api";
import { formatINR, getRiskBandInfo } from "../utils/helpers";
import toast from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  degree: string;
  institution: string;
  principal: number;
  interestRate: number;
  moratoriumMonths: number;
  repaymentMonths: number;
  computedResults: any;
  riskReport: any;
}

function DeltaBadge({ a, b, lowerIsBetter = false }: { a: number; b: number; lowerIsBetter?: boolean }) {
  const delta = b - a;
  if (Math.abs(delta) < 0.01) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>;
  const better = lowerIsBetter ? delta < 0 : delta > 0;
  return (
    <span
      style={{
        fontSize: "0.8rem",
        color: better ? "var(--safe)" : "var(--danger)",
        fontWeight: 600,
      }}
    >
      {delta > 0 ? "+" : ""}
      {typeof a === typeof 0 && Math.abs(delta) > 1000
        ? formatINR(delta, true)
        : delta.toFixed(1)}
      {better ? " ✓" : " ✗"}
    </span>
  );
}

function CompareRow({ label, a, b, format, lowerIsBetter }: {
  label: string;
  a: number;
  b: number;
  format: (v: number) => string;
  lowerIsBetter?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "16px",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontWeight: 700, textAlign: "center" }}>{format(a)}</div>
      <div style={{ fontWeight: 700, textAlign: "center" }}>
        {format(b)}{" "}
        <DeltaBadge a={a} b={b} lowerIsBetter={lowerIsBetter} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [planA, setPlanA] = useState<string>("");
  const [planB, setPlanB] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated()) return;
    api.get("/api/plans").then(({ data }) => setPlans(data.plans)).catch(() => {
      toast.error("Failed to load plans");
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const pA = plans.find((p) => p.id === planA);
  const pB = plans.find((p) => p.id === planB);

  if (loading) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2>Log in to compare plans</h2>
      </div>
    );
  }

  if (plans.length < 2) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚖️</div>
        <h2 style={{ marginBottom: "8px", color: "var(--text)" }}>Compare Plans</h2>
        <p>You need at least 2 saved plans to compare. Go to the wizard to create another plan.</p>
      </div>
    );
  }

  const INR = (v: number) => formatINR(v, true);
  const PCT = (v: number) => `${v.toFixed(2)}%`;

  return (
    <div style={{ padding: "48px 0", minHeight: "calc(100vh - 80px)" }}>
      <div className="container">
        <h1 style={{ marginBottom: "8px" }}>⚖️ Compare Plans</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
          Select two saved plans to see side-by-side metrics with delta highlighting.
        </p>

        {/* Plan selectors */}
        <div className="grid-2" style={{ marginBottom: "40px" }}>
          {(["A", "B"] as const).map((label) => {
            const val = label === "A" ? planA : planB;
            const setter = label === "A" ? setPlanA : setPlanB;
            const other = label === "A" ? planB : planA;

            return (
              <div
                key={label}
                className="card"
                style={{
                  border: `1px solid ${label === "A" ? "var(--primary)" : "rgba(139,106,255,0.5)"}40`,
                  background: `linear-gradient(135deg, rgba(108,71,255,${label === "A" ? "0.12" : "0.06"}), transparent)`,
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Plan {label}
                </div>
                <select
                  className="form-input"
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  aria-label={`Select Plan ${label}`}
                  id={`plan-${label.toLowerCase()}-select`}
                >
                  <option value="">— Select a plan —</option>
                  {plans.filter((p) => p.id !== other).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {val && plans.find((p) => p.id === val) && (
                  <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {plans.find((p) => p.id === val)?.degree} · {plans.find((p) => p.id === val)?.institution}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        {pA && pB ? (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                padding: "16px",
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Metric</div>
              <div style={{ fontWeight: 700, textAlign: "center", color: "var(--primary-light)" }}>📋 {pA.name}</div>
              <div style={{ fontWeight: 700, textAlign: "center", color: "#8b6aff" }}>📋 {pB.name}</div>
            </div>

            {/* Risk bands */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                padding: "16px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Risk Band</div>
              {[pA, pB].map((p) => {
                const band = p.riskReport?.riskBand;
                const info = band ? getRiskBandInfo(band) : null;
                return (
                  <div key={p.id} style={{ textAlign: "center" }}>
                    {info ? (
                      <span className={`badge ${info.bgClass}`}>{info.emoji} {info.label}</span>
                    ) : "—"}
                  </div>
                );
              })}
            </div>

            <CompareRow label="Monthly EMI" a={pA.computedResults?.emi || 0} b={pB.computedResults?.emi || 0} format={INR} lowerIsBetter />
            <CompareRow label="FOIR %" a={pA.riskReport?.foirPercent || 0} b={pB.riskReport?.foirPercent || 0} format={PCT} lowerIsBetter />
            <CompareRow label="Loan Principal" a={pA.principal} b={pB.principal} format={INR} lowerIsBetter />
            <CompareRow label="Interest Rate" a={pA.interestRate} b={pB.interestRate} format={(v) => `${v}%`} lowerIsBetter />
            <CompareRow label="Moratorium" a={pA.moratoriumMonths} b={pB.moratoriumMonths} format={(v) => `${v} months`} lowerIsBetter />
            <CompareRow label="Moratorium Interest" a={pA.computedResults?.moratorium?.interestAccruedDuringMoratorium || 0} b={pB.computedResults?.moratorium?.interestAccruedDuringMoratorium || 0} format={INR} lowerIsBetter />
            <CompareRow label="Balance After Moratorium" a={pA.computedResults?.moratorium?.principalAfterMoratorium || 0} b={pB.computedResults?.moratorium?.principalAfterMoratorium || 0} format={INR} lowerIsBetter />
            <CompareRow label="Total Repayment" a={pA.computedResults?.totalRepayment || 0} b={pB.computedResults?.totalRepayment || 0} format={INR} lowerIsBetter />
            <CompareRow label="Total Interest Paid" a={pA.computedResults?.totalInterestPaid || 0} b={pB.computedResults?.totalInterestPaid || 0} format={INR} lowerIsBetter />
            <CompareRow label="Repayment Tenure" a={pA.repaymentMonths} b={pB.repaymentMonths} format={(v) => `${v} months`} lowerIsBetter />
            <CompareRow label="Estimated Salary Min" a={pA.riskReport?.salaryRangeMin || 0} b={pB.riskReport?.salaryRangeMin || 0} format={INR} />
            <CompareRow label="Estimated Salary Max" a={pA.riskReport?.salaryRangeMax || 0} b={pB.riskReport?.salaryRangeMax || 0} format={INR} />
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              color: "var(--text-muted)",
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            Select two plans above to see the comparison
          </div>
        )}
      </div>
    </div>
  );
}
