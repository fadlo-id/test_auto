<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['code', 'name_fr', 'name_ar', 'name_en', 'description_fr', 'icon_url'];

    public function autoSchools()
    {
        return $this->belongsToMany(AutoSchool::class, 'school_categories');
    }
}