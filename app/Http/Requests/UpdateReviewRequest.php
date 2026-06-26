<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        $review = $this->route('review');

        return $this->user()->can('update', $review);
    }

    public function rules(): array
    {
        return [
            'rating'  => 'sometimes|required|integer|between:1,5',
            'title'   => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|min:10|max:2000',
        ];
    }
}
