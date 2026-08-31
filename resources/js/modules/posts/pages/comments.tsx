import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Clock, ExternalLink, MessageCircle, RefreshCw, Send, User, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import CommentFilters from '../components/CommentFilters';
import CommentReplyBox from '../components/CommentReplyBox';
import type { PostCommentsPagePost } from '../types/post';
import type { PostCommentFilters, PostCommentItem } from '../types/post-comment';

interface Props {
    data: {
        post: PostCommentsPagePost;
        comments: PostCommentItem[];
        filters: PostCommentFilters;
    };
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function PostComments({ data }: Props) {
    const { post, comments, filters } = data;
    const [syncing, setSyncing] = useState(false);
    const [replyAllMessage, setReplyAllMessage] = useState('');
    const [replyingAll, setReplyingAll] = useState(false);

    const syncComments = () => {
        router.post(
            route('posts.comments.sync', { post: post.id }),
            {},
            { preserveScroll: true, onStart: () => setSyncing(true), onFinish: () => setSyncing(false) },
        );
    };

    const replyToAll = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyAllMessage.trim()) return;

        router.post(
            route('posts.comments.reply-all', { post: post.id }),
            { message: replyAllMessage },
            {
                preserveScroll: true,
                onStart: () => setReplyingAll(true),
                onFinish: () => setReplyingAll(false),
                onSuccess: () => setReplyAllMessage(''),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Post Comments" />

            <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
                <div className="p-6 mx-auto w-full space-y-6">
                    <Link
                        href={route('posts.index')}
                        className="inline-flex items-center gap-1.5 text-xs w-fit"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        <ArrowLeft size={13} />
                        Back to Post List
                    </Link>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Comments
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                                On the {post.post_type} post to{' '}
                                <span style={{ color: 'var(--color-text)' }}>{post.facebook_app_account?.account_name ?? 'this page'}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <CommentFilters postId={post.id} filters={filters} />

                            {post.post_id && (
                                <button
                                    onClick={syncComments}
                                    disabled={syncing}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontFamily: 'var(--font-display)',
                                        opacity: syncing ? 0.6 : 1,
                                    }}
                                >
                                    <RefreshCw size={14} className={syncing ? 'animate-spin' : undefined} />
                                    {syncing ? 'Syncing…' : 'Sync Comments'}
                                </button>
                            )}
                        </div>
                    </div>

                    {post.post_id && comments.length > 0 && (
                        <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={15} style={{ color: 'var(--color-primary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                    Reply to all comments
                                </span>
                            </div>
                            <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
                                Sends the same message as a reply to every comment on this post that doesn't already have one.
                            </p>
                            <form onSubmit={replyToAll} className="flex items-start gap-2">
                                <input
                                    type="text"
                                    value={replyAllMessage}
                                    onChange={(e) => setReplyAllMessage(e.target.value)}
                                    placeholder="Write a message to send to everyone…"
                                    className="flex-1 px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                />
                                <button
                                    type="submit"
                                    disabled={replyingAll || !replyAllMessage.trim()}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontFamily: 'var(--font-display)',
                                        opacity: replyingAll || !replyAllMessage.trim() ? 0.6 : 1,
                                    }}
                                >
                                    <Send size={14} />
                                    {replyingAll ? 'Sending…' : 'Reply to All'}
                                </button>
                            </form>
                        </div>
                    )}

                    {comments.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center text-center rounded-xl p-16"
                            style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border-hover)' }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-primary-dim)' }}>
                                <MessageCircle size={22} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                {filters.commenter || filters.message ? 'No comments match your search' : 'No comments yet'}
                            </h2>
                            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                                {filters.commenter || filters.message
                                    ? 'Try adjusting or resetting the search filters above.'
                                    : post.post_id
                                      ? 'Click "Sync Comments" to pull the latest comments from Facebook.'
                                      : 'This post has not been published to Facebook yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="rounded-xl p-4"
                                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'var(--color-surface-2)' }}
                                        >
                                            <User size={14} style={{ color: 'var(--color-muted)' }} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                                    {comment.commenter_name ?? 'Unknown'}
                                                </span>
                                                <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                                                    <Clock size={10} />
                                                    {formatDateTime(comment.commented_at ?? comment.created_at)}
                                                </span>
                                            </div>

                                            <p className="text-sm mt-1 leading-snug" style={{ color: 'var(--color-text)' }}>
                                                {comment.message || (comment.attachment_url ? 'Attachment only' : '—')}
                                            </p>

                                            {comment.attachment_url && (
                                                <img
                                                    src={comment.attachment_url}
                                                    alt=""
                                                    className="w-16 h-16 rounded-md object-cover mt-2"
                                                    style={{ border: '1px solid var(--color-border)' }}
                                                />
                                            )}

                                            <CommentReplyBox comment={comment} />
                                        </div>

                                        {comment.comment_id && (
                                            <a
                                                href={`https://www.facebook.com/${comment.comment_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="View comment on Facebook"
                                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100 flex-shrink-0"
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
