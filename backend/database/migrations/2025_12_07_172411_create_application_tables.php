<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->longText('content');
            $table->json('tags')->nullable();
            $table->string('read_time')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->json('tags')->nullable();
            $table->enum('status', ['active', 'completed', 'wip', 'archived'])->default('active');
            $table->string('github_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('category')->default('web');
            $table->boolean('featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('now_updates', function (Blueprint $table) {
            $table->id();
            $table->string('location')->nullable();
            $table->string('status')->default('ONLINE');
            $table->json('working_on')->nullable();
            $table->json('learning')->nullable();
            $table->json('reading')->nullable();
            $table->json('watching')->nullable();
            $table->json('goals')->nullable();
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('now_updates');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('blog_posts');
    }
};
