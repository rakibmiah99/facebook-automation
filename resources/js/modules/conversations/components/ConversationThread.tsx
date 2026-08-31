import { useForm } from '@inertiajs/react';
import { ExternalLink, MessageCircle, Paperclip, RefreshCw, Send, User } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { route } from 'ziggy-js';
import type { ConversationItem, ConversationMessageItem, ConversationPage } from '../types/conversation';
import MessageBubble from './MessageBubble';

interface Props {
    account: ConversationPage | null;
    conversation: ConversationItem | null;
    messages: ConversationMessageItem[];
    syncing: boolean;
    onSync: () => void;
}

export default function ConversationThread({ account, conversation, messages, syncing, onSync }: Props) {
    const form = useForm<{ message: string; attachment: File | null }>({ message: '', attachment: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    if (!account) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageCircle size={24} style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
                    Select a Facebook Page above to view its conversations.
                </p>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageCircle size={24} style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
                    Select a conversation to start messaging.
                </p>
            </div>
        );
    }

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.message.trim() && !form.data.attachment) return;

        form.post(route('conversations.messages.store', { conversation: conversation.id }), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div
                className="flex items-center justify-between gap-2 px-5 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--color-border)' }}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--color-surface-2)' }}
                    >
                        <User size={14} style={{ color: 'var(--color-muted)' }} />
                    </div>
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {conversation.participant_name ?? 'Unknown'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {conversation.link && (
                        <a
                            href={conversation.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Facebook"
                            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
                            style={{ color: 'var(--color-muted)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                        >
                            <ExternalLink size={14} />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onSync}
                        disabled={syncing}
                        title="Sync messages from Facebook"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100"
                        style={{
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            opacity: syncing ? 0.6 : 1,
                        }}
                    >
                        <RefreshCw size={12} className={syncing ? 'animate-spin' : undefined} />
                        {syncing ? 'Syncing…' : 'Sync Messages'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            No messages yet. Sync to pull this conversation's history.
                        </p>
                    </div>
                ) : (
                    messages.map((message) => <MessageBubble key={message.id} message={message} />)
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="flex items-end gap-2 px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => form.setData('attachment', e.target.files?.[0] ?? null)}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach an image"
                    className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: form.data.attachment ? 'var(--color-primary)' : 'var(--color-muted)',
                    }}
                >
                    <Paperclip size={14} />
                </button>
                <input
                    type="text"
                    value={form.data.message}
                    onChange={(e) => form.setData('message', e.target.value)}
                    placeholder="Write a message…"
                    className="flex-1 px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                <button
                    type="submit"
                    disabled={form.processing || (!form.data.message.trim() && !form.data.attachment)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        opacity: form.processing || (!form.data.message.trim() && !form.data.attachment) ? 0.6 : 1,
                    }}
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
}
