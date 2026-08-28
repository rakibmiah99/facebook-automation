export interface FacebookApp {
    id: number;
    app_name: string;
    app_id: string;
    status: boolean;
    has_long_lived_token: boolean;
    long_lived_token_expires_at: string | null;
    is_long_lived_token_valid: boolean;
    created_at: string;
}
