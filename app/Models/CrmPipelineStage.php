<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmPipelineStage extends Model
{
    protected $table = 'crm_pipeline_stages';

    protected $fillable = ['name', 'color', 'order', 'type', 'is_default'];

    protected $casts = ['is_default' => 'boolean', 'order' => 'integer'];

    public function prospects(): HasMany
    {
        return $this->hasMany(CrmProspect::class, 'stage_id');
    }

    public function isWon(): bool  { return $this->type === 'won'; }
    public function isLost(): bool { return $this->type === 'lost'; }
}
