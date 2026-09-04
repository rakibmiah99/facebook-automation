<?php

namespace App\Services;

use App\Http\Requests\FacebookAppStoreRequest;
use App\Http\Requests\FacebookAppUpdateRequest;
use App\Models\FacebookApp;
use App\Models\FacebookAppAccount;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Support\Collection;
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

    /**
     * The caller's own apps plus each app's accounts (has-many), for API consumers — a minimal
     * projection rather than the full models `index()` returns for the web UI: just enough to
     * identify an app and pick one of its Pages by id.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function listForApi(int $userId): Collection
    {
        return FacebookApp::query()
            ->where('user_id', $userId)
            ->with('accounts:id,facebook_app_id,account_name')
            ->latest()
            ->get()
            ->map(fn (FacebookApp $app) => [
                'id' => $app->id,
                'app_name' => $app->app_name,
                'status' => $app->status,
                'accounts' => $app->accounts->map(fn (FacebookAppAccount $account) => [
                    'id' => $account->id,
                    'account_name' => $account->account_name,
                ]),
            ]);
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
