<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['auto_school_id', 'name', 'description', 'price', 'duration', 'is_active'];
    protected $casts = ['price' => 'decimal:2', 'is_active' => 'boolean'];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}