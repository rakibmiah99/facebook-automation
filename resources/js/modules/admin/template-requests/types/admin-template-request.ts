import type { AttachmentItem, Paginated, TemplateRequestTemplateRef } from '../../../template-requests/types/template-request';

export interface AdminRequestListItem {
    id: number;
    title: string;
    aspect_ratio: string;
    status: string;
    created_at: string;
    attachments_count: number;
    user: { id: number; name: string; email: string } | null;
}

export interface AdminRequestDetail {
    id: number;
    title: string;
    aspect_ratio: string;
    width: number | null;
    height: number | null;
    description: string;
    status: string;
    admin_notes: string | null;
    created_at: string;
    user: { id: number; name: string; email: string } | null;
    handled_by: { id: number; name: string } | null;
    attachments: AttachmentItem[];
    templates: TemplateRequestTemplateRef[];
}

export type { Paginated };
