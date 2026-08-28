import { useState } from "react";
import { useToast } from "../ui/Toast";

const reports = [
  {
    id: 1, name: "Q3 Revenue Summary", desc: "Revenue breakdown by team, region, and product line",
    type: "Revenue", updated: "Aug 22, 2026", rows: "14,820", status: "ready",
  },
  {
    id: 2, name: "Sprint Velocity — Engineering", desc: "Story points delivered per sprint over last 6 months",
    type: "Performance", updated: "Aug 20, 2026", rows: "1,242", status: "ready",
  },
  {
    id: 3, name: "User Retention Cohort Analysis", desc: "Weekly cohort retention curves for Aug 2026",
    type: "Analytics", updated: "Aug 19, 2026", rows: "88,310", status: "ready",
  },
  {
    id: 4, name: "Team Headcount & Utilization", desc: "FTE counts, open roles, and utilization by department",
    type: "Team", updated: "Aug 15, 2026", rows: "248", status: "ready",
  },
  {
    id: 5, name: "Infrastructure Cost Audit", desc: "Cloud spend by service, env, and cost center",
    type: "Infrastructure", updated: "Generating…", rows: "—", status: "processing",
  },
  {
    id: 6, name: "Support Ticket Resolution", desc: "P1–P4 ticket SLA adherence and escalation rates",
    type: "Support", updated: "Aug 12, 2026", rows: "3,091", status: "ready",
  },
];

const typeColor: Record<string, string> = {
  Revenue: "#10b981",
  Performance: "#6366f1",
  Analytics: "#22d3ee",
  Team: "#f59e0b",
  Infrastructure: "#f43f5e",
  Support: "#a78bfa",
};

const builders = [
  { label: "Data Source", options: ["All events", "Revenue events", "User events", "Task events"] },
  { label: "Grouping", options: ["By day", "By week", "By month", "By quarter"] },
  { label: "Team filter", options: ["All teams", "Engineering", "Design", "Growth", "Product"] },
  { label: "Format", options: ["Table", "Bar chart", "Line chart", "Pie chart"] },
];

const statCards = [
  { label: "Reports generated", value: "1,284", change: "+42 this month", up: true },
  { label: "Avg. generation time", value: "1.2s", change: "-0.4s vs last month", up: true },
  { label: "Scheduled exports", value: "18", change: "3 running now", up: true },
  { label: "Data freshness", value: "< 5 min", change: "Live sync active", up: true },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [reportName, setReportName] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!reportName.trim()) { toast("Please enter a report name", "warning"); return; }
    setGenerating(true);
    toast("Building your report…", "info");
    setTimeout(() => {
      setGenerating(false);
      setBuilderOpen(false);
      setReportName("");
      setSelections({});
      toast("Report generated successfully!", "success");
    }, 2000);
  };

  const handleDownload = (name: string) => {
    toast(`Downloading "${name}" as CSV…`, "success");
  };

  const handleSchedule = (name: string) => {
    toast(`"${name}" scheduled for weekly delivery`, "info");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Reports</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>Build, schedule, and export data reports</p>
          </div>
          <button
            onClick={() => setBuilderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
            style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            New Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>{s.label}</p>
              <p className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--color-success)" }}>{s.change}</p>
            </div>
          ))}
        </div>

        {/* Report library */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>Report Library</h2>
          <div className="space-y-2">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-150"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
              >
                {/* Type badge */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: `${typeColor[r.type]}18`, color: typeColor[r.type] }}
                >
                  {r.type.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{r.name}</p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: `${typeColor[r.type]}15`, color: typeColor[r.type] }}
                    >
                      {r.type}
                    </span>
                    {r.status === "processing" && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "rgba(245,158,11,0.12)", color: "var(--color-warning)" }}
                      >
                        Processing
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-muted)" }}>{r.desc}</p>
                </div>

                {/* Meta */}
                <div className="hidden md:flex items-center gap-6 text-xs flex-shrink-0" style={{ color: "var(--color-muted)" }}>
                  <span>{r.rows} rows</span>
                  <span>Updated {r.updated}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleSchedule(r.name)}
                    disabled={r.status === "processing"}
                    className="p-1.5 rounded-lg transition-colors"
                    title="Schedule"
                    style={{ color: "var(--color-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(r.name)}
                    disabled={r.status === "processing"}
                    className="p-1.5 rounded-lg transition-colors"
                    title="Download CSV"
                    style={{ color: "var(--color-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v7M4.5 7l2.5 2.5L9.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    className="p-1.5 rounded-lg transition-colors"
                    title="More options"
                    style={{ color: "var(--color-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="2.5" cy="7" r="1" fill="currentColor" />
                      <circle cx="7" cy="7" r="1" fill="currentColor" />
                      <circle cx="11.5" cy="7" r="1" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Report Builder Modal */}
      {builderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setBuilderOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-hover)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div>
                <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>Report Builder</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Configure and generate a custom report</p>
              </div>
              <button onClick={() => setBuilderOpen(false)} style={{ color: "var(--color-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Report name</label>
                <input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g. Q4 Growth Report"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {builders.map((b) => (
                  <div key={b.label}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>{b.label}</label>
                    <select
                      value={selections[b.label] ?? ""}
                      onChange={(e) => setSelections((s) => ({ ...s, [b.label]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: selections[b.label] ? "var(--color-text)" : "var(--color-muted)" }}
                    >
                      <option value="" disabled>Select…</option>
                      {b.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview area */}
              <div
                className="rounded-xl p-4 flex items-center justify-center"
                style={{ background: "var(--color-surface-2)", border: "1px dashed var(--color-border-hover)", minHeight: "80px" }}
              >
                {generating ? (
                  <div className="flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                      <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm">Generating report…</span>
                  </div>
                ) : (
                  <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
                    Configure options above and click Generate to build your report
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setBuilderOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                  style={{
                    background: generating ? "rgba(99,102,241,0.5)" : "var(--color-primary)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => { if (!generating) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {generating ? "Generating…" : "Generate Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
