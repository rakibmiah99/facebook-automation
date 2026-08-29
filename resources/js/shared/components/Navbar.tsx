import { Bell, ChevronDown, Menu, MoonStar, Search, Sun } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../types/user';

interface NavbarProps {
    user: User;
    onLogout: () => void;
    onOpenSearch?: () => void;
    onOpenSidebar?: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
}

const notifications = [
    { id: 1, text: 'New project assigned: Nexus API v2', time: '2m ago', unread: true },
    { id: 2, text: 'Task completed by Alex Kim', time: '14m ago', unread: true },
    { id: 3, text: 'Sprint review scheduled for Friday', time: '1h ago', unread: false },
    { id: 4, text: 'Budget threshold reached: Q4 Marketing', time: '3h ago', unread: false },
];

export default function Navbar({ user, onLogout, onOpenSearch, onOpenSidebar, isDark, onToggleTheme }: NavbarProps) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const unread = notifications.filter((n) => n.unread).length;

    return (
        <header
            className="flex items-center justify-between px-6 flex-shrink-0 relative"
            style={{ height: '60px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
            {/* Search — opens command palette */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
                <button
                    onClick={onOpenSidebar}
                    className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ color: 'var(--color-muted)' }}
                    aria-label="Open menu"
                >
                    <Menu size={18} />
                </button>
                <button
                    onClick={onOpenSearch}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all duration-150 text-left"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                >
                    <Search size={14} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    <span className="text-sm flex-1 min-w-0" style={{ color: 'var(--color-muted)' }}>
                        Search anything...
                    </span>
                    <kbd
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' }}
                    >
                        ⌘K
                    </kbd>
                </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <button
                    onClick={onToggleTheme}
                    className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
                    style={{ color: 'var(--color-muted)' }}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                    }}
                >
                    {isDark ? <Sun size={16} /> : <MoonStar size={16} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setNotifOpen(!notifOpen);
                            setProfileOpen(false);
                        }}
                        className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150"
                        style={{ color: 'var(--color-muted)' }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                        }}
                    >
                        <Bell size={16} />
                        {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--color-danger)' }} />}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-hover)' }}>
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span className="text-sm font-semibold">Notifications</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}>
                                    {unread} new
                                </span>
                            </div>
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-100"
                                    style={{ background: n.unread ? 'rgba(99,102,241,0.04)' : 'transparent', borderBottom: '1px solid var(--color-border)' }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = n.unread ? 'rgba(99,102,241,0.04)' : 'transparent')}
                                >
                                    {n.unread && (
                                        <div className="flex-shrink-0 mt-1.5">
                                            <span className="block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
                                        </div>
                                    )}
                                    <div className={n.unread ? '' : 'pl-4'}>
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
                                            {n.text}
                                        </p>
                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                            {n.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="p-2">
                                <button
                                    className="w-full text-xs py-2 rounded-lg transition-colors duration-100"
                                    style={{ color: 'var(--color-primary)' }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-primary-dim)')}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotifOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150"
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-display)' }}
                        >
                            {user.name.charAt(0)}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-medium leading-tight" style={{ color: 'var(--color-text)' }}>
                                {user.name}
                            </p>
                            <p className="text-[10px] leading-tight" style={{ color: 'var(--color-muted)' }}>
                                {user.email}
                            </p>
                        </div>
                        <ChevronDown size={12} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-hover)' }}>
                            <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                                    {user.name}
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    {user.email}
                                </p>
                            </div>
                            <div className="p-1">
                                {['Profile', 'Preferences', 'Billing'].map((item) => (
                                    <button
                                        key={item}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-100"
                                        style={{ color: 'var(--color-text)' }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                    >
                                        {item}
                                    </button>
                                ))}
                                <div style={{ borderTop: '1px solid var(--color-border)' }} className="mt-1 pt-1">
                                    <button
                                        onClick={onLogout}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-100"
                                        style={{ color: 'var(--color-danger)' }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)')}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
