import { useState, useEffect } from "react";
import { hitungSisaBulan, hitungSisaHari } from "../../utils/deviceUtils";

export function usePrinterFilter(printerData, propFilterStatus, propSetFilterStatus) {
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterStatus, setFilterStatus] = useState(propFilterStatus || "Semua");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync state if prop changes
  useEffect(() => {
    if (propFilterStatus) {
      setFilterStatus(propFilterStatus);
    }
  }, [propFilterStatus]);

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
    
    let matchFilter = false;
    if (filterStatus === "Semua") {
      matchFilter = true;
    } else if (filterStatus === "warning") {
      const sisaBulan = hitungSisaBulan(item.tanggalSelesai);
      matchFilter = (item.status === "Sewa Berjalan" && sisaBulan !== null && sisaBulan <= 3) || item.status === "Sewa Habis";
    } else {
      matchFilter = item.status === filterStatus;
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

