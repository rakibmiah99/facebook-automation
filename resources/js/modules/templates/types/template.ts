export interface TemplateField {
    key: string;
    type: 'text' | 'image';
    label: string;
    default?: string | null;
    default_url?: string | null;
    x: number;
    y: number;
    width: number;
    height?: number;
    font_size?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    line_height?: number;
    editable: boolean;
}

export interface TemplateBackground {
    type: 'color' | 'image';
    value?: string;
    path?: string | null;
    url?: string | null;
    editable: boolean;
}

export interface TemplateConfig {
    background?: TemplateBackground;
    fields: TemplateField[];
}

export interface TemplateItem {
    id: number;
    name: string;
    category: string | null;
    aspect_ratio: string;
    width: number;
    height: number;
    preview_path: string | null;
    preview_url: string | null;
    config: TemplateConfig;
    is_common: boolean;
    is_premium: boolean;
    is_active: boolean;
    owner_id: number | null;
    created_by: number | null;
    custom_template_request_id: number | null;
}

export interface TemplateAccountOption {
    id: number;
    account_name: string;
    link: string | null;
}

export interface GenerationPostAccount {
    id: number;
    account_name: string;
    link: string | null;
}

export interface GenerationPost {
    id: number;
    is_published: boolean;
    is_scheduled: boolean;
    scheduled_at: string | null;
    facebook_app_account: GenerationPostAccount | null;
}

export interface TemplateGeneration {
    id: number;
    path: string;
    url: string;
    is_posted: boolean;
    created_at: string;
    template_id?: number | null;
    user_id?: number;
    values?: Record<string, string> | null;
    posts?: GenerationPost[];
}
