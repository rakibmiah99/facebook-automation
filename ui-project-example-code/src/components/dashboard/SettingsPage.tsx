import { useState } from "react";
import { useToast } from "../ui/Toast";

const tabs = ["Profile", "Account", "Notifications", "Integrations", "Billing"];

const plans = [
  { name: "Starter", price: "$0", desc: "For individuals and small teams", features: ["5 projects", "3 team members", "1GB storage", "Community support"] },
  { name: "Pro", price: "$29", desc: "For growing teams", features: ["Unlimited projects", "25 team members", "50GB storage", "Priority support", "Analytics"], current: true },
  { name: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Unlimited everything", "SSO & SAML", "Custom SLAs", "Dedicated CSM", "Audit logs"] },
];

const integrations = [
  { name: "GitHub", desc: "Connect repositories and automate deployments", connected: true, icon: "GH" },
  { name: "Slack", desc: "Get task and project notifications in Slack", connected: true, icon: "SL" },
  { name: "Figma", desc: "Link designs to projects and tasks", connected: false, icon: "FG" },
  { name: "Linear", desc: "Sync issues and sprints bidirectionally", connected: false, icon: "LN" },
  { name: "Notion", desc: "Embed Notion pages in project workspaces", connected: false, icon: "NT" },
  { name: "Jira", desc: "Import and track Jira tickets", connected: false, icon: "JR" },
];

const notifSettings = [
  { id: "task_assign", label: "Task assigned to me", desc: "When someone assigns a task to you", defaultOn: true },
  { id: "task_comment", label: "Comments on my tasks", desc: "When someone comments on your task", defaultOn: true },
  { id: "project_update", label: "Project status updates", desc: "When a project's status changes", defaultOn: false },
  { id: "sprint_end", label: "Sprint reminders", desc: "24h before a sprint ends", defaultOn: true },
  { id: "team_invite", label: "Team activity digest", desc: "Weekly digest of team activity", defaultOn: false },
  { id: "billing", label: "Billing alerts", desc: "Usage limits and invoice notifications", defaultOn: true },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0 transition-colors duration-200 rounded-full"
      style={{
        width: 36,
        height: 20,
        background: on ? "var(--color-primary)" : "var(--color-surface-2)",
        border: `1px solid ${on ? "var(--color-primary)" : "var(--color-border-hover)"}`,
      }}
    >
      <span
        className="absolute top-0.5 rounded-full transition-all duration-200"
        style={{
          width: 16, height: 16,
          background: "white",
          left: on ? "calc(100% - 18px)" : "1px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("Profile");
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifSettings.map((n) => [n.id, n.defaultOn]))
  );
  const [intgs, setIntgs] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.name, i.connected]))
  );
  const [profile, setProfile] = useState({ name: "Alex Johnson", email: "alex@nexus.io", bio: "Building things at Nexus.", timezone: "UTC-8 (Pacific Time)" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast("Profile saved successfully", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleIntg = (name: string, on: boolean) => {
    setIntgs((prev) => ({ ...prev, [name]: !on }));
    toast(!on ? `${name} connected` : `${name} disconnected`, !on ? "success" : "info");
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Settings nav */}
      <div
        className="w-48 flex-shrink-0 py-6 px-3"
        style={{ borderRight: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Settings</p>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-100"
            style={{
              background: tab === t ? "var(--color-primary-dim)" : "transparent",
              color: tab === t ? "var(--color-primary)" : "var(--color-muted)",
              fontWeight: tab === t ? 500 : 400,
            }}
            onMouseEnter={(e) => { if (tab !== t) { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text)"; } }}
            onMouseLeave={(e) => { if (tab !== t) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; } }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">

          {/* Profile */}
          {tab === "Profile" && (
            <>
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Profile</h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Manage your public profile information.</p>
              </div>

              <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}
                  >
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                    >
                      Change avatar
                    </button>
                    <p className="text-[11px] mt-1" style={{ color: "var(--color-muted)" }}>JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                {[
                  { label: "Full name", key: "name", type: "text" },
                  { label: "Email address", key: "email", type: "email" },
                  { label: "Timezone", key: "timezone", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>{label}</label>
                    <input
                      type={type}
                      value={profile[key as keyof typeof profile]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
                    style={{ background: "var(--color-primary)", color: "white" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                  >
                    {saved ? "Saved ✓" : "Save changes"}
                  </button>
                  {saved && <span className="text-xs" style={{ color: "var(--color-success)" }}>Changes saved</span>}
                </div>
              </div>
            </>
          )}

          {/* Notifications */}
          {tab === "Notifications" && (
            <>
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Notifications</h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Choose what you want to be notified about.</p>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                {notifSettings.map((n, i) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                    style={{ borderBottom: i < notifSettings.length - 1 ? "1px solid var(--color-border)" : "none" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{n.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{n.desc}</p>
                    </div>
                    <Toggle on={notifs[n.id]} onChange={(v) => setNotifs((prev) => ({ ...prev, [n.id]: v }))} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Integrations */}
          {tab === "Integrations" && (
            <>
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Integrations</h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Connect your favorite tools to Nexus.</p>
              </div>
              <div className="space-y-3">
                {integrations.map((intg) => {
                  const on = intgs[intg.name];
                  return (
                    <div
                      key={intg.name}
                      className="flex items-center gap-4 rounded-xl p-4"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--color-surface-2)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
                      >
                        {intg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{intg.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>{intg.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleIntg(intg.name, on)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                        style={{
                          background: on ? "rgba(16,185,129,0.12)" : "var(--color-surface-2)",
                          color: on ? "var(--color-success)" : "var(--color-text)",
                          border: `1px solid ${on ? "rgba(16,185,129,0.3)" : "var(--color-border)"}`,
                        }}
                      >
                        {on ? "Connected" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Billing */}
          {tab === "Billing" && (
            <>
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Billing & Plans</h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Manage your subscription and payment details.</p>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className="rounded-xl p-4 transition-all"
                    style={{
                      background: plan.current ? "var(--color-primary-dim)" : "var(--color-surface)",
                      border: `1px solid ${plan.current ? "rgba(99,102,241,0.4)" : "var(--color-border)"}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{plan.name}</p>
                      {plan.current && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "var(--color-primary)", color: "white" }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: plan.current ? "var(--color-primary)" : "var(--color-text)" }}>
                      {plan.price}
                      {plan.price !== "Custom" && <span className="text-xs font-normal" style={{ color: "var(--color-muted)" }}>/mo</span>}
                    </p>
                    <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>{plan.desc}</p>
                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="var(--color-success)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="w-full py-2 rounded-lg text-xs font-semibold transition-opacity"
                      style={{
                        background: plan.current ? "var(--color-primary)" : "var(--color-surface-2)",
                        color: plan.current ? "white" : "var(--color-text)",
                        border: plan.current ? "none" : "1px solid var(--color-border)",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                    >
                      {plan.current ? "Manage plan" : "Upgrade"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Account */}
          {tab === "Account" && (
            <>
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Account</h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Security, password, and account actions.</p>
              </div>
              <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Change password</h3>
                {["Current password", "New password", "Confirm new password"].map((label) => (
                  <div key={label}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>{label}</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    />
                  </div>
                ))}
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
                  style={{ background: "var(--color-primary)", color: "white" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  Update password
                </button>
              </div>

              <div className="rounded-xl p-5" style={{ background: "var(--color-surface)", border: "1px solid rgba(244,63,94,0.2)" }}>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-danger)" }}>Danger zone</h3>
                <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>These actions are irreversible. Please proceed with caution.</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(244,63,94,0.08)", color: "var(--color-danger)", border: "1px solid rgba(244,63,94,0.2)" }}
                  >
                    Delete workspace
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(244,63,94,0.08)", color: "var(--color-danger)", border: "1px solid rgba(244,63,94,0.2)" }}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
