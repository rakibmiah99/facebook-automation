import { router } from '@inertiajs/react';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import type { ConversationMessageItem } from '../types/conversation';

interface Props {
    message: ConversationMessageItem;
}

function formatTime(value: string | null) {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message }: Props) {
    const [retrying, setRetrying] = useState(false);
    const failed = message.is_from_page && !message.message_id;

    const retry = () => {
        router.post(
            route('conversations.messages.retry', { conversationMessage: message.id }),
            {},
            { preserveScroll: true, preserveState: true, onStart: () => setRetrying(true), onFinish: () => setRetrying(false) },
        );
    };

    return (
        <div className={`flex ${message.is_from_page ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[70%] flex flex-col" style={{ alignItems: message.is_from_page ? 'flex-end' : 'flex-start' }}>
                <div
                    className="px-3.5 py-2 rounded-2xl text-sm leading-snug"
                    style={{
                        background: message.is_from_page ? 'var(--color-primary)' : 'var(--color-surface-2)',
                        color: message.is_from_page ? 'white' : 'var(--color-text)',
                        border: message.is_from_page ? 'none' : '1px solid var(--color-border)',
                    }}
                >
                    {message.attachment_url && <img src={message.attachment_url} alt="" className="w-40 h-40 rounded-lg object-cover mb-1.5" />}
                    {message.message && <p>{message.message}</p>}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        {formatTime(message.sent_at ?? message.created_at)}
                    </span>
                    {failed && (
                        <button
                            type="button"
                            onClick={retry}
                            disabled={retrying}
                            className="flex items-center gap-1 text-[10px] font-medium"
                            style={{ color: 'var(--color-danger)', opacity: retrying ? 0.6 : 1 }}
                        >
                            <RotateCw size={10} className={retrying ? 'animate-spin' : undefined} />
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
