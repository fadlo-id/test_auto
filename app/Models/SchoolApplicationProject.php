<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolApplicationProject extends Model
{
    protected $fillable = ['school_application_id', 'title', 'description', 'year'];

    protected $casts = ['year' => 'integer'];

    public function application()
    {
        return $this->belongsTo(SchoolApplication::class, 'school_application_id');
    }
}
