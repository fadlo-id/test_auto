<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'auto_school_id', 'user_id', 'name', 'email', 'phone',
        'permit_type', 'message', 'preferred_date', 'status', 'admin_notes',
    ];

    protected $casts = ['preferred_date' => 'date'];

    public function autoSchool(): BelongsTo
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
