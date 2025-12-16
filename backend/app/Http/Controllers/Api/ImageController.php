<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function __construct(
        private ImageService $imageService
    ) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240',
            'type' => 'nullable|in:featured,content',
        ]);

        $type = $request->input('type', 'content');
        $file = $request->file('image');

        if ($type === 'featured') {
            $result = $this->imageService->uploadFeaturedImage($file);
        } else {
            $result = $this->imageService->uploadContentImage($file);
        }

        return response()->json($result, 201);
    }

    public function destroy(string $filename): JsonResponse
    {
        $path = '/storage/images/posts/' . $filename;
        $deleted = $this->imageService->deleteImage($path);

        if (!$deleted) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        return response()->json(null, 204);
    }
}
