<?php

namespace App\Http\Controllers;

use App\Http\Requests\MediaProxyRequest;
use App\Services\MediaProxyService;
use Illuminate\Http\Response;

class MediaProxyController extends Controller
{
    public function __construct(
        private MediaProxyService $mediaProxyService,
    ) {
    }

    public function show(MediaProxyRequest $request): Response
    {
        return $this->mediaProxyService->fetch($request->validated('url'));
    }
}
