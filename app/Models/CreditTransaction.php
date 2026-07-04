<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditTransaction extends Model
{
    public $timestamps = false;

    /** Actions an admin can reverse. Deliberately excludes `consumed` — visitor
     *  consumption is never manually rolled back — and `rollback` itself. */
    public const ROLLBACKABLE_ACTIONS = [
        'added', 'removed', 'reset', 'renewal', 'set_unlimited', 'remove_unlimited',
        'blocked', 'unblocked', 'exhausted', 'reactivated',
    ];

    protected $fillable = [
        'auto_school_id', 'credit_type', 'action', 'amount',
        'balance_before', 'balance_after', 'performed_by',
        'reason', 'notes', 'ip_address', 'created_at',
        'rollback_of_id', 'rolled_back_at',
    ];

    protected $casts = [
        'amount'         => 'integer',
        'balance_before' => 'integer',
        'balance_after'  => 'integer',
        'created_at'     => 'datetime',
        'rolled_back_at' => 'datetime',
    ];

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(AutoSchool::class, 'auto_school_id');
    }

    /** The original transaction this row reverses (only set on rollback rows). */
    public function rollbackOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'rollback_of_id');
    }

    public function isRollbackable(): bool
    {
        return in_array($this->action, self::ROLLBACKABLE_ACTIONS, true)
            && $this->rolled_back_at === null
            && $this->rollback_of_id === null
            && $this->balance_before !== null;
    }

    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'consumed'         => 'Consommé',
            'added'            => 'Ajouté',
            'removed'          => 'Retiré',
            'reset'            => 'Réinitialisé',
            'renewal'          => 'Renouvellement',
            'blocked'          => 'Bloqué',
            'unblocked'        => 'Débloqué',
            'set_unlimited'    => 'Illimité activé',
            'remove_unlimited' => 'Illimité désactivé',
            'exhausted'        => 'Épuisé',
            'reactivated'      => 'Réactivé',
            'suspended'        => 'Suspendu',
            'unsuspended'      => 'Désuspendu',
            'rollback'         => 'Annulé (rollback)',
            default            => $this->action,
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return CreditBalance::LABELS[$this->credit_type] ?? $this->credit_type;
    }
}
