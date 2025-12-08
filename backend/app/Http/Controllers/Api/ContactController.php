<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    // Public endpoint for submitting contact form
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $submission = ContactSubmission::create($validated);

        return response()->json([
            'message' => 'Thanks for reaching out! I\'ll get back to you soon.',
            'id' => $submission->id,
        ], 201);
    }

    // Admin: Get all submissions
    public function index(Request $request): JsonResponse
    {
        $query = ContactSubmission::query()->orderBy('created_at', 'desc');

        if ($request->has('unread')) {
            $query->unread();
        }

        return response()->json($query->get());
    }

    // Admin: Get single submission
    public function show(string $id): JsonResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        return response()->json($submission);
    }

    // Admin: Mark as read
    public function markRead(string $id): JsonResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $submission->update(['read' => true]);
        return response()->json($submission);
    }

    // Admin: Mark as unread
    public function markUnread(string $id): JsonResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $submission->update(['read' => false]);
        return response()->json($submission);
    }

    // Admin: Delete submission
    public function destroy(string $id): JsonResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $submission->delete();
        return response()->json(null, 204);
    }

    // Admin: Get unread count
    public function unreadCount(): JsonResponse
    {
        $count = ContactSubmission::unread()->count();
        return response()->json(['count' => $count]);
    }
}
