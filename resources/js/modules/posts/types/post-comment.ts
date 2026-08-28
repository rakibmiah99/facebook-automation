export interface PostCommentItem {
    id: number;
    comment_id: string | null;
    message: string | null;
    attachment_path: string | null;
    attachment_url: string | null;
    created_at: string;
}
