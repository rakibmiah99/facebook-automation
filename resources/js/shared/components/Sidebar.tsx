import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CheckSquare,
    ChevronDown,
    ChevronLeft,
    ClipboardList,
    Facebook,
    FileText,
    FolderKanban,
    Image,
    LayoutGrid,
    LayoutTemplate,
    List,
    Send,
    Settings,
    ShieldCheck,
    Type,
    Users,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { route } from 'ziggy-js';
import type { SharedPageProps } from '../types/shared';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    /** Below the `lg` breakpoint the sidebar becomes an off-canvas drawer instead of pushing
     *  content — `mobileOpen` controls whether it's slid into view. */
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

interface ChildNavItem {
    id: string;
    label: string;
    icon: ComponentType<{ size?: number }>;
    routeName?: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: ComponentType<{ size?: number }>;
    routeName?: string;
    children?: ChildNavItem[];
}

function buildNavItems(isAdmin: boolean): { group: string; items: NavItem[] }[] {
    const groups: { group: string; items: NavItem[] }[] = [
        {
            group: 'Main',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, routeName: 'dashboard.index' },
                { id: 'facebook-apps', label: 'My Apps', icon: Facebook, routeName: 'facebook-apps.index' },
                {
                    id: 'post',
                    label: 'Post',
                    icon: Send,
                    children: [
                        { id: 'post-text', label: 'Text', icon: Type, routeName: 'posts.text' },
                        { id: 'post-image', label: 'Image', icon: Image, routeName: 'posts.image' },
                        { id: 'post-list', label: 'Post List', icon: List, routeName: 'posts.index' },
                    ],
                },
                {
                    id: 'customization',
                    label: 'Customization',
                    icon: LayoutTemplate,
                    children: [
                        { id: 'customization-templates', label: 'Templates', icon: LayoutTemplate, routeName: 'templates.index' },
                        { id: 'customization-requests', label: 'Custom Template Requests', icon: ClipboardList, routeName: 'template-requests.index' },
                    ],
                },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'projects', label: 'Projects', icon: FolderKanban },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                { id: 'reports', label: 'Reports', icon: FileText },
            ],
        },
        {
            group: 'Manage',
            items: [
                { id: 'team', label: 'Team', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings },
            ],
        },
    ];

    if (isAdmin) {
        groups.push({
            group: 'Admin',
            items: [
                {
                    id: 'admin',
                    label: 'Customization Admin',
                    icon: ShieldCheck,
                    children: [
                        { id: 'admin-templates', label: 'Manage Templates', icon: LayoutTemplate, routeName: 'admin.templates.index' },
                        { id: 'admin-requests', label: 'Template Requests', icon: ClipboardList, routeName: 'admin.template-requests.index' },
                    ],
                },
            ],
        });
    }

    return groups;
}

