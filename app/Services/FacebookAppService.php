<?php

namespace App\Services;

use App\Http\Requests\FacebookAppStoreRequest;
use App\Http\Requests\FacebookAppUpdateRequest;
use App\Models\FacebookApp;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;

class FacebookAppService
{
    public function __construct(
        private FacebookRepositoryInterface $facebookRepository,
    ) {
    }

    public function index(): array
    {
        return [
            'apps' => FacebookApp::query()
                ->where('user_id', Auth::id())
                ->latest()
                ->get(),
        ];
    }

    public function store(FacebookAppStoreRequest $request): FacebookApp
    {
        return FacebookApp::create([
            'user_id' => $request->user()->id,
            'app_name' => $request->validated('app_name'),
            'app_id' => $request->validated('app_id'),
            'app_secret' => $request->validated('app_secret'),
            'app_token' => $request->validated('app_token'),
            'status' => $request->boolean('status', true),
        ]);
    }

    public function update(FacebookAppUpdateRequest $request, FacebookApp $facebookApp): FacebookApp
    {
        abort_unless($facebookApp->user_id === Auth::id(), 403);

        $facebookApp->update(array_filter([
            'app_name' => $request->validated('app_name'),
            'app_id' => $request->validated('app_id'),
            'app_secret' => $request->validated('app_secret') ?: null,
            'app_token' => $request->validated('app_token') ?: null,
            'status' => $request->boolean('status', true),
        ], fn ($value) => $value !== null));

        return $facebookApp->refresh();
    }

    public function destroy(FacebookApp $facebookApp): void
    {
        abort_unless($facebookApp->user_id === Auth::id(), 403);

        $facebookApp->delete();
    }

    public function generateLongLivedToken(FacebookApp $facebookApp): FacebookApp
    {
        abort_unless($facebookApp->user_id === Auth::id(), 403);

        $result = $this->facebookRepository->getLongLivedToken(
            $facebookApp->app_id,
            $facebookApp->app_secret,
            $facebookApp->app_token,
        );

        $facebookApp->update([
            'long_lived_token' => $result['access_token'],
            'long_lived_token_expiration' => Date::now()->addSeconds((int) ($result['expires_in'] ?? 0))->timestamp,
        ]);

        return $facebookApp->refresh();
    }
}
