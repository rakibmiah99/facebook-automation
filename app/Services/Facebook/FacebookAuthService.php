<?php

namespace App\Services\Facebook;

use App\Models\FacebookApp;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Handles the full "Facebook Login for Business" OAuth flow using our own
 * Meta App credentials, so customers can connect their Facebook Pages to
 * this SaaS without ever entering an App ID/secret themselves.
 *
 * All Meta Graph API communication for this flow lives here — the
 * controller only translates HTTP requests/responses.
 */
class FacebookAuthService
{
    protected string $appId;

    protected string $appSecret;

    protected string $configId;

    protected string $redirectUri;

    protected string $version;

    protected string $graphBaseUrl;

    public function __construct()
    {
        $this->appId = (string) config('services.facebook.app_id');
        $this->appSecret = (string) config('services.facebook.app_secret');
        $this->configId = (string) config('services.facebook.config_id');
        $this->redirectUri = (string) config('services.facebook.redirect_uri');
        $this->version = (string) config('services.facebook.version');
        $this->graphBaseUrl = rtrim((string) config('services.facebook.base_url'), '/').'/'.$this->version;
    }

    /**
     * A random, unguessable value the controller stores in the session and
     * verifies on callback to protect against CSRF.
     */
    public function generateState(): string
    {
        return Str::random(40);
    }

    /**
     * Build the Facebook Login for Business authorization dialog URL.
     */
    public function getAuthorizationUrl(string $state): string
    {
        $query = http_build_query([
            'client_id' => $this->appId,
            'redirect_uri' => $this->redirectUri,
            'config_id' => $this->configId,
            'response_type' => 'code',
            'state' => $state,
        ]);

        return "https://www.facebook.com/{$this->version}/dialog/oauth?{$query}";
    }

    /**
     * Exchange the authorization code Facebook sent to the callback for a
     * user access token.
     *
     * @return array{access_token: string, token_type?: string, expires_in?: int}
     */
    public function exchangeCodeForToken(string $code): array
    {
        return $this->get(
            "{$this->graphBaseUrl}/oauth/access_token",
            [
                'client_id' => $this->appId,
                'client_secret' => $this->appSecret,
                'redirect_uri' => $this->redirectUri,
                'code' => $code,
            ],
            endpoint: 'oauth/access_token',
            fallbackMessage: 'Failed to exchange the authorization code for an access token.',
        );
    }

    /**
     * Retrieve the authenticated Facebook user's basic profile.
     *
     * @return array{id: string, name?: string, email?: string}
     */
    public function getUserProfile(string $userAccessToken): array
    {
        return $this->get(
            "{$this->graphBaseUrl}/me",
            ['fields' => 'id,name,email'],
            token: $userAccessToken,
            endpoint: 'me',
            fallbackMessage: 'Failed to retrieve the Facebook user profile.',
        );
    }

    /**
     * Retrieve every Page the authenticated user manages, including each
     * Page's own access token.
     *
     * @return array<int, array{id: string, name: string, access_token: string, fan_count?: int, link?: string}>
     */
    public function getPages(string $userAccessToken): array
    {
        $response = $this->get(
            "{$this->graphBaseUrl}/me/accounts",
            ['fields' => 'id,name,access_token,fan_count,link'],
            token: $userAccessToken,
            endpoint: 'me/accounts',
            fallbackMessage: 'Failed to retrieve the Facebook Pages for this user.',
        );

        return $response['data'] ?? [];
    }

    /**
     * Retrieve the Page access token for a single, specific Page.
     * Useful when a customer picks one Page rather than connecting all of them.
     */
    public function getPageAccessToken(string $pageId, string $userAccessToken): ?string
    {
        $response = $this->get(
            "{$this->graphBaseUrl}/{$pageId}",
            ['fields' => 'access_token'],
            token: $userAccessToken,
            endpoint: "{$pageId}",
            fallbackMessage: 'Failed to retrieve the Page access token.',
        );

        return $response['access_token'] ?? null;
    }

    /**
     * Run the full connect flow for an authenticated platform user: exchange the
     * code, fetch their profile, fetch every Page they manage, and persist all of
     * it as a FacebookApp (+ FacebookAppAccount per Page) so it behaves exactly
     * like an app the user added manually.
     */
    public function connect(int $userId, string $code): FacebookApp
    {
        $token = $this->exchangeCodeForToken($code);
        $userAccessToken = $token['access_token'] ?? null;

        if (! $userAccessToken) {
            throw new RuntimeException('Facebook did not return an access token.');
        }

        $profile = $this->getUserProfile($userAccessToken);

        $facebookApp = FacebookApp::updateOrCreate(
            ['user_id' => $userId, 'app_id' => $this->appId],
            [
                'app_name' => 'Facebook Login — '.($profile['name'] ?? 'Connected Account'),
                'app_secret' => $this->appSecret,
                'app_token' => $userAccessToken,
                'status' => true,
            ],
        );

        foreach ($this->getPages($userAccessToken) as $page) {
            if (empty($page['id']) || empty($page['access_token'])) {
                continue;
            }

            $facebookApp->accounts()->updateOrCreate(
                ['account_id' => $page['id']],
                [
                    'user_id' => $userId,
                    'account_name' => $page['name'] ?? $page['id'],
                    'access_token' => $page['access_token'],
                    'link' => $page['link'] ?? null,
                    'fan_count' => $page['fan_count'] ?? null,
                ],
            );
        }

        return $facebookApp->refresh();
    }

    /**
     * @return array<string, mixed>
     */
    private function get(string $url, array $query, string $endpoint, string $fallbackMessage, ?string $token = null): array
    {
        try {
            $request = Http::timeout(15)->connectTimeout(10);

            if ($token) {
                $request = $request->withToken($token);
            }

            $response = $request->get($url, $query);
        } catch (ConnectionException $exception) {
            Log::error('Facebook OAuth API connection failed', [
                'endpoint' => $endpoint,
                'message' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Could not reach Facebook. Please try again.');
        }

        return $this->handle($response, $endpoint, $fallbackMessage);
    }

    /**
     * @return array<string, mixed>
     */
    private function handle(Response $response, string $endpoint, string $fallbackMessage): array
    {
        if ($response->failed()) {
            Log::error('Facebook OAuth API request failed', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

            throw new RuntimeException($response->json('error.message') ?? $fallbackMessage);
        }

        return $response->json() ?? [];
    }
}
