// resources/js/hooks/printer/usePrinterData.js
"use client";

import { useState, useEffect } from "react";
import { calculateAutoStatus } from "../../utils/deviceUtils";
import { usePrinterCRUD }    from "./usePrinterCRUD";
import { usePrinterFilter }  from "./usePrinterFilter";
import { usePrinterActions } from "./usePrinterActions";

const normalizePrinter = (printer, outlets = []) => {
  if (!printer) return printer;
  let idOutlet = printer.idOutlet ?? printer.outlet_id ?? printer.outlet_rel?.code ?? printer.outlet_rel?.id ?? "";

  if (!idOutlet && printer.outlet && outlets.length > 0) {
    const rawName = String(printer.outlet).trim().toLowerCase();
    const matched = outlets.find((o) => {
      const oName = (o.nama || "").trim().toLowerCase();
      const oCode = (o.code || "").trim().toLowerCase();
      return oName === rawName || oCode === rawName || (rawName && (oName.startsWith(rawName) || rawName.startsWith(oName)));
    });
    if (matched) {
      idOutlet = matched.code || matched.id || "";
    }
  }

  if (printer.outlet_rel && !idOutlet) {
    idOutlet = printer.outlet_rel.code || printer.outlet_rel.id || "";
  }

  const tanggalMulai = printer.tanggalMulai ?? printer.tanggal_mulai ?? "";
  const tanggalSelesai = printer.tanggalSelesai ?? printer.tanggal_selesai ?? "";
  const vendor = printer.vendor ?? printer.penyedia ?? "";

  return {
    ...printer,
    id: printer.id,
    idOutlet: idOutlet ? String(idOutlet) : "",
    outlet_id: idOutlet ? Number(idOutlet) : (printer.outlet_id ? Number(printer.outlet_id) : null),
    outlet: printer.outlet ?? (printer.outlet_rel ? printer.outlet_rel.nama : ""),
    produk: printer.produk ?? "",
    sn: printer.sn ?? "",
    tanggalMulai,
    tanggal_mulai: tanggalMulai,
    tanggalSelesai,
    tanggal_selesai: tanggalSelesai,
    vendor,
    penyedia: vendor,
    status: printer.status ?? (tanggalMulai && tanggalSelesai ? calculateAutoStatus(tanggalMulai, tanggalSelesai) : "Inventaris"),
    kondisi: printer.kondisi ?? "BAIK",
    keterangan: printer.keterangan ?? printer.deskripsi ?? "",
    inventory_id: printer.inventory_id ?? printer.inventory?.id ?? null,
    inventory: printer.inventory ?? null,
    histories: printer.histories || [],
  };
};

export function usePrinterData(initialPrinters = [], initialOutlets = [], initialInventory = [], propFilterStatus, propSetFilterStatus, propSearchQuery, propSetSearchQuery) {
  const [printerData, setPrinterData]     = useState(() => (initialPrinters || []).map((p) => normalizePrinter(p, initialOutlets)));
  const [outletsList, setOutletsList]     = useState(initialOutlets || []);
  const [inventoryList, setInventoryList] = useState(initialInventory || []);
  const [snList, setSnList]               = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [koneksiError, setKoneksiError]   = useState(false);
  const [notif, setNotif]                 = useState({ show: false, message: "", type: "" });
  const [qrModalData, setQrModalData]     = useState(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  useEffect(() => {
    setPrinterData((initialPrinters || []).map((p) => normalizePrinter(p, initialOutlets)));
    setOutletsList(initialOutlets || []);
    setInventoryList(initialInventory || []);
    
    // Accumulate unique serial numbers from printers data
    const sns = new Set();
    (initialPrinters || []).forEach(p => { if (p.sn) sns.add(p.sn); });
    setSnList([...sns]);
  }, [initialPrinters, initialOutlets, initialInventory]);

  // Sub-hooks
  const filter  = usePrinterFilter(printerData, propFilterStatus, propSetFilterStatus, propSearchQuery, propSetSearchQuery);
  const crud    = usePrinterCRUD({
    printerData,
    setPrinterData,
    showNotif,
    outletsList,
    inventoryList,
    setCurrentPage: filter.setCurrentPage,
    resetFilters: filter.resetFilters,
  });
  const actions = usePrinterActions({
    filteredData: filter.filteredData,
    setIsSaving:  crud.setIsSaving,
    showNotif,
  });

  // Form handlers dengan logika domain
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
          updated.vendor = itemMaster.vendor_nama || itemMaster.vendor;
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
    printerData, outletsList, inventoryList, snList,
    isLoading, koneksiError, notif, setNotif,
    qrModalData, setQrModalData,
    ...crud,
    ...filter,
    ...actions,
    handleOutletChange, handleProdukChange, handleDateChange,
  };
}
