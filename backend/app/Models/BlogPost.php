<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BlogPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'featured_image',
        'featured_image_alt',
        'tags',
        'read_time',
        'featured',
        'published',
        'published_at',
        'post_to_linkedin',
        'linkedin_post_id',
    ];

    protected $casts = [
        'tags' => 'array',
        'featured' => 'boolean',
        'published' => 'boolean',
        'published_at' => 'datetime',
        'post_to_linkedin' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('published', true)->whereNotNull('published_at');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }
}
