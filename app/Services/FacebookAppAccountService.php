<?php

namespace App\Services;

use App\Models\FacebookApp;
use App\Repositories\FacebookRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class FacebookAppAccountService
{
    public function __construct(
        private FacebookRepositoryInterface $facebookRepository,
    ) {
    }

    public function index(FacebookApp $facebookApp): array
    {
        abort_unless($facebookApp->user_id === Auth::id(), 403);

        return [
            'app' => $facebookApp,
            'accounts' => $facebookApp->accounts()->latest()->get(),
        ];
    }

    public function fetch(FacebookApp $facebookApp): void
    {
        abort_unless($facebookApp->user_id === Auth::id(), 403);

        if (! $facebookApp->has_long_lived_token) {
            throw new RuntimeException('Generate a long-lived token for this app before fetching accounts.');
        }

        $accounts = $this->facebookRepository->getAccounts($facebookApp->long_lived_token);

        foreach ($accounts as $account) {
            $facebookApp->accounts()->updateOrCreate(
                ['account_id' => $account['id']],
                [
                    'user_id' => $facebookApp->user_id,
                    'account_name' => $account['name'],
                    'access_token' => $account['access_token'],
                    'link' => $account['link'] ?? null,
                    'fan_count' => $account['fan_count'] ?? null,
                ],
            );
        }
    }
}
