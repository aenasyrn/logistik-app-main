<?php

namespace App\Http\Controllers;

use App\Models\LetterNumberSetting;
use App\Models\Transaction;
use App\Models\SpkHistory;
use App\Models\SoppHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LetterNumberController extends Controller
{
    /**
     * Get setting for a specific letter type.
     */
    public function getSettings(Request $request)
    {
        $request->validate([
            'letter_type' => 'required|string|in:serah_terima_keluar,serah_terima_masuk,spk,sopp',
            'tanggal' => 'nullable|date',
        ]);

        $type = $request->input('letter_type');
        $setting = $this->getOrCreateSetting($type);
        $nextInfo = $this->calculateNextNumber($type, $setting, $request->input('tanggal') ?? date('Y-m-d'));

        $currentNumberToDisplay = $nextInfo['current_number'] ?? $setting->current_number;
        $nextNumberToDisplay = $nextInfo['next_number'] ?? $nextInfo['number'] ?? null;

        return response()->json([
            'success' => true,
            'setting' => $setting,
            'current_number' => $currentNumberToDisplay,
            'next_number' => $nextNumberToDisplay,
            'next_info' => $nextInfo,
        ]);
    }

    /**
     * Update setting (Admin only).
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Admin yang dapat mengubah pengaturan nomor surat.'
            ], 403);
        }

        $validated = $request->validate([
            'letter_type' => 'required|string|in:serah_terima_keluar,serah_terima_masuk,spk,sopp',
            'mode' => 'required|string|in:otomatis,reset_manual,manual',
            'manual_start_number' => 'nullable|integer|min:1',
            'current_number' => 'nullable|integer|min:0',
        ]);

        $setting = $this->getOrCreateSetting($validated['letter_type']);
        $setting->mode = $validated['mode'];

        if ($request->has('current_number') && $request->input('current_number') !== null && $request->input('current_number') !== '') {
            $curNum = (int) $request->input('current_number');
            $setting->current_number = $curNum;
            if ($curNum > 0) {
                $setting->manual_start_number = $curNum;
            }
            $setting->reset_at = now();
        } elseif ($validated['mode'] === 'manual') {
            $startNum = (int) ($validated['manual_start_number'] ?? 1);
            $setting->manual_start_number = $startNum;
            $setting->current_number = max(0, $startNum - 1);
            $setting->reset_at = now();
        } elseif ($validated['mode'] === 'reset_manual') {
            if (!$setting->reset_at || $setting->mode !== 'reset_manual') {
                $setting->current_number = 0;
                $setting->manual_start_number = 1;
                $setting->reset_at = now();
            }
        } elseif ($validated['mode'] === 'otomatis') {
            // Mode otomatis membersihkan reset_at dan melanjutkan transaksi riil sistem
            $setting->reset_at = null;
            if ($validated['letter_type'] === 'serah_terima_keluar' || $validated['letter_type'] === 'serah_terima_masuk') {
                $jenisTrx = ($validated['letter_type'] === 'serah_terima_keluar') ? 'Barang Keluar' : 'Barang Masuk';
                $latestTrx = Transaction::where('jenis_transaksi', $jenisTrx)
                    ->whereNotNull('nomor_surat')
                    ->orderBy('tanggal', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();
                if ($latestTrx && preg_match('/^(\d+)/', (string)$latestTrx->nomor_surat, $m)) {
                    $setting->current_number = (int) $m[1];
                }
            }
        }

        $setting->save();

        $nextInfo = $this->calculateNextNumber($validated['letter_type'], $setting, date('Y-m-d'));
        $currentNumberToDisplay = $nextInfo['current_number'] ?? $setting->current_number;
        $nextNumberToDisplay = $nextInfo['next_number'] ?? $nextInfo['number'] ?? null;

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan nomor surat berhasil disimpan.',
            'setting' => $setting,
            'current_number' => $currentNumberToDisplay,
            'next_number' => $nextNumberToDisplay,
            'next_info' => $nextInfo,
        ]);
    }

    /**
     * Reset sequence to 1 (Admin only, Reset Manual mode).
     */
    public function resetSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Admin yang dapat mereset nomor surat.'
            ], 403);
        }

        $request->validate([
            'letter_type' => 'required|string|in:serah_terima_keluar,serah_terima_masuk,spk,sopp',
        ]);

        $type = $request->input('letter_type');
        $setting = $this->getOrCreateSetting($type);
        $setting->mode = 'reset_manual';
        $setting->current_number = 0;
        $setting->manual_start_number = 1;
        $setting->last_reset_year = (int) date('Y');
        $setting->reset_at = now();
        $setting->save();

        $nextInfo = $this->calculateNextNumber($type, $setting, date('Y-m-d'));
        $currentNumberToDisplay = $nextInfo['current_number'] ?? $setting->current_number;
        $nextNumberToDisplay = $nextInfo['next_number'] ?? $nextInfo['number'] ?? 1;

        return response()->json([
            'success' => true,
            'message' => 'Nomor surat berhasil direset kembali ke 1.',
            'setting' => $setting,
            'current_number' => $currentNumberToDisplay,
            'next_number' => $nextNumberToDisplay,
            'next_info' => $nextInfo,
        ]);
    }

    /**
     * Get next number for letter creation.
     */
    public function getNext(Request $request)
    {
        $request->validate([
            'letter_type' => 'required|string|in:serah_terima_keluar,serah_terima_masuk,spk,sopp',
            'tanggal' => 'nullable|date',
        ]);

        $type = $request->input('letter_type');
        $setting = $this->getOrCreateSetting($type);
        $tanggal = $request->input('tanggal') ?? date('Y-m-d');

        $nextInfo = $this->calculateNextNumber($type, $setting, $tanggal);

        return response()->json($nextInfo);
    }

    /**
     * Find or initialize setting record.
     */
    private function getOrCreateSetting(string $type): LetterNumberSetting
    {
        return LetterNumberSetting::firstOrCreate(
            ['letter_type' => $type],
            [
                'mode' => 'otomatis',
                'current_number' => 0,
                'manual_start_number' => 1,
                'last_reset_year' => (int) date('Y'),
            ]
        );
    }

    /**
     * Calculate next number based on rules.
     */
    private function calculateNextNumber(string $type, LetterNumberSetting $setting, string $tanggal): array
    {
        $year = (int) date('Y', strtotime($tanggal));
        $currentYear = (int) date('Y');

        // Otomatis mode resets at the beginning of each year
        if ($setting->mode === 'otomatis' && $setting->last_reset_year && $setting->last_reset_year !== $currentYear) {
            $setting->current_number = 0;
            $setting->last_reset_year = $currentYear;
            $setting->save();
        }

        // Pengecekan Hari Kerja (Senin - Jumat) untuk semua jenis surat
        $dayOfWeek = (int) date('N', strtotime($tanggal)); // 1 (Mon) to 7 (Sun)
        if ($dayOfWeek === 6 || $dayOfWeek === 7) {
            $hari = ($dayOfWeek === 6) ? 'Sabtu' : 'Minggu';
            return [
                'success' => false,
                'is_weekend' => true,
                'message' => "Hari {$hari} tidak dapat digunakan untuk pembuatan surat (hanya Senin s.d. Jumat).",
                'current_number' => null,
                'next_number' => null,
                'number' => null,
                'mode' => $setting->mode,
            ];
        }

        // 1. SERAH TERIMA BARANG (Keluar & Masuk independen, sistem 20 slot per hari)
        if ($type === 'serah_terima_keluar' || $type === 'serah_terima_masuk') {
            return $this->calculateSerahTerimaSlotNumber($type, $setting, $tanggal);
        }

        // 2. SPK & SOPP (Sekuensial berurutan)
        $currentNum = (int) ($setting->current_number ?? 0);
        $next = $currentNum + 1;

        return [
            'success' => true,
            'current_number' => $currentNum,
            'next_number' => $next,
            'number' => $next,
            'formatted_current_number' => str_pad($currentNum, 3, '0', STR_PAD_LEFT),
            'formatted_next_number' => str_pad($next, 3, '0', STR_PAD_LEFT),
            'formatted_number' => str_pad($next, 3, '0', STR_PAD_LEFT),
            'mode' => $setting->mode,
        ];
    }

    /**
     * Calculate 20-slot letter number per day for Serah Terima (Keluar or Masuk).
     */
    private function calculateSerahTerimaSlotNumber(string $letterType, LetterNumberSetting $setting, string $tanggal): array
    {
        $slotSize = 20;
        $jenisTransaksi = ($letterType === 'serah_terima_keluar') ? 'Barang Keluar' : 'Barang Masuk';

        // Pengecekan Hari Kerja (Senin - Jumat)
        $dayOfWeek = (int) date('N', strtotime($tanggal)); // 1 (Mon) to 7 (Sun)
        if ($dayOfWeek === 6 || $dayOfWeek === 7) {
            $hari = ($dayOfWeek === 6) ? 'Sabtu' : 'Minggu';
            return [
                'success' => false,
                'is_weekend' => true,
                'message' => "Hari {$hari} tidak dapat digunakan untuk pembuatan surat (hanya Senin s.d. Jumat).",
                'current_number' => null,
                'next_number' => null,
                'number' => null,
                'formatted_number' => null,
                'mode' => $setting->mode,
            ];
        }

        // Ambil semua transaksi: jika ada reset_at, hanya ambil transaksi yang dibuat setelah reset
        $trxQuery = Transaction::where('jenis_transaksi', $jenisTransaksi)
            ->whereNotNull('nomor_surat')
            ->whereNotNull('tanggal');

        // Ambil semua transaksi: jika mode bukan otomatis dan ada reset_at, hanya ambil transaksi yang dibuat setelah reset
        if ($setting->mode !== 'otomatis' && $setting->reset_at) {
            $trxQuery->where('created_at', '>=', $setting->reset_at);
        }

        $transactions = $trxQuery->orderBy('tanggal', 'asc')
            ->orderBy('id', 'asc')
            ->get(['id', 'nomor_surat', 'tanggal']);

        $dateNumbers = [];
        foreach ($transactions as $trx) {
            if (preg_match('/^(\d+)/', (string)$trx->nomor_surat, $m)) {
                $num = (int)$m[1];
                $d = date('Y-m-d', strtotime($trx->tanggal));
                $dateNumbers[$d][] = $num;
            }
        }

        $allDates = array_keys($dateNumbers);
        sort($allDates);

        $targetDate = date('Y-m-d', strtotime($tanggal));
        $today = date('Y-m-d');

        // Tentukan baseline nomor awal dari setting
        if ($setting->mode === 'reset_manual') {
            $baseNumber = 1;
        } elseif ($setting->mode === 'manual' && $setting->manual_start_number) {
            $baseNumber = (int) $setting->manual_start_number;
        } else {
            $baseNumber = ($setting->current_number > 0) ? $setting->current_number : 3721;
        }

        // Tentukan titik acuan (anchor date & anchor block)
        if (!empty($allDates)) {
            $latestTrxDate = max($allDates);
            $latestNums = $dateNumbers[$latestTrxDate];
            $latestMax = max($latestNums);
            $anchorDate = $latestTrxDate;
            $anchorBlockStart = (int)((floor(($latestMax - 1) / $slotSize) * $slotSize) + 1);
        } else {
            // Belum ada transaksi (atau baru saja direset)
            $anchorDate = $setting->reset_at ? date('Y-m-d', strtotime($setting->reset_at)) : $today;
            if ($setting->mode === 'manual' || $setting->mode === 'reset_manual') {
                $anchorBlockStart = $baseNumber;
            } else {
                $anchorBlockStart = (int)((floor(($baseNumber - 1) / $slotSize) * $slotSize) + 1);
            }
        }

        // Kasus 1: Tanggal yang dipilih SUDAH memiliki transaksi
        if (isset($dateNumbers[$targetDate]) && !empty($dateNumbers[$targetDate])) {
            $numsOnDate = $dateNumbers[$targetDate];
            $maxNum = max($numsOnDate);
            $blockStart = (int)((floor(($maxNum - 1) / $slotSize) * $slotSize) + 1);
            $blockEnd = $blockStart + $slotSize - 1;

            $usedInBlock = array_values(array_filter($numsOnDate, fn($n) => $n >= $blockStart && $n <= $blockEnd));

            $assignedNumber = null;
            for ($n = $blockStart; $n <= $blockEnd; $n++) {
                if (!in_array($n, $usedInBlock)) {
                    $assignedNumber = $n;
                    break;
                }
            }

            if ($assignedNumber === null) {
                $formattedDate = date('d/m/Y', strtotime($targetDate));
                return [
                    'success' => false,
                    'message' => "Slot nomor surat untuk tanggal {$formattedDate} sudah penuh (maksimal {$slotSize} surat per hari).",
                    'current_number' => max($usedInBlock),
                    'next_number' => null,
                    'number' => null,
                    'formatted_number' => null,
                    'mode' => $setting->mode,
                    'slots_used' => count($usedInBlock),
                    'slots_total' => $slotSize,
                    'slots_remaining' => 0,
                    'slot_range' => "{$blockStart} - {$blockEnd}",
                ];
            }

            $lastUsedOnDate = !empty($usedInBlock) ? max($usedInBlock) : 0;

            return [
                'success' => true,
                'current_number' => $lastUsedOnDate,
                'next_number' => $assignedNumber,
                'number' => $assignedNumber,
                'formatted_current_number' => str_pad($lastUsedOnDate, 3, '0', STR_PAD_LEFT),
                'formatted_next_number' => str_pad($assignedNumber, 3, '0', STR_PAD_LEFT),
                'formatted_number' => str_pad($assignedNumber, 3, '0', STR_PAD_LEFT),
                'mode' => $setting->mode,
                'slots_used' => count($usedInBlock),
                'slots_total' => $slotSize,
                'slots_remaining' => $slotSize - count($usedInBlock),
                'slot_range' => "{$blockStart} - {$blockEnd}",
            ];
        }

        // Kasus 2: Tanggal yang dipilih BELUM memiliki transaksi
        // Hitung selisih hari kerja (Senin - Jumat saja, Sabtu dan Minggu tidak dihitung)
        $workingDaysDiff = $this->countWorkingDaysDiff($anchorDate, $targetDate);
        $blockStart = $anchorBlockStart + ($workingDaysDiff * $slotSize);
        if ($blockStart < 1) {
            $blockStart = 1;
        }
        $blockEnd = $blockStart + $slotSize - 1;

        $assignedNumber = $blockStart;
        if (!empty($allDates)) {
            $currentUsed = $latestMax;
        } elseif ($setting->mode === 'manual' && $setting->manual_start_number) {
            $currentUsed = max(0, ((int)$setting->manual_start_number) - 1);
        } elseif ($setting->current_number > 0) {
            $currentUsed = (int) $setting->current_number;
        } else {
            $currentUsed = 0;
        }

        return [
            'success' => true,
            'current_number' => $currentUsed,
            'next_number' => $assignedNumber,
            'number' => $assignedNumber,
            'formatted_current_number' => str_pad($currentUsed, 3, '0', STR_PAD_LEFT),
            'formatted_next_number' => str_pad($assignedNumber, 3, '0', STR_PAD_LEFT),
            'formatted_number' => str_pad($assignedNumber, 3, '0', STR_PAD_LEFT),
            'mode' => $setting->mode,
            'slots_used' => 0,
            'slots_total' => $slotSize,
            'slots_remaining' => $slotSize,
            'slot_range' => "{$blockStart} - {$blockEnd}",
        ];
    }

    /**
     * Calculate difference in working days (Senin - Jumat only, ignoring Saturday and Sunday).
     */
    private function countWorkingDaysDiff(string $from, string $to): int
    {
        $fromTime = strtotime($from);
        $toTime = strtotime($to);

        if ($fromTime === $toTime) {
            return 0;
        }

        $direction = ($toTime > $fromTime) ? 1 : -1;
        $current = $fromTime;
        $workingDays = 0;

        while ($current !== $toTime) {
            $current = strtotime(($direction > 0 ? '+1 day' : '-1 day'), $current);
            $dayOfWeek = (int) date('N', $current);
            if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                $workingDays += $direction;
            }
        }

        return $workingDays;
    }
}
