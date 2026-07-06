<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'status',
        'school_name', 'owner_name', 'founded_at', 'city', 'district', 'address',
        'phone_landline', 'phone_mobile', 'whatsapp', 'email',
        'tagline', 'director_message', 'description',
        'categories', 'languages', 'instructor_genders',
        'opening_hours',
        'facebook_url', 'instagram_url', 'tiktok_url', 'website_url', 'google_maps_url',
        'years_experience', 'total_students', 'avg_students_per_month', 'success_rate',
        'staff_count', 'vehicles_count',
        'special_services', 'special_services_other',
        'rejection_reason', 'reviewed_by', 'reviewed_at',
        'created_auto_school_id', 'created_user_id',
        'ip_address',
    ];

    protected $casts = [
        'founded_at'          => 'date',
        'categories'          => 'array',
        'languages'           => 'array',
        'instructor_genders'  => 'array',
        'opening_hours'       => 'array',
        'special_services'    => 'array',
        'reviewed_at'         => 'datetime',
        'years_experience'    => 'integer',
        'total_students'      => 'integer',
        'avg_students_per_month' => 'integer',
        'success_rate'        => 'integer',
        'staff_count'         => 'integer',
        'vehicles_count'      => 'integer',
    ];

    public function media()
    {
        return $this->hasMany(SchoolApplicationMedia::class)->orderBy('sort_order');
    }

    public function logo()
    {
        return $this->hasOne(SchoolApplicationMedia::class)->where('type', 'logo');
    }

    public function galleryMedia()
    {
        return $this->hasMany(SchoolApplicationMedia::class)->where('type', 'gallery')->orderBy('sort_order');
    }

    public function projects()
    {
        return $this->hasMany(SchoolApplicationProject::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function createdAutoSchool()
    {
        return $this->belongsTo(AutoSchool::class, 'created_auto_school_id');
    }

    public function createdUser()
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
