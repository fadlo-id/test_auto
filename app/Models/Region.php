<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['name', 'code', 'capital', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function schools()
    {
        return $this->hasMany(AutoSchool::class, 'region', 'name');
    }
}
