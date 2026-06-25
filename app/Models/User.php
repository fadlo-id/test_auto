<?php

namespace App\Models;

use App\Observers\UserObserver;
use App\Models\AutoSchool;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[ObservedBy(UserObserver::class)]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Champs autorisés
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'image',
        'available_credits',
        'status',
        'is_admin',
    ];

    /**
     * Champs cachés
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relation : User → AutoSchools
     * (1 user peut créer plusieurs auto-écoles)
     */
    public function autoSchools()
    {
        return $this->hasMany(AutoSchool::class);
    }

    /**
     * Déduire les crédits utilisateur
     */
    public function decreaseCredits(int $credits): self
    {
        $this->available_credits -= $credits;
        $this->save();

        return $this;
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function usedFeatures()
    {
        return $this->hasMany(UsedFeature::class);
    }
}