// src/components/TabContent.jsx
// Render semua panel konten per tab
"use client";

import {
  DashboardView, DataMaster, FormView, PreviewView,
  DataPrinter, DataKomputer, DataLaptop,
  RiwayatTransaksi, LogAktivitas, KelolaAkses,
  BangunanTanah, BangunanSewa,
  BangunanRenovasi, BangunanSarana, BangunanSPK,
  NotificationPageView, SoppGenerator,
  PusatDataBarang, Mebelair,
  DataMeja, DataKursi, DataLemari, DataSofa, DataAC,
} from "./LazyComponents";

/** Panel pembungkus: tampil jika active, sembunyi jika tidak */
function Panel({ id, activeTab, children }) {
  const isActive = activeTab === id;
  return (
    <div id={id} className={isActive ? "block animate-in fade-in duration-300" : "hidden"}>
      {children}
    </div>
  );
}

/** Pesan akses ditolak untuk halaman yang butuh role admin */
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-slate-400">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Akses Ditolak</h2>
      <p>Anda tidak memiliki izin (Admin) untuk mengakses halaman ini.</p>
    </div>
  );
}

/** Pesan akses ditolak untuk fitur surat pada role guest */
function AccessDeniedSurat({ setView }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200 dark:border-amber-800/50">
        <span className="text-4xl">🔒</span>
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 mb-3 border border-red-200 dark:border-red-900/50">
        Akses Ditolak
      </span>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mb-2">
        Tidak Dapat Mengakses
      </h2>
      <p className="text-sm text-gray-600 dark:text-slate-300 max-w-md mb-6 leading-relaxed">
        Akun Anda menggunakan peran <strong>Tamu (Guest)</strong>. Role ini hanya memiliki izin untuk melihat <strong>Riwayat Surat</strong>, dan tidak diperkenankan membuat surat.
      </p>
      {setView && (
        <button
          type="button"
          onClick={() => setView("riwayat")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0d5c3a] hover:bg-[#0a462c] shadow-md shadow-[#0d5c3a]/20 transition-all cursor-pointer"
        >
          <span>Buka Riwayat Surat</span>
        </button>
      )}
    </div>
  );
}

/**
 * Merender semua panel konten berdasarkan tab yang terbuka.
 * Hanya tab yang pernah dibuka yang di-mount (hidden jika tidak aktif).
 */
