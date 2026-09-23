// resources/js/hooks/komputer/useKomputerData.js
import { useState, useEffect } from "react";
import { calculateAutoStatus } from "../../utils/deviceUtils";
import { useKomputerCRUD }   from "./useKomputerCRUD";
import { useKomputerFilter } from "./useKomputerFilter";
import { useKomputerActions } from "./useKomputerActions";

const normalizeComputer = (comp, outlets = []) => {
  if (!comp) return comp;
  let idOutlet = comp.idOutlet ?? comp.outlet_id ?? comp.outlet_rel?.code ?? comp.outlet_rel?.id ?? "";

  // If idOutlet is still missing, lookup in outlets by outlet name or code
  if (!idOutlet && comp.outlet && outlets.length > 0) {
    const rawName = String(comp.outlet).trim().toLowerCase();
    const matched = outlets.find((o) => {
      const oName = (o.nama || "").trim().toLowerCase();
      const oCode = (o.code || "").trim().toLowerCase();
      return oName === rawName || oCode === rawName || (rawName && (oName.startsWith(rawName) || rawName.startsWith(oName)));
    });
    if (matched) {
      idOutlet = matched.code || matched.id || "";
    }
  }

  if (comp.outlet_rel && !idOutlet) {
    idOutlet = comp.outlet_rel.code || comp.outlet_rel.id || "";
  }

  const ipAddress = comp.ipAddress ?? comp.ip_address ?? "";
  const macAddress = comp.macAddress ?? comp.mac_address ?? "";
  const tanggalMulai = comp.tanggalMulai ?? comp.tanggal_mulai ?? "";
  const tanggalSelesai = comp.tanggalSelesai ?? comp.tanggal_selesai ?? "";
  const penyedia = comp.penyedia ?? comp.vendor ?? "";

  return {
    ...comp,
    id: comp.id,
    idOutlet: idOutlet ? String(idOutlet) : "",
    outlet_id: idOutlet ? Number(idOutlet) : (comp.outlet_id ? Number(comp.outlet_id) : null),
    outlet: comp.outlet ?? (comp.outlet_rel ? comp.outlet_rel.nama : ""),
    ipAddress,
    ip_address: ipAddress,
    macAddress,
    mac_address: macAddress,
    cpu: comp.cpu ?? "",
    ram: comp.ram ?? "",
    storage: comp.storage ?? "",
    os: comp.os ?? "",
    produk: comp.produk ?? "",
    sn: comp.sn ?? "",
    tanggalMulai,
    tanggal_mulai: tanggalMulai,
    tanggalSelesai,
    tanggal_selesai: tanggalSelesai,
    penyedia,
    vendor: penyedia,
    status: comp.status ?? (tanggalMulai && tanggalSelesai ? calculateAutoStatus(tanggalMulai, tanggalSelesai) : "Inventaris"),
    kondisi: comp.kondisi ?? "BAIK",
    keterangan: comp.keterangan ?? comp.deskripsi ?? "",
    inventory_id: comp.inventory_id ?? comp.inventory?.id ?? null,
    inventory: comp.inventory ?? null,
    histories: comp.histories || [],
  };
};

export function useKomputerData(initialComputers = [], initialOutlets = [], initialInventory = [], propFilterStatus, propSetFilterStatus, propSearchQuery, propSetSearchQuery) {
  const [computerData, setComputerData]   = useState(() => (initialComputers || []).map((c) => normalizeComputer(c, initialOutlets)));
  const [outletsList, setOutletsList]     = useState(initialOutlets || []);
  const [inventoryList, setInventoryList] = useState(initialInventory || []);
  const [isLoading, setIsLoading]         = useState(false);
  const [koneksiError, setKoneksiError]   = useState(false);
  const [notif, setNotif]                 = useState({ show: false, message: "", type: "" });
  const [qrModalData, setQrModalData]     = useState(null);

  const showNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  useEffect(() => {
    setComputerData((initialComputers || []).map((c) => normalizeComputer(c, initialOutlets)));
    setOutletsList(initialOutlets || []);
    setInventoryList(initialInventory || []);
  }, [initialComputers, initialOutlets, initialInventory]);

  const crud    = useKomputerCRUD({ computerData, setComputerData, showNotif });
  const filter  = useKomputerFilter(computerData, propFilterStatus, propSetFilterStatus, propSearchQuery, propSetSearchQuery);
  const actions = useKomputerActions({
    filteredData: filter.filteredData,
    setIsSaving:  crud.setIsSaving,
    showNotif,
  });

  const handleOutletChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));

    const strVal = String(val).trim();
    const selectedOutlet = outletsList.find(
      (o) => (o.nama && o.nama.toLowerCase() === strVal.toLowerCase()) || String(o.id) === strVal
    );

    crud.setFormData((prev) => ({
      ...prev,
      outlet: selectedOutlet ? selectedOutlet.nama : strVal,
      idOutlet: selectedOutlet ? selectedOutlet.id : prev.idOutlet,
    }));
  };

  const handleProdukChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));

    const strVal = String(val).trim();
    const itemMaster = inventoryList.find(
      (inv) => (inv.nama && inv.nama.toLowerCase() === strVal.toLowerCase()) || String(inv.id) === strVal
    );

    crud.setFormData((prev) => {
      const updated = {
        ...prev,
        produk: itemMaster ? itemMaster.nama : strVal,
        inventory_id: itemMaster ? itemMaster.id : (prev.inventory_id || null),
      };
      if (itemMaster) {
        if (itemMaster.vendor_nama || itemMaster.vendor) {
          updated.penyedia = itemMaster.vendor_nama || itemMaster.vendor;
        }
        if (itemMaster.tanggal_mulai) {
          updated.tanggalMulai = itemMaster.tanggal_mulai;
        }
        if (itemMaster.tanggal_selesai) {
          updated.tanggalSelesai = itemMaster.tanggal_selesai;
        }
        updated.status = calculateAutoStatus(updated.tanggalMulai, updated.tanggalSelesai) || itemMaster.status || "Inventaris";

        if (itemMaster.deskripsi && !updated.keterangan) {
          updated.keterangan = itemMaster.deskripsi;
        }
      }
      return updated;
    });
  };

  const handleDateChange = (fieldOrEvent, maybeValue) => {
    if (typeof fieldOrEvent === "object" && fieldOrEvent !== null && fieldOrEvent.target) {
      const { name, value } = fieldOrEvent.target;
      crud.setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "tanggalMulai" || name === "tanggalSelesai") {
          updated.status = calculateAutoStatus(updated.tanggalMulai, updated.tanggalSelesai);
        }
        return updated;
      });
    } else {
      const field = fieldOrEvent;
      const value = maybeValue;
      crud.setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        if (field === "tanggalMulai" || field === "tanggalSelesai") {
          updated.status = calculateAutoStatus(updated.tanggalMulai, updated.tanggalSelesai);
        }
        return updated;
      });
    }
  };

  return {
    // data
    computerData, outletsList, inventoryList,
    // ui
    isLoading, koneksiError, notif, setNotif,
    qrModalData, setQrModalData,
    // crud
    ...crud,
    // filter & pagination
    ...filter,
    // actions (csv, excel, sync)
    ...actions,
    // form handlers
    handleOutletChange, handleProdukChange, handleDateChange,
  };
}