<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
    ) {
    }

    public function index(): Response
    {
        $data = $this->dashboardService->index();

        return Inertia::render('dashboard/pages/index', [
            'data' => $data,
        ]);
    }
}
