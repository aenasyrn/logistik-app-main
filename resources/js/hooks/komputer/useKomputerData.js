// resources/js/hooks/komputer/useKomputerData.js
"use client";

import { useState, useEffect } from "react";
import { calculateAutoStatus } from "../../utils/deviceUtils";
import { useKomputerCRUD }   from "./useKomputerCRUD";
import { useKomputerFilter } from "./useKomputerFilter";
import { useKomputerActions } from "./useKomputerActions";

export function useKomputerData(initialComputers = [], initialOutlets = [], initialInventory = [], propFilterStatus, propSetFilterStatus) {
  const [computerData, setComputerData]   = useState(initialComputers);
  const [outletsList, setOutletsList]     = useState(initialOutlets);
  const [inventoryList, setInventoryList] = useState(initialInventory);
  const [isLoading, setIsLoading]         = useState(false);
  const [koneksiError, setKoneksiError]   = useState(false);
  const [notif, setNotif]                 = useState({ show: false, message: "", type: "" });
  const [qrModalData, setQrModalData]     = useState(null);

  const showNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  useEffect(() => {
    setComputerData(initialComputers);
    setOutletsList(initialOutlets);
    setInventoryList(initialInventory);
  }, [initialComputers, initialOutlets, initialInventory]);

  const crud    = useKomputerCRUD({ computerData, setComputerData, showNotif });
  const filter  = useKomputerFilter(computerData, propFilterStatus, propSetFilterStatus);
  const actions = useKomputerActions({
    filteredData: filter.filteredData,
    setIsSaving:  crud.setIsSaving,
    showNotif,
  });

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