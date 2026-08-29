export interface AttachmentItem {
    id: number;
    original_filename: string;
    mime_type: string | null;
    size: number | null;
    url: string;
}

export interface TemplateRequestTemplateRef {
    id: number;
    name: string;
}

export interface TemplateRequestListItem {
    id: number;
    title: string;
    aspect_ratio: string;
    status: string;
    created_at: string;
    attachments_count: number;
    templates: TemplateRequestTemplateRef[];
}

export interface TemplateRequestDetail {
    id: number;
    title: string;
    aspect_ratio: string;
    width: number | null;
    height: number | null;
    description: string;
    status: string;
    admin_notes: string | null;
    created_at: string;
    handled_by: { id: number; name: string } | null;
    attachments: AttachmentItem[];
    templates: TemplateRequestTemplateRef[];
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

export const ASPECT_RATIO_OPTIONS = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '4:5', label: 'Portrait (4:5)' },
    { value: '9:16', label: 'Story (9:16)' },
    { value: '16:9', label: 'Landscape (16:9)' },
];

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    submitted: { label: 'Submitted', color: 'var(--color-muted)', bg: 'var(--color-surface-2)' },
    under_review: { label: 'Under Review', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.12)' },
    in_progress: { label: 'In Progress', color: 'var(--color-primary)', bg: 'var(--color-primary-dim)' },
    awaiting_info: { label: 'Awaiting Info', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.12)' },
    completed: { label: 'Completed', color: 'var(--color-success)', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Rejected', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.12)' },
    cancelled: { label: 'Cancelled', color: 'var(--color-muted)', bg: 'var(--color-surface-2)' },
};
