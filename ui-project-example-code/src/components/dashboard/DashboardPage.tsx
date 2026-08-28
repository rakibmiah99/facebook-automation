import { useState } from "react";
import MultiLabelDropdown from "../ui/MultiLabelDropdown";
import { useToast } from "../ui/Toast";

const categoryOptions = [
  { value: "revenue", label: "Revenue", color: "#10b981" },
  { value: "users", label: "Users", color: "#6366f1" },
  { value: "performance", label: "Performance", color: "#f59e0b" },
  { value: "infra", label: "Infrastructure", color: "#22d3ee" },
  { value: "support", label: "Support", color: "#f43f5e" },
];

const periodOptions = [
  { value: "7d", label: "Last 7 days", color: "#6366f1" },
  { value: "30d", label: "Last 30 days", color: "#6366f1" },
  { value: "90d", label: "Last 90 days", color: "#6366f1" },
  { value: "1y", label: "This year", color: "#6366f1" },
];

const teamOptions = [
  { value: "eng", label: "Engineering", color: "#22d3ee" },
  { value: "design", label: "Design", color: "#f59e0b" },
  { value: "product", label: "Product", color: "#10b981" },
  { value: "growth", label: "Growth", color: "#f43f5e" },
];

const stats = [
  { label: "Total Revenue", value: "$284,912", change: "+12.4%", up: true, color: "#10b981" },
  { label: "Active Users", value: "48,391", change: "+8.1%", up: true, color: "#6366f1" },
  { label: "Avg. Response", value: "142ms", change: "-23ms", up: true, color: "#22d3ee" },
  { label: "Open Tickets", value: "143", change: "+5", up: false, color: "#f43f5e" },
];

const recentActivity = [
  { user: "Mia Chen", action: "Deployed API v3.2.1 to production", time: "3m ago", tag: "Deploy", tagColor: "#10b981" },
  { user: "Luca Ferri", action: "Opened P1 incident: auth latency spike", time: "18m ago", tag: "Incident", tagColor: "#f43f5e" },
  { user: "Riya Patel", action: "Merged PR #891: onboarding redesign", time: "42m ago", tag: "Code", tagColor: "#6366f1" },
  { user: "Omar Saeed", action: "Updated Q4 growth forecast model", time: "1h ago", tag: "Analytics", tagColor: "#f59e0b" },
  { user: "Sophie Lane", action: "Completed accessibility audit pass", time: "2h ago", tag: "Design", tagColor: "#22d3ee" },
];

const projects = [
  { name: "Nexus API v3", status: "Active", progress: 78, team: "Engineering", due: "Nov 12" },
  { name: "Onboarding Redesign", status: "Review", progress: 91, team: "Design", due: "Oct 28" },
  { name: "Growth Dashboard", status: "Active", progress: 45, team: "Growth", due: "Dec 3" },
  { name: "Mobile App", status: "Paused", progress: 33, team: "Product", due: "Jan 15" },
];

const statusColor: Record<string, string> = {
  Active: "#10b981",
  Review: "#f59e0b",
  Paused: "#6b6b80",
};

const barHeights = [42, 68, 55, 82, 71, 94, 63, 77, 88, 52, 71, 83];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>(["revenue", "users"]);
  const [periods, setPeriods] = useState<string[]>(["30d"]);
  const [teams, setTeams] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Wednesday, August 27 · Q3 2026
            </p>
          </div>
          <button
            onClick={() => toast("Opening report builder…", "info")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            New Report
          </button>
        </div>

        {/* Filters row */}
        <div
          className="rounded-xl p-4 grid gap-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          <MultiLabelDropdown
            label="Categories"
            options={categoryOptions}
            selected={categories}
            onChange={setCategories}
            placeholder="All categories"
          />
          <MultiLabelDropdown
            label="Time Period"
            options={periodOptions}
            selected={periods}
            onChange={setPeriods}
            placeholder="Select period"
          />
          <MultiLabelDropdown
            label="Teams"
            options={teamOptions}
            selected={teams}
            onChange={setTeams}
            placeholder="All teams"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-5 transition-all duration-150"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{s.label}</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: s.up ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                    color: s.up ? "var(--color-success)" : "var(--color-danger)",
                  }}
                >
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                {s.value}
              </p>
              <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                <div className="h-full rounded-full" style={{ width: "65%", background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
          {/* Bar chart */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Revenue Overview</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Monthly breakdown, 2026</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--color-surface-2)", color: "var(--color-muted)" }}>
                YTD
              </span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div
                    className="w-full rounded-t-sm transition-opacity duration-150 group-hover:opacity-100"
                    style={{
                      height: `${h}%`,
                      background: i === 7
                        ? "var(--color-primary)"
                        : `rgba(99,102,241,${0.25 + (h / 100) * 0.3})`,
                    }}
                  />
                  <span className="text-[9px]" style={{ color: "var(--color-muted)" }}>{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                    style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}
                  >
                    {a.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: "var(--color-text)" }}>
                      <span className="font-medium">{a.user}</span> {a.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: `${a.tagColor}18`, color: a.tagColor }}
                      >
                        {a.tag}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Active Projects</h2>
            <button className="text-xs" style={{ color: "var(--color-primary)" }}>View all →</button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Project", "Team", "Status", "Progress", "Due"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr
                  key={i}
                  className="transition-colors duration-100 cursor-pointer"
                  style={{ borderBottom: i < projects.length - 1 ? "1px solid var(--color-border)" : "none" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{p.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>{p.team}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${statusColor[p.status]}15`, color: statusColor[p.status] }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--color-surface-2)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.progress}%`, background: statusColor[p.status] }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right" style={{ color: "var(--color-muted)" }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>{p.due}</span>
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
