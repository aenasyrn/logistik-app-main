// resources/js/hooks/printer/usePrinterData.js
"use client";

import { useState, useEffect } from "react";
import { calculateAutoStatus } from "../../utils/deviceUtils";
import { usePrinterCRUD }    from "./usePrinterCRUD";
import { usePrinterFilter }  from "./usePrinterFilter";
import { usePrinterActions } from "./usePrinterActions";

export function usePrinterData(initialPrinters = [], initialOutlets = [], initialInventory = [], propFilterStatus, propSetFilterStatus) {
  const [printerData, setPrinterData]     = useState(initialPrinters);
  const [outletsList, setOutletsList]     = useState(initialOutlets);
  const [inventoryList, setInventoryList] = useState(initialInventory);
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
    setPrinterData(initialPrinters);
    setOutletsList(initialOutlets);
    setInventoryList(initialInventory);
    
    // Accumulate unique serial numbers from printers data
    const sns = new Set();
    initialPrinters.forEach(p => { if (p.sn) sns.add(p.sn); });
    setSnList([...sns]);
  }, [initialPrinters, initialOutlets, initialInventory]);

  // Sub-hooks
  const crud    = usePrinterCRUD({ printerData, setPrinterData, showNotif, outletsList, inventoryList });
  const filter  = usePrinterFilter(printerData, propFilterStatus, propSetFilterStatus);
  const actions = usePrinterActions({
    filteredData: filter.filteredData,
    setIsSaving:  crud.setIsSaving,
    showNotif,
  });

  // Form handlers dengan logika domain
  const handleOutletChange = (e) => {
    const selectedOutlet = outletsList.find((o) => o.nama === e.target.value);
    crud.setFormData((prev) => ({
      ...prev,
      outlet:   e.target.value,
      idOutlet: selectedOutlet ? selectedOutlet.id : "",
    }));
  };

  const handleProdukChange = (e) => {
    const itemMaster = inventoryList.find((inv) => inv.nama === e.target.value);
    crud.setFormData((prev) => {
      const updated = { ...prev, produk: e.target.value };
      if (itemMaster) {
        updated.penyedia       = itemMaster.vendor_nama     || "";
        updated.tanggalMulai   = itemMaster.tanggal_mulai   || "";
        updated.tanggalSelesai = itemMaster.tanggal_selesai || "";
        updated.status         = calculateAutoStatus(itemMaster.tanggal_mulai, itemMaster.tanggal_selesai);
      } else {
        updated.penyedia = updated.tanggalMulai = updated.tanggalSelesai = "";
        updated.status   = "Inventaris";
      }
      return updated;
    });
  };

  const handleDateChange = (field, value) => {
    crud.setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      updated.status = calculateAutoStatus(updated.tanggalMulai, updated.tanggalSelesai);
      return updated;
    });
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
