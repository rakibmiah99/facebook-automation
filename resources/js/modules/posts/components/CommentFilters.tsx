import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import type { PostCommentFilters } from '../types/post-comment';

interface Props {
    postId: number;
    filters: PostCommentFilters;
}

const inputStyle: React.CSSProperties = {
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

export default function CommentFilters({ postId, filters }: Props) {
    const [commenter, setCommenter] = useState(filters.commenter ?? '');
    const [message, setMessage] = useState(filters.message ?? '');

    const hasActiveFilters = Boolean(filters.commenter || filters.message);

    const search = (e: React.FormEvent) => {
        e.preventDefault();

        router.get(
            route('posts.comments.index', { post: postId }),
            { commenter: commenter || undefined, message: message || undefined },
            { preserveState: true, preserveScroll: true, replace: true, only: ['data'] },
        );
    };

    const reset = () => {
        setCommenter('');
        setMessage('');

        router.get(
            route('posts.comments.index', { post: postId }),
            {},
            { preserveState: true, preserveScroll: true, replace: true, only: ['data'] },
        );
    };

    return (
        <form onSubmit={search} className="flex items-center gap-2 flex-wrap">
            <input
                type="text"
                value={commenter}
                onChange={(e) => setCommenter(e.target.value)}
                placeholder="Search by commenter…"
                className="w-40 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                style={inputStyle}
                onFocus={(e) => applyFocusStyle(e.currentTarget)}
                onBlur={(e) => applyBlurStyle(e.currentTarget)}
            />
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Search by message…"
                className="w-40 px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                style={inputStyle}
                onFocus={(e) => applyFocusStyle(e.currentTarget)}
                onBlur={(e) => applyBlurStyle(e.currentTarget)}
            />
            <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
                <Search size={14} />
                Search
            </button>
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={reset}
                    title="Reset filters"
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                >
                    <RotateCcw size={13} />
                </button>
            )}
        </form>
    );
}
