// src/components/TabContent.jsx
// Render semua panel konten per tab
"use client";

import {
  DashboardView, DataMaster, FormView, PreviewView,
  DataPrinter, DataKomputer, KelolaUser,
  RiwayatTransaksi, LogAktivitas,
  BangunanTanah, BangunanSewa,
  BangunanRenovasi, BangunanSarana, BangunanSPK,
  NotificationPageView, SoppGenerator,
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

/**
 * Merender semua panel konten berdasarkan tab yang terbuka.
 * Hanya tab yang pernah dibuka yang di-mount (hidden jika tidak aktif).
 */
export default function TabContent({
  tabs,
  activeTab,
  userRole,
  // data props
  transactions, setTransactions, inventory, outlets,
  printers, computers,
  notifSewa, notifSewaKomputer,
  usersList, activityLogs,
  buildingLands, buildingSewas,
  buildingRenovations, securityFacilities,
  spkHistory, soppHistory,
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
}) {
  const has = (id) => tabs.some((t) => t.id === id);

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#0f1712] text-gray-900 dark:text-slate-100 relative transition-colors">

      {has("dashboard") && (
        <Panel id="dashboard" activeTab={activeTab}>
          <DashboardView
            transactions={transactions}
            inventory={inventory}
            setView={setView}
            user={user}
            userRole={userRole}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            printers={printers}
            computers={computers}
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
            printerFilter={printerFilter}
            setPrinterFilter={setPrinterFilter}
          />
        </Panel>
      )}

      {has("form") && (
        <Panel id="form" activeTab={activeTab}>
          <FormView
            formData={formData}
            handleInputChange={handleInputChange}
            items={items}
            handleItemChange={handleItemChange}
            addItem={addItem}
            removeItem={removeItem}
            setView={setView}
            inventory={inventory}
            outlets={outlets}
          />
        </Panel>
      )}

      {has("master_barang") && (
        <Panel id="master_barang" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_barang"
            inventory={inventory}
            outlets={outlets}
            userRole={userRole}
          />
        </Panel>
      )}

      {has("master_outlet") && (
        <Panel id="master_outlet" activeTab={activeTab}>
          <DataMaster
            activeMenu="master_outlet"
            inventory={inventory}
            outlets={outlets}
            userRole={userRole}
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
            filterStatus={printerFilter} 
            setFilterStatus={setPrinterFilter} 
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
            filterStatus={computerFilter} 
            setFilterStatus={setComputerFilter} 
          />
        </Panel>
      )}

      {has("bangunan_tanah") && (
        <Panel id="bangunan_tanah" activeTab={activeTab}>
          <BangunanTanah 
            userRole={userRole} 
            lands={buildingLands} 
            landFilter={landFilter} 
            setLandFilter={setLandFilter} 
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
          />
        </Panel>
      )}
      {has("bangunan_renovasi") && (
        <Panel id="bangunan_renovasi" activeTab={activeTab}>
          <BangunanRenovasi 
            userRole={userRole} 
            renovations={buildingRenovations} 
            renovationFilter={renovationFilter}
            setRenovationFilter={setRenovationFilter}
          />
        </Panel>
      )}
      {has("bangunan_sarana") && (
        <Panel id="bangunan_sarana" activeTab={activeTab}>
          <BangunanSarana 
            userRole={userRole} 
            facilities={securityFacilities} 
            securityFilter={securityFilter}
            setSecurityFilter={setSecurityFilter}
          />
        </Panel>
      )}

      <Panel id="spk_renovasi" activeTab={activeTab}>
        <BangunanSPK type="renovasi" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="spk_elektronik" activeTab={activeTab}>
        <BangunanSPK type="elektronik" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="spk_kendaraan" activeTab={activeTab}>
        <BangunanSPK type="kendaraan" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="sopp_pengadaan" activeTab={activeTab}>
        <SoppGenerator type="pengadaan" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="sopp_sewa" activeTab={activeTab}>
        <SoppGenerator type="sewa" setView={setView} activeTab={activeTab} />
      </Panel>



      {has("riwayat") && (
        <Panel id="riwayat" activeTab={activeTab}>
          <RiwayatTransaksi
            transactions={transactions}
            setTransactions={setTransactions}
            setFormData={setFormData}
            setItems={setItems}
            setActiveTransaction={setActiveTransaction}
            setView={setView}
            currentTab={activeTab}
            spkHistoryProp={spkHistory}
            soppHistoryProp={soppHistory}
          />
        </Panel>
      )}

      <Panel id="preview" activeTab={activeTab}>
        <PreviewView
          formData={formData}
          items={items}
          activeTransaction={activeTransaction}
          setView={setView}
          handleSaveTransaction={handleSaveTransaction}
          isSaving={isSaving}
        />
      </Panel>

      {has("kelola_user") && (
        <Panel id="kelola_user" activeTab={activeTab}>
          {userRole === "admin"
            ? <KelolaUser usersList={usersList} handleUpdateRole={handleUpdateRole} />
            : <AccessDenied />}
        </Panel>
      )}

      {has("log_aktivitas") && (
        <Panel id="log_aktivitas" activeTab={activeTab}>
          {userRole === "admin"
            ? <LogAktivitas logs={activityLogs} />
            : <AccessDenied />}
        </Panel>
      )}

      {has("notifikasi") && (
        <Panel id="notifikasi" activeTab={activeTab}>
          <NotificationPageView
            printers={printers}
            computers={computers}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={setView}
            setLandFilter={setLandFilter}
            setSewaFilter={setSewaFilter}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
          />
        </Panel>
      )}

    </div>
  );
}