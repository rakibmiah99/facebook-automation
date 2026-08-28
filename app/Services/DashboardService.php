<?php

namespace App\Services;

class DashboardService
{
    public function index(): array
    {
        return [
            'stats' => [
                ['label' => 'Total Revenue', 'value' => '$284,912', 'change' => '+12.4%', 'up' => true, 'color' => '#10b981'],
                ['label' => 'Active Users', 'value' => '48,391', 'change' => '+8.1%', 'up' => true, 'color' => '#6366f1'],
                ['label' => 'Avg. Response', 'value' => '142ms', 'change' => '-23ms', 'up' => true, 'color' => '#22d3ee'],
                ['label' => 'Open Tickets', 'value' => '143', 'change' => '+5', 'up' => false, 'color' => '#f43f5e'],
            ],
            'revenue' => [
                'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'values' => [42, 68, 55, 82, 71, 94, 63, 77, 88, 52, 71, 83],
            ],
            'activity' => [
                ['user' => 'Mia Chen', 'action' => 'Deployed API v3.2.1 to production', 'time' => '3m ago', 'tag' => 'Deploy', 'tagColor' => '#10b981'],
                ['user' => 'Luca Ferri', 'action' => 'Opened P1 incident: auth latency spike', 'time' => '18m ago', 'tag' => 'Incident', 'tagColor' => '#f43f5e'],
                ['user' => 'Riya Patel', 'action' => 'Merged PR #891: onboarding redesign', 'time' => '42m ago', 'tag' => 'Code', 'tagColor' => '#6366f1'],
                ['user' => 'Omar Saeed', 'action' => 'Updated Q4 growth forecast model', 'time' => '1h ago', 'tag' => 'Analytics', 'tagColor' => '#f59e0b'],
                ['user' => 'Sophie Lane', 'action' => 'Completed accessibility audit pass', 'time' => '2h ago', 'tag' => 'Design', 'tagColor' => '#22d3ee'],
            ],
            'projects' => [
                ['name' => 'Nexus API v3', 'status' => 'Active', 'progress' => 78, 'team' => 'Engineering', 'due' => 'Nov 12'],
                ['name' => 'Onboarding Redesign', 'status' => 'Review', 'progress' => 91, 'team' => 'Design', 'due' => 'Oct 28'],
                ['name' => 'Growth Dashboard', 'status' => 'Active', 'progress' => 45, 'team' => 'Growth', 'due' => 'Dec 3'],
                ['name' => 'Mobile App', 'status' => 'Paused', 'progress' => 33, 'team' => 'Product', 'due' => 'Jan 15'],
            ],
            'filters' => [
                'categories' => [
                    ['value' => 'revenue', 'label' => 'Revenue', 'color' => '#10b981'],
                    ['value' => 'users', 'label' => 'Users', 'color' => '#6366f1'],
                    ['value' => 'performance', 'label' => 'Performance', 'color' => '#f59e0b'],
                    ['value' => 'infra', 'label' => 'Infrastructure', 'color' => '#22d3ee'],
                    ['value' => 'support', 'label' => 'Support', 'color' => '#f43f5e'],
                ],
                'periods' => [
                    ['value' => '7d', 'label' => 'Last 7 days', 'color' => '#6366f1'],
                    ['value' => '30d', 'label' => 'Last 30 days', 'color' => '#6366f1'],
                    ['value' => '90d', 'label' => 'Last 90 days', 'color' => '#6366f1'],
                    ['value' => '1y', 'label' => 'This year', 'color' => '#6366f1'],
                ],
                'teams' => [
                    ['value' => 'eng', 'label' => 'Engineering', 'color' => '#22d3ee'],
                    ['value' => 'design', 'label' => 'Design', 'color' => '#f59e0b'],
                    ['value' => 'product', 'label' => 'Product', 'color' => '#10b981'],
                    ['value' => 'growth', 'label' => 'Growth', 'color' => '#f43f5e'],
                ],
            ],
        ];
    }
}
