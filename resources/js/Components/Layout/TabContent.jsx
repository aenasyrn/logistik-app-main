// src/components/TabContent.jsx
// Render semua panel konten per tab
"use client";

import {
  DashboardView, DataMaster, FormView, PreviewView,
  DataPrinter, DataKomputer, KelolaUser,
  RiwayatTransaksi, LogAktivitas,
  BangunanTanah, BangunanSewa,
  BangunanRenovasi, BangunanSarana,
} from "./LazyComponents";

/** Panel pembungkus: tampil jika active, sembunyi jika tidak */
function Panel({ id, activeTab, children }) {
  const isActive = activeTab === id;
  return (
    <div className={isActive ? "block animate-in fade-in duration-300" : "hidden"}>
      {children}
    </div>
  );
}

/** Pesan akses ditolak untuk halaman yang butuh role admin */
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
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
  transactions, inventory, outlets,
  printers, computers,
  notifSewa, notifSewaKomputer,
  usersList, activityLogs,
  buildingLands, buildingSewas,
  buildingRenovations, securityFacilities,
  // form props
  formData, setFormData,
  items, setItems,
  activeTransaction, setActiveTransaction,
  // handlers
  handleInputChange, handleItemChange,
  addItem, removeItem,
  handleSaveTransaction,
  setView,
  user,
  handleUpdateRole,
}) {
  const has = (id) => tabs.some((t) => t.id === id);

  return (
    <div className="flex-1 w-full bg-white relative">

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
          <DataPrinter userRole={userRole} printers={printers} outlets={outlets} inventory={inventory} />
        </Panel>
      )}

      {has("perangkat_komputer") && (
        <Panel id="perangkat_komputer" activeTab={activeTab}>
          <DataKomputer userRole={userRole} computers={computers} outlets={outlets} inventory={inventory} />
        </Panel>
      )}

      {has("bangunan_tanah") && (
        <Panel id="bangunan_tanah" activeTab={activeTab}>
          <BangunanTanah userRole={userRole} lands={buildingLands} />
        </Panel>
      )}



      {has("bangunan_sewa") && (
        <Panel id="bangunan_sewa" activeTab={activeTab}>
          <BangunanSewa userRole={userRole} sewas={buildingSewas} outlets={outlets} />
        </Panel>
      )}

      {has("bangunan_renovasi") && (
        <Panel id="bangunan_renovasi" activeTab={activeTab}>
          <BangunanRenovasi userRole={userRole} renovations={buildingRenovations} />
        </Panel>
      )}

      {has("bangunan_sarana") && (
        <Panel id="bangunan_sarana" activeTab={activeTab}>
          <BangunanSarana userRole={userRole} facilities={securityFacilities} />
        </Panel>
      )}



      {has("riwayat") && (
        <Panel id="riwayat" activeTab={activeTab}>
          <RiwayatTransaksi
            transactions={transactions}
            setFormData={setFormData}
            setItems={setItems}
            setActiveTransaction={setActiveTransaction}
            setView={setView}
          />
        </Panel>
      )}

      {has("preview") && (
        <Panel id="preview" activeTab={activeTab}>
          <PreviewView
            formData={formData}
            items={items}
            activeTransaction={activeTransaction}
            setView={setView}
            handleSaveTransaction={handleSaveTransaction}
          />
        </Panel>
      )}

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

    </div>
  );
}