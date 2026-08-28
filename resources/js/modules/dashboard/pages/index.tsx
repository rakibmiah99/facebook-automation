import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import MultiLabelDropdown from '../../../shared/components/MultiLabelDropdown';
import { useToast } from '../../../shared/components/Toast';
import AppLayout from '../../../shared/layouts/AppLayout';
import type { DashboardData } from '../types/dashboard';

interface Props {
    data: DashboardData;
}

const statusColor: Record<string, string> = {
    Active: '#10b981',
    Review: '#f59e0b',
    Paused: '#6b6b80',
};

export default function Index({ data }: Props) {
    const { toast } = useToast();
    const [categories, setCategories] = useState<string[]>(['revenue', 'users']);
    const [periods, setPeriods] = useState<string[]>(['30d']);
    const [teams, setTeams] = useState<string[]>([]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Dashboard
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                {today}
                            </p>
                        </div>
                        <button
                            onClick={() => toast('Opening report builder…', 'info')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-display)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                        >
                            <Plus size={14} />
                            New Report
                        </button>
                    </div>

                    {/* Filters row */}
                    <div
                        className="rounded-xl p-4 grid gap-4"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
                    >
                        <MultiLabelDropdown label="Categories" options={data.filters.categories} selected={categories} onChange={setCategories} placeholder="All categories" />
                        <MultiLabelDropdown label="Time Period" options={data.filters.periods} selected={periods} onChange={setPeriods} placeholder="Select period" />
                        <MultiLabelDropdown label="Teams" options={data.filters.teams} selected={teams} onChange={setTeams} placeholder="All teams" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                        {data.stats.map((s) => (
                            <div
                                key={s.label}
                                className="rounded-xl p-5 transition-all duration-150"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                                        {s.label}
                                    </span>
                                    <span
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: s.up ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                                            color: s.up ? 'var(--color-success)' : 'var(--color-danger)',
                                        }}
                                    >
                                        {s.change}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                    {s.value}
                                </p>
                                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                                    <div className="h-full rounded-full" style={{ width: '65%', background: s.color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart + Activity */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>
                        {/* Bar chart */}
                        <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                                        Revenue Overview
                                    </h2>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        Monthly breakdown, 2026
                                    </p>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                                    YTD
                                </span>
                            </div>
                            <div className="flex gap-2 h-40">
                                {data.revenue.values.map((h, i) => (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group">
                                        <div
                                            className="w-full rounded-t-sm transition-opacity duration-150 group-hover:opacity-100"
                                            style={{
                                                height: `${h}%`,
                                                background: i === data.revenue.values.length - 5 ? 'var(--color-primary)' : `rgba(99,102,241,${0.25 + (h / 100) * 0.3})`,
                                            }}
                                        />
                                        <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                                            {data.revenue.months[i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                                Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {data.activity.map((a, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                                            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
                                        >
                                            {a.user.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs leading-snug" style={{ color: 'var(--color-text)' }}>
                                                <span className="font-medium">{a.user}</span> {a.action}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${a.tagColor}18`, color: a.tagColor }}>
                                                    {a.tag}
                                                </span>
                                                <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                                                    {a.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Projects table */}
                    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                                Active Projects
                            </h2>
                            <button className="text-xs" style={{ color: 'var(--color-primary)' }} onClick={() => toast('Projects module is coming soon.', 'info')}>
                                View all →
                            </button>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    {['Project', 'Team', 'Status', 'Progress', 'Due'].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.projects.map((p, i) => (
                                    <tr
                                        key={i}
                                        className="transition-colors duration-100 cursor-pointer"
                                        style={{ borderBottom: i < data.projects.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                    >
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                                {p.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                                {p.team}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${statusColor[p.status]}15`, color: statusColor[p.status] }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
                                                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: statusColor[p.status] }} />
                                                </div>
                                                <span className="text-xs w-8 text-right" style={{ color: 'var(--color-muted)' }}>
                                                    {p.progress}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                                {p.due}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
