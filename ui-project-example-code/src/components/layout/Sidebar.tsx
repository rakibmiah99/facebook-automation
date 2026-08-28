interface SidebarProps {
  active: string;
  onNav: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    group: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: GridIcon },
      { id: "analytics", label: "Analytics", icon: ChartIcon },
      { id: "projects", label: "Projects", icon: FolderIcon },
      { id: "tasks", label: "Tasks", icon: CheckIcon },
      { id: "reports", label: "Reports", icon: ReportIcon },
    ],
  },
  {
    group: "Manage",
    items: [
      { id: "team", label: "Team", icon: UsersIcon },
      { id: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export default function Sidebar({ active, onNav, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0"
      style={{
        width: collapsed ? "64px" : "220px",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ height: "60px", borderBottom: "1px solid var(--color-border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <span
            className="font-semibold text-sm tracking-tight truncate"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Nexus
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((group) => (
          <div key={group.group} className="mb-5">
            {!collapsed && (
              <span
                className="block px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                {group.group}
              </span>
            )}
            {group.items.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => onNav(id)}
                  title={collapsed ? label : undefined}
                  className="flex items-center gap-3 w-full rounded-lg transition-all duration-150 mb-0.5"
                  style={{
                    padding: collapsed ? "9px 10px" : "9px 12px",
                    background: isActive ? "var(--color-primary-dim)" : "transparent",
                    color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                    justifyContent: collapsed ? "center" : "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-muted)";
                    }
                  }}
                >
                  <Icon size={16} />
                  {!collapsed && <span className="text-sm font-medium">{label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div style={{ borderTop: "1px solid var(--color-border)" }} className="p-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg transition-colors duration-150"
          style={{ color: "var(--color-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--color-muted)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
          >
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ChartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 14V8l3-3 3 3 4-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1.5 4.5A1.5 1.5 0 013 3h3l2 2h5a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0113 14H3a1.5 1.5 0 01-1.5-1.5v-8z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 13c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 7.5a2 2 0 100-4M15 13c0-2-1.5-3.5-3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReportIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
