import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import type { PostFilterAccount, PostFilters as PostFiltersType } from '../types/post';

interface Props {
    filters: PostFiltersType;
    accounts: PostFilterAccount[];
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'failed', label: 'Failed' },
];

const POST_TYPE_OPTIONS = [
    { value: 'all', label: 'All Post' },
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' },
];

const selectStyle: React.CSSProperties = {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
};

function applyFocusStyle(el: HTMLElement) {
    el.style.borderColor = 'var(--color-primary)';
    el.style.outline = '1px solid rgba(99,102,241,0.25)';
}

function applyBlurStyle(el: HTMLElement) {
    el.style.borderColor = 'var(--color-border)';
    el.style.outline = 'none';
}

export default function PostFilters({ filters, accounts }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            submit({ search: search || null });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const submit = (changes: Partial<PostFiltersType>) => {
        const next = { ...filters, ...changes };

        router.get(
            route('posts.index'),
            {
                page: next.page || undefined,
                search: next.search || undefined,
                date_from: next.date_from || undefined,
                date_to: next.date_to || undefined,
                status: next.status || undefined,
                post_type: next.post_type && next.post_type !== 'all' ? next.post_type : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true, only: ['data'] },
        );
    };

    const hasActiveFilters =
        Boolean(filters.page) ||
        Boolean(filters.search) ||
        Boolean(filters.date_from) ||
        Boolean(filters.date_to) ||
        Boolean(filters.status) ||
        (filters.post_type && filters.post_type !== 'all');

    const resetFilters = () => {
        setSearch('');
        router.get(
            route('posts.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true, only: ['data'] },
        );
    };

    return (
        <div
            className="flex items-end gap-3 flex-wrap p-4 rounded-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
            <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Search
                </label>
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title/content..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                        style={selectStyle}
                        onFocus={(e) => applyFocusStyle(e.currentTarget)}
                        onBlur={(e) => applyBlurStyle(e.currentTarget)}
                    />
                </div>
            </div>

            <div className="min-w-[160px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Page
                </label>
                <select
                    value={filters.page ?? ''}
                    onChange={(e) => submit({ page: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                    style={selectStyle}
                    onFocus={(e) => applyFocusStyle(e.currentTarget)}
                    onBlur={(e) => applyBlurStyle(e.currentTarget)}
                >
                    <option value="">All Pages</option>
                    {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.account_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="min-w-[140px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    From
                </label>
                <input
                    type="date"
                    value={filters.date_from ?? ''}
                    onChange={(e) => submit({ date_from: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                    style={selectStyle}
                    onFocus={(e) => applyFocusStyle(e.currentTarget)}
                    onBlur={(e) => applyBlurStyle(e.currentTarget)}
                />
            </div>

            <div className="min-w-[140px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    To
                </label>
                <input
                    type="date"
                    value={filters.date_to ?? ''}
                    min={filters.date_from ?? undefined}
                    onChange={(e) => submit({ date_to: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                    style={selectStyle}
                    onFocus={(e) => applyFocusStyle(e.currentTarget)}
                    onBlur={(e) => applyBlurStyle(e.currentTarget)}
                />
            </div>

            <div className="min-w-[150px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Status
                </label>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => submit({ status: (e.target.value || null) as PostFiltersType['status'] })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                    style={selectStyle}
                    onFocus={(e) => applyFocusStyle(e.currentTarget)}
                    onBlur={(e) => applyBlurStyle(e.currentTarget)}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="min-w-[140px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    Post Type
                </label>
                <select
                    value={filters.post_type}
                    onChange={(e) => submit({ post_type: e.target.value as PostFiltersType['post_type'] })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                    style={selectStyle}
                    onFocus={(e) => applyFocusStyle(e.currentTarget)}
                    onBlur={(e) => applyBlurStyle(e.currentTarget)}
                >
                    {POST_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-100"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                >
                    <RotateCcw size={12} />
                    Reset
                </button>
            )}
        </div>
    );
}
