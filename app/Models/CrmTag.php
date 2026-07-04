<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CrmTag extends Model
{
    protected $table = 'crm_tags';

    protected $fillable = ['name', 'color'];

    public function prospects(): BelongsToMany
    {
        return $this->belongsToMany(CrmProspect::class, 'crm_prospect_tags', 'tag_id', 'prospect_id');
    }
}
