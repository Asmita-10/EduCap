import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatINR } from "../utils/helpers";

interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

interface AmortizationChartProps {
  schedule: AmortizationEntry[];
}

// Sample every Nth point for large schedules to keep chart performant
function sampleData(data: AmortizationEntry[], maxPoints = 120) {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0 || i === data.length - 1);
}

export default function AmortizationChart({ schedule }: AmortizationChartProps) {
  const sampled = sampleData(schedule);

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
      <h3 style={{ marginBottom: "16px", color: "var(--text)" }}>
        Repayment Schedule
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={sampled} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6c47ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6c47ff" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
          <Legend
            wrapperStyle={{ color: "var(--text-muted)", fontSize: "0.8rem", paddingTop: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="principal"
            name="Principal"
            stroke="#6c47ff"
            fill="url(#principalGrad)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="interest"
            name="Interest"
            stroke="#dc2626"
            fill="url(#interestGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Balance curve */}
      <h3 style={{ marginTop: "32px", marginBottom: "16px", color: "var(--text)" }}>
        Outstanding Balance Over Time
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={sampled} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b6aff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b6aff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatINR(v, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            name="Outstanding Balance"
            stroke="#8b6aff"
            fill="url(#balanceGrad)"
            strokeWidth={2.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
