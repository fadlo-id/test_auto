<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

/**
 * Generic tabular sheet: title + headings + rows. Reused for every
 * Analytics export sheet instead of one class per metric.
 */
class GenericSheet implements FromArray, WithHeadings, WithTitle
{
    public function __construct(
        private readonly string $title,
        private readonly array $headings,
        private readonly array $rows,
    ) {
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function title(): string
    {
        // Excel sheet titles are capped at 31 chars and can't contain []:*?/\\
        return substr(preg_replace('/[\[\]:\*\?\/\\\\]/', '', $this->title), 0, 31);
    }
}
