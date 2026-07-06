<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolApplicationMedia extends Model
{
    protected $fillable = ['school_application_id', 'type', 'path', 'sort_order'];

    public function application()
    {
        return $this->belongsTo(SchoolApplication::class, 'school_application_id');
    }
}
