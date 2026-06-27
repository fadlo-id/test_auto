<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'price', 'currency', 'billing_period', 'stripe_price_id', 'features', 'max_listings', 'is_active'];
    protected $casts = ['price' => 'decimal:2', 'features' => 'array', 'is_active' => 'boolean'];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function getIsPremiumAttribute()
    {
        return $this->price > 0;
    }
}