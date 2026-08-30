import { router } from '@inertiajs/react';
import { CheckCircle2, CornerDownRight, RotateCw, Send, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import type { PostCommentItem } from '../types/post-comment';

interface CommentReplyBoxProps {
    comment: PostCommentItem;
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function CommentReplyBox({ comment }: CommentReplyBoxProps) {
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [retryingId, setRetryingId] = useState<number | null>(null);

    const canReply = Boolean(comment.comment_id);

    const sendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        router.post(
            route('posts.comments.replies.store', { postComment: comment.id }),
            { message },
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onSuccess: () => {
                    setMessage('');
                    setShowForm(false);
                },
            },
        );
    };

    const retryReply = (replyId: number) => {
        router.post(
            route('posts.comments.replies.retry', { commentReply: replyId }),
            {},
            { preserveScroll: true, onStart: () => setRetryingId(replyId), onFinish: () => setRetryingId(null) },
        );
    };

    return (
        <div className="mt-2">
            {comment.replies.length > 0 && (
                <div className="space-y-2 mb-2">
                    {comment.replies.map((reply) => {
                        const published = Boolean(reply.reply_id);

                        return (
                            <div key={reply.id} className="flex items-start gap-2 pl-4" style={{ borderLeft: '2px solid var(--color-border)' }}>
                                <CornerDownRight size={12} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-muted)' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs leading-snug" style={{ color: 'var(--color-text)' }}>
                                        {reply.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span
                                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                            style={{
                                                background: published ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                                                color: published ? 'var(--color-success)' : 'var(--color-danger)',
                                            }}
                                        >
                                            {published ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                                            {published ? 'Sent' : 'Failed'}
                                        </span>
                                        {reply.is_automatic && (
                                            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                                                Automatic
                                            </span>
                                        )}
                                        <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                                            {formatDateTime(reply.created_at)}
                                        </span>
                                    </div>
                                </div>
                                {!published && (
                                    <button
                                        type="button"
                                        onClick={() => retryReply(reply.id)}
                                        disabled={retryingId === reply.id}
                                        title="Retry sending this reply"
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors duration-100 flex-shrink-0"
                                        style={{
                                            background: 'var(--color-surface-2)',
                                            border: '1px solid var(--color-border)',
                                            color: 'var(--color-danger)',
                                            opacity: retryingId === reply.id ? 0.6 : 1,
                                        }}
                                    >
                                        <RotateCw size={10} className={retryingId === reply.id ? 'animate-spin' : undefined} />
                                        Retry
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {canReply && !showForm && (
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="text-[11px] font-medium pl-4"
                    style={{ color: 'var(--color-primary)' }}
                >
                    Reply
                </button>
            )}

            {canReply && showForm && (
                <form onSubmit={sendReply} className="flex items-start gap-2 pl-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write a reply…"
                        autoFocus
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    />
                    <button
                        type="submit"
                        disabled={sending || !message.trim()}
                        title="Send reply"
                        className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                        style={{ background: 'var(--color-primary)', color: 'white', opacity: sending || !message.trim() ? 0.6 : 1 }}
                    >
                        <Send size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setMessage('');
                        }}
                        className="text-[11px]"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}
