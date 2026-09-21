import { useState, useEffect } from "react";
import { hitungSisaBulan, hitungSisaHari } from "../../utils/deviceUtils";

export function usePrinterFilter(printerData, propFilterStatus, propSetFilterStatus, propSearchQuery, propSetSearchQuery) {
  const [searchQuery, setSearchQuery]   = useState(propSearchQuery || "");
  const [filterStatus, setFilterStatus] = useState(propFilterStatus || "Semua");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync state if props change
  useEffect(() => {
    if (propFilterStatus) {
      setFilterStatus(propFilterStatus);
    }
  }, [propFilterStatus]);

  useEffect(() => {
    if (propSearchQuery !== undefined) {
      setSearchQuery(propSearchQuery);
    }
  }, [propSearchQuery]);

  const handleSearch       = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilterStatus = (e) => { 
    setFilterStatus(e.target.value); 
    setCurrentPage(1); 
    if (propSetFilterStatus) {
      propSetFilterStatus(e.target.value);
    }
  };

  const filteredData = printerData.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.produk?.toLowerCase().includes(q) ||
      item.sn?.toLowerCase().includes(q) ||
      item.outlet?.toLowerCase().includes(q);
    
    const endTgl = item.tanggalSelesai || item.tanggal_selesai;
    const sisaHari = hitungSisaHari(endTgl);
    const sisaBulan = hitungSisaBulan(endTgl);

    const isExpired = sisaHari !== null && sisaHari < 0;
    const isExpiringSoon = sisaHari !== null && sisaHari >= 0 && sisaHari <= 7;
    const isExpiringMonth = !isExpired && sisaBulan !== null && sisaBulan <= 3;

    const realStatus = (!item.tanggalMulai && !item.tanggal_mulai && !endTgl)
      ? "Inventaris"
      : (isExpired ? "Sewa Habis" : "Sewa Berjalan");
    
    let matchFilter = false;
    if (filterStatus === "Semua") {
      matchFilter = true;
    } else if (filterStatus === "warning") {
      matchFilter = isExpired || isExpiringSoon || isExpiringMonth;
    } else {
      matchFilter = realStatus === filterStatus || item.status === filterStatus;
    }
    
    return matchSearch && matchFilter;
  });

  if (filterStatus === "warning") {
    filteredData.sort((a, b) => {
      const sisaHariA = hitungSisaHari(a.tanggalSelesai);
      const sisaHariB = hitungSisaHari(b.tanggalSelesai);
      if (sisaHariA === null) return 1;
      if (sisaHariB === null) return -1;
      return sisaHariA - sisaHariB;
    });
  }

  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("Semua");
    setCurrentPage(1);
    if (propSetFilterStatus) {
      propSetFilterStatus("Semua");
    }
  };

  return {
    searchQuery, filterStatus,
    currentPage, setCurrentPage,
    totalPages, startIndex, itemsPerPage, setItemsPerPage,
    filteredData, paginatedData,
    handleSearch, handleFilterStatus, resetFilters,
  };
}

