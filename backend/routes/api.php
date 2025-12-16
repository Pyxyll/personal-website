<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\NowUpdateController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\LinkedInController;

// Public API routes
Route::prefix('v1')->group(function () {
    // Auth routes - rate limited to prevent brute force
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1'); // 5 attempts per minute
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });

    // Public read endpoints - rate limited to prevent scraping/DoS
    Route::middleware('throttle:60,1')->group(function () {
        // Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/{slug}', [ProjectController::class, 'show']);

        // Blog Posts
        Route::get('/posts', [BlogPostController::class, 'index']);
        Route::get('/posts/tags', [BlogPostController::class, 'tags']);
        Route::get('/posts/{slug}', [BlogPostController::class, 'show']);

        // Now Updates
        Route::get('/now', [NowUpdateController::class, 'current']);
        Route::get('/now/history', [NowUpdateController::class, 'index']);
    });

    // Contact Form (public submission) - rate limited to prevent spam
    Route::post('/contact', [ContactController::class, 'store'])
        ->middleware('throttle:3,1'); // 3 submissions per minute

    // LinkedIn OAuth callback (public, redirects to admin)
    Route::get('/linkedin/callback', [LinkedInController::class, 'callback']);
});

// Protected API routes (for admin)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Projects
    Route::get('/admin/projects', [ProjectController::class, 'adminIndex']);
    Route::get('/admin/projects/{id}', [ProjectController::class, 'adminShow']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Blog Posts
    Route::get('/admin/posts', [BlogPostController::class, 'adminIndex']);
    Route::get('/admin/posts/{id}', [BlogPostController::class, 'adminShow']);
    Route::post('/posts', [BlogPostController::class, 'store']);
    Route::put('/posts/{id}', [BlogPostController::class, 'update']);
    Route::delete('/posts/{id}', [BlogPostController::class, 'destroy']);

    // Now Updates
    Route::get('/admin/now', [NowUpdateController::class, 'adminIndex']);
    Route::post('/now', [NowUpdateController::class, 'store']);
    Route::put('/now/{id}', [NowUpdateController::class, 'update']);
    Route::delete('/now/{id}', [NowUpdateController::class, 'destroy']);

    // Contact Submissions
    Route::get('/admin/contact', [ContactController::class, 'index']);
    Route::get('/admin/contact/unread-count', [ContactController::class, 'unreadCount']);
    Route::get('/admin/contact/{id}', [ContactController::class, 'show']);
    Route::patch('/admin/contact/{id}/read', [ContactController::class, 'markRead']);
    Route::patch('/admin/contact/{id}/unread', [ContactController::class, 'markUnread']);
    Route::delete('/admin/contact/{id}', [ContactController::class, 'destroy']);

    // Images
    Route::post('/admin/images/upload', [ImageController::class, 'upload']);
    Route::delete('/admin/images/{filename}', [ImageController::class, 'destroy']);

    // LinkedIn
    Route::get('/admin/linkedin/status', [LinkedInController::class, 'status']);
    Route::get('/admin/linkedin/auth', [LinkedInController::class, 'auth']);
    Route::post('/admin/linkedin/disconnect', [LinkedInController::class, 'disconnect']);
    Route::post('/admin/linkedin/post', [LinkedInController::class, 'post']);
});
