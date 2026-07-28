<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ComputerController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BuildingLandController;

use App\Http\Controllers\BuildingSewaController;
use App\Http\Controllers\BuildingRenovationController;
use App\Http\Controllers\SecurityFacilityController;
use App\Http\Controllers\SpkHistoryController;
use App\Http\Controllers\SoppHistoryController;

use Illuminate\Support\Facades\Route;

// Redirect guest to login, authenticated to index dashboard
Route::get('/', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

Route::get('/dashboard', function () {
    return redirect('/');
})->middleware(['auth']);

Route::middleware('auth')->group(function () {
    // Outlets (Master Instansi)
    Route::post('/outlets', [OutletController::class, 'store'])->name('outlets.store');
    Route::put('/outlets/{id}', [OutletController::class, 'update'])->name('outlets.update');
    Route::delete('/outlets/{id}', [OutletController::class, 'destroy'])->name('outlets.destroy');
    Route::post('/outlets/import', [OutletController::class, 'import'])->name('outlets.import');

    // Inventories (Master Barang)
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::put('/inventory/{id}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('/inventory/import', [InventoryController::class, 'import'])->name('inventory.import');

    // Computers (Data PC)
    Route::post('/computers', [ComputerController::class, 'store'])->name('computers.store');
    Route::put('/computers/{id}', [ComputerController::class, 'update'])->name('computers.update');
    Route::delete('/computers/{id}', [ComputerController::class, 'destroy'])->name('computers.destroy');
    Route::post('/computers/import', [ComputerController::class, 'import'])->name('computers.import');

    // Printers (Data Printer)
    Route::post('/printers', [PrinterController::class, 'store'])->name('printers.store');
    Route::put('/printers/{id}', [PrinterController::class, 'update'])->name('printers.update');
    Route::delete('/printers/{id}', [PrinterController::class, 'destroy'])->name('printers.destroy');
    Route::post('/printers/import', [PrinterController::class, 'import'])->name('printers.import');

    // Transactions (Surat Jalan)
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Users role (Kelola Akses)
    Route::put('/users/{id}/role', [UserController::class, 'updateRole'])->name('users.updateRole');

    // Lands (Daftar Tanah)
    Route::post('/building-lands', [BuildingLandController::class, 'store'])->name('building-lands.store');
    Route::put('/building-lands/{id}', [BuildingLandController::class, 'update'])->name('building-lands.update');
    Route::put('/building-lands/{id}/status', [BuildingLandController::class, 'updateStatus'])->name('building-lands.updateStatus');
    Route::delete('/building-lands/{id}', [BuildingLandController::class, 'destroy'])->name('building-lands.destroy');
    Route::post('/building-lands/import', [BuildingLandController::class, 'import'])->name('building-lands.import');

    // Sewas (Sewa)
    Route::post('/building-sewas', [BuildingSewaController::class, 'store'])->name('building-sewas.store');
    Route::put('/building-sewas/{id}', [BuildingSewaController::class, 'update'])->name('building-sewas.update');
    Route::put('/building-sewas/{id}/status', [BuildingSewaController::class, 'updateStatus'])->name('building-sewas.updateStatus');
    Route::delete('/building-sewas/{id}', [BuildingSewaController::class, 'destroy'])->name('building-sewas.destroy');
    Route::post('/building-sewas/import', [BuildingSewaController::class, 'import'])->name('building-sewas.import');

    // Renovations (Renovasi)
    Route::post('/building-renovations', [BuildingRenovationController::class, 'store'])->name('building-renovations.store');
    Route::put('/building-renovations/{id}', [BuildingRenovationController::class, 'update'])->name('building-renovations.update');
    Route::delete('/building-renovations/{id}', [BuildingRenovationController::class, 'destroy'])->name('building-renovations.destroy');
    Route::post('/building-renovations/import', [BuildingRenovationController::class, 'import'])->name('building-renovations.import');

    // Security Facilities (Sarana Pengamanan & Keamanan)
    Route::post('/security-facilities', [SecurityFacilityController::class, 'store'])->name('security-facilities.store');
    Route::put('/security-facilities/{id}', [SecurityFacilityController::class, 'update'])->name('security-facilities.update');
    Route::put('/security-facilities/{id}/status', [SecurityFacilityController::class, 'updateStatus'])->name('security-facilities.update-status');
    Route::delete('/security-facilities/{id}', [SecurityFacilityController::class, 'destroy'])->name('security-facilities.destroy');
    Route::post('/security-facilities/import', [SecurityFacilityController::class, 'import'])->name('security-facilities.import');

    // SPK Histories
    Route::get('/spk-histories', [SpkHistoryController::class, 'index'])->name('spk-histories.index');
    Route::get('/spk-histories/{id}', [SpkHistoryController::class, 'show'])->name('spk-histories.show');
    Route::post('/spk-histories', [SpkHistoryController::class, 'store'])->name('spk-histories.store');
    Route::delete('/spk-histories/{id}', [SpkHistoryController::class, 'destroy'])->name('spk-histories.destroy');

    // SOPP Histories
    Route::get('/sopp-histories', [SoppHistoryController::class, 'index'])->name('sopp-histories.index');
    Route::get('/sopp-histories/{id}', [SoppHistoryController::class, 'show'])->name('sopp-histories.show');
    Route::post('/sopp-histories', [SoppHistoryController::class, 'store'])->name('sopp-histories.store');
    Route::delete('/sopp-histories/{id}', [SoppHistoryController::class, 'destroy'])->name('sopp-histories.destroy');
});

require __DIR__.'/auth.php';
