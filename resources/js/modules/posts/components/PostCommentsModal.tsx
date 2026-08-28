import { router } from '@inertiajs/react';
import { CheckCircle2, Clock, ExternalLink, MessageCircle, RotateCw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import Modal from '../../../shared/components/Modal';
import type { PostListItem } from '../types/post';

interface PostCommentsModalProps {
    post: PostListItem | null;
    open: boolean;
    onClose: () => void;
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function PostCommentsModal({ post, open, onClose }: PostCommentsModalProps) {
    const [retryingId, setRetryingId] = useState<number | null>(null);

    const retryComment = (commentId: number) => {
        router.post(
            route('posts.comments.retry', { postComment: commentId }),
            {},
            { preserveScroll: true, preserveState: true, onStart: () => setRetryingId(commentId), onFinish: () => setRetryingId(null) },
        );
    };

    return (
        <Modal
            open={open && Boolean(post)}
            onClose={onClose}
            title="Comments"
            description={post ? `On the ${post.post_type} post to ${post.facebook_app_account?.account_name ?? 'this page'}` : undefined}
            maxWidth="480px"
        >
            {!post || post.comments.length === 0 ? (
                <div className="flex flex-col items-center text-center py-6">
                    <MessageCircle size={22} style={{ color: 'var(--color-muted)' }} />
                    <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                        No comments on this post yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {post.comments.map((comment) => {
                        const published = Boolean(comment.comment_id);
                        const canRetry = !published && post.is_published;

                        return (
                            <div key={comment.id} className="rounded-lg p-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-start gap-3">
                                    {comment.attachment_url && (
                                        <img
                                            src={comment.attachment_url}
                                            alt=""
                                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                                            style={{ border: '1px solid var(--color-border)' }}
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
                                            {comment.message || (comment.attachment_url ? 'Attachment only' : '—')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span
                                                className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                                                style={{
                                                    background: published ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                                                    color: published ? 'var(--color-success)' : 'var(--color-danger)',
                                                }}
                                            >
                                                {published ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                {published ? 'Published' : 'Failed'}
                                            </span>
                                            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                                                <Clock size={10} />
                                                {formatDateTime(comment.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {published && (
                                            <a
                                                href={`https://www.facebook.com/${comment.comment_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="View comment on Facebook"
                                                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100"
                                                style={{ color: 'var(--color-muted)' }}
                                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface)')}
                                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                            >
                                                <ExternalLink size={13} />
                                            </a>
                                        )}
                                        {canRetry && (
                                            <button
                                                type="button"
                                                onClick={() => retryComment(comment.id)}
                                                disabled={retryingId === comment.id}
                                                title="Retry publishing this comment"
                                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors duration-100"
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border)',
                                                    color: 'var(--color-danger)',
                                                    opacity: retryingId === comment.id ? 0.6 : 1,
                                                }}
                                            >
                                                <RotateCw size={11} className={retryingId === comment.id ? 'animate-spin' : undefined} />
                                                {retryingId === comment.id ? 'Retrying…' : 'Retry'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
}