export default function TabContent({
  tabs,
  activeTab,
  userRole,
  // data props
  transactions, setTransactions, inventory, outlets, vendors,
  printers, computers, laptops = [],
  notifSewa, notifSewaKomputer, notifSewaLaptop = [],
  usersList, activityLogs,
  buildingLands, buildingSewas,
  buildingRenovations, securityFacilities,
  spkHistory, soppHistory,
  meubelairs = [],
  masterMeubelairs = [],
  jenisMeubelairs = [],
  outletAreas = [],
  onRefreshJenis = null,
  // form props
  formData, setFormData,
  items, setItems,
  activeTransaction, setActiveTransaction,
  // handlers
  handleInputChange, handleItemChange,
  addItem, removeItem,
  handleSaveTransaction,
  isSaving,
  setView,
  user,
  handleUpdateRole,
  landFilter,
  setLandFilter,
  sewaFilter,
  setSewaFilter,
  renovationFilter,
  setRenovationFilter,
  securityFilter,
  setSecurityFilter,
  printerFilter,
  setPrinterFilter,
  computerFilter,
  setComputerFilter,
  laptopFilter,
  setLaptopFilter,
  riwayatFilter,
  setRiwayatFilter,
  landSearch,
  setLandSearch,
  sewaSearch,
  setSewaSearch,
  printerSearch,
  setPrinterSearch,
  computerSearch,
  setComputerSearch,
  laptopSearch,
  setLaptopSearch,
  notificationCategoryFilter,
  setNotificationCategoryFilter,
}) {
  const has = (id) => tabs.some((t) => t.id === id);

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#0f1712] text-gray-900 dark:text-slate-100 relative transition-colors">

      {(has("dashboard") || has("dashboard_inventaris") || has("dashboard_bangunan") || has("dashboard_pengamanan") || activeTab.startsWith("dashboard")) && (
        <Panel id={activeTab.startsWith("dashboard") ? activeTab : "dashboard"} activeTab={activeTab}>
          <DashboardView
            transactions={transactions}
            inventory={inventory}
            setView={setView}
            activeTab={activeTab}
            user={user}
            userRole={userRole}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            notifSewaLaptop={notifSewaLaptop}
            printers={printers}
            computers={computers}
            laptops={laptops}
            meubelairs={meubelairs}
            jenisMeubelairs={jenisMeubelairs}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            buildingRenovations={buildingRenovations}
            securityFacilities={securityFacilities}
            landFilter={landFilter}
            setLandFilter={setLandFilter}
            sewaFilter={sewaFilter}
            setSewaFilter={setSewaFilter}
            securityFilter={securityFilter}
            setSecurityFilter={setSecurityFilter}
            computerFilter={computerFilter}
            setComputerFilter={setComputerFilter}
            laptopFilter={laptopFilter}
            setLaptopFilter={setLaptopFilter}
            printerFilter={printerFilter}
            setPrinterFilter={setPrinterFilter}
            landSearch={landSearch}
            setLandSearch={setLandSearch}
            sewaSearch={sewaSearch}
            setSewaSearch={setSewaSearch}
            printerSearch={printerSearch}
            setPrinterSearch={setPrinterSearch}
            computerSearch={computerSearch}
            setComputerSearch={setComputerSearch}
            laptopSearch={laptopSearch}
            setLaptopSearch={setLaptopSearch}
            notificationCategoryFilter={notificationCategoryFilter}
            setNotificationCategoryFilter={setNotificationCategoryFilter}
          />
        </Panel>
      )}

      {has("form") && (
        <Panel id="form" activeTab={activeTab}>
          {userRole === "guest" ? (
            <AccessDeniedSurat setView={setView} />
          ) : (
            <FormView
              formData={formData}
              handleInputChange={handleInputChange}
              items={items}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              setView={setView}
              inventory={inventory}
              masterMeubelairs={masterMeubelairs}
              outlets={outlets}
              vendors={vendors}
              transactions={transactions}
              activeTransaction={activeTransaction}
            />
          )}
        </Panel>
      )}

      {has("master_barang") && (
        <Panel id="master_barang" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_barang"
            inventory={inventory}
            masterMeubelairs={masterMeubelairs}
            outlets={outlets}
            vendors={vendors}
            userRole={userRole}
            jenisMeubelairs={jenisMeubelairs}
            onRefreshJenis={onRefreshJenis}
          />
        </Panel>
      )}

      {has("master_barang_meubelair") && (
        <Panel id="master_barang_meubelair" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_barang_meubelair"
            inventory={inventory}
            masterMeubelairs={masterMeubelairs}
            outlets={outlets}
            vendors={vendors}
            userRole={userRole}
            jenisMeubelairs={jenisMeubelairs}
            onRefreshJenis={onRefreshJenis}
          />
        </Panel>
      )}

      {has("master_barang_non_meubelair") && (
        <Panel id="master_barang_non_meubelair" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_barang_non_meubelair"
            inventory={inventory}
            masterMeubelairs={masterMeubelairs}
            outlets={outlets}
            vendors={vendors}
            userRole={userRole}
            jenisMeubelairs={jenisMeubelairs}
            onRefreshJenis={onRefreshJenis}
          />
        </Panel>
      )}

      {has("master_outlet") && (
        <Panel id="master_outlet" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_outlet"
            inventory={inventory}
            outlets={outlets}
            vendors={vendors}
            userRole={userRole}
            outletAreas={outletAreas}
          />
        </Panel>
      )}

      {has("perangkat_printer") && (
        <Panel id="perangkat_printer" activeTab={activeTab}>
          <DataPrinter
            userRole={userRole}
            printers={printers}
            outlets={outlets}
            inventory={inventory}
            vendors={vendors}
            filterStatus={printerFilter}
            setFilterStatus={setPrinterFilter}
            printerSearch={printerSearch}
            setPrinterSearch={setPrinterSearch}
            setView={setView}
          />
        </Panel>
      )}

      {has("perangkat_komputer") && (
        <Panel id="perangkat_komputer" activeTab={activeTab}>
          <DataKomputer
            userRole={userRole}
            computers={computers}
            outlets={outlets}
            inventory={inventory}
            vendors={vendors}
            filterStatus={computerFilter}
            setFilterStatus={setComputerFilter}
            computerSearch={computerSearch}
            setComputerSearch={setComputerSearch}
            setView={setView}
          />
        </Panel>
      )}

      {has("perangkat_laptop") && (
        <Panel id="perangkat_laptop" activeTab={activeTab}>
          <DataLaptop
            laptops={laptops}
            inventory={inventory}
            vendors={vendors}
            userRole={userRole}
            setView={setView}
            laptopFilter={laptopFilter}
            setLaptopFilter={setLaptopFilter}
            laptopSearch={laptopSearch}
            setLaptopSearch={setLaptopSearch}
          />
        </Panel>
      )}

      {has("bangunan_tanah") && (
        <Panel id="bangunan_tanah" activeTab={activeTab}>
          <BangunanTanah
            userRole={userRole}
            lands={buildingLands}
            outlets={outlets}
            landFilter={landFilter}
            setLandFilter={setLandFilter}
            landSearch={landSearch}
            setLandSearch={setLandSearch}
          />
        </Panel>
      )}

      {has("bangunan_sewa") && (
        <Panel id="bangunan_sewa" activeTab={activeTab}>
          <BangunanSewa
            userRole={userRole}
            sewas={buildingSewas}
            outlets={outlets}
            sewaFilter={sewaFilter}
            setSewaFilter={setSewaFilter}
            sewaSearch={sewaSearch}
            setSewaSearch={setSewaSearch}
          />
        </Panel>
      )}
      {has("bangunan_renovasi") && (
        <Panel id="bangunan_renovasi" activeTab={activeTab}>
          <BangunanRenovasi
            userRole={userRole}
            renovations={buildingRenovations}
            outlets={outlets}
            vendors={vendors}
            renovationFilter={renovationFilter}
            setRenovationFilter={setRenovationFilter}
            spkHistory={spkHistory}
            soppHistory={soppHistory}
          />
        </Panel>
      )}
      {has("bangunan_sarana") && (
        <Panel id="bangunan_sarana" activeTab={activeTab}>
          <BangunanSarana
            userRole={userRole}
            facilities={securityFacilities}
            outlets={outlets}
            securityFilter={securityFilter}
            setSecurityFilter={setSecurityFilter}
          />
        </Panel>
      )}

      <Panel id="spk_renovasi" activeTab={activeTab}>
        {userRole === "guest" ? <AccessDeniedSurat setView={setView} /> : <BangunanSPK type="renovasi" setView={setView} activeTab={activeTab} />}
      </Panel>

      <Panel id="spk_elektronik" activeTab={activeTab}>
        {userRole === "guest" ? <AccessDeniedSurat setView={setView} /> : <BangunanSPK type="elektronik" setView={setView} activeTab={activeTab} />}
      </Panel>

      <Panel id="spk_kendaraan" activeTab={activeTab}>
        {userRole === "guest" ? <AccessDeniedSurat setView={setView} /> : <BangunanSPK type="kendaraan" setView={setView} activeTab={activeTab} />}
      </Panel>

      <Panel id="sopp_pengadaan" activeTab={activeTab}>
        {userRole === "guest" ? <AccessDeniedSurat setView={setView} /> : <SoppGenerator type="pengadaan" setView={setView} activeTab={activeTab} outlets={outlets} vendors={vendors} spkHistory={spkHistory} />}
      </Panel>

      <Panel id="sopp_sewa" activeTab={activeTab}>
        {userRole === "guest" ? <AccessDeniedSurat setView={setView} /> : <SoppGenerator type="sewa" setView={setView} activeTab={activeTab} outlets={outlets} vendors={vendors} spkHistory={spkHistory} />}
      </Panel>

      <Panel id="sopp_renovasi" activeTab={activeTab}>
        {userRole === "guest" ? <AccessDeniedSurat setView={setView} /> : <SoppGenerator type="renovasi" setView={setView} activeTab={activeTab} outlets={outlets} vendors={vendors} spkHistory={spkHistory} />}
      </Panel>

      {has("riwayat") && (
        <Panel id="riwayat" activeTab={activeTab}>
          <RiwayatTransaksi
            userRole={userRole}
            transactions={transactions}
            setTransactions={setTransactions}
            setFormData={setFormData}
            setItems={setItems}
            setActiveTransaction={setActiveTransaction}
            setView={setView}
            currentTab={activeTab}
            spkHistoryProp={spkHistory}
            soppHistoryProp={soppHistory}
            riwayatFilter={riwayatFilter}
            setRiwayatFilter={setRiwayatFilter}
          />
        </Panel>
      )}

      <Panel id="preview" activeTab={activeTab}>
        {userRole === "guest" ? (
          <AccessDeniedSurat setView={setView} />
        ) : (
          <PreviewView
            formData={formData}
            items={items}
            activeTransaction={activeTransaction}
            setView={setView}
            handleSaveTransaction={handleSaveTransaction}
            isSaving={isSaving}
          />
        )}
      </Panel>

      {has("log_aktivitas") && (
        <Panel id="log_aktivitas" activeTab={activeTab}>
          {userRole !== "guest" ? (
            <LogAktivitas logs={activityLogs} currentUser={user} userRole={userRole} />
          ) : (
            <AccessDenied />
          )}
        </Panel>
      )}

      {has("kelola_user") && (
        <Panel id="kelola_user" activeTab={activeTab}>
          {userRole === "admin"
            ? <KelolaAkses usersList={usersList} handleUpdateRole={handleUpdateRole} />
            : <AccessDenied />}
        </Panel>
      )}

      {has("master_vendor") && (
        <Panel id="master_vendor" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_vendor"
            inventory={inventory}
            outlets={outlets}
            vendors={vendors}
            userRole={userRole}
          />
        </Panel>
      )}

      {has("pusat_data_barang") && (
        <Panel id="pusat_data_barang" activeTab={activeTab}>
          <PusatDataBarang
            activeTab={activeTab}
            inventory={inventory}
            outlets={outlets}
            vendors={vendors}
            computers={computers}
            printers={printers}
            laptops={laptops}
            meubelairs={meubelairs}
            masterMeubelairs={masterMeubelairs}
            transactions={transactions}
            soppHistory={soppHistory}
            spkHistory={spkHistory}
            setView={setView}
            setRiwayatFilter={setRiwayatFilter}
          />
        </Panel>
      )}

      {(has("inventaris_mebelair") || has("mebelair_meja") || has("mebelair_kursi") || has("mebelair_lemari") || has("mebelair_sofa") || has("mebelair_ac")) && (
        <Panel id={activeTab && activeTab.startsWith("mebelair_") ? activeTab : "inventaris_mebelair"} activeTab={activeTab}>
          <Mebelair
            meubelairs={meubelairs}
            outlets={outlets}
            userRole={userRole}
            jenisMeubelairs={jenisMeubelairs}
            onRefreshJenis={onRefreshJenis}
          />
        </Panel>
      )}

      {has("notifikasi") && (
        <Panel id="notifikasi" activeTab={activeTab}>
          <NotificationPageView
            printers={printers}
            computers={computers}
            laptops={laptops}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            notifSewaLaptop={notifSewaLaptop}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={setView}
            setLandFilter={setLandFilter}
            setSewaFilter={setSewaFilter}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
            setLaptopFilter={setLaptopFilter}
            setLandSearch={setLandSearch}
            setSewaSearch={setSewaSearch}
            printerSearch={printerSearch}
            setPrinterSearch={setPrinterSearch}
            computerSearch={computerSearch}
            setComputerSearch={setComputerSearch}
            setLaptopSearch={setLaptopSearch}
            notificationCategoryFilter={notificationCategoryFilter}
            setNotificationCategoryFilter={setNotificationCategoryFilter}
          />
        </Panel>
      )}

    </div>
  );
}