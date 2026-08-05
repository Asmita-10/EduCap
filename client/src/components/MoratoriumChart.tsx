import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { formatINR } from "../utils/helpers";

interface MoratoriumEntry {
  month: number;
  balance: number;
  interestThisMonth: number;
}

interface MoratoriumChartProps {
  breakdown: MoratoriumEntry[];
  principal: number;
  accrualType: "SIMPLE" | "COMPOUND";
}

export default function MoratoriumChart({ breakdown, principal, accrualType }: MoratoriumChartProps) {
  if (!breakdown.length) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        No moratorium period configured
      </div>
    );
  }

  const finalBalance = breakdown[breakdown.length - 1]?.balance || principal;
  const totalInterest = finalBalance - principal;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ color: "var(--text-muted)", marginBottom: "6px" }}>Month {label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {formatINR(p.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <h3 style={{ color: "var(--text)" }}>Moratorium Interest Accrual</h3>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {accrualType} interest over {breakdown.length} months
          </div>
          <div style={{ color: "#dc2626", fontWeight: 700, fontSize: "1rem" }}>
            +{formatINR(totalInterest)} accumulated
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={breakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Month", position: "insideBottom", offset: -5, fill: "var(--text-muted)", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatINR(v, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={principal}
            stroke="rgba(108,71,255,0.5)"
            strokeDasharray="6 3"
            label={{ value: "Original Principal", fill: "rgba(108,71,255,0.7)", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Loan Balance"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#f97316" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div
        style={{
          marginTop: "12px",
          padding: "12px 16px",
          background: "rgba(220,38,38,0.08)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: "10px",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
        }}
      >
        ⚠️ During the moratorium, interest accrues but you make no payments — your effective debt grows from{" "}
        <strong style={{ color: "var(--text)" }}>{formatINR(principal)}</strong> to{" "}
        <strong style={{ color: "#dc2626" }}>{formatINR(finalBalance)}</strong> before repayment begins.
      </div>
    </div>
  );
}
