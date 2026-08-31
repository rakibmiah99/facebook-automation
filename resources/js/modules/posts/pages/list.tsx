import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    ImageIcon,
    MessageCircle,
    MessagesSquare,
    Plus,
    RefreshCw,
    RotateCw,
    Type,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import PostCommentsModal from '../components/PostCommentsModal';
import PostFilters from '../components/PostFilters';
import type { Paginated, PostFilterAccount, PostFilters as PostFiltersType, PostListItem } from '../types/post';

interface Props {
    data: {
        posts: Paginated<PostListItem>;
        accounts: PostFilterAccount[];
        filters: PostFiltersType;
    };
}

function statusOf(post: PostListItem) {
    if (post.is_scheduled) {
        return { label: 'Scheduled', color: 'var(--color-primary)', bg: 'var(--color-primary-dim)', Icon: CalendarClock };
    }
    if (post.is_published) {
        return { label: 'Published', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.12)', Icon: CheckCircle2 };
    }
    return { label: 'Failed', color: 'var(--color-danger)', bg: 'rgba(244,63,94,0.12)', Icon: XCircle };
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function PostList({ data }: Props) {
    const { posts, accounts, filters } = data;
    const hasActiveFilters = Boolean(
        filters.account_id ||
            filters.search ||
            filters.date_from ||
            filters.date_to ||
            filters.status ||
            (filters.post_type && filters.post_type !== 'all'),
    );
    const [retryingId, setRetryingId] = useState<number | null>(null);
    const [syncingId, setSyncingId] = useState<number | null>(null);
    const [syncingCommentsId, setSyncingCommentsId] = useState<number | null>(null);
    const [syncingAccount, setSyncingAccount] = useState(false);
    const [viewingPostId, setViewingPostId] = useState<number | null>(null);
    const viewingPost = posts.data.find((p) => p.id === viewingPostId) ?? null;

    const syncAccountPosts = () => {
        if (!filters.account_id) return;

        router.post(
            route('posts.sync-account', { facebookAppAccount: filters.account_id }),
            {},
            { preserveScroll: true, preserveState: true, onStart: () => setSyncingAccount(true), onFinish: () => setSyncingAccount(false) },
        );
    };

    const retryPost = (postId: number) => {
        router.post(
            route('posts.retry', { post: postId }),
            {},
            { preserveScroll: true, onStart: () => setRetryingId(postId), onFinish: () => setRetryingId(null) },
        );
    };

    const syncPost = (postId: number) => {
        router.post(
            route('posts.sync', { post: postId }),
            {},
            { preserveScroll: true, onStart: () => setSyncingId(postId), onFinish: () => setSyncingId(null) },
        );
    };

    const syncComments = (postId: number) => {
        router.post(
            route('posts.comments.sync', { post: postId }),
            {},
            { onStart: () => setSyncingCommentsId(postId), onFinish: () => setSyncingCommentsId(null) },
        );
    };

    return (
        <AppLayout>
            <Head title="Post List" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 mx-auto w-full space-y-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Post List
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                Everything you've published or scheduled across your Pages.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {filters.account_id && (
                                <button
                                    type="button"
                                    onClick={syncAccountPosts}
                                    disabled={syncingAccount}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{
                                        background: 'var(--color-surface-2)',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text)',
                                        opacity: syncingAccount ? 0.6 : 1,
                                    }}
                                >
                                    <RefreshCw size={14} className={syncingAccount ? 'animate-spin' : undefined} />
                                    {syncingAccount ? 'Syncing…' : 'Sync Posts'}
                                </button>
                            )}
                            <Link
                                href={route('posts.image')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            >
                                <ImageIcon size={14} />
                                New Image Post
                            </Link>
                            <Link
                                href={route('posts.text')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-display)' }}
                            >
                                <Plus size={14} />
                                New Text Post
                            </Link>
                        </div>
                    </div>

                    <PostFilters filters={filters} accounts={accounts} />

                    {posts.data.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center text-center rounded-xl p-16"
                            style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border-hover)' }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-primary-dim)' }}>
                                <FileText size={22} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                {hasActiveFilters ? 'No posts match your filters' : 'No posts yet'}
                            </h2>
                            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                                {hasActiveFilters
                                    ? 'Try adjusting or resetting the filters above.'
                                    : 'Create your first text or image post to see it listed here.'}
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                {filters.account_id && (
                                    <button
                                        type="button"
                                        onClick={syncAccountPosts}
                                        disabled={syncingAccount}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                        style={{
                                            background: 'var(--color-surface-2)',
                                            border: '1px solid var(--color-border)',
                                            color: 'var(--color-text)',
                                            opacity: syncingAccount ? 0.6 : 1,
                                        }}
                                    >
                                        <RefreshCw size={14} className={syncingAccount ? 'animate-spin' : undefined} />
                                        {syncingAccount ? 'Syncing…' : 'Sync Posts'}
                                    </button>
                                )}
                                <Link
                                    href={route('posts.image')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                >
                                    <ImageIcon size={14} />
                                    New Image Post
                                </Link>
                                <Link
                                    href={route('posts.text')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-display)' }}
                                >
                                    <Plus size={14} />
                                    New Text Post
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            {['Page', 'Content', 'Status', 'When', ''].map((h) => (
                                                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.data.map((post, i) => {
                                            const status = statusOf(post);
                                            const facebookUrl = post.is_published && post.post_id ? `https://www.facebook.com/${post.post_id}` : null;

                                            return (
                                                <tr
                                                    key={post.id}
                                                    style={{ borderBottom: i < posts.data.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                                    className="transition-colors duration-100"
                                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                                >
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                                            {post.facebook_app_account?.account_name ?? '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 max-w-xs">
                                                        <div className="flex items-center gap-2.5">
                                                            {post.post_type === 'image' ? (
                                                                post.content?.content_url ? (
                                                                    <img
                                                                        src={post.content.content_url}
                                                                        alt=""
                                                                        className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                                                                        style={{ border: '1px solid var(--color-border)' }}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                                                        style={{ background: 'var(--color-surface-2)' }}
                                                                    >
                                                                        <ImageIcon size={13} style={{ color: 'var(--color-muted)' }} />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div
                                                                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                                                    style={{ background: 'var(--color-surface-2)' }}
                                                                >
                                                                    <Type size={13} style={{ color: 'var(--color-muted)' }} />
                                                                </div>
                                                            )}
                                                            <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                                                                {post.content?.content_text || (post.post_type === 'image' ? 'Image post' : '—')}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                                                            style={{ background: status.bg, color: status.color }}
                                                        >
                                                            <status.Icon size={11} />
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
                                                            <Clock size={11} />
                                                            {formatDateTime(post.is_scheduled && post.scheduled_at ? post.scheduled_at : post.created_at)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {post.comments.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingPostId(post.id)}
                                                                title="View comments"
                                                                className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
                                                                style={{
                                                                    color: post.comments.some((c) => !c.comment_id) ? 'var(--color-danger)' : 'var(--color-muted)',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                                }}
                                                            >
                                                                <MessageCircle size={14} />
                                                            </button>
                                                        )}
                                                        {post.post_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => syncPost(post.id)}
                                                                disabled={syncingId === post.id}
                                                                title="Sync this post from Facebook"
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
                                                                style={{ color: 'var(--color-muted)', opacity: syncingId === post.id ? 0.6 : 1 }}
                                                                onMouseEnter={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                                                                }}
                                                            >
                                                                <RefreshCw size={14} className={syncingId === post.id ? 'animate-spin' : undefined} />
                                                            </button>
                                                        )}
                                                        {post.post_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => syncComments(post.id)}
                                                                disabled={syncingCommentsId === post.id}
                                                                title="Sync comments from Facebook"
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
                                                                style={{ color: 'var(--color-muted)', opacity: syncingCommentsId === post.id ? 0.6 : 1 }}
                                                                onMouseEnter={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                                    (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                                                                }}
                                                            >
                                                                <MessagesSquare size={14} className={syncingCommentsId === post.id ? 'animate-pulse' : undefined} />
                                                            </button>
                                                        )}
                                                        {facebookUrl && (
                                                            <a
                                                                href={facebookUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="View on Facebook"
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
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
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        )}
                                                        {!post.is_published && !post.is_scheduled && (
                                                            <button
                                                                type="button"
                                                                onClick={() => retryPost(post.id)}
                                                                disabled={retryingId === post.id}
                                                                title="Retry publishing this post"
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100"
                                                                style={{
                                                                    background: 'var(--color-surface-2)',
                                                                    border: '1px solid var(--color-border)',
                                                                    color: 'var(--color-danger)',
                                                                    opacity: retryingId === post.id ? 0.6 : 1,
                                                                }}
                                                            >
                                                                <RotateCw size={12} className={retryingId === post.id ? 'animate-spin' : undefined} />
                                                                {retryingId === post.id ? 'Retrying…' : 'Retry'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {posts.last_page > 1 && (
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    {posts.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className="min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-colors duration-100"
                                            style={{
                                                background: link.active ? 'var(--color-primary)' : 'var(--color-surface)',
                                                color: link.active ? 'white' : link.url ? 'var(--color-text)' : 'var(--color-muted-2)',
                                                border: '1px solid var(--color-border)',
                                                pointerEvents: link.url ? 'auto' : 'none',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <PostCommentsModal post={viewingPost} open={Boolean(viewingPost)} onClose={() => setViewingPostId(null)} />
        </AppLayout>
    );
}
