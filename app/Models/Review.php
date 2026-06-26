<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'auto_school_id', 'user_id', 'rating', 'title', 'content',
        'verified', 'helpful_count', 'status', 'rejection_reason',
    ];

    protected $casts = [
        'rating'   => 'integer',
        'verified' => 'boolean',
    ];

    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}