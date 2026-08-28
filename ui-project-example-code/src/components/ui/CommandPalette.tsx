import { useState, useEffect, useRef } from "react";

interface Command {
  id: string;
  label: string;
  desc?: string;
  group: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNav: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  toast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function CommandPalette({ open, onClose, onNav, onLogout, onToggleTheme, toast }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const buildCommands = (): Command[] => [
    {
      id: "nav-dashboard", label: "Go to Dashboard", group: "Navigation",
      icon: <NavIcon d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" />,
      action: () => { onNav("dashboard"); onClose(); },
    },
    {
      id: "nav-analytics", label: "Go to Analytics", group: "Navigation",
      icon: <NavIcon d="M2 14V8l3-3 3 3 4-6M2 14h12" />,
      action: () => { onNav("analytics"); onClose(); },
    },
    {
      id: "nav-projects", label: "Go to Projects", group: "Navigation",
      icon: <NavIcon d="M1.5 4.5A1.5 1.5 0 013 3h3l2 2h5a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0113 14H3a1.5 1.5 0 01-1.5-1.5v-8z" />,
      action: () => { onNav("projects"); onClose(); },
    },
    {
      id: "nav-tasks", label: "Go to Tasks", group: "Navigation",
      icon: <NavIcon d="M1.5 1.5h13v13h-13zM5 8l2 2 4-4" />,
      action: () => { onNav("tasks"); onClose(); },
    },
    {
      id: "nav-team", label: "Go to Team", group: "Navigation",
      icon: <NavIcon d="M6 5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1 13c0-2.761 2.239-4 5-4s5 1.239 5 4M11 7.5a2 2 0 100-4M15 13c0-2-1.5-3.5-3.5-3.5" />,
      action: () => { onNav("team"); onClose(); },
    },
    {
      id: "nav-settings", label: "Go to Settings", group: "Navigation",
      icon: <NavIcon d="M8 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1" />,
      action: () => { onNav("settings"); onClose(); },
    },
    {
      id: "action-new-project", label: "New Project", desc: "Create a new project", group: "Actions",
      shortcut: "N P",
      icon: <ActionIcon />,
      action: () => { onNav("projects"); toast("Opening project creation…", "info"); onClose(); },
    },
    {
      id: "action-new-task", label: "New Task", desc: "Add a task to the board", group: "Actions",
      shortcut: "N T",
      icon: <ActionIcon />,
      action: () => { onNav("tasks"); toast("Opening task board…", "info"); onClose(); },
    },
    {
      id: "action-invite", label: "Invite Team Member", desc: "Send an invitation", group: "Actions",
      icon: <ActionIcon />,
      action: () => { onNav("team"); toast("Opening invite dialog…", "info"); onClose(); },
    },
    {
      id: "action-export", label: "Export Report", desc: "Download as CSV", group: "Actions",
      icon: <ActionIcon />,
      action: () => { toast("Generating report CSV…", "success"); onClose(); },
    },
    {
      id: "sys-theme", label: "Toggle Dark / Light Mode", group: "System",
      action: () => { onToggleTheme(); onClose(); },
    },
    {
      id: "sys-logout", label: "Sign out", desc: "Log out of your account", group: "System",
      action: () => { onLogout(); onClose(); },
    },
  ];

  const commands = buildCommands();

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.desc?.toLowerCase().includes(query.toLowerCase()) ||
          c.group.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const groups = Array.from(new Set(filtered.map((c) => c.group)));

  const flat = groups.flatMap((g) => filtered.filter((c) => c.group === g));

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, flat.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); flat[selected]?.action(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, flat, selected]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  if (!open) return null;

  let idx = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-hover)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: "54px", borderBottom: "1px solid var(--color-border)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-muted)", flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, actions…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text)" }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: "var(--color-surface-2)", color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto py-2" style={{ maxHeight: "380px" }}>
          {flat.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>No results for "{query}"</p>
            </div>
          ) : (
            groups.map((group) => {
              const groupCmds = filtered.filter((c) => c.group === group);
              return (
                <div key={group}>
                  <p
                    className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {group}
                  </p>
                  {groupCmds.map((cmd) => {
                    idx++;
                    const isSelected = idx === selected;
                    const currentIdx = idx;
                    return (
                      <button
                        key={cmd.id}
                        data-idx={currentIdx}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelected(currentIdx)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors duration-75"
                        style={{ background: isSelected ? "var(--color-primary-dim)" : "transparent" }}
                      >
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isSelected ? "rgba(99,102,241,0.2)" : "var(--color-surface-2)",
                            color: isSelected ? "var(--color-primary)" : "var(--color-muted)",
                          }}
                        >
                          {cmd.icon ?? <DefaultIcon />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-sm"
                            style={{ color: isSelected ? "var(--color-primary)" : "var(--color-text)" }}
                          >
                            {cmd.label}
                          </span>
                          {cmd.desc && (
                            <span className="block text-xs" style={{ color: "var(--color-muted)" }}>{cmd.desc}</span>
                          )}
                        </span>
                        {cmd.shortcut && (
                          <span className="flex gap-1">
                            {cmd.shortcut.split(" ").map((k) => (
                              <kbd
                                key={k}
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: "var(--color-surface-2)",
                                  color: "var(--color-muted)",
                                  border: "1px solid var(--color-border)",
                                }}
                              >
                                {k}
                              </kbd>
                            ))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2.5"
          style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}
        >
          {[["↑↓", "navigate"], ["↵", "select"], ["ESC", "close"]].map(([key, action]) => (
            <span key={action} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px]"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                {key}
              </kbd>
              {action}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DefaultIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
