<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'status'               => $this->status,
            'started_at'           => $this->started_at?->toIso8601String(),
            'expires_at'           => $this->expires_at?->toIso8601String(),
            'cancel_at_period_end' => $this->cancel_at_period_end,
            'is_active'            => $this->isActive(),
            'plan'                 => new PlanResource($this->whenLoaded('plan')),
        ];
    }
}
