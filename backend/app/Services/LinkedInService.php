<?php

namespace App\Services;

use App\Models\SocialToken;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LinkedInService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private string $authUrl = 'https://www.linkedin.com/oauth/v2/authorization';
    private string $tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    private string $apiUrl = 'https://api.linkedin.com/v2';

    public function __construct()
    {
        $this->clientId = config('services.linkedin.client_id', '');
        $this->clientSecret = config('services.linkedin.client_secret', '');
        $this->redirectUri = config('services.linkedin.redirect_uri', '');
    }

    public function getAuthUrl(User $user): string
    {
        $params = http_build_query([
            'response_type' => 'code',
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'state' => encrypt($user->id),
            'scope' => 'openid profile w_member_social',
        ]);

        return $this->authUrl . '?' . $params;
    }

    public function handleCallback(string $code, string $state): ?SocialToken
    {
        try {
            $userId = decrypt($state);
            $user = User::findOrFail($userId);

            $response = Http::asForm()->post($this->tokenUrl, [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->redirectUri,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if (!$response->successful()) {
                Log::error('LinkedIn token exchange failed', ['response' => $response->body()]);
                return null;
            }

            $data = $response->json();

            return SocialToken::updateOrCreate(
                ['provider' => 'linkedin', 'user_id' => $user->id],
                [
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'] ?? null,
                    'expires_at' => now()->addSeconds($data['expires_in']),
                ]
            );
        } catch (\Exception $e) {
            Log::error('LinkedIn callback error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function refreshToken(SocialToken $token): ?SocialToken
    {
        if (!$token->refresh_token) {
            return null;
        }

        try {
            $response = Http::asForm()->post($this->tokenUrl, [
                'grant_type' => 'refresh_token',
                'refresh_token' => $token->refresh_token,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if (!$response->successful()) {
                Log::error('LinkedIn token refresh failed', ['response' => $response->body()]);
                return null;
            }

            $data = $response->json();

            $token->update([
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? $token->refresh_token,
                'expires_at' => now()->addSeconds($data['expires_in']),
            ]);

            return $token->fresh();
        } catch (\Exception $e) {
            Log::error('LinkedIn token refresh error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function isConnected(User $user): bool
    {
        $token = $this->getToken($user);
        return $token !== null && !$token->isExpired();
    }

    public function getToken(User $user): ?SocialToken
    {
        return SocialToken::where('provider', 'linkedin')
            ->where('user_id', $user->id)
            ->first();
    }

    public function createPost(User $user, string $text, ?string $url = null, ?string $imageUrl = null): ?string
    {
        $token = $this->getToken($user);

        if (!$token) {
            return null;
        }

        if ($token->isExpired()) {
            $token = $this->refreshToken($token);
            if (!$token) {
                return null;
            }
        }

        try {
            // Get user's LinkedIn URN
            $profileResponse = Http::withToken($token->access_token)
                ->get($this->apiUrl . '/userinfo');

            if (!$profileResponse->successful()) {
                Log::error('LinkedIn profile fetch failed', ['response' => $profileResponse->body()]);
                return null;
            }

            $profileData = $profileResponse->json();
            $authorUrn = 'urn:li:person:' . $profileData['sub'];

            // Build the post content
            $postContent = [
                'author' => $authorUrn,
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $text,
                        ],
                        'shareMediaCategory' => 'NONE',
                    ],
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC',
                ],
            ];

            // Add article if URL is provided
            if ($url) {
                $postContent['specificContent']['com.linkedin.ugc.ShareContent']['shareMediaCategory'] = 'ARTICLE';
                $postContent['specificContent']['com.linkedin.ugc.ShareContent']['media'] = [
                    [
                        'status' => 'READY',
                        'originalUrl' => $url,
                    ],
                ];
            }

            $response = Http::withToken($token->access_token)
                ->withHeaders(['X-Restli-Protocol-Version' => '2.0.0'])
                ->post($this->apiUrl . '/ugcPosts', $postContent);

            if (!$response->successful()) {
                Log::error('LinkedIn post creation failed', ['response' => $response->body()]);
                return null;
            }

            return $response->header('X-RestLi-Id') ?? 'posted';
        } catch (\Exception $e) {
            Log::error('LinkedIn post error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function disconnect(User $user): bool
    {
        return SocialToken::where('provider', 'linkedin')
            ->where('user_id', $user->id)
            ->delete() > 0;
    }
}
