export interface PostCommentItem {
    id: number;
    comment_id: string | null;
    commenter_id: string | null;
    commenter_name: string | null;
    message: string | null;
    attachment_path: string | null;
    attachment_url: string | null;
    commented_at: string | null;
    created_at: string;
    is_automatic: boolean;
    replies: PostCommentItem[];
}

export interface PostCommentFilters {
    commenter: string | null;
    message: string | null;
}
