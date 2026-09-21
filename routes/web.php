<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ComputerController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\LaptopController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BuildingLandController;
use App\Http\Controllers\VendorController;

use App\Http\Controllers\BuildingSewaController;
use App\Http\Controllers\BuildingRenovationController;
use App\Http\Controllers\SecurityFacilityController;
use App\Http\Controllers\SpkHistoryController;
use App\Http\Controllers\SoppHistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MeubelairController;
use App\Http\Controllers\MasterMeubelairController;
use App\Http\Controllers\JenisMeubelairController;
use App\Http\Controllers\OutletAreaController;
use App\Http\Controllers\OutletCabangController;
use App\Http\Controllers\LetterNumberController;

use Illuminate\Support\Facades\Route;

// Redirect guest to login, authenticated to index dashboard
Route::get('/', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

Route::get('/dashboard', function () {
    return redirect('/');
})->middleware(['auth']);

Route::middleware('auth')->group(function () {
    // Web Page View Routes (Tab Route Slugs)
    Route::get('/dashboard-inventaris', [DashboardController::class, 'index']);
    Route::get('/dashboard-bangunan', [DashboardController::class, 'index']);
    Route::get('/dashboard-pengamanan', [DashboardController::class, 'index']);
    Route::get('/pusat-data-barang', [DashboardController::class, 'index']);
    Route::get('/inventaris-mebelair', [DashboardController::class, 'index']);
    Route::get('/riwayat-surat', [DashboardController::class, 'index'])->name('riwayat-surat');
    Route::get('/riwayat', [DashboardController::class, 'index']);
    Route::get('/master-barang', [DashboardController::class, 'index']);
    Route::get('/master-outlet', [DashboardController::class, 'index']);
    Route::get('/master-vendor', [DashboardController::class, 'index']);
    Route::get('/surat-jalan', [DashboardController::class, 'index']);
    Route::get('/preview-surat', [DashboardController::class, 'index']);
    Route::get('/data-printer', [DashboardController::class, 'index']);
    Route::get('/data-pc', [DashboardController::class, 'index']);
    Route::get('/data-laptop', [DashboardController::class, 'index']);
    Route::get('/manajemen-akses', [DashboardController::class, 'index']);
    Route::get('/log-aktivitas', [DashboardController::class, 'index']);
    Route::get('/daftar-tanah', [DashboardController::class, 'index']);
    Route::get('/sewa-bangunan', [DashboardController::class, 'index']);
    Route::get('/renovasi-gedung', [DashboardController::class, 'index']);
    Route::get('/sarana-keamanan', [DashboardController::class, 'index']);
    Route::get('/spk-renovasi', [DashboardController::class, 'index']);
    Route::get('/spk-elektronik', [DashboardController::class, 'index']);
    Route::get('/spk-kendaraan', [DashboardController::class, 'index']);
    Route::get('/sopp-pengadaan', [DashboardController::class, 'index']);
    Route::get('/sopp-sewa', [DashboardController::class, 'index']);
    Route::get('/sopp-renovasi', [DashboardController::class, 'index']);
    Route::get('/notifikasi', [DashboardController::class, 'index']);
    Route::get('/meubelair', [DashboardController::class, 'index']);
    Route::get('/inventaris-mebelair', [DashboardController::class, 'index']);
    Route::get('/mebelair-meja', [DashboardController::class, 'index']);
    Route::get('/mebelair-kursi', [DashboardController::class, 'index']);
    Route::get('/mebelair-lemari', [DashboardController::class, 'index']);
    Route::get('/mebelair-sofa', [DashboardController::class, 'index']);
    Route::get('/mebelair-ac', [DashboardController::class, 'index']);
    Route::get('/master-barang-meubelair', [DashboardController::class, 'index']);
    Route::get('/master-barang-non-meubelair', [DashboardController::class, 'index']);

    // Read & Shared API Routes
    Route::get('/spk-histories', [SpkHistoryController::class, 'index'])->name('spk-histories.index');
    Route::get('/spk-histories/{id}', [SpkHistoryController::class, 'show'])->name('spk-histories.show');
    Route::get('/sopp-histories', [SoppHistoryController::class, 'index'])->name('sopp-histories.index');
    Route::get('/sopp-histories/{id}', [SoppHistoryController::class, 'show'])->name('sopp-histories.show');
    Route::get('/api/letter-numbers/settings', [LetterNumberController::class, 'getSettings'])->name('letter-numbers.settings');
    Route::get('/api/letter-numbers/next', [LetterNumberController::class, 'getNext'])->name('letter-numbers.next');
    Route::get('/jenis-meubelairs', [JenisMeubelairController::class, 'index'])->name('jenis-meubelairs.index');
    Route::get('/outlet-areas', [OutletAreaController::class, 'index'])->name('outlet-areas.index');
    Route::get('/outlet-cabangs', [OutletCabangController::class, 'index'])->name('outlet-cabangs.index');

    // Admin & Logistik Officer: Add Data & Create Letters (No Edit/Delete for Logistik Officer)
    Route::middleware('role:admin,logistic_officer')->group(function () {
        // Surat / Transactions
        Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
        Route::post('/spk-histories', [SpkHistoryController::class, 'store'])->name('spk-histories.store');
        Route::post('/sopp-histories', [SoppHistoryController::class, 'store'])->name('sopp-histories.store');

        // Inventaris & IT (Store & Import)
        Route::post('/computers', [ComputerController::class, 'store'])->name('computers.store');
        Route::post('/computers/import', [ComputerController::class, 'import'])->name('computers.import');
        Route::post('/printers', [PrinterController::class, 'store'])->name('printers.store');
        Route::post('/printers/import', [PrinterController::class, 'import'])->name('printers.import');
        Route::post('/laptops', [LaptopController::class, 'store'])->name('laptops.store');
        Route::post('/laptops/import', [LaptopController::class, 'import'])->name('laptops.import');

        // Bangunan & Keamanan (Store & Import)
        Route::post('/building-lands', [BuildingLandController::class, 'store'])->name('building-lands.store');
        Route::post('/building-lands/import', [BuildingLandController::class, 'import'])->name('building-lands.import');
        Route::post('/building-sewas', [BuildingSewaController::class, 'store'])->name('building-sewas.store');
        Route::post('/building-sewas/import', [BuildingSewaController::class, 'import'])->name('building-sewas.import');
        Route::post('/building-renovations', [BuildingRenovationController::class, 'store'])->name('building-renovations.store');
        Route::post('/building-renovations/import', [BuildingRenovationController::class, 'import'])->name('building-renovations.import');
        Route::post('/security-facilities', [SecurityFacilityController::class, 'store'])->name('security-facilities.store');
        Route::post('/security-facilities/import', [SecurityFacilityController::class, 'import'])->name('security-facilities.import');

        // Meubelair & Master (Store & Import)
        Route::post('/meubelairs', [MeubelairController::class, 'store'])->name('meubelairs.store');
        Route::post('/meubelairs/import', [MeubelairController::class, 'import'])->name('meubelairs.import');
        Route::post('/master-meubelairs', [MasterMeubelairController::class, 'store'])->name('master-meubelairs.store');
        Route::post('/master-meubelairs/import', [MasterMeubelairController::class, 'import'])->name('master-meubelairs.import');
        Route::post('/jenis-meubelairs', [JenisMeubelairController::class, 'store'])->name('jenis-meubelairs.store');
        Route::post('/outlet-areas', [OutletAreaController::class, 'store'])->name('outlet-areas.store');
        Route::post('/outlet-cabangs', [OutletCabangController::class, 'store'])->name('outlet-cabangs.store');

        // Data Master (Outlets, Vendors, Inventory Store & Import)
        Route::post('/outlets', [OutletController::class, 'store'])->name('outlets.store');
        Route::post('/outlets/import', [OutletController::class, 'import'])->name('outlets.import');
        Route::post('/vendors', [VendorController::class, 'store'])->name('vendors.store');
        Route::post('/vendors/import', [VendorController::class, 'import'])->name('vendors.import');
        Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
        Route::post('/inventory/import', [InventoryController::class, 'import'])->name('inventory.import');
    });

    // Admin Only: Edit, Delete, Letter Number Settings, User Management
    Route::middleware('role:admin')->group(function () {
        // Letter Number Settings (Pengaturan Nomor Surat)
        Route::post('/api/letter-numbers/settings', [LetterNumberController::class, 'updateSettings'])->name('letter-numbers.settings.update');
        Route::post('/api/letter-numbers/reset', [LetterNumberController::class, 'resetSettings'])->name('letter-numbers.reset');

        // Deletions for Letters
        Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
        Route::delete('/spk-histories/{id}', [SpkHistoryController::class, 'destroy'])->name('spk-histories.destroy');
        Route::delete('/sopp-histories/{id}', [SoppHistoryController::class, 'destroy'])->name('sopp-histories.destroy');

        // Updates & Deletes for IT Inventaris
        Route::put('/computers/{id}', [ComputerController::class, 'update'])->name('computers.update');
        Route::delete('/computers/{id}', [ComputerController::class, 'destroy'])->name('computers.destroy');
        Route::put('/printers/{id}', [PrinterController::class, 'update'])->name('printers.update');
        Route::delete('/printers/{id}', [PrinterController::class, 'destroy'])->name('printers.destroy');
        Route::put('/laptops/{id}', [LaptopController::class, 'update'])->name('laptops.update');
        Route::delete('/laptops/{id}', [LaptopController::class, 'destroy'])->name('laptops.destroy');

        // Updates & Deletes for Bangunan & Keamanan
        Route::put('/building-lands/{id}', [BuildingLandController::class, 'update'])->name('building-lands.update');
        Route::put('/building-lands/{id}/status', [BuildingLandController::class, 'updateStatus'])->name('building-lands.updateStatus');
        Route::delete('/building-lands/{id}', [BuildingLandController::class, 'destroy'])->name('building-lands.destroy');

        Route::put('/building-sewas/{id}', [BuildingSewaController::class, 'update'])->name('building-sewas.update');
        Route::put('/building-sewas/{id}/status', [BuildingSewaController::class, 'updateStatus'])->name('building-sewas.updateStatus');
        Route::delete('/building-sewas/{id}', [BuildingSewaController::class, 'destroy'])->name('building-sewas.destroy');

        Route::put('/building-renovations/{id}', [BuildingRenovationController::class, 'update'])->name('building-renovations.update');
        Route::delete('/building-renovations/{id}', [BuildingRenovationController::class, 'destroy'])->name('building-renovations.destroy');

        Route::put('/security-facilities/{id}', [SecurityFacilityController::class, 'update'])->name('security-facilities.update');
        Route::put('/security-facilities/{id}/status', [SecurityFacilityController::class, 'updateStatus'])->name('security-facilities.update-status');
        Route::delete('/security-facilities/{id}', [SecurityFacilityController::class, 'destroy'])->name('security-facilities.destroy');

        // Updates & Deletes for Meubelair
        Route::put('/meubelairs/{id}', [MeubelairController::class, 'update'])->name('meubelairs.update');
        Route::delete('/meubelairs/{id}', [MeubelairController::class, 'destroy'])->name('meubelairs.destroy');
        Route::put('/master-meubelairs/{id}', [MasterMeubelairController::class, 'update'])->name('master-meubelairs.update');
        Route::delete('/master-meubelairs/{id}', [MasterMeubelairController::class, 'destroy'])->name('master-meubelairs.destroy');
        Route::delete('/jenis-meubelairs/{id}', [JenisMeubelairController::class, 'destroy'])->name('jenis-meubelairs.destroy');
        Route::delete('/outlet-areas/{id}', [OutletAreaController::class, 'destroy'])->name('outlet-areas.destroy');
        Route::delete('/outlet-cabangs/{id}', [OutletCabangController::class, 'destroy'])->name('outlet-cabangs.destroy');

        // Updates & Deletes for Data Master
        Route::put('/outlets/{id}', [OutletController::class, 'update'])->name('outlets.update');
        Route::delete('/outlets/{id}', [OutletController::class, 'destroy'])->name('outlets.destroy');
        Route::put('/vendors/{id}', [VendorController::class, 'update'])->name('vendors.update');
        Route::delete('/vendors/{id}', [VendorController::class, 'destroy'])->name('vendors.destroy');
        Route::put('/inventory/{id}', [InventoryController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{id}', [InventoryController::class, 'destroy'])->name('inventory.destroy');

        // User Management (Kelola Akses)
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::put('/users/{id}/role', [UserController::class, 'updateRole'])->name('users.update-role');
    });

    // User Profile Update Route
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__.'/auth.php';
