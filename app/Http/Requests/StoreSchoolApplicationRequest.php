<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolApplicationRequest extends FormRequest
{
    public const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    public function authorize(): bool
    {
        // Public form — anyone (including guests) may submit an application.
        // Abuse is mitigated by route-level rate limiting, not authorization.
        return true;
    }

    public function rules(): array
    {
        $rules = [
            // 1. Informations générales
            'school_name'     => 'required|string|max:255',
            'owner_name'      => 'required|string|max:255',
            'founded_at'      => 'nullable|date|before_or_equal:today',
            'city'            => 'required|string|max:100',
            'district'        => 'nullable|string|max:100',
            'address'         => 'required|string|max:500',
            'phone_landline'  => 'nullable|string|max:30',
            'phone_mobile'    => 'required|string|max:30',
            'whatsapp'        => 'nullable|string|max:30',
            'email'           => 'required|email|max:255',

            // 2. Présentation
            'tagline'          => 'nullable|string|max:150',
            'director_message' => 'nullable|string|max:2000',
            'description'      => 'required|string|max:5000',

            // 3. Informations pédagogiques
            'categories'          => 'required|array|min:1',
            'categories.*'        => 'exists:categories,id',
            'languages'           => 'nullable|array',
            'languages.*'         => 'string|max:50',
            'instructor_genders'  => 'nullable|array',
            'instructor_genders.*' => 'in:male,female',

            // 5. Présence en ligne
            'facebook_url'    => 'nullable|url|max:255',
            'instagram_url'   => 'nullable|url|max:255',
            'tiktok_url'      => 'nullable|url|max:255',
            'website_url'     => 'nullable|url|max:255',
            'google_maps_url' => 'nullable|url|max:255',

            // 6. Chiffres clés
            'years_experience'        => 'nullable|integer|min:0|max:100',
            'total_students'          => 'nullable|integer|min:0|max:1000000',
            'avg_students_per_month'  => 'nullable|integer|min:0|max:100000',
            'success_rate'            => 'nullable|integer|min:0|max:100',
            'staff_count'             => 'nullable|integer|min:0|max:1000',
            'vehicles_count'          => 'nullable|integer|min:0|max:1000',

            // 7. Médias
            'logo'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'gallery'   => 'nullable|array|max:10',
            'gallery.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',

            // 8. Services spéciaux
            'special_services'       => 'nullable|array',
            'special_services.*'     => 'string|max:100',
            'special_services_other' => 'nullable|string|max:255',

            // 9. Autres projets
            'projects'              => 'nullable|array|max:10',
            'projects.*.title'      => 'required|string|max:255',
            'projects.*.description' => 'nullable|string|max:1000',
            'projects.*.year'       => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
        ];

        // 4. Horaires — structured per day, not a textarea.
        $rules['opening_hours'] = 'required|array';
        foreach (self::DAYS as $day) {
            $rules["opening_hours.{$day}.closed"] = 'required|boolean';
            $rules["opening_hours.{$day}.open"] = 'nullable|required_if:opening_hours.' . $day . '.closed,false|date_format:H:i';
            $rules["opening_hours.{$day}.close"] = 'nullable|required_if:opening_hours.' . $day . '.closed,false|date_format:H:i';
        }

        return $rules;
    }

    public function attributes(): array
    {
        return [
            'school_name'   => 'nom de l\'auto-école',
            'owner_name'    => 'nom du propriétaire',
            'phone_mobile'  => 'GSM',
            'categories'    => 'catégories',
            'description'   => 'description',
            'opening_hours' => 'horaires',
        ];
    }
}
