import type { TemplateItem } from '../../../templates/types/template';

export interface AdminUserOption {
    id: number;
    name: string;
    email: string;
}

export interface AdminPendingRequestOption {
    id: number;
    title: string;
    aspect_ratio: string;
    user: { id: number; name: string } | null;
}

export interface AdminTemplateFormData {
    name: string;
    category: string;
    aspect_ratio: string;
    width: string;
    height: string;
    preview: File | null;
    config: string;
    is_common: boolean;
    is_premium: boolean;
    is_active: boolean;
    owner_id: string;
    custom_template_request_id: string;
}

export const DEFAULT_CONFIG_TEMPLATE = JSON.stringify(
    {
        background: { type: 'color', value: '#111827', editable: false },
        fields: [
            {
                key: 'headline',
                type: 'text',
                label: 'Headline',
                default: 'Breaking News',
                x: 40,
                y: 40,
                width: 600,
                font_size: 48,
                color: '#ffffff',
                align: 'left',
                editable: true,
            },
        ],
    },
    null,
    2,
);

export type { TemplateItem };
