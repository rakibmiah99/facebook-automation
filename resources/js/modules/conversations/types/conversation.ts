export interface ConversationApp {
    id: number;
    app_name: string;
}

export interface ConversationPage {
    id: number;
    account_id: string;
    account_name: string;
    link: string | null;
}

export interface ConversationItem {
    id: number;
    conversation_id: string;
    participant_id: string | null;
    participant_name: string | null;
    participant_email: string | null;
    snippet: string | null;
    unread_count: number;
    message_count: number | null;
    link: string | null;
    conversation_updated_at: string | null;
    created_at: string;
}

export interface ConversationMessageItem {
    id: number;
    message_id: string | null;
    is_from_page: boolean;
    sender_id: string | null;
    sender_name: string | null;
    message: string | null;
    attachment_path: string | null;
    attachment_url: string | null;
    attachment_type: string | null;
    sent_at: string | null;
    created_at: string;
}

export interface ConversationPageData {
    apps: ConversationApp[];
    selectedApp: ConversationApp | null;
    pages: ConversationPage[];
    selectedAccount: ConversationPage | null;
    conversations: ConversationItem[];
    selectedConversation: ConversationItem | null;
    messages: ConversationMessageItem[];
}
