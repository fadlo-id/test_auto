<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stat extends Model
{
    protected $fillable = [
        'auto_school_id',
        'views_count',
        'phone_clicks',
        'website_clicks',
        'facebook_clicks',
        'instagram_clicks',
        'whatsapp_clicks',
        'email_clicks',
        'maps_clicks',
        'registrations_count',
        'date'
    ];
    protected $casts = ['date' => 'date'];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}