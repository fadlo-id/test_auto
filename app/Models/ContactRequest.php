<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactRequest extends Model
{
    protected $fillable = [
        'auto_school_id',
        'name',
        'email',
        'phone',
        'message',
        'status'
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}