<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AutoSchoolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'slug'             => $this->slug,
            'description'      => $this->description,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'address'          => $this->address,
            'city'             => $this->city,
            'region'           => $this->region,
            'latitude'         => $this->latitude,
            'longitude'        => $this->longitude,
            'license_number'   => $this->license_number,
            'established_year' => $this->established_year,
            'website_url'      => $this->website_url,
            'facebook_url'     => $this->facebook_url,
            'instagram_url'    => $this->instagram_url,
            'logo_url'         => $this->logo_url,
            'banner_url'       => $this->banner_url,
            'is_active'        => $this->is_active,
            'status'           => $this->status,
            'is_verified'      => $this->is_verified,
            'featured_until'   => $this->featured_until?->toIso8601String(),
            'average_rating'   => round((float) $this->average_rating, 2),
            'review_count'     => (int) $this->review_count,
            'categories'       => $this->whenLoaded('categories'),
            'services'         => $this->whenLoaded('services'),
            'reviews'          => ReviewResource::collection($this->whenLoaded('reviews')),
            'subscription'     => new SubscriptionResource($this->whenLoaded('subscription')),
            'created_at'       => $this->created_at?->toIso8601String(),
        ];
    }
}
