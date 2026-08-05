/** Format a number as INR currency */
export function formatINR(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Get risk band display info */
export function getRiskBandInfo(band: "SAFE" | "MODERATE" | "HIGH_STRESS") {
  const map = {
    SAFE: {
      label: "Safe",
      color: "#16a34a",
      bgClass: "badge-safe",
      description: "Your EMI is within a manageable range",
      emoji: "✅",
    },
    MODERATE: {
      label: "Moderate",
      color: "#d97706",
      bgClass: "badge-moderate",
      description: "Loan is repayable but leaves limited flexibility",
      emoji: "⚠️",
    },
    HIGH_STRESS: {
      label: "High Stress",
      color: "#dc2626",
      bgClass: "badge-danger",
      description: "EMI burden is dangerously high — action needed",
      emoji: "🚨",
    },
  };
  return map[band] || map.MODERATE;
}

/** Client-side quick EMI calculation for slider preview */
export function quickEMI(principal: number, annualRate: number, months: number): number {
  if (months === 0 || principal === 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round((principal / months) * 100) / 100;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1) * 100) / 100;
}

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
