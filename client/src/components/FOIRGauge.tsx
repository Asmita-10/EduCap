import { useEffect, useRef } from "react";
import { getRiskBandInfo } from "../utils/helpers";

interface FOIRGaugeProps {
  foir: number;
  riskBand: "SAFE" | "MODERATE" | "HIGH_STRESS";
  size?: number;
}

export default function FOIRGauge({ foir, riskBand, size = 220 }: FOIRGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const info = getRiskBandInfo(riskBand);

  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size * 0.38;

  // Map FOIR 0-100 to angle -180 to 0 degrees (semicircle, left to right)
  const foirClamped = Math.min(foir, 100);
  const angleDeg = -180 + (foirClamped / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleLength = r - 12;
  const nx = cx + needleLength * Math.cos(angleRad);
  const ny = cy + needleLength * Math.sin(angleRad);

  // Arc segments: Safe 0-30%, Moderate 30-45%, Danger 45-100%
  function polarToCartesian(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arc(startPct: number, endPct: number, color: string, strokeWidth = 22) {
    const startAngle = -180 + (startPct / 100) * 180;
    const endAngle = -180 + (endPct / 100) * 180;
    const start = polarToCartesian(startAngle, r);
    const end = polarToCartesian(endAngle, r);
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    return (
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }

  useEffect(() => {
    if (needleRef.current) {
      needleRef.current.style.transition = "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
      role="img"
      aria-label={`FOIR Gauge: ${foir.toFixed(1)}% — ${info.label} risk`}
    >
      <svg
        width={size}
        height={size * 0.6}
        viewBox={`0 0 ${size} ${size * 0.6}`}
        aria-hidden="true"
      >
        {/* Track */}
        {arc(0, 100, "rgba(255,255,255,0.06)")}
        {/* Coloured zones */}
        {arc(0, 30, "rgba(22,163,74,0.3)")}
        {arc(30, 45, "rgba(217,119,6,0.3)")}
        {arc(45, 100, "rgba(220,38,38,0.3)")}
        {/* Active fill up to current FOIR */}
        {foir > 0 && arc(0, Math.min(foirClamped, 30), "#16a34a")}
        {foir > 30 && arc(30, Math.min(foirClamped, 45), "#d97706")}
        {foir > 45 && arc(45, Math.min(foirClamped, 100), "#dc2626")}

        {/* Zone labels */}
        <text x={cx * 0.18} y={cy - r * 0.1} fontSize="9" fill="rgba(22,163,74,0.7)" textAnchor="middle">SAFE</text>
        <text x={cx} y={cy - r - 8} fontSize="9" fill="rgba(217,119,6,0.7)" textAnchor="middle">MOD.</text>
        <text x={cx * 1.82} y={cy - r * 0.1} fontSize="9" fill="rgba(220,38,38,0.7)" textAnchor="middle">RISK</text>

        {/* Tick marks: 30 and 45 */}
        {[30, 45].map((pct) => {
          const angle = -180 + (pct / 100) * 180;
          const inner = polarToCartesian(angle, r - 30);
          const outer = polarToCartesian(angle, r + 2);
          return (
            <line
              key={pct}
              x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.25)" strokeWidth="2"
            />
          );
        })}

        {/* Needle */}
        <line
          ref={needleRef}
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke={info.color}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Needle center dot */}
        <circle cx={cx} cy={cy} r="7" fill={info.color} />
        <circle cx={cx} cy={cy} r="3" fill="var(--bg-card)" />
      </svg>

      {/* FOIR value */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            fontFamily: "Outfit, sans-serif",
            color: info.color,
            lineHeight: 1,
          }}
        >
          {foir.toFixed(1)}%
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
          FOIR (EMI-to-Income Ratio)
        </div>
        <div className={`badge ${info.bgClass}`} style={{ marginTop: "8px" }}>
          {info.emoji} {info.label}
        </div>
      </div>
    </div>
  );
}
