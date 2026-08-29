import type { User } from './user';

export interface SharedPageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
        generated?: { id: number; path: string; url: string; created_at: string; is_posted: boolean } | null;
    };
    [key: string]: unknown;
}
