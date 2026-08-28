export interface FilterOption {
    value: string;
    label: string;
    color?: string;
}

export interface StatCard {
    label: string;
    value: string;
    change: string;
    up: boolean;
    color: string;
}

export interface ActivityEntry {
    user: string;
    action: string;
    time: string;
    tag: string;
    tagColor: string;
}

export interface ProjectRow {
    name: string;
    status: string;
    progress: number;
    team: string;
    due: string;
}

export interface DashboardData {
    stats: StatCard[];
    revenue: {
        months: string[];
        values: number[];
    };
    activity: ActivityEntry[];
    projects: ProjectRow[];
    filters: {
        categories: FilterOption[];
        periods: FilterOption[];
        teams: FilterOption[];
    };
}
