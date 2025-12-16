<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Interfaces\ImageInterface;

class ImageService
{
    private const FEATURED_SIZE = 500;
    private const CONTENT_MAX_WIDTH = 1200;
    private const QUALITY = 85;
    private const STORAGE_PATH = 'images/posts';
    private const DISK = 'public';

    public function uploadFeaturedImage(UploadedFile $file): array
    {
        $image = Image::read($file);

        $image = $this->cropToSquare($image, self::FEATURED_SIZE);

        return $this->saveImage($image, 'featured');
    }

    public function uploadContentImage(UploadedFile $file): array
    {
        $image = Image::read($file);

        if ($image->width() > self::CONTENT_MAX_WIDTH) {
            $image = $image->scale(width: self::CONTENT_MAX_WIDTH);
        }

        return $this->saveImage($image, 'content');
    }

    public function deleteImage(string $url): bool
    {
        // Extract the path from full URL or relative path
        $path = parse_url($url, PHP_URL_PATH) ?? $url;
        // Remove /storage/ prefix to get the path relative to the public disk
        $storagePath = preg_replace('#^/storage/#', '', $path);

        if (Storage::disk(self::DISK)->exists($storagePath)) {
            return Storage::disk(self::DISK)->delete($storagePath);
        }

        return false;
    }

    private function cropToSquare(ImageInterface $image, int $size): ImageInterface
    {
        $width = $image->width();
        $height = $image->height();

        if ($width > $height) {
            $image = $image->crop($height, $height, (int)(($width - $height) / 2), 0);
        } elseif ($height > $width) {
            $image = $image->crop($width, $width, 0, (int)(($height - $width) / 2));
        }

        return $image->resize($size, $size);
    }

    private function saveImage(ImageInterface $image, string $prefix): array
    {
        $filename = $prefix . '_' . Str::random(16);

        Storage::disk(self::DISK)->makeDirectory(self::STORAGE_PATH);

        $webpPath = self::STORAGE_PATH . '/' . $filename . '.webp';
        $jpegPath = self::STORAGE_PATH . '/' . $filename . '.jpg';

        $webpEncoded = $image->toWebp(self::QUALITY);
        Storage::disk(self::DISK)->put($webpPath, (string) $webpEncoded);

        $jpegEncoded = $image->toJpeg(self::QUALITY);
        Storage::disk(self::DISK)->put($jpegPath, (string) $jpegEncoded);

        $relativePath = '/storage/' . self::STORAGE_PATH . '/' . $filename;
        $baseUrl = rtrim(config('app.url'), '/');

        return [
            'webp' => $baseUrl . $relativePath . '.webp',
            'jpeg' => $baseUrl . $relativePath . '.jpg',
            'url' => $baseUrl . $relativePath . '.webp',
        ];
    }
}
