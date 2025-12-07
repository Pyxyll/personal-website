<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::query()->orderBy('sort_order')->orderBy('created_at', 'desc');

        if ($request->has('featured')) {
            $query->featured();
        }

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:projects',
            'description' => 'required|string',
            'tags' => 'nullable|array',
            'status' => 'nullable|in:active,completed,wip,archived',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'category' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $project = Project::create($validated);

        return response()->json($project, 201);
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        return response()->json($project);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:projects,slug,' . $id,
            'description' => 'sometimes|string',
            'tags' => 'nullable|array',
            'status' => 'nullable|in:active,completed,wip,archived',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'category' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    public function destroy(string $id): JsonResponse
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(null, 204);
    }

    // Admin methods
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Project::query()->orderBy('sort_order')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }
}
