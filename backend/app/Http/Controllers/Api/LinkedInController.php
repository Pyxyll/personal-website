<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Services\LinkedInService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class LinkedInController extends Controller
{
    public function __construct(
        private LinkedInService $linkedInService
    ) {}

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $isConnected = $this->linkedInService->isConnected($user);

        return response()->json([
            'connected' => $isConnected,
        ]);
    }

    public function auth(Request $request): JsonResponse
    {
        $user = $request->user();
        $url = $this->linkedInService->getAuthUrl($user);

        return response()->json([
            'url' => $url,
        ]);
    }

    public function callback(Request $request): RedirectResponse
    {
        $code = $request->input('code');
        $state = $request->input('state');
        $error = $request->input('error');

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        if ($error) {
            return redirect($frontendUrl . '/admin/settings?linkedin=error&message=' . urlencode($error));
        }

        if (!$code || !$state) {
            return redirect($frontendUrl . '/admin/settings?linkedin=error&message=missing_params');
        }

        $token = $this->linkedInService->handleCallback($code, $state);

        if (!$token) {
            return redirect($frontendUrl . '/admin/settings?linkedin=error&message=auth_failed');
        }

        return redirect($frontendUrl . '/admin/settings?linkedin=success');
    }

    public function disconnect(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->linkedInService->disconnect($user);

        return response()->json([
            'success' => true,
        ]);
    }

    public function post(Request $request): JsonResponse
    {
        $request->validate([
            'post_id' => 'required|exists:blog_posts,id',
            'content' => 'required|string|max:3000',
        ]);

        $user = $request->user();
        $post = BlogPost::findOrFail($request->input('post_id'));

        $postUrl = config('app.frontend_url', 'http://localhost:3000') . '/blog/' . $post->slug;

        $linkedInPostId = $this->linkedInService->createPost(
            $user,
            $request->input('content'),
            $postUrl,
            $post->featured_image
        );

        if (!$linkedInPostId) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to post to LinkedIn',
            ], 500);
        }

        $post->update(['linkedin_post_id' => $linkedInPostId]);

        return response()->json([
            'success' => true,
            'linkedin_post_id' => $linkedInPostId,
        ]);
    }
}
