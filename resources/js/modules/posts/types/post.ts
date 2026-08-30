import type { PostCommentItem } from './post-comment';

export interface PostAccountOption {
    id: number;
    account_name: string;
    link: string | null;
}

export interface PostListItem {
    id: number;
    post_id: string | null;
    is_published: boolean;
    is_scheduled: boolean;
    scheduled_at: string | null;
    post_type: string;
    created_at: string;
    facebook_app_account: {
        id: number;
        account_name: string;
        link: string | null;
    } | null;
    content: {
        content_type: string;
        content_text: string | null;
        content_path: string | null;
        content_url: string | null;
    } | null;
    comments: PostCommentItem[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface PostFilterAccount {
    id: number;
    account_name: string;
}

export type PostStatusFilter = 'published' | 'scheduled' | 'failed';

export type PostTypeFilter = 'all' | 'text' | 'image';

export interface PostFilters {
    page: string | null;
    search: string | null;
    date_from: string | null;
    date_to: string | null;
    status: PostStatusFilter | null;
    post_type: PostTypeFilter;
}
