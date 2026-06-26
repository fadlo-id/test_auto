<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'rating'           => $this->rating,
            'title'            => $this->title,
            'content'          => $this->content,
            'status'           => $this->status,
            'verified'         => $this->verified,
            'helpful_count'    => $this->helpful_count,
            'user'             => new UserResource($this->whenLoaded('user')),
            'auto_school_id'   => $this->auto_school_id,
            'created_at'       => $this->created_at?->toIso8601String(),
        ];
    }
}
