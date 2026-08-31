import { MessageCircle, RefreshCw } from 'lucide-react';
import type { ConversationItem, ConversationPage } from '../types/conversation';

interface Props {
    account: ConversationPage | null;
    conversations: ConversationItem[];
    selectedConversationId: number | null;
    syncing: boolean;
    onSync: () => void;
    onSelect: (conversationId: number) => void;
}

function formatDateTime(value: string | null) {
    if (!value) return '';
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ConversationList({ account, conversations, selectedConversationId, syncing, onSync, onSelect }: Props) {
    return (
        <div className="flex flex-col w-80 flex-shrink-0 overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
            <div
                className="flex items-center justify-between gap-2 px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--color-border)' }}
            >
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                    Conversations
                </span>
                {account && (
                    <button
                        type="button"
                        onClick={onSync}
                        disabled={syncing}
                        title="Sync conversations from Facebook"
                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100"
                        style={{ color: 'var(--color-muted)', opacity: syncing ? 0.6 : 1 }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                        <RefreshCw size={14} className={syncing ? 'animate-spin' : undefined} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {!account ? (
                    <div className="flex flex-col items-center text-center px-4 py-10">
                        <MessageCircle size={20} style={{ color: 'var(--color-muted)' }} />
                        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                            Select a Page above to view its conversations.
                        </p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center text-center px-4 py-10">
                        <MessageCircle size={20} style={{ color: 'var(--color-muted)' }} />
                        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                            No conversations yet. Sync to pull this Page's inbox.
                        </p>
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const active = conversation.id === selectedConversationId;

                        return (
                            <button
                                key={conversation.id}
                                type="button"
                                onClick={() => onSelect(conversation.id)}
                                className="flex items-start gap-2.5 w-full text-left px-4 py-3 transition-colors duration-100"
                                style={{
                                    background: active ? 'var(--color-primary-dim)' : 'transparent',
                                    borderBottom: '1px solid var(--color-border)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className="text-sm font-medium truncate"
                                            style={{ color: active ? 'var(--color-primary)' : 'var(--color-text)' }}
                                        >
                                            {conversation.participant_name ?? 'Unknown'}
                                        </span>
                                        <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                                            {formatDateTime(conversation.conversation_updated_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                        {conversation.snippet ?? '—'}
                                    </p>
                                </div>
                                {conversation.unread_count > 0 && (
                                    <span
                                        className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center"
                                        style={{ background: 'var(--color-primary)', color: 'white' }}
                                    >
                                        {conversation.unread_count}
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
