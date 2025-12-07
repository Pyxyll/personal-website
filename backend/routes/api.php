<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\NowUpdateController;
use App\Http\Controllers\Api\AuthController;

// Public API routes
Route::prefix('v1')->group(function () {
    // Auth routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });
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

// Protected API routes (for admin)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Projects
    Route::get('/admin/projects', [ProjectController::class, 'adminIndex']);
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
});
