<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Outlet;
use App\Models\Vendor;
use App\Models\Inventory;
use App\Models\Computer;
use App\Models\Printer;
use App\Models\Laptop;
use App\Models\Transaction;
use App\Models\ActivityLog;
use App\Models\BuildingLand;

use App\Models\BuildingSewa;
use App\Models\BuildingRenovation;
use App\Models\SecurityFacility;
use App\Models\SpkHistory;
use App\Models\SoppHistory;
use App\Models\Meubelair;
use App\Models\MasterMeubelair;
use App\Models\JenisMeubelair;
use App\Models\OutletArea;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $inventoryQuery = Inventory::orderBy('id', 'desc');
 
        $sewaOrderMap = \Illuminate\Support\Facades\DB::table('menu_sewa')
            ->orderBy('id', 'asc')
            ->get(['id', 'nama_outlet'])
            ->pluck('id', 'nama_outlet')
            ->mapWithKeys(function ($id, $name) {
                return [strtoupper(trim($name)) => $id];
            })
            ->toArray();

        // Position Area Header outlets directly above their respective starting CP unit
        $areaMap = [
            'AREA SENEN' => ($sewaOrderMap['CP PETAMBURAN'] ?? 7) - 0.5,
            'AREA KRAMAT JATI' => ($sewaOrderMap['CP JATINEGARA'] ?? 65) - 0.5,
            'AREA JATIWARINGIN' => ($sewaOrderMap['CP PONDOK MELATI'] ?? 146) - 0.5,
            'AREA BEKASI' => ($sewaOrderMap['CP BEKASI UTAMA'] ?? 206) - 0.5,
            'AREA BOGOR' => ($sewaOrderMap['CP BOGOR'] ?? 286) - 0.5,
        ];
        foreach ($areaMap as $areaName => $orderVal) {
            $sewaOrderMap[$areaName] = $orderVal;
        }

        $outlets = Outlet::all()->sort(function ($a, $b) use ($sewaOrderMap) {
            $nameA = strtoupper(trim($a->nama));
            $nameB = strtoupper(trim($b->nama));

            // 1. Gudang Terpadu di paling atas
            $isGudangA = (strpos($nameA, 'GUDANG TERPADU') === 0);
            $isGudangB = (strpos($nameB, 'GUDANG TERPADU') === 0);

            if ($isGudangA && !$isGudangB) return -1;
            if (!$isGudangA && $isGudangB) return 1;

            $areaA = $a->area ? strtoupper(trim($a->area)) : null;
            $areaB = $b->area ? strtoupper(trim($b->area)) : null;
            $cabangA = $a->cabang ? strtoupper(trim($a->cabang)) : null;
            $cabangB = $b->cabang ? strtoupper(trim($b->cabang)) : null;

            $orderA = isset($sewaOrderMap[$nameA]) 
                ? $sewaOrderMap[$nameA] 
                : ($cabangA && isset($sewaOrderMap[$cabangA]) 
                    ? $sewaOrderMap[$cabangA] + 0.01 + ($a->id * 0.0001)
                    : ($areaA && isset($sewaOrderMap[$areaA]) ? $sewaOrderMap[$areaA] + 0.1 : 999999));

            $orderB = isset($sewaOrderMap[$nameB]) 
                ? $sewaOrderMap[$nameB] 
                : ($cabangB && isset($sewaOrderMap[$cabangB]) 
                    ? $sewaOrderMap[$cabangB] + 0.01 + ($b->id * 0.0001)
                    : ($areaB && isset($sewaOrderMap[$areaB]) ? $sewaOrderMap[$areaB] + 0.1 : 999999));

            if ($orderA == $orderB) {
                return $a->id <=> $b->id;
            }
            return $orderA <=> $orderB;
        })->values();

        $adminEmails = User::where('role', 'admin')->pluck('email')->filter()->toArray();
        $adminEmails = array_values(array_unique(array_merge($adminEmails, ['admin@logistik.co.id', 'admin@system.com'])));
        $adminEmailsLower = array_map('strtolower', $adminEmails);

        return Inertia::render('App', [
            'inventory' => $inventoryQuery->with('histories')->withCount(['computers', 'printers', 'laptops'])->get(),
            'outlets' => $outlets,
            'vendors' => Vendor::orderBy('id', 'desc')->get(),
            'transactions' => Transaction::with('items')->orderBy('created_at', 'desc')->get(),
            'computers' => Computer::with(['histories', 'outlet_rel:id,nama,area,cabang'])->orderBy('updated_at', 'desc')->orderBy('id', 'desc')->get(),
            'printers' => Printer::with(['histories', 'outlet_rel:id,nama,area,cabang'])->orderBy('updated_at', 'desc')->orderBy('id', 'desc')->get(),
            'laptops' => Laptop::with('histories')->orderBy('updated_at', 'desc')->orderBy('id', 'desc')->get(),
            'currentUserRole' => $user->role,
            
            // Lazy Loaded Tabs: Hanya diambil saat tab dibuka, tidak diekspos di inspect element saat load awal
            'activityLogs' => Inertia::lazy(function () use ($user, $adminEmailsLower) {
                if ($user->role === 'guest') {
                    return [];
                }
                $activityLogsQuery = ActivityLog::orderBy('timestamp', 'desc');
                if ($user->role !== 'admin') {
                    // Role Protection: Staf biasa hanya bisa melihat riwayat aktivitas akunnya sendiri
                    $activityLogsQuery->where('user_email', $user->email);
                }
                return $activityLogsQuery->get()->map(function ($log) use ($adminEmailsLower) {
                    $log->is_admin = in_array(strtolower($log->user_email ?? ''), $adminEmailsLower);
                    return $log;
                });
            }),
            'usersList' => Inertia::lazy(function () use ($user) {
                return $user->role === 'admin'
                    ? User::select(['id', 'name', 'email', 'role', 'created_at'])->orderBy('id', 'desc')->get()
                    : [];
            }),
            'spkHistory' => Inertia::lazy(fn() => SpkHistory::orderBy('created_at', 'desc')->get()),
            'soppHistory' => Inertia::lazy(fn() => SoppHistory::orderBy('created_at', 'desc')->get()),

            'buildingLands' => BuildingLand::with('histories')->orderBy('id', 'desc')->get(),
            'buildingSewas' => BuildingSewa::with('histories')->orderBy('id', 'desc')->get(),
            'buildingRenovations' => BuildingRenovation::orderBy('id', 'desc')->get(),
            'securityFacilities' => SecurityFacility::orderByRaw('CAST(no_urut AS UNSIGNED) ASC')->get(),
            
            'meubelairs' => Meubelair::with('outlet_rel:id,nama,area,cabang')->orderBy('id', 'desc')->get(),
            'masterMeubelairs' => MasterMeubelair::orderBy('id', 'desc')->get(),
            'jenisMeubelairs' => JenisMeubelair::orderBy('nama', 'asc')->get(),
            'outletAreas' => OutletArea::with('cabangs')->orderBy('nama', 'asc')->get(),
        ]);
    }
}
