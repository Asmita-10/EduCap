import { useState } from "react";
import { useWizardStore } from "../store";
import type { WizardStep1Data } from "../store";

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
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--primary-light)",
            fontFamily: "Outfit, sans-serif",
          }}
        >
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

interface WizardStep1Props {
  onNext: () => void;
}

const INR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function WizardStep1({ onNext }: WizardStep1Props) {
  const { step1, setStep1 } = useWizardStore();

  const [form, setForm] = useState<WizardStep1Data>({
    degree: step1?.degree || "",
    institution: step1?.institution || "",
    city: step1?.city || "",
    durationYears: step1?.durationYears || 2,
    tuitionCostPerYear: step1?.tuitionCostPerYear || 500000,
    livingCostPerYear: step1?.livingCostPerYear || 300000,
    educationInflation: step1?.educationInflation || 8,
    generalInflation: step1?.generalInflation || 6,
  });

  const set = (key: keyof WizardStep1Data, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (!form.degree || !form.institution || !form.city) {
      alert("Please fill in degree, institution, and city.");
      return;
    }
    setStep1(form);
    onNext();
  };

  const totalInflated = (() => {
    let t = 0;
    let l = 0;
    for (let n = 1; n <= form.durationYears; n++) {
      t += form.tuitionCostPerYear * Math.pow(1 + form.educationInflation / 100, n - 1);
      l += form.livingCostPerYear * Math.pow(1 + form.generalInflation / 100, n - 1);
    }
    return Math.round(t + l);
  })();

  return (
    <div className="animate-fadeInUp">
      <h2 style={{ marginBottom: "6px" }}>Academic Profile</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "0.9rem" }}>
        Tell us about your degree and estimated costs so we can model the true inflated expense.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Text inputs */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="degree">Degree / Program</label>
            <input
              id="degree"
              type="text"
              className="form-input"
              placeholder="e.g. M.Tech Computer Science"
              value={form.degree}
              onChange={(e) => set("degree", e.target.value)}
              required
              aria-label="Degree or program name"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="institution">Institution</label>
            <input
              id="institution"
              type="text"
              className="form-input"
              placeholder="e.g. IIT Delhi"
              value={form.institution}
              onChange={(e) => set("institution", e.target.value)}
              required
              aria-label="Institution name"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="city">Target City</label>
          <input
            id="city"
            type="text"
            className="form-input"
            placeholder="e.g. New Delhi"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            required
            aria-label="City where you will study or work"
          />
        </div>

        <div className="divider" />

        {/* Duration */}
        <SliderField
          id="durationYears"
          label="Study Duration"
          value={form.durationYears}
          min={1}
          max={8}
          step={1}
          format={(v) => `${v} year${v > 1 ? "s" : ""}`}
          onChange={(v) => set("durationYears", v)}
        />

        {/* Costs */}
        <SliderField
          id="tuitionCostPerYear"
          label="Annual Tuition (current price)"
          value={form.tuitionCostPerYear}
          min={50000}
          max={5000000}
          step={50000}
          format={INR}
          onChange={(v) => set("tuitionCostPerYear", v)}
          info="Enter today's fee. We will compound it for future years."
        />
        <SliderField
          id="livingCostPerYear"
          label="Annual Living Cost (current price)"
          value={form.livingCostPerYear}
          min={0}
          max={2000000}
          step={25000}
          format={INR}
          onChange={(v) => set("livingCostPerYear", v)}
          info="Rent, food, transport, etc. — enter today's estimate."
        />

        <div className="divider" />

        {/* Inflation */}
        <div
          style={{
            background: "rgba(108,71,255,0.06)",
            border: "1px solid rgba(108,71,255,0.15)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "4px", fontSize: "1rem" }}>Inflation Assumptions</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "16px" }}>
            India defaults: Education ~8%, General ~6%. Adjust based on your country/program.
          </p>
          <div className="grid-2">
            <SliderField
              id="educationInflation"
              label="Education Inflation"
              value={form.educationInflation}
              min={0}
              max={30}
              step={0.5}
              unit="% p.a."
              onChange={(v) => set("educationInflation", v)}
            />
            <SliderField
              id="generalInflation"
              label="General Inflation"
              value={form.generalInflation}
              min={0}
              max={20}
              step={0.5}
              unit="% p.a."
              onChange={(v) => set("generalInflation", v)}
            />
          </div>
        </div>

        {/* Live preview */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            📊 Estimated Total Inflated Expense
          </span>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: "1.4rem",
              color: "var(--primary-light)",
            }}
          >
            {INR(totalInflated)}
          </span>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleNext}
          style={{ alignSelf: "flex-end" }}
          id="wizard-step1-next"
        >
          Next: Loan Terms →
        </button>
      </div>
    </div>
  );
}
