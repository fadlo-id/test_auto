<?php

namespace App\Exports;

use App\Exports\Sheets\GenericSheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * Multi-sheet Excel export of the enterprise analytics report built by
 * Admin\AnalyticsController::buildReport() / School\AnalyticsController.
 * When downloaded as CSV, only the first ("Vue d'ensemble") sheet is
 * written — CSV has no concept of multiple sheets.
 */
class AnalyticsExport implements WithMultipleSheets
{
    public function __construct(private readonly array $data)
    {
    }

    public function sheets(): array
    {
        $d = $this->data;
        $sheets = [];

        $sheets[] = $this->overviewSheet($d);
        $sheets[] = $this->timeSeriesSheet('Vues par jour', $d['viewsPerDay'] ?? []);
        $sheets[] = $this->timeSeriesSheet('Clics par jour', $d['clicksPerDay'] ?? []);
        $sheets[] = $this->timeSeriesSheet('Reservations par jour', $d['bookingsPerDay'] ?? []);

        $sheets[] = new GenericSheet(
            'Revenus par mois',
            ['Mois', 'Revenus (MAD)', 'Nombre de paiements'],
            collect($d['revenuePerMonth'] ?? [])->map(fn ($r) => [$r->month, (float) $r->revenue, (int) $r->count])->all()
        );

        $sheets[] = new GenericSheet(
            'Revenus par ecole',
            ['Ecole', 'Ville', 'Revenus (MAD)', 'Nombre de paiements'],
            collect($d['revenuePerSchool'] ?? [])->map(fn ($r) => [$r->name, $r->city, (float) $r->revenue, (int) $r->payments_count])->all()
        );

        $sheets[] = $this->topSchoolsSheet('Ecoles les plus vues', $d['mostViewed'] ?? []);
        $sheets[] = $this->topSchoolsSheet('Ecoles les plus cliquees', $d['mostClicked'] ?? []);
        $sheets[] = $this->topSchoolsSheet('Ecoles les plus contactees', $d['mostContacted'] ?? []);

        $sheets[] = new GenericSheet(
            'Top villes',
            ['Ville', 'Vues'],
            collect($d['topCities'] ?? [])->map(fn ($c) => [$c->city, (int) $c->views])->all()
        );

        $sheets[] = new GenericSheet(
            'Top categories',
            ['Categorie', 'Vues'],
            collect($d['topCategories'] ?? [])->map(fn ($c) => [$c->name, (int) $c->views])->all()
        );

        $sheets[] = new GenericSheet(
            'Sources de trafic',
            ['Source', 'Vues'],
            collect($d['trafficSources'] ?? [])->map(fn ($count, $source) => [ucfirst($source), (int) $count])->values()->all()
        );

        $sheets[] = $this->breakdownSheet('Appareils', $d['deviceStats'] ?? []);
        $sheets[] = $this->breakdownSheet('Navigateurs', $d['browserStats'] ?? []);
        $sheets[] = $this->breakdownSheet('Pays', $d['countryStats'] ?? []);

        $sheets[] = new GenericSheet(
            'Entonnoir de conversion',
            ['Etape', 'Total', 'Pourcentage (%)'],
            collect($d['funnel']['steps'] ?? [])->map(fn ($s) => [$s['name'], (int) $s['count'], $s['percentage']])->all()
        );

        $sheets[] = new GenericSheet(
            'Heatmap horaire',
            ['Jour (0=Lun)', 'Heure', 'Vues'],
            collect($d['heatmap'] ?? [])->map(fn ($h) => [(int) $h->weekday, (int) $h->hour, (int) $h->count])->all()
        );

        return $sheets;
    }

    private function overviewSheet(array $d): GenericSheet
    {
        $overview = $d['overview'] ?? [];
        $filters  = $d['filters'] ?? [];

        $labels = [
            'Periode'              => ($filters['date_from'] ?? '') . ' au ' . ($filters['date_to'] ?? ''),
            'Vues'                 => $overview['views'] ?? 0,
            'Visiteurs uniques'    => $overview['unique_visitors'] ?? 0,
            'Visiteurs recurrents' => $overview['returning_visitors'] ?? 0,
            'Clics'                => $overview['clicks'] ?? 0,
            'Contacts (leads)'     => $overview['leads'] ?? 0,
            'Reservations'         => $overview['bookings'] ?? 0,
            'Revenus (MAD)'        => $overview['revenue'] ?? '—',
            'Taux de rebond (%)'   => $overview['bounce_rate'] ?? 0,
            'CTR (%)'              => $overview['ctr'] ?? 0,
            'Taux de conversion (%)' => $overview['conversion_rate'] ?? 0,
        ];

        $rows = collect($labels)->map(fn ($value, $label) => [$label, $value])->values()->all();

        return new GenericSheet('Vue d\'ensemble', ['Indicateur', 'Valeur'], $rows);
    }

    private function timeSeriesSheet(string $title, iterable $series): GenericSheet
    {
        $rows = collect($series)->map(fn ($row) => [$row['date'], (int) $row['count']])->all();

        return new GenericSheet($title, ['Date', 'Total'], $rows);
    }

    private function topSchoolsSheet(string $title, iterable $schools): GenericSheet
    {
        $rows = collect($schools)->map(fn ($s) => [$s->name, $s->city, (int) $s->total])->all();

        return new GenericSheet($title, ['Ecole', 'Ville', 'Total'], $rows);
    }

    private function breakdownSheet(string $title, iterable $rows): GenericSheet
    {
        $data = collect($rows)->map(fn ($r) => [$r->name, (int) $r->count])->all();

        return new GenericSheet($title, ['Categorie', 'Total'], $data);
    }
}
