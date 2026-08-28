import { LayoutGrid, LogOut, MoonStar, Search, Sun } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Command {
    id: string;
    label: string;
    desc?: string;
    group: string;
    icon?: ReactNode;
    action: () => void;
}

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    onLogout: () => void;
    onToggleTheme: () => void;
    isDark: boolean;
}

export default function CommandPalette({ open, onClose, onLogout, onToggleTheme, isDark }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const commands: Command[] = [
        {
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            group: 'Navigation',
            icon: <LayoutGrid size={14} />,
            action: () => onClose(),
        },
        {
            id: 'sys-theme',
            label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            group: 'System',
            icon: isDark ? <Sun size={14} /> : <MoonStar size={14} />,
            action: () => {
                onToggleTheme();
                onClose();
            },
        },
        {
            id: 'sys-logout',
            label: 'Sign out',
            desc: 'Log out of your account',
            group: 'System',
            icon: <LogOut size={14} />,
            action: () => {
                onLogout();
                onClose();
            },
        },
    ];

    const filtered = query.trim()
        ? commands.filter(
              (c) =>
                  c.label.toLowerCase().includes(query.toLowerCase()) ||
                  c.desc?.toLowerCase().includes(query.toLowerCase()) ||
                  c.group.toLowerCase().includes(query.toLowerCase()),
          )
        : commands;

    const groups = Array.from(new Set(filtered.map((c) => c.group)));
    const flat = groups.flatMap((g) => filtered.filter((c) => c.group === g));

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 30);
        }
    }, [open]);

    useEffect(() => {
        setSelected(0);
    }, [query]);

    useEffect(() => {
        if (!open) return;
        const handle = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, flat.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                flat[selected]?.action();
            }
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [open, flat, selected, onClose]);

    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-idx="${selected}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [selected]);

    if (!open) return null;

    let idx = -1;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-hover)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4" style={{ height: '54px', borderBottom: '1px solid var(--color-border)' }}>
                    <Search size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search commands, pages, actions…"
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: 'var(--color-text)' }}
                    />
                    <kbd
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
                    >
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="overflow-y-auto py-2" style={{ maxHeight: '380px' }}>
                    {flat.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                                No results for "{query}"
                            </p>
                        </div>
                    ) : (
                        groups.map((group) => {
                            const groupCmds = filtered.filter((c) => c.group === group);
                            return (
                                <div key={group}>
                                    <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
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
                                                style={{ background: isSelected ? 'var(--color-primary-dim)' : 'transparent' }}
                                            >
                                                <span
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        background: isSelected ? 'rgba(99,102,241,0.2)' : 'var(--color-surface-2)',
                                                        color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)',
                                                    }}
                                                >
                                                    {cmd.icon}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-sm" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                                                        {cmd.label}
                                                    </span>
                                                    {cmd.desc && (
                                                        <span className="block text-xs" style={{ color: 'var(--color-muted)' }}>
                                                            {cmd.desc}
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                    {[['↑↓', 'navigate'], ['↵', 'select'], ['ESC', 'close']].map(([key, action]) => (
                        <span key={action} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-muted)' }}>
                            <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
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
