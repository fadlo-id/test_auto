<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditLog extends Model
{
    public $timestamps = false;

    protected $table = 'credit_logs';

    protected $fillable = [
        'auto_school_id',
        'credit_type',
        'change',
        'balance_after',
        'reason',
        'admin_id',
        'notes',
    ];

    protected $casts = [
        'change'       => 'integer',
        'balance_after' => 'integer',
        'created_at'   => 'datetime',
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
