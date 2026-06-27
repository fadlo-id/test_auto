<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolPhoto extends Model
{
    protected $fillable = ['auto_school_id', 'path', 'caption', 'sort_order'];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}
