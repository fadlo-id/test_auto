<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolView extends Model
{
    protected $fillable = [
        'auto_school_id',
        'ip',
        'user_agent'
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}