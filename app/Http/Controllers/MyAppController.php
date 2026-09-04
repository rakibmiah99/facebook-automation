<?php

namespace App\Http\Controllers;

use App\Services\FacebookAppService;
use Illuminate\Http\Request;

class MyAppController extends Controller
{
    public function __construct(
        private FacebookAppService $facebookAppService,
    ) {
    }

    public function index(Request $request)
    {
        $apps = $this->facebookAppService->listForApi($request->user()->id);

        return response()->json([
            'status' => true,
            'message' => 'Apps retrieved successfully.',
            'data' => $apps,
        ]);
    }
}
