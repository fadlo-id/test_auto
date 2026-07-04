<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'subject_type', 'subject_id',
        'properties', 'ip', 'user_agent', 'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(
        string $action,
        ?Model $subject = null,
        array $properties = [],
        ?int $userId = null
    ): void {
        try {
            $request = request();
            static::create([
                'user_id'      => $userId ?? auth()->id(),
                'action'       => $action,
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id'   => $subject?->getKey(),
                'properties'   => empty($properties) ? null : $properties,
                'ip'           => $request->ip(),
                'user_agent'   => substr($request->userAgent() ?? '', 0, 500),
                'created_at'   => now(),
            ]);
        } catch (\Throwable) {
            // Audit failures must never break business logic
        }
    }
}
