<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'price'          => (float) $this->price,
            'currency'       => $this->currency,
            'billing_period' => $this->billing_period,
            'features'       => $this->features,
            'max_listings'   => $this->max_listings,
            'is_active'      => $this->is_active,
        ];
    }
}
