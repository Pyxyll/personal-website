<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('featured_image')->nullable()->after('content');
            $table->string('featured_image_alt')->nullable()->after('featured_image');
            $table->boolean('post_to_linkedin')->default(false)->after('is_published');
            $table->string('linkedin_post_id')->nullable()->after('post_to_linkedin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn([
                'featured_image',
                'featured_image_alt',
                'post_to_linkedin',
                'linkedin_post_id',
            ]);
        });
    }
};
