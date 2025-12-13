<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Validate query parameters
        $request->validate([
            'search' => 'nullable|string|max:100',
            'tag' => 'nullable|string|max:50',
            'featured' => 'nullable|boolean',
        ]);

        $query = BlogPost::query()->published()->orderBy('published_at', 'desc');

        if ($request->has('featured')) {
            $query->featured();
        }

        if ($request->has('tag')) {
            $query->byTag($request->tag);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:blog_posts',
            'description' => 'required|string',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'read_time' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        $post = BlogPost::create($validated);

        return response()->json($post, 201);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::where('slug', $slug)->published()->firstOrFail();
        return response()->json($post);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:blog_posts,slug,' . $id,
            'description' => 'sometimes|string',
            'content' => 'sometimes|string',
            'tags' => 'nullable|array',
            'read_time' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        $post->update($validated);

        return response()->json($post);
    }

    public function destroy(string $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json(null, 204);
    }

    public function tags(): JsonResponse
    {
        $posts = BlogPost::published()->get();
        $tags = $posts->pluck('tags')->flatten()->unique()->sort()->values();
        return response()->json($tags);
    }

    // Admin methods - includes drafts
    public function adminIndex(Request $request): JsonResponse
    {
        // Validate query parameters
        $request->validate([
            'search' => 'nullable|string|max:100',
        ]);

        $query = BlogPost::query()->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function adminShow(string $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        return response()->json($post);
    }
}
