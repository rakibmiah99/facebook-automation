import { useState } from "react";
import MultiLabelDropdown from "../ui/MultiLabelDropdown";
import { useToast } from "../ui/Toast";

const roleOptions = [
  { value: "admin", label: "Admin", color: "#f43f5e" },
  { value: "lead", label: "Lead", color: "#f59e0b" },
  { value: "member", label: "Member", color: "#6366f1" },
  { value: "viewer", label: "Viewer", color: "#6b6b80" },
];

const deptOptions = [
  { value: "eng", label: "Engineering", color: "#22d3ee" },
  { value: "design", label: "Design", color: "#f59e0b" },
  { value: "product", label: "Product", color: "#10b981" },
  { value: "growth", label: "Growth", color: "#f43f5e" },
];

const members = [
  { id: 1, name: "Mia Chen", email: "mia@nexus.io", role: "admin", dept: "eng", title: "Staff Engineer", joined: "Mar 2024", tasks: 12, status: "online" },
  { id: 2, name: "Luca Ferri", email: "luca@nexus.io", role: "lead", dept: "eng", title: "Tech Lead", joined: "Jan 2024", tasks: 8, status: "online" },
  { id: 3, name: "Riya Patel", email: "riya@nexus.io", role: "member", dept: "design", title: "Senior Designer", joined: "Jun 2024", tasks: 5, status: "away" },
  { id: 4, name: "Omar Saeed", email: "omar@nexus.io", role: "lead", dept: "growth", title: "Growth Lead", joined: "Feb 2024", tasks: 9, status: "online" },
  { id: 5, name: "Sophie Lane", email: "sophie@nexus.io", role: "member", dept: "design", title: "UI Designer", joined: "Aug 2024", tasks: 6, status: "offline" },
  { id: 6, name: "Arjun Mehta", email: "arjun@nexus.io", role: "member", dept: "eng", title: "Backend Engineer", joined: "Apr 2024", tasks: 11, status: "online" },
  { id: 7, name: "Nina Torres", email: "nina@nexus.io", role: "viewer", dept: "product", title: "Product Analyst", joined: "Sep 2024", tasks: 3, status: "away" },
  { id: 8, name: "Kai Nakamura", email: "kai@nexus.io", role: "lead", dept: "product", title: "Product Manager", joined: "Nov 2023", tasks: 14, status: "online" },
];

const roleColor: Record<string, { color: string; bg: string }> = {
  admin: { color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
  lead: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  member: { color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  viewer: { color: "#6b6b80", bg: "rgba(107,107,128,0.15)" },
};

const statusDot: Record<string, string> = {
  online: "#10b981",
  away: "#f59e0b",
  offline: "#6b6b80",
};

const avatarColors = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#6366f1", "#22d3ee", "#10b981"];

export default function TeamPage() {
  const { toast } = useToast();
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const filtered = members.filter((m) => {
    if (roleFilter.length && !roleFilter.includes(m.role)) return false;
    if (deptFilter.length && !deptFilter.includes(m.dept)) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleInvite = () => {
    if (!inviteEmail) { toast("Enter an email address", "warning"); return; }
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail("");
      setShowInvite(false);
      toast(`Invitation sent to ${inviteEmail}`, "success");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Team</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              {members.length} members · {members.filter(m => m.status === "online").length} online now
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
            style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {[
            { label: "Total Members", value: members.length, color: "#6366f1" },
            { label: "Online Now", value: members.filter(m => m.status === "online").length, color: "#10b981" },
            { label: "Departments", value: 4, color: "#22d3ee" },
            { label: "Open Tasks", value: members.reduce((a, m) => a + m.tasks, 0), color: "#f59e0b" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--color-muted)" }}>{s.label}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="flex flex-wrap items-end gap-3 p-4 rounded-xl"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Search</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: "var(--color-muted)" }}>
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8.5 8.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..." className="bg-transparent text-sm outline-none flex-1" style={{ color: "var(--color-text)" }} />
            </div>
          </div>
          <div className="min-w-44">
            <MultiLabelDropdown label="Role" options={roleOptions} selected={roleFilter} onChange={setRoleFilter} placeholder="All roles" />
          </div>
          <div className="min-w-44">
            <MultiLabelDropdown label="Department" options={deptOptions} selected={deptFilter} onChange={setDeptFilter} placeholder="All departments" />
          </div>
        </div>

        {/* Members grid */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {filtered.map((m, i) => {
            const rc = roleColor[m.role];
            return (
              <div
                key={m.id}
                className="rounded-xl p-4 transition-all duration-150"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                      style={{ background: avatarColors[i % avatarColors.length], color: "white" }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: statusDot[m.status], borderColor: "var(--color-surface)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>{m.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-muted)" }}>{m.title}</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-muted)" }}>{m.email}</p>
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0"
                    style={{ background: rc.bg, color: rc.color }}
                  >
                    {m.role}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded capitalize"
                    style={{ background: "var(--color-surface-2)", color: "var(--color-muted)" }}
                  >
                    {m.dept}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>{m.tasks} tasks</span>
                    <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>Joined {m.joined}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowInvite(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-hover)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>Invite a team member</h2>
            <p className="text-xs mb-5" style={{ color: "var(--color-muted)" }}>They'll receive an email invitation to join Nexus.</p>

            {inviteSent ? (
              <div className="flex items-center gap-2 py-3 justify-center" style={{ color: "var(--color-success)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium">Invitation sent!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Email address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Role</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  >
                    {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowInvite(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                    style={{ background: "var(--color-primary)", color: "white" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
