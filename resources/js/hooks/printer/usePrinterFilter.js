// src/hooks/printer/usePrinterFilter.js
import { useState } from "react";

export function usePrinterFilter(printerData) {
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const handleSearch       = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilterStatus = (e) => { setFilterStatus(e.target.value); setCurrentPage(1); };

  const filteredData = printerData.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.produk?.toLowerCase().includes(q) ||
      item.sn?.toLowerCase().includes(q) ||
      item.outlet?.toLowerCase().includes(q);
    const matchFilter = filterStatus === "Semua" || item.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return {
    searchQuery, filterStatus,
    currentPage, setCurrentPage,
    totalPages, startIndex, itemsPerPage,
    filteredData, paginatedData,
    handleSearch, handleFilterStatus,
  };
}
