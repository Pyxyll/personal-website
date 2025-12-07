<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NowUpdate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NowUpdateController extends Controller
{
    public function index(): JsonResponse
    {
        $updates = NowUpdate::orderBy('created_at', 'desc')->get();
        return response()->json($updates);
    }

    public function current(): JsonResponse
    {
        $update = NowUpdate::current()->first();
        return response()->json($update);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'location' => 'nullable|string',
            'status' => 'nullable|string',
            'working_on' => 'nullable|array',
            'learning' => 'nullable|array',
            'reading' => 'nullable|array',
            'watching' => 'nullable|array',
            'goals' => 'nullable|array',
            'is_current' => 'nullable|boolean',
        ]);

        if ($request->input('is_current', false)) {
            NowUpdate::where('is_current', true)->update(['is_current' => false]);
        }

        $update = NowUpdate::create($validated);

        return response()->json($update, 201);
    }

    public function show(string $id): JsonResponse
    {
        $update = NowUpdate::findOrFail($id);
        return response()->json($update);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $update = NowUpdate::findOrFail($id);

        $validated = $request->validate([
            'location' => 'nullable|string',
            'status' => 'nullable|string',
            'working_on' => 'nullable|array',
            'learning' => 'nullable|array',
            'reading' => 'nullable|array',
            'watching' => 'nullable|array',
            'goals' => 'nullable|array',
            'is_current' => 'nullable|boolean',
        ]);

        if ($request->input('is_current', false)) {
            NowUpdate::where('is_current', true)
                     ->where('id', '!=', $id)
                     ->update(['is_current' => false]);
        }

        $update->update($validated);

        return response()->json($update);
    }

    public function destroy(string $id): JsonResponse
    {
        $update = NowUpdate::findOrFail($id);
        $update->delete();

        return response()->json(null, 204);
    }

    // Admin methods
    public function adminIndex(): JsonResponse
    {
        $updates = NowUpdate::orderBy('created_at', 'desc')->get();
        return response()->json($updates);
    }
}
