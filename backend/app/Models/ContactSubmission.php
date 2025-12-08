<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContactSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'message',
        'read',
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }
}
