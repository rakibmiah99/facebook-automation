import { useState } from "react";

const ranges = ["7D", "30D", "90D", "1Y"];

const lineData = {
  "7D": [42, 58, 51, 73, 68, 85, 91],
  "30D": [30, 45, 38, 60, 55, 72, 68, 80, 74, 88, 82, 95, 89, 78, 85, 91, 88, 76, 82, 94, 90, 83, 87, 92, 96, 88, 84, 90, 95, 98],
  "90D": Array.from({ length: 90 }, (_, i) => 30 + Math.round(Math.sin(i / 8) * 15 + i * 0.7)),
  "1Y": [38, 52, 47, 65, 72, 68, 81, 76, 88, 83, 91, 96],
};

const topPages = [
  { path: "/dashboard", sessions: 14820, bounce: "28%", duration: "4m 12s", change: +12 },
  { path: "/analytics", sessions: 9431, bounce: "34%", duration: "3m 05s", change: +7 },
  { path: "/projects", sessions: 7214, bounce: "41%", duration: "2m 48s", change: -3 },
  { path: "/team", sessions: 5882, bounce: "22%", duration: "5m 31s", change: +19 },
  { path: "/settings", sessions: 3109, bounce: "58%", duration: "1m 44s", change: -8 },
];

const sources = [
  { name: "Direct", pct: 38, color: "#6366f1" },
  { name: "Organic Search", pct: 27, color: "#22d3ee" },
  { name: "Referral", pct: 19, color: "#10b981" },
  { name: "Email", pct: 11, color: "#f59e0b" },
  { name: "Social", pct: 5, color: "#f43f5e" },
];

const deviceData = [
  { label: "Desktop", value: 61, color: "#6366f1" },
  { label: "Mobile", value: 31, color: "#22d3ee" },
  { label: "Tablet", value: 8, color: "#f59e0b" },
];

const kpis = [
  { label: "Page Views", value: "1.24M", sub: "+18.3% vs last period", up: true },
  { label: "Unique Visitors", value: "284K", sub: "+9.7% vs last period", up: true },
  { label: "Avg. Session", value: "3m 48s", sub: "+22s vs last period", up: true },
  { label: "Bounce Rate", value: "34.2%", sub: "-2.1pp vs last period", up: true },
];

function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const h = 60;
  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#grad-${color})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30D");
  const data = lineData[range as keyof typeof lineData];

  const chartH = 120;
  const chartW = 600;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const r = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * chartW},${chartH - ((v - min) / r) * chartH}`)
    .join(" ");

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Analytics</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>Product usage and traffic insights</p>
          </div>
          <div
            className="flex p-1 rounded-lg gap-0.5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                style={{
                  background: range === r ? "var(--color-primary)" : "transparent",
                  color: range === r ? "white" : "var(--color-muted)",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl p-5"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>{k.label}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{k.value}</p>
              <p className="text-xs mt-1" style={{ color: k.up ? "var(--color-success)" : "var(--color-danger)" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Main line chart */}
        <div className="rounded-xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Visitor Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Unique visitors · {range}</p>
            </div>
          </div>
          <div className="w-full overflow-hidden" style={{ height: "140px" }}>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((pct) => (
                <line
                  key={pct}
                  x1="0" y1={chartH - (pct / 100) * chartH}
                  x2={chartW} y2={chartH - (pct / 100) * chartH}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1"
                />
              ))}
              <polygon
                points={`0,${chartH} ${pts} ${chartW},${chartH}`}
                fill="url(#lineGrad)"
              />
              <polyline
                points={pts}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Sources + Devices */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Traffic sources */}
          <div className="rounded-xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Traffic Sources</h2>
            <div className="space-y-3">
              {sources.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs" style={{ color: "var(--color-text)" }}>{s.name}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="rounded-xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Device Split</h2>
            <div className="flex items-center gap-6">
              {/* Donut */}
              <div className="relative flex-shrink-0" style={{ width: 110, height: 110 }}>
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return deviceData.map((d) => {
                      const circ = 2 * Math.PI * 14;
                      const dash = (d.value / 100) * circ;
                      const gap = circ - dash;
                      const el = (
                        <circle
                          key={d.label}
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke={d.color}
                          strokeWidth="4"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                        />
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: "var(--color-text)" }}>100%</span>
                </div>
              </div>
              <div className="space-y-3">
                {deviceData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-xs" style={{ color: "var(--color-text)" }}>{d.label}</span>
                    <span className="text-xs font-semibold ml-auto pl-4" style={{ color: "var(--color-muted)" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top pages */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Top Pages</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Page", "Sessions", "Bounce Rate", "Avg. Duration", "Change"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPages.map((p, i) => (
                <tr
                  key={i}
                  className="cursor-pointer transition-colors duration-100"
                  style={{ borderBottom: i < topPages.length - 1 ? "1px solid var(--color-border)" : "none" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>{p.path}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text)" }}>{p.sessions.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted)" }}>{p.bounce}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted)" }}>{p.duration}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: p.change >= 0 ? "var(--color-success)" : "var(--color-danger)" }}
                    >
                      {p.change >= 0 ? "+" : ""}{p.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
