import type { User } from './user';

export interface SharedPageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}
