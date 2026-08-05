import { useState } from "react";
import { useWizardStore } from "../store";
import type { WizardStep2Data } from "../store";
import { formatINR, quickEMI } from "../utils/helpers";

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  info?: string;
}

function SliderField({ id, label, value, min, max, step, unit = "", format, onChange, info }: SliderFieldProps) {
  const display = format ? format(value) : `${value.toLocaleString("en-IN")}${unit}`;
  return (
    <div className="form-group">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label className="form-label" htmlFor={id}>{label}</label>
        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary-light)", fontFamily: "Outfit, sans-serif" }}>
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="form-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)" }}>
        <span>{format ? format(min) : `${min.toLocaleString("en-IN")}${unit}`}</span>
        <span>{format ? format(max) : `${max.toLocaleString("en-IN")}${unit}`}</span>
      </div>
      {info && <p className="info-text">{info}</p>}
    </div>
  );
}

interface WizardStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function WizardStep2({ onNext, onBack }: WizardStep2Props) {
  const { step2, setStep2 } = useWizardStore();

  const [form, setForm] = useState<WizardStep2Data>({
    principal: step2?.principal || 2000000,
    interestRate: step2?.interestRate || 11,
    moratoriumMonths: step2?.moratoriumMonths || 30,
    accrualType: step2?.accrualType || "COMPOUND",
    repaymentMonths: step2?.repaymentMonths || 120,
    estimatedMonthlySalary: step2?.estimatedMonthlySalary || 60000,
  });

  const set = (key: keyof WizardStep2Data, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Real-time EMI preview
  const liveEMI = (() => {
    const r = form.interestRate / 100 / 12;
    let moratoriumBalance = form.principal;
    if (form.accrualType === "COMPOUND") {
      moratoriumBalance = form.principal * Math.pow(1 + r, form.moratoriumMonths);
    } else {
      moratoriumBalance = form.principal + form.principal * r * form.moratoriumMonths;
    }
    return quickEMI(moratoriumBalance, form.interestRate, form.repaymentMonths);
  })();

  const liveFOIR = form.estimatedMonthlySalary > 0
    ? Math.round((liveEMI / form.estimatedMonthlySalary) * 1000) / 10
    : 0;

  const foirColor = liveFOIR <= 30 ? "var(--safe)" : liveFOIR <= 45 ? "var(--moderate)" : "var(--danger)";

  const handleNext = () => {
    setStep2(form);
    onNext();
  };

  return (
    <div className="animate-fadeInUp">
      <h2 style={{ marginBottom: "6px" }}>Loan Configuration</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "0.9rem" }}>
        Configure your loan terms and salary expectation. All charts update live as you adjust.
      </p>

      {/* Live FOIR preview bar */}
      <div
        style={{
          background: `rgba(${liveFOIR <= 30 ? "22,163,74" : liveFOIR <= 45 ? "217,119,6" : "220,38,38"},0.08)`,
          border: `1px solid ${foirColor}30`,
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>Live EMI Preview</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "Outfit, sans-serif", color: "var(--primary-light)" }}>
            {formatINR(liveEMI)}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/mo</span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>Live FOIR</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "Outfit, sans-serif", color: foirColor }}>
            {liveFOIR.toFixed(1)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>Risk Band</div>
          <div
            className={`badge ${liveFOIR <= 30 ? "badge-safe" : liveFOIR <= 45 ? "badge-moderate" : "badge-danger"}`}
            style={{ fontSize: "0.9rem", padding: "6px 16px" }}
          >
            {liveFOIR <= 30 ? "✅ Safe" : liveFOIR <= 45 ? "⚠️ Moderate" : "🚨 High Stress"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Principal */}
        <SliderField
          id="principal"
          label="Loan Principal"
          value={form.principal}
          min={100000}
          max={10000000}
          step={100000}
          format={(v) => formatINR(v, true)}
          onChange={(v) => set("principal", v)}
          info="The total loan amount you will borrow."
        />

        {/* Interest rate */}
        <SliderField
          id="interestRate"
          label="Annual Interest Rate"
          value={form.interestRate}
          min={5}
          max={20}
          step={0.25}
          unit="% p.a."
          onChange={(v) => set("interestRate", v)}
          info="Typical education loan rates in India: 8.5–12.5% p.a."
        />

        <div className="divider" />

        {/* Moratorium */}
        <SliderField
          id="moratoriumMonths"
          label="Moratorium Period"
          value={form.moratoriumMonths}
          min={0}
          max={84}
          step={1}
          format={(v) => `${v} months (${(v / 12).toFixed(1)} yrs)`}
          onChange={(v) => set("moratoriumMonths", v)}
          info="Typically = study duration + 6–12 months grace. No payments during this period, but interest accrues."
        />

        {/* Accrual type */}
        <div className="form-group">
          <label className="form-label" htmlFor="accrualType">Moratorium Interest Type</label>
          <select
            id="accrualType"
            className="form-input"
            value={form.accrualType}
            onChange={(e) => set("accrualType", e.target.value as "SIMPLE" | "COMPOUND")}
            aria-label="Moratorium interest accrual type"
          >
            <option value="COMPOUND">Compound (more common — larger accumulation)</option>
            <option value="SIMPLE">Simple (some lenders / subsidised loans)</option>
          </select>
          <p className="info-text">
            Compound accrual grows faster — choose to be conservative in your planning.
          </p>
        </div>

        <div className="divider" />

        {/* Repayment tenure */}
        <SliderField
          id="repaymentMonths"
          label="Repayment Tenure"
          value={form.repaymentMonths}
          min={12}
          max={360}
          step={12}
          format={(v) => `${v} months (${(v / 12).toFixed(0)} years)`}
          onChange={(v) => set("repaymentMonths", v)}
          info="Standard: 120 months (10 years). Longer tenure = lower EMI but more total interest."
        />

        {/* Salary */}
        <div
          style={{
            background: "rgba(108,71,255,0.06)",
            border: "1px solid rgba(108,71,255,0.15)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <SliderField
            id="estimatedMonthlySalary"
            label="Estimated Monthly Net Salary (post-graduation)"
            value={form.estimatedMonthlySalary}
            min={15000}
            max={500000}
            step={5000}
            format={(v) => `${formatINR(v)}/mo`}
            onChange={(v) => set("estimatedMonthlySalary", v)}
            info="Your take-home salary estimate. AI will refine this based on your degree & city in the results."
          />
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onBack} id="wizard-step2-back">
            ← Back
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleNext} id="wizard-step2-calculate">
            Calculate Risk →
          </button>
        </div>
      </div>
    </div>
  );
}
