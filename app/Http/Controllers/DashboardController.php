<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Outlet;
use App\Models\Inventory;
use App\Models\Computer;
use App\Models\Printer;
use App\Models\Transaction;
use App\Models\ActivityLog;
use App\Models\BuildingLand;

use App\Models\BuildingSewa;
use App\Models\BuildingRenovation;
use App\Models\SecurityFacility;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('App', [
            'inventory' => Inventory::all(),
            'outlets' => Outlet::orderBy('nama')->get(),
            'transactions' => Transaction::with('items')->orderBy('created_at', 'desc')->get(),
            'computers' => Computer::all(),
            'printers' => Printer::all(),
            'usersList' => $user->role === 'admin' ? User::all() : [],
            'activityLogs' => ActivityLog::orderBy('timestamp', 'desc')->get(),
            'currentUserRole' => $user->role,
            'buildingLands' => BuildingLand::orderBy('id', 'desc')->get(),

            'buildingSewas' => BuildingSewa::orderBy('id', 'desc')->get(),
            'buildingRenovations' => BuildingRenovation::orderBy('id', 'asc')->get(),
            'securityFacilities' => SecurityFacility::all(),

        ]);
    }
}