function isChildActive(item: NavItem): boolean {
    return item.children?.some((child) => child.routeName && route().current(child.routeName)) ?? false;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const { auth } = usePage<SharedPageProps>().props;
    const navItems = buildNavItems(Boolean(auth.user?.is_admin));

    return (
        <>
            {/* Backdrop — mobile only, closes the drawer on tap outside it */}
            {mobileOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onCloseMobile} />}

            <aside
                className={`flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
                style={{
                    width: collapsed ? '64px' : '220px',
                    background: 'var(--color-surface)',
                    borderRight: '1px solid var(--color-border)',
                }}
            >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 flex-shrink-0" style={{ height: '60px', borderBottom: '1px solid var(--color-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                        <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
                        <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
                        <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" />
                    </svg>
                </div>
                {!collapsed && (
                    <span className="font-semibold text-sm tracking-tight truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                        Nexus
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                {navItems.map((group) => (
                    <div key={group.group} className="mb-5">
                        {!collapsed && (
                            <span className="block px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                                {group.group}
                            </span>
                        )}
                        {group.items.map((item) => {
                            const { id, label, icon: Icon, routeName, children } = item;

                            if (children) {
                                const childActive = isChildActive(item);
                                const isOpen = expanded[id] ?? childActive;

                                return (
                                    <div key={id} className="mb-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (collapsed) {
                                                    const first = children.find((c) => c.routeName);
                                                    if (first?.routeName) router.visit(route(first.routeName));
                                                    return;
                                                }
                                                setExpanded((prev) => ({ ...prev, [id]: !isOpen }));
                                            }}
                                            title={collapsed ? label : undefined}
                                            className="flex items-center gap-3 w-full rounded-lg transition-all duration-150"
                                            style={{
                                                padding: collapsed ? '9px 10px' : '9px 12px',
                                                background: childActive ? 'var(--color-primary-dim)' : 'transparent',
                                                color: childActive ? 'var(--color-primary)' : 'var(--color-muted)',
                                                justifyContent: collapsed ? 'center' : 'flex-start',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!childActive) {
                                                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!childActive) {
                                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                                                }
                                            }}
                                        >
                                            <Icon size={16} />
                                            {!collapsed && (
                                                <span className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                                    <span className="text-sm font-medium truncate">{label}</span>
                                                    <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                                </span>
                                            )}
                                        </button>

                                        {!collapsed && isOpen && (
                                            <div className="mt-0.5 ml-4 pl-3 space-y-0.5" style={{ borderLeft: '1px solid var(--color-border)' }}>
                                                {children.map((child) => {
                                                    const ChildIcon = child.icon;

                                                    if (!child.routeName) {
                                                        return (
                                                            <button
                                                                key={child.id}
                                                                type="button"
                                                                disabled
                                                                className="flex items-center gap-2.5 w-full rounded-lg py-2 px-2.5 cursor-not-allowed"
                                                                style={{ color: 'var(--color-muted-2)' }}
                                                            >
                                                                <ChildIcon size={14} />
                                                                <span className="text-xs font-medium flex-1 text-left truncate">{child.label}</span>
                                                                <span
                                                                    className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0"
                                                                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
                                                                >
                                                                    Soon
                                                                </span>
                                                            </button>
                                                        );
                                                    }

                                                    const active = route().current(child.routeName);

                                                    return (
                                                        <Link
                                                            key={child.id}
                                                            href={route(child.routeName)}
                                                            className="flex items-center gap-2.5 w-full rounded-lg py-2 px-2.5 transition-colors duration-100"
                                                            style={{
                                                                background: active ? 'var(--color-primary-dim)' : 'transparent',
                                                                color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!active) {
                                                                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!active) {
                                                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                                                                }
                                                            }}
                                                        >
                                                            <ChildIcon size={14} />
                                                            <span className="text-xs font-medium truncate">{child.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            const disabled = !routeName;
                            const isActive = routeName ? route().current(routeName) : false;

                            if (disabled) {
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        disabled
                                        title={collapsed ? `${label} (coming soon)` : undefined}
                                        className="flex items-center gap-3 w-full rounded-lg mb-0.5 cursor-not-allowed"
                                        style={{
                                            padding: collapsed ? '9px 10px' : '9px 12px',
                                            color: 'var(--color-muted-2)',
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                        }}
                                    >
                                        <Icon size={16} />
                                        {!collapsed && (
                                            <span className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                                <span className="text-sm font-medium truncate">{label}</span>
                                                <span
                                                    className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0"
                                                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
                                                >
                                                    Soon
                                                </span>
                                            </span>
                                        )}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={id}
                                    href={route(routeName)}
                                    title={collapsed ? label : undefined}
                                    className="flex items-center gap-3 w-full rounded-lg transition-all duration-150 mb-0.5"
                                    style={{
                                        padding: collapsed ? '9px 10px' : '9px 12px',
                                        background: isActive ? 'var(--color-primary-dim)' : 'transparent',
                                        color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                            (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                                            (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                                        }
                                    }}
                                >
                                    <Icon size={16} />
                                    {!collapsed && <span className="text-sm font-medium">{label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Collapse toggle — desktop only; an off-canvas mobile drawer has no use for an
                icons-only collapsed state, it just closes via the backdrop instead. */}
            <div style={{ borderTop: '1px solid var(--color-border)' }} className="p-2 hidden lg:block">
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center w-full py-2 rounded-lg transition-colors duration-150"
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
                    <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
            </div>
            </aside>
        </>
    );
}
