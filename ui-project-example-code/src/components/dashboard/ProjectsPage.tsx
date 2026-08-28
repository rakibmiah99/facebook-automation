import { useState } from "react";
import MultiLabelDropdown from "../ui/MultiLabelDropdown";

const statusOptions = [
  { value: "active", label: "Active", color: "#10b981" },
  { value: "review", label: "Review", color: "#f59e0b" },
  { value: "paused", label: "Paused", color: "#6b6b80" },
  { value: "done", label: "Done", color: "#6366f1" },
];

const teamOptions = [
  { value: "eng", label: "Engineering", color: "#22d3ee" },
  { value: "design", label: "Design", color: "#f59e0b" },
  { value: "product", label: "Product", color: "#10b981" },
  { value: "growth", label: "Growth", color: "#f43f5e" },
];

const allProjects = [
  {
    id: 1, name: "Nexus API v3", desc: "GraphQL migration and performance overhaul for core API layer",
    status: "active", team: "eng", progress: 78, due: "Nov 12, 2026",
    members: ["M", "L", "R"], tasks: { done: 42, total: 54 }, priority: "High",
  },
  {
    id: 2, name: "Onboarding Redesign", desc: "Full UX revamp of new-user onboarding flow and empty states",
    status: "review", team: "design", progress: 91, due: "Oct 28, 2026",
    members: ["S", "O", "A"], tasks: { done: 31, total: 34 }, priority: "High",
  },
  {
    id: 3, name: "Growth Dashboard", desc: "Self-serve analytics for marketing and growth teams",
    status: "active", team: "growth", progress: 45, due: "Dec 3, 2026",
    members: ["R", "M"], tasks: { done: 18, total: 40 }, priority: "Medium",
  },
  {
    id: 4, name: "Mobile App", desc: "Native iOS and Android apps powered by React Native",
    status: "paused", team: "product", progress: 33, due: "Jan 15, 2027",
    members: ["L", "S", "R", "A"], tasks: { done: 21, total: 64 }, priority: "Low",
  },
  {
    id: 5, name: "Data Pipeline v2", desc: "Real-time event streaming with Kafka and dbt transforms",
    status: "active", team: "eng", progress: 62, due: "Nov 30, 2026",
    members: ["O", "M"], tasks: { done: 28, total: 45 }, priority: "High",
  },
  {
    id: 6, name: "Design System", desc: "Tokens, components, and documentation for Nexus UI",
    status: "done", team: "design", progress: 100, due: "Oct 1, 2026",
    members: ["S", "A"], tasks: { done: 88, total: 88 }, priority: "Medium",
  },
];

const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Active" },
  review: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Review" },
  paused: { color: "#6b6b80", bg: "rgba(107,107,128,0.15)", label: "Paused" },
  done: { color: "#6366f1", bg: "rgba(99,102,241,0.12)", label: "Done" },
};

const priorityColor: Record<string, string> = {
  High: "#f43f5e",
  Medium: "#f59e0b",
  Low: "#6b6b80",
};

const avatarColors = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e"];

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [teamFilter, setTeamFilter] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = allProjects.filter((p) => {
    if (statusFilter.length && !statusFilter.includes(p.status)) return false;
    if (teamFilter.length && !teamFilter.includes(p.team)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Projects</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>{allProjects.length} projects · {allProjects.filter(p => p.status === "active").length} active</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
            style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            New Project
          </button>
        </div>

        {/* Filters */}
        <div
          className="flex flex-wrap items-end gap-3 p-4 rounded-xl"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Search</label>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: "var(--color-muted)" }}>
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8.5 8.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter projects..."
                className="bg-transparent text-sm outline-none flex-1"
                style={{ color: "var(--color-text)" }}
              />
            </div>
          </div>
          <div className="min-w-44">
            <MultiLabelDropdown label="Status" options={statusOptions} selected={statusFilter} onChange={setStatusFilter} placeholder="All statuses" />
          </div>
          <div className="min-w-44">
            <MultiLabelDropdown label="Team" options={teamOptions} selected={teamFilter} onChange={setTeamFilter} placeholder="All teams" />
          </div>
          <div className="flex gap-1 p-1 rounded-lg self-end" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="p-1.5 rounded transition-all"
                style={{ background: view === v ? "var(--color-surface)" : "transparent", color: view === v ? "var(--color-text)" : "var(--color-muted)" }}
              >
                {v === "grid" ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>Showing {filtered.length} of {allProjects.length} projects</p>

        {/* Grid view */}
        {view === "grid" ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {filtered.map((p) => {
              const sm = statusMeta[p.status];
              return (
                <div
                  key={p.id}
                  className="rounded-xl p-5 cursor-pointer transition-all duration-150 flex flex-col gap-4"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" style={{ fontFamily: "var(--font-display)" }}>{p.name}</h3>
                      <p className="text-xs mt-1 leading-snug line-clamp-2" style={{ color: "var(--color-muted)" }}>{p.desc}</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>Progress</span>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--color-text)" }}>{p.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: sm.color }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {p.members.map((m, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border"
                          style={{
                            background: avatarColors[idx % avatarColors.length],
                            color: "white",
                            borderColor: "var(--color-surface)",
                          }}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                        {p.tasks.done}/{p.tasks.total} tasks
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: `${priorityColor[p.priority]}15`, color: priorityColor[p.priority] }}
                      >
                        {p.priority}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                    <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                      Due <span style={{ color: "var(--color-text)" }}>{p.due}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {["Project", "Status", "Team", "Progress", "Tasks", "Priority", "Due"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const sm = statusMeta[p.status];
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer transition-colors duration-100"
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{p.name}</p>
                          <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: "var(--color-muted)" }}>{p.desc}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs capitalize" style={{ color: "var(--color-muted)" }}>{p.team}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                            <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: sm.color }} />
                          </div>
                          <span className="text-xs" style={{ color: "var(--color-muted)" }}>{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "var(--color-muted)" }}>{p.tasks.done}/{p.tasks.total}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold" style={{ color: priorityColor[p.priority] }}>{p.priority}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "var(--color-muted)" }}>{p.due}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-hover)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>New Project</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--color-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {["Project name", "Description"].map((label) => (
                <div key={label}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>{label}</label>
                  {label === "Description" ? (
                    <textarea
                      rows={3}
                      placeholder="What is this project about?"
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Product Roadmap Q1"
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Team</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  >
                    {teamOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Due date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                  style={{ background: "var(--color-primary)", color: "white" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
