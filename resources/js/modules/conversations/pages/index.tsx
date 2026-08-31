import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../shared/layouts/AppLayout';
import ConversationAccountSwitcher from '../components/ConversationAccountSwitcher';
import ConversationList from '../components/ConversationList';
import ConversationThread from '../components/ConversationThread';
import type { ConversationPageData } from '../types/conversation';

interface Props {
    data: ConversationPageData;
}

interface Selection {
    facebook_app_id: number | null;
    facebook_app_account_id: number | null;
    conversation: number | null;
}

export default function ConversationsIndex({ data }: Props) {
    const { apps, selectedApp, pages, selectedAccount, conversations, selectedConversation, messages } = data;
    const [syncingConversations, setSyncingConversations] = useState(false);
    const [syncingMessages, setSyncingMessages] = useState(false);

    const currentSelection: Selection = {
        facebook_app_id: selectedApp?.id ?? null,
        facebook_app_account_id: selectedAccount?.id ?? null,
        conversation: selectedConversation?.id ?? null,
    };

    const navigate = (changes: Partial<Selection>) => {
        const next = { ...currentSelection, ...changes };

        router.get(
            route('conversations.index'),
            {
                facebook_app_id: next.facebook_app_id ?? undefined,
                facebook_app_account_id: next.facebook_app_account_id ?? undefined,
                conversation: next.conversation ?? undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true, only: ['data'] },
        );
    };

    const selectApp = (appId: number) => navigate({ facebook_app_id: appId, facebook_app_account_id: null, conversation: null });
    const selectAccount = (accountId: number) => navigate({ facebook_app_account_id: accountId, conversation: null });
    const selectConversation = (conversationId: number) => navigate({ conversation: conversationId });

    const syncConversations = () => {
        if (!selectedAccount) return;

        router.post(
            route('conversations.sync', { facebookAppAccount: selectedAccount.id }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSyncingConversations(true),
                onFinish: () => setSyncingConversations(false),
            },
        );
    };

    const syncMessages = () => {
        if (!selectedConversation) return;

        router.post(
            route('conversations.messages.sync', { conversation: selectedConversation.id }),
            {},
            { preserveScroll: true, preserveState: true, onStart: () => setSyncingMessages(true), onFinish: () => setSyncingMessages(false) },
        );
    };

    return (
        <AppLayout>
            <Head title="Conversations" />

            <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                <ConversationAccountSwitcher
                    apps={apps}
                    selectedApp={selectedApp}
                    pages={pages}
                    selectedAccount={selectedAccount}
                    onSelectApp={selectApp}
                    onSelectAccount={selectAccount}
                />

                <div className="flex-1 flex overflow-hidden">
                    <ConversationList
                        account={selectedAccount}
                        conversations={conversations}
                        selectedConversationId={selectedConversation?.id ?? null}
                        syncing={syncingConversations}
                        onSync={syncConversations}
                        onSelect={selectConversation}
                    />

                    <ConversationThread
                        account={selectedAccount}
                        conversation={selectedConversation}
                        messages={messages}
                        syncing={syncingMessages}
                        onSync={syncMessages}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
