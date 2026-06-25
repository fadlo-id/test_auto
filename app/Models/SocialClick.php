<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClick extends Model
{
    protected $fillable = [
        'auto_school_id',
        'type'
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}