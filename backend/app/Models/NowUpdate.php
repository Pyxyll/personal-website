<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NowUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'status',
        'working_on',
        'learning',
        'reading',
        'watching',
        'goals',
        'is_current',
    ];

    protected $casts = [
        'working_on' => 'array',
        'learning' => 'array',
        'reading' => 'array',
        'watching' => 'array',
        'goals' => 'array',
        'is_current' => 'boolean',
    ];

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }
}
