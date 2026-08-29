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
                editable: true,
                style: {
                    top: 40,
                    left: 40,
                    width: 600,
                    fontSize: 48,
                    color: '#ffffff',
                    textAlign: 'left',
                },
            },
        ],
    },
    null,
    2,
);

export type { TemplateItem };
