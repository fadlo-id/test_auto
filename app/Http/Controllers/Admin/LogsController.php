<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class LogsController extends Controller
{
    private const MAX_LINES  = 200;
    private const READ_CHUNK = 65536; // 64 KB per seek — never loads full file

    public function index(Request $request): Response
    {
        $logPath = storage_path('logs/laravel.log');
        $search  = $request->input('search', '');
        $level   = $request->input('level', 'all');
        $lines   = [];

        if (File::exists($logPath)) {
            $lines = $this->tailFilter($logPath, $search, $level);
        }

        return Inertia::render('Admin/Logs', [
            'logs'    => $lines,
            'filters' => ['search' => $search, 'level' => $level],
        ]);
    }

    public function clear(): RedirectResponse
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }
        return back()->with('success', 'Logs effacés.');
    }

    private function tailFilter(string $path, string $search, string $level): array
    {
        $fh   = @fopen($path, 'rb');
        $size = @filesize($path);

        if (! $fh || ! $size) {
            return [];
        }

        $buffer   = '';
        $offset   = $size;
        $rawLines = [];

        // Walk backwards in fixed-size chunks; stop once we have enough candidates.
        while ($offset > 0 && count($rawLines) < self::MAX_LINES * 4) {
            $chunkSize = min(self::READ_CHUNK, $offset);
            $offset   -= $chunkSize;
            fseek($fh, $offset);
            $buffer   = fread($fh, $chunkSize) . $buffer;
            $rawLines = explode("\n", $buffer);
        }

        fclose($fh);

        // First element may be a partial line (if we didn't reach file start).
        if ($offset > 0) {
            array_shift($rawLines);
        }

        $rawLines = array_reverse($rawLines);
        $result   = [];

        foreach ($rawLines as $line) {
            $line = rtrim($line);
            if (strlen($line) < 10) {
                continue;
            }

            $detected = 'info';
            foreach (['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'] as $l) {
                if (str_contains($line, $l)) {
                    $detected = 'error';
                    break;
                }
            }
            if ($detected === 'info' && str_contains($line, 'WARNING')) {
                $detected = 'warning';
            }

            if ($level !== 'all' && $detected !== $level) {
                continue;
            }
            if ($search !== '' && ! str_contains(strtolower($line), strtolower($search))) {
                continue;
            }

            $result[] = ['text' => mb_substr($line, 0, 500), 'level' => $detected];

            if (count($result) >= self::MAX_LINES) {
                break;
            }
        }

        return $result;
    }
}
