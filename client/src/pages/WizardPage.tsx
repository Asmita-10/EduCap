import { useState } from "react";
import { useWizardStore } from "../store";
import WizardStep1 from "./WizardStep1";
import WizardStep2 from "./WizardStep2";
import ResultsPanel from "../components/ResultsPanel";
import api from "../services/api";
import toast from "react-hot-toast";

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: "Academic Profile" },
    { n: 2, label: "Loan Terms" },
    { n: 3, label: "Results" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div
              className={`step-dot ${current === s.n ? "active" : current > s.n ? "completed" : "pending"}`}
              aria-current={current === s.n ? "step" : undefined}
            >
              {current > s.n ? "✓" : s.n}
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                color: current === s.n ? "var(--text)" : "var(--text-muted)",
                fontWeight: current === s.n ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`step-line ${current > s.n ? "completed" : ""}`}
              style={{ margin: "0 8px", marginBottom: "20px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function WizardPage() {
  const { step, step1, step2, setStep, setResults, results } = useWizardStore();
  const [loading, setLoading] = useState(false);

  const handleStep1Next = () => setStep(2);
  const handleStep2Back = () => setStep(1);

  const handleStep2Next = async () => {
    if (!step1 || !step2) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api/calculate", {
        ...step1,
        ...step2,
      });
      setResults(data);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Calculation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-container">
      <div className="container-sm">
        <StepIndicator current={step} />

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "3px solid rgba(108,71,255,0.2)",
                borderTopColor: "var(--primary)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "var(--text-muted)" }}>
              Crunching the numbers...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && step === 1 && <WizardStep1 onNext={handleStep1Next} />}
        {!loading && step === 2 && <WizardStep2 onNext={handleStep2Next} onBack={handleStep2Back} />}
        {!loading && step === 3 && results && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2>Your Loan Risk Report</h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setStep(2)}
                id="results-back-btn"
              >
                ← Adjust Parameters
              </button>
            </div>
            <ResultsPanel results={results} />
          </>
        )}
      </div>
    </div>
  );
}
