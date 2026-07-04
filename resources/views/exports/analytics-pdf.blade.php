<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Rapport Analytics</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 18px; color: #ea580c; margin-bottom: 2px; }
        h2 { font-size: 13px; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
        p.subtitle { color: #6b7280; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #f3f4f6; }
        th { background-color: #f9fafb; font-weight: bold; }
        .kpi-grid { width: 100%; }
        .kpi-grid td { width: 25%; padding: 6px; }
        .kpi-box { border: 1px solid #e5e7eb; border-radius: 4px; padding: 6px 8px; }
        .kpi-label { font-size: 9px; text-transform: uppercase; color: #6b7280; }
        .kpi-value { font-size: 15px; font-weight: bold; color: #111827; }
        .two-col td { width: 50%; vertical-align: top; padding-right: 10px; }
    </style>
</head>
<body>
    <h1>Rapport Analytics — AutoEcoles Maroc</h1>
    <p class="subtitle">
        Periode du {{ $data['filters']['date_from'] }} au {{ $data['filters']['date_to'] }}
        @if($data['filters']['school_id'] ?? null) — Auto-ecole #{{ $data['filters']['school_id'] }} @endif
        — genere le {{ now()->format('d/m/Y H:i') }}
    </p>

    <h2>Vue d'ensemble</h2>
    <table class="kpi-grid">
        <tr>
            <td><div class="kpi-box"><div class="kpi-label">Vues</div><div class="kpi-value">{{ number_format($data['overview']['views'] ?? 0) }}</div></div></td>
            <td><div class="kpi-box"><div class="kpi-label">Visiteurs uniques</div><div class="kpi-value">{{ number_format($data['overview']['unique_visitors'] ?? 0) }}</div></div></td>
            <td><div class="kpi-box"><div class="kpi-label">Visiteurs recurrents</div><div class="kpi-value">{{ number_format($data['overview']['returning_visitors'] ?? 0) }}</div></div></td>
            <td><div class="kpi-box"><div class="kpi-label">Clics</div><div class="kpi-value">{{ number_format($data['overview']['clicks'] ?? 0) }}</div></div></td>
        </tr>
        <tr>
            <td><div class="kpi-box"><div class="kpi-label">Contacts</div><div class="kpi-value">{{ number_format($data['overview']['leads'] ?? 0) }}</div></div></td>
            <td><div class="kpi-box"><div class="kpi-label">Reservations</div><div class="kpi-value">{{ number_format($data['overview']['bookings'] ?? 0) }}</div></div></td>
            <td><div class="kpi-box"><div class="kpi-label">Taux de rebond</div><div class="kpi-value">{{ $data['overview']['bounce_rate'] ?? 0 }}%</div></div></td>
            <td><div class="kpi-box"><div class="kpi-label">CTR</div><div class="kpi-value">{{ $data['overview']['ctr'] ?? 0 }}%</div></div></td>
        </tr>
        <tr>
            <td><div class="kpi-box"><div class="kpi-label">Taux de conversion</div><div class="kpi-value">{{ $data['overview']['conversion_rate'] ?? 0 }}%</div></div></td>
            @if(($data['overview']['revenue'] ?? null) !== null)
                <td><div class="kpi-box"><div class="kpi-label">Revenus</div><div class="kpi-value">{{ number_format($data['overview']['revenue'], 0) }} MAD</div></div></td>
            @endif
        </tr>
    </table>

    @if(count($data['mostViewed']) > 0)
    <table class="two-col">
        <tr>
            <td>
                <h2>Ecoles les plus vues</h2>
                <table>
                    <tr><th>Ecole</th><th>Ville</th><th>Vues</th></tr>
                    @foreach($data['mostViewed'] as $s)
                        <tr><td>{{ $s->name }}</td><td>{{ $s->city }}</td><td>{{ number_format($s->total) }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td>
                <h2>Ecoles les plus cliquees</h2>
                <table>
                    <tr><th>Ecole</th><th>Ville</th><th>Clics</th></tr>
                    @foreach($data['mostClicked'] as $s)
                        <tr><td>{{ $s->name }}</td><td>{{ $s->city }}</td><td>{{ number_format($s->total) }}</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>

    <table class="two-col">
        <tr>
            <td>
                <h2>Ecoles les plus contactees</h2>
                <table>
                    <tr><th>Ecole</th><th>Ville</th><th>Contacts</th></tr>
                    @foreach($data['mostContacted'] as $s)
                        <tr><td>{{ $s->name }}</td><td>{{ $s->city }}</td><td>{{ number_format($s->total) }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td>
                <h2>Revenus par ecole</h2>
                <table>
                    <tr><th>Ecole</th><th>Ville</th><th>Revenus</th></tr>
                    @foreach($data['revenuePerSchool'] as $s)
                        <tr><td>{{ $s->name }}</td><td>{{ $s->city }}</td><td>{{ number_format($s->revenue) }} MAD</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>
    @endif

    <table class="two-col">
        <tr>
            <td>
                <h2>Top villes</h2>
                <table>
                    <tr><th>Ville</th><th>Vues</th></tr>
                    @foreach($data['topCities'] as $c)
                        <tr><td>{{ $c->city }}</td><td>{{ number_format($c->views) }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td>
                <h2>Top categories</h2>
                <table>
                    <tr><th>Categorie</th><th>Vues</th></tr>
                    @foreach($data['topCategories'] as $c)
                        <tr><td>{{ $c->name }}</td><td>{{ number_format($c->views) }}</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>

    <table class="two-col">
        <tr>
            <td>
                <h2>Appareils</h2>
                <table>
                    <tr><th>Type</th><th>Total</th></tr>
                    @foreach($data['deviceStats'] as $d)
                        <tr><td>{{ $d->name }}</td><td>{{ number_format($d->count) }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td>
                <h2>Navigateurs</h2>
                <table>
                    <tr><th>Navigateur</th><th>Total</th></tr>
                    @foreach($data['browserStats'] as $b)
                        <tr><td>{{ $b->name }}</td><td>{{ number_format($b->count) }}</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>

    <table class="two-col">
        <tr>
            <td>
                <h2>Pays</h2>
                <table>
                    <tr><th>Pays</th><th>Total</th></tr>
                    @foreach($data['countryStats'] as $c)
                        <tr><td>{{ $c->name }}</td><td>{{ number_format($c->count) }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td>
                <h2>Sources de trafic</h2>
                <table>
                    <tr><th>Source</th><th>Vues</th></tr>
                    @foreach($data['trafficSources'] as $source => $count)
                        <tr><td>{{ ucfirst($source) }}</td><td>{{ number_format($count) }}</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>

    <h2>Entonnoir de conversion</h2>
    <table>
        <tr><th>Etape</th><th>Total</th><th>%</th></tr>
        @foreach($data['funnel']['steps'] as $step)
            <tr><td>{{ $step['name'] }}</td><td>{{ number_format($step['count']) }}</td><td>{{ $step['percentage'] }}%</td></tr>
        @endforeach
    </table>

    @php
        $heatmapGrid = [];
        foreach ($data['heatmap'] as $h) {
            $heatmapGrid[$h->weekday][$h->hour] = $h->count;
        }
        $weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    @endphp
    @if(count($data['heatmap']) > 0)
    <h2>Repartition horaire des visites (jour x heure)</h2>
    <table style="font-size: 8px;">
        <tr>
            <th></th>
            @for($h = 0; $h < 24; $h++)
                <th style="text-align:center;">{{ $h }}</th>
            @endfor
        </tr>
        @for($w = 0; $w < 7; $w++)
            <tr>
                <td><strong>{{ $weekdayLabels[$w] }}</strong></td>
                @for($h = 0; $h < 24; $h++)
                    <td style="text-align:center;">{{ $heatmapGrid[$w][$h] ?? 0 }}</td>
                @endfor
            </tr>
        @endfor
    </table>
    @endif
</body>
</html>
