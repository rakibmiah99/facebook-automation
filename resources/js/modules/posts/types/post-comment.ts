export interface CommentReplyItem {
    id: number;
    reply_id: string | null;
    message: string;
    is_automatic: boolean;
    created_at: string;
}

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
    replies: CommentReplyItem[];
}

export interface PostCommentFilters {
    commenter: string | null;
    message: string | null;
}
