import { Link, router } from '@inertiajs/react';
import { Facebook, KeyRound, MoreVertical, Pencil, ShieldAlert, ShieldCheck, ShieldOff, Trash2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import type { FacebookApp } from '../types/facebook-app';

interface AppCardProps {
    app: FacebookApp,
    onEdit: () => void,
    onDelete: () => void,
    key?: number
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AppCard({ app, onEdit, onDelete, key }: AppCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const generateToken = () => {
        setMenuOpen(false);
        router.post(route('facebook-apps.generate-token', { facebookApp: app.id }), {}, { preserveScroll: true });
    };

    const validity = !app.has_long_lived_token
        ? { color: 'var(--color-warning)', Icon: ShieldAlert, label: 'No long-lived token yet' }
        : app.is_long_lived_token_valid
            ? {
                color: 'var(--color-success)',
                Icon: ShieldCheck,
                label: app.long_lived_token_expires_at ? `Valid until ${formatDate(app.long_lived_token_expires_at)}` : 'Token valid',
            }
            : {
                color: 'var(--color-danger)',
                Icon: ShieldOff,
                label: app.long_lived_token_expires_at ? `Expired ${formatDate(app.long_lived_token_expires_at)}` : 'Token expired',
            };

    const menuItemStyle = { color: 'var(--color-text)' };
    const menuItemHover = (e: React.MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)');
    const menuItemLeave = (e: React.MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'transparent');

    return (
        <div
            className="rounded-xl p-5 transition-all duration-150"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(24,119,242,0.12)' }}>
                        <Facebook size={18} style={{ color: '#1877F2' }} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                            {app.app_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                            App ID: {app.app_id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            background: app.status ? 'rgba(16,185,129,0.12)' : 'rgba(107,107,128,0.15)',
                            color: app.status ? 'var(--color-success)' : 'var(--color-muted)',
                        }}
                    >
                        {app.status ? 'Active' : 'Inactive'}
                    </span>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            title="App actions"
                            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100"
                            style={{ color: 'var(--color-muted)', background: menuOpen ? 'var(--color-surface-2)' : 'transparent' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = menuOpen ? 'var(--color-surface-2)' : 'transparent')}
                        >
                            <MoreVertical size={15} />
                        </button>

                        {menuOpen && (
                            <div
                                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-2xl overflow-hidden z-20"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-hover)' }}
                            >
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onEdit();
                                        }}
                                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-100"
                                        style={menuItemStyle}
                                        onMouseEnter={menuItemHover}
                                        onMouseLeave={menuItemLeave}
                                    >
                                        <Pencil size={14} />
                                        Edit app
                                    </button>
                                    <Link
                                        href={route('facebook-app-accounts.index', { facebookApp: app.id })}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-100"
                                        style={menuItemStyle}
                                        onMouseEnter={menuItemHover}
                                        onMouseLeave={menuItemLeave}
                                    >
                                        <Users size={14} />
                                        Accounts
                                    </Link>
                                    <button
                                        onClick={generateToken}
                                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-100"
                                        style={menuItemStyle}
                                        onMouseEnter={menuItemHover}
                                        onMouseLeave={menuItemLeave}
                                    >
                                        <KeyRound size={14} />
                                        {app.has_long_lived_token ? 'Regenerate token' : 'Generate token'}
                                    </button>
                                    <div style={{ borderTop: '1px solid var(--color-border)' }} className="mt-1 pt-1">
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onDelete();
                                            }}
                                            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-100"
                                            style={{ color: 'var(--color-danger)' }}
                                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)')}
                                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                        >
                                            <Trash2 size={14} />
                                            Delete app
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
                <validity.Icon size={14} style={{ color: validity.color, flexShrink: 0 }} />
                <span className="text-xs truncate" style={{ color: 'var(--color-text)' }}>
                    {validity.label}
                </span>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                    Added {formatDate(app.created_at)}
                </span>
            </div>
        </div>
    );
}
