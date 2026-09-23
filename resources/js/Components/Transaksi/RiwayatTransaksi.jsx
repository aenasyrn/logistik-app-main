import { useState, useEffect, useRef } from "react";
import { Search, Download, FileText, ArrowLeft, ChevronLeft, ChevronRight, Printer, Edit, Trash2, CheckCircle, AlertTriangle, History } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";

export default function RiwayatTransaksi({
  userRole: userRoleProp,
  transactions: transactionsProp = [],
  setTransactions,
  setFormData,
  setItems,
  setActiveTransaction,
  setView,
  currentTab,
  spkHistoryProp = [],
  soppHistoryProp = [],
  riwayatFilter,
  setRiwayatFilter,
}) {
  const pageProps = usePage?.()?.props || {};
  const authUser = pageProps.auth?.user;
  const userRole = userRoleProp || authUser?.role || "user";
  const canDelete = userRole === "admin";

  const [activeTab, setActiveTab] = useState("spk");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterJenis, setFilterJenis] = useState("all");

  // Sync with incoming riwayatFilter prop from PusatDataBarang or other views
  useEffect(() => {
    if (riwayatFilter === undefined || riwayatFilter === null || riwayatFilter === "") return;

    if (typeof riwayatFilter === "object") {
      if (riwayatFilter.query !== undefined) {
        setSearchQuery(riwayatFilter.query);
      }
      if (riwayatFilter.tab) {
        setActiveTab(riwayatFilter.tab);
      }
    } else if (typeof riwayatFilter === "string") {
      setSearchQuery(riwayatFilter);
      const q = riwayatFilter.toLowerCase();
      if (q.includes("spk")) {
        setActiveTab("spk");
      } else if (q.includes("sopp")) {
        setActiveTab("sopp");
      } else if (q.includes("sst") || q.includes("bast") || q.includes("serah")) {
        setActiveTab("sst");
      }
    }
    setCurrentPage(1);
  }, [riwayatFilter]);

  const toastActiveRef = useRef(false);

  const transactions = (transactionsProp || []).map(trx => ({
    id: trx.id,
    nomorSurat: trx.nomor_surat,
    tanggal: trx.tanggal,
    jenisTransaksi: trx.jenis_transaksi,
    penerimaNama: trx.penerima_nama,
    penerimaJabatan: trx.penerima_jabatan,
    penerimaInstansi: trx.penerima_instansi,
    pengirimNama: trx.pengirim_nama,
    pengirimJabatan: trx.pengirim_jabatan,
    pengirimInstansi: trx.pengirim_instansi,
    mengetahuiNama: trx.mengetahui_nama,
    mengetahuiJabatan: trx.mengetahui_jabatan,
    lokasi: trx.lokasi,
    items: trx.items || [],
    created_at: trx.created_at,
    updated_at: trx.updated_at
  }));

  const mapSpkHistory = (item) => {
    if (!item) return {};
    let contentObj = typeof item.content === "object" && item.content !== null ? item.content : {};
    if (typeof item.content === "string") {
      try { contentObj = JSON.parse(item.content); } catch (e) {}
    }
    const rawForm = contentObj.formData || {};
    return {
      ...contentObj,
      ...rawForm,
      id: item.id,
      nomorSpk: item.nomor_spk || contentObj.nomorSpk || rawForm.noSurat,
      tanggal: item.tanggal || contentObj.tanggal || rawForm.tanggalSuratRaw,
      type: item.tipe_spk || contentObj.tipeSpk || item.type || "renovasi",
      perusahaan: item.perusahaan || contentObj.perusahaan || rawForm.kepadanya,
      uraian: item.uraian || contentObj.uraian || contentObj.projectUraian,
      jumlah: item.jumlah || contentObj.jumlah || rawForm.spkDibulatkan || rawForm.spkTotal,
    };
  };

  const mapSoppHistory = (item) => {
    if (!item) return {};
    let contentObj = typeof item.content === "object" && item.content !== null ? item.content : {};
    if (typeof item.content === "string") {
      try { contentObj = JSON.parse(item.content); } catch (e) {}
    }
    return {
      ...contentObj,
      id: item.id,
      nomorSopp: item.nomor_sopp || contentObj.nomorSopp,
      nomor_sopp: item.nomor_sopp || contentObj.nomorSopp,
      nomorSpk: item.nomor_spk || contentObj.nomorSpk || contentObj.no_spk,
      nomor_spk: item.nomor_spk || contentObj.nomorSpk || contentObj.no_spk,
      tanggal: item.tanggal || contentObj.tanggal,
      type: item.tipe_sopp || contentObj.type || "renovasi",
      dibayarkanKepada: item.dibayarkan_kepada || contentObj.dibayarkanKepada,
      jumlah: item.jumlah || contentObj.jumlah,
    };
  };

  // SPK History state
  const [spkHistory, setSpkHistory] = useState(() => spkHistoryProp.map(mapSpkHistory));
  // SOPP History state
  const [soppHistory, setSoppHistory] = useState(() => soppHistoryProp.map(mapSoppHistory));
  // Toast text state
  const [toastMessage, setToastMessage] = useState("");
  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Pending background edits state
  const [pendingSpkEdits, setPendingSpkEdits] = useState({});
  const [pendingSoppEdits, setPendingSoppEdits] = useState({});

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    type: "" // "spk" or "sopp"
  });

  const mergeSpkHistory = (currentList, newList) => {
    const temps = currentList.filter(item => String(item.id).startsWith("temp-"));
    const newIds = newList.map(item => String(item.id));
    const newlyAddedItems = currentList.filter(item => !String(item.id).startsWith("temp-") && !newIds.includes(String(item.id)));

    const newNoSpks = newList.map(item => item.nomorSpk);
    const pendingTemps = temps.filter(item => !newNoSpks.includes(item.nomorSpk));

    const mergedList = newList.map(item => {
      if (pendingSpkEdits[item.id]) {
        return pendingSpkEdits[item.id];
      }
      return item;
    });

    return [...pendingTemps, ...newlyAddedItems, ...mergedList];
  };

  const mergeSoppHistory = (currentList, newList) => {
    const temps = currentList.filter(item => String(item.id).startsWith("temp-"));
    const newIds = newList.map(item => String(item.id));
    const newlyAddedItems = currentList.filter(item => !String(item.id).startsWith("temp-") && !newIds.includes(String(item.id)));

    const newNoSopps = newList.map(item => item.nomorSopp);
    const pendingTemps = temps.filter(item => !newNoSopps.includes(item.nomorSopp));

    const mergedList = newList.map(item => {
      if (pendingSoppEdits[item.id]) {
        return pendingSoppEdits[item.id];
      }
      return item;
    });

    return [...pendingTemps, ...newlyAddedItems, ...mergedList];
  };

  // Load history from props only when they change from the parent component
  useEffect(() => {
    setSpkHistory(prev => mergeSpkHistory(prev, spkHistoryProp.map(mapSpkHistory)));
  }, [spkHistoryProp]);

  useEffect(() => {
    setSoppHistory(prev => mergeSoppHistory(prev, soppHistoryProp.map(mapSoppHistory)));
  }, [soppHistoryProp]);

  // Refresh histories immediately when the tab becomes active
  useEffect(() => {
    if (currentTab !== "riwayat") return;

    const fetchHistories = async () => {
      try {
        const [spkRes, soppRes] = await Promise.all([
          axios.get('/spk-histories'),
          axios.get('/sopp-histories')
        ]);
        setSpkHistory(prev => mergeSpkHistory(prev, spkRes.data.map(mapSpkHistory)));
        setSoppHistory(prev => mergeSoppHistory(prev, soppRes.data.map(mapSoppHistory)));
      } catch (e) {
        console.error("Failed to fetch histories:", e);
      }
    };

    fetchHistories(); // Fetch immediately on tab active
  }, [currentTab, pendingSpkEdits, pendingSoppEdits]);

  // Listen to optimistic updates
  useEffect(() => {
    const handleOptimisticSpk = (e) => {
      const newSpk = e.detail;
      const mapped = mapSpkHistory(newSpk);
      setSpkHistory((prev) => {
        const exists = prev.some(item => String(item.id) === String(newSpk.id));
        if (exists) {
          setPendingSpkEdits(edits => ({ ...edits, [newSpk.id]: mapped }));
          return prev.map(item => String(item.id) === String(newSpk.id) ? mapped : item);
        } else {
          return [mapped, ...prev];
        }
      });
    };

    const handleOptimisticSopp = (e) => {
      const newSopp = e.detail;
      const mapped = mapSoppHistory(newSopp);
      setSoppHistory((prev) => {
        const exists = prev.some(item => String(item.id) === String(newSopp.id));
        if (exists) {
          setPendingSoppEdits(edits => ({ ...edits, [newSopp.id]: mapped }));
          return prev.map(item => String(item.id) === String(newSopp.id) ? mapped : item);
        } else {
          return [mapped, ...prev];
        }
      });
    };

    const handleSpkSaved = (e) => {
      const savedId = e.detail;
      if (savedId) {
        // Delay clearing the pending edit to prevent in-flight polls from overwriting it with old data
        setTimeout(() => {
          setPendingSpkEdits(edits => {
            const next = { ...edits };
            delete next[savedId];
            return next;
          });
        }, 2000);
      }
    };

    const handleSoppSaved = (e) => {
      const savedId = e.detail;
      if (savedId) {
        // Delay clearing the pending edit to prevent in-flight polls from overwriting it with old data
        setTimeout(() => {
          setPendingSoppEdits(edits => {
            const next = { ...edits };
            delete next[savedId];
            return next;
          });
        }, 2000);
      }
    };

    window.addEventListener("optimistic-spk-added", handleOptimisticSpk);
    window.addEventListener("optimistic-sopp-added", handleOptimisticSopp);
    window.addEventListener("spk-saved-to-db", handleSpkSaved);
    window.addEventListener("sopp-saved-to-db", handleSoppSaved);
    return () => {
      window.removeEventListener("optimistic-spk-added", handleOptimisticSpk);
      window.removeEventListener("optimistic-sopp-added", handleOptimisticSopp);
      window.removeEventListener("spk-saved-to-db", handleSpkSaved);
      window.removeEventListener("sopp-saved-to-db", handleSoppSaved);
    };
  }, []);

  // Load success toast and selected tab from localStorage if set
  useEffect(() => {
    if (currentTab === "riwayat") {
      const tab = localStorage.getItem("riwayat_active_tab");
      if (tab) {
        localStorage.removeItem("riwayat_active_tab");
        setActiveTab(tab);
      }

      const showSoppToast = localStorage.getItem("show_sopp_success_toast");
      const showSpkToast = localStorage.getItem("show_spk_success_toast");
      const showTrxToast = localStorage.getItem("show_trx_success_toast");
      if (showSoppToast === "true" || showSpkToast === "true" || showSpkToast === "edit" || showTrxToast === "true" || toastActiveRef.current) {
        if (showSoppToast === "true") {
          localStorage.removeItem("show_sopp_success_toast");
          setToastMessage("Surat SOPP berhasil disubmit ke riwayat!");
        } else if (showSpkToast === "true") {
          localStorage.removeItem("show_spk_success_toast");
          setToastMessage("Surat Perintah Kerja berhasil disubmit ke riwayat!");
        } else if (showSpkToast === "edit") {
          localStorage.removeItem("show_spk_success_toast");
          setToastMessage("Surat Perintah Kerja berhasil di edit");
        } else if (showTrxToast === "true") {
          localStorage.removeItem("show_trx_success_toast");
          setToastMessage("Surat Serah Terima berhasil disubmit ke riwayat!");
        }

        toastActiveRef.current = true;
        setShowSuccessToast(true);
        const timer = setTimeout(() => {
          setShowSuccessToast(false);
          toastActiveRef.current = false;
        }, 4000);
        return () => clearTimeout(timer);
      }
    } else {
      toastActiveRef.current = false;
      setShowSuccessToast(false);
    }
  }, [currentTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setFilterJenis("all");
  };

  // === SEARCH & FILTER LOGIC ===
  // Helper to sort by ID descending (temp- ids go to top, followed by numeric IDs descending)
  const sortByIdDesc = (a, b) => {
    const idA = String(a.id || "");
    const idB = String(b.id || "");
    const isTempA = idA.startsWith("temp-");
    const isTempB = idB.startsWith("temp-");
    if (isTempA && !isTempB) return -1;
    if (!isTempA && isTempB) return 1;
    const numA = parseInt(idA, 10);
    const numB = parseInt(idB, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA;
    }
    return idB.localeCompare(idA);
  };

  // 1. Filtered SPK List
  const filteredSpks = spkHistory.filter((spk) => {
    if (filterJenis !== "all" && spk.type !== filterJenis) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    const matchNo = String(spk.nomorSpk || "").toLowerCase().includes(query);
    const matchPerusahaan = String(spk.perusahaan || "").toLowerCase().includes(query);
    const matchUraian = String(spk.uraian || "").toLowerCase().includes(query);
    const matchJumlah = String(spk.jumlah || "").toLowerCase().includes(query);
    return matchNo || matchPerusahaan || matchUraian || matchJumlah;
  }).sort(sortByIdDesc);

  // 2. Filtered Transactions (Surat Serah Terima) List
  const filteredTransactions = transactions.filter((trx) => {
    if (filterJenis !== "all" && trx.jenisTransaksi !== filterJenis) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    const matchSurat = String(trx.nomorSurat || "").toLowerCase().includes(query);
    const matchPihak =
      String(trx.pengirimNama || "").toLowerCase().includes(query) ||
      String(trx.penerimaNama || "").toLowerCase().includes(query) ||
      String(trx.pengirimInstansi || "").toLowerCase().includes(query) ||
      String(trx.penerimaInstansi || "").toLowerCase().includes(query);
    const matchJenis = String(trx.jenisTransaksi || "").toLowerCase().includes(query);
    const matchBarang = trx.items?.some((item) => String(item.nama || "").toLowerCase().includes(query));
    return matchSurat || matchPihak || matchJenis || matchBarang;
  }).sort(sortByIdDesc);

  // 3. Filtered SOPP List
  const filteredSopps = soppHistory.filter((sopp) => {
    if (filterJenis !== "all" && sopp.type !== filterJenis) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    const matchNo = String(sopp.nomorSopp || "").toLowerCase().includes(query);
    const matchDibayarkan = String(sopp.dibayarkanKepada || "").toLowerCase().includes(query);
    const matchType = String(sopp.type || "").toLowerCase().includes(query);
    const matchJumlah = String(sopp.jumlah || "").toLowerCase().includes(query);
    return matchNo || matchDibayarkan || matchType || matchJumlah;
  }).sort(sortByIdDesc);

  // === PAGINATION CALCULATION ===
  const activeListLength =
    activeTab === "spk"
      ? filteredSpks.length
      : activeTab === "sopp"
        ? filteredSopps.length
        : filteredTransactions.length;
  const totalPages = Math.ceil(activeListLength / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedSpkData = filteredSpks.slice(startIndex, startIndex + itemsPerPage);
  const paginatedTrxData = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  const paginatedSoppData = filteredSopps.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // === SPK ACTIONS ===
  const handleLoadSpk = (spk) => {
    localStorage.setItem("selected_spk_to_edit", JSON.stringify(spk));
    window.dispatchEvent(new CustomEvent("load-spk-document", { detail: spk }));
    const spkType = spk.tipe_spk || spk.tipeSpk || spk.type || "renovasi";
    setView(`spk_${spkType}`);
  };

  const handlePrintSpk = (spk) => {
    window.dispatchEvent(new CustomEvent("print-spk-direct", { detail: spk }));
  };

  const handleDeleteSpk = (id) => {
    if (!canDelete) return;
    setDeleteConfirm({
      isOpen: true,
      id,
      type: "spk"
    });
  };

  // === SOPP ACTIONS ===
  const handleLoadSopp = (sopp) => {
    localStorage.setItem("selected_sopp_to_edit", JSON.stringify(sopp));
    window.dispatchEvent(new CustomEvent("load-sopp-document", { detail: sopp }));
    const targetView = sopp.type === "sewa" ? "sopp_sewa" : (sopp.type === "renovasi" ? "sopp_renovasi" : "sopp_pengadaan");
    setView(targetView);
  };

  const handlePrintSopp = (sopp) => {
    window.dispatchEvent(new CustomEvent("print-sopp-direct", { detail: sopp }));
  };

  const handleDeleteSopp = (id) => {
    if (!canDelete) return;
    setDeleteConfirm({
      isOpen: true,
      id,
      type: "sopp"
    });
  };

  // === TRANSAKSI ACTIONS ===
  const handleLoadTrx = (trx) => {
    const rawItems = trx.items || [];
    let parsedItems = Array.isArray(rawItems) ? rawItems : [];
    if (typeof rawItems === "string") {
      try { parsedItems = JSON.parse(rawItems); } catch (e) {}
    }
    const mappedTrx = {
      id: trx.id,
      nomorSurat: trx.nomorSurat || trx.nomor_surat || "",
      tanggal: trx.tanggal || "",
      jenisTransaksi: trx.jenisTransaksi || trx.jenis_transaksi || "Barang Keluar",
      penerimaNama: trx.penerimaNama || trx.penerima_nama || "",
      penerimaJabatan: trx.penerimaJabatan || trx.penerima_jabatan || "",
      penerimaInstansi: trx.penerimaInstansi || trx.penerima_instansi || "",
      pengirimNama: trx.pengirimNama || trx.pengirim_nama || "",
      pengirimJabatan: trx.pengirimJabatan || trx.pengirim_jabatan || "Staff Pengadaan dan Logistik",
      pengirimInstansi: trx.pengirimInstansi || trx.pengirim_instansi || "",
      mengetahuiNama: trx.mengetahuiNama || trx.mengetahui_nama || "Zoni Rahmawan Putra",
      mengetahuiJabatan: trx.mengetahuiJabatan || trx.mengetahui_jabatan || "Kabag Pengadaan dan Logistik",
      lokasi: trx.lokasi || "Jakarta",
    };
    setFormData(mappedTrx);
    setItems(parsedItems.length > 0 ? parsedItems : [{ id: Date.now().toString(), nama: "", kuantitas: 1, satuan: "Pcs", sn: "", keterangan: "", outlet: "", vendor: "" }]);
    setActiveTransaction(trx); // Retain activeTransaction to update the existing record
    setView("form");
  };

  const handlePrintTrx = (trx) => {
    setFormData(trx);
    setItems(trx.items || []);
    setActiveTransaction(trx);
    setTimeout(() => {
      document.body.classList.add("print-handover-only");
      window.print();
      document.body.classList.remove("print-handover-only");
    }, 150);
  };

  const handleDeleteTrx = (id) => {
    if (!canDelete) return;
    setDeleteConfirm({
      isOpen: true,
      id,
      type: "transaksi"
    });
  };

  const handleConfirmDelete = () => {
    if (!canDelete) return;
    const { id, type } = deleteConfirm;
    if (type === "spk") {
      // Optimistic delete UI update
      setSpkHistory(prev => prev.filter(item => item.id !== id));
      setToastMessage("Surat SPK berhasil dihapus!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

      // Perform actual DB deletion in the background
      axios.delete(`/spk-histories/${id}`)
        .then(() => {
          router.reload({ only: ["spkHistory"] });
        })
        .catch(e => console.error("Failed to delete SPK:", e));
    } else if (type === "sopp") {
      // Optimistic delete UI update
      setSoppHistory(prev => prev.filter(item => item.id !== id));
      setToastMessage("Surat SOPP berhasil dihapus!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

      // Perform actual DB deletion in the background
      axios.delete(`/sopp-histories/${id}`)
        .then(() => {
          router.reload({ only: ["soppHistory"] });
        })
        .catch(e => console.error("Failed to delete SOPP:", e));
    } else if (type === "transaksi") {
      // Optimistic delete UI update
      if (setTransactions) {
        setTransactions(prev => prev.filter(item => String(item.id) !== String(id)));
      }
      setToastMessage("Surat Serah Terima berhasil dihapus!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

      // Perform actual DB deletion and reload silently in the background
      axios.delete(`/transactions/${id}`)
        .then(() => {
          router.reload({ only: ['transactions', 'inventory', 'masterMeubelairs', 'meubelairs', 'computers', 'printers', 'activityLogs'] });
        })
        .catch(e => console.error("Failed to delete Transaction:", e));
    }
    setDeleteConfirm({ isOpen: false, id: null, type: "" });
  };

  // === EXPORT TO CSV ===
  const exportToExcel = () => {
    if (activeTab === "spk") {
      const headers = ["No. SPK", "Tanggal", "Uraian", "Jumlah"];
      const rows = filteredSpks.map(spk => [
        spk.nomorSpk,
        spk.tanggal,
        spk.uraian,
        spk.jumlah
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Riwayat_SPK_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === "sopp") {
      const headers = ["No. SOPP", "Tanggal", "Jenis", "Dibayarkan Kepada", "Jumlah"];
      const rows = filteredSopps.map(sopp => [
        sopp.nomorSopp,
        sopp.tanggal,
        sopp.type === "sewa" ? "Sewa" : "Pengadaan",
        sopp.dibayarkanKepada,
        sopp.jumlah
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Riwayat_SOPP_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["Tanggal", "No. Surat", "Jenis Transaksi", "Pengirim (Nama)", "Pengirim (Instansi)", "Penerima (Nama)", "Penerima (Instansi)", "Daftar Barang & Qty"];
      const rows = filteredTransactions.map(trx => {
        const itemsString = trx.items?.map(i => `${i.nama} (${i.kuantitas} ${i.satuan})`).join("; ") || "-";
        const rowData = [trx.tanggal, trx.nomorSurat, trx.jenisTransaksi, trx.pengirimNama, trx.pengirimInstansi, trx.penerimaNama, trx.penerimaInstansi, itemsString];
        return rowData.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",");
      });
      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Riwayat_Transaksi_Logistik_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white bg-green-600 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-5 tracking-tight flex items-center gap-2.5">
        <History className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Pusat Riwayat Surat
      </h2>

      <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-[#213527] pb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => handleTabChange("spk")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "spk"
            ? "bg-green-600 dark:bg-[#48a359] text-white shadow-md shadow-green-600/10"
            : "bg-slate-100 dark:bg-[#1a2b20] text-slate-600 dark:text-[#ffffff] hover:bg-slate-200 dark:hover:bg-[#243e2e]"
            }`}
        >
          Surat Perintah Kerja ({spkHistory.length})
        </button>
        <button
          onClick={() => handleTabChange("sopp")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "sopp"
            ? "bg-green-600 dark:bg-[#48a359] text-white shadow-md shadow-green-600/10"
            : "bg-slate-100 dark:bg-[#1a2b20] text-slate-600 dark:text-[#ffffff] hover:bg-slate-200 dark:hover:bg-[#243e2e]"
            }`}
        >
          SOPP ({soppHistory.length})
        </button>
        <button
          onClick={() => handleTabChange("serah_terima")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "serah_terima"
            ? "bg-green-600 dark:bg-[#48a359] text-white shadow-md shadow-green-600/10"
            : "bg-slate-100 dark:bg-[#1a2b20] text-slate-600 dark:text-[#ffffff] hover:bg-slate-200 dark:hover:bg-[#243e2e]"
            }`}
        >
          Surat Serah Terima ({transactions.length})
        </button>
      </div>

      <div className="bg-white dark:bg-[#0c1410] rounded-xl shadow-sm border border-gray-100 dark:border-[#213527] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#213527] bg-gray-50/50 dark:bg-[#0c1410]/50 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "spk"
                      ? "Cari nomor SPK, uraian..."
                      : activeTab === "sopp"
                        ? "Cari nomor SOPP, penerima..."
                        : "Cari nomor surat, pengirim, penerima..."
                  }
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a2b20] border border-gray-200 dark:border-[#213527] text-gray-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                />
              </div>

              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-350">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-8 py-1.5 bg-white dark:bg-[#1a2b20] border border-gray-300 dark:border-[#213527] text-gray-800 dark:text-[#f1f5f3] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs cursor-pointer font-medium shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={10000}>All</option>
                </select>
                <span>entries</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              {/* Export CSV Button (on the left of Total Data) */}
              <button
                type="button"
                onClick={exportToExcel}
                disabled={activeListLength === 0}
                className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>

              {/* Total Data Badge */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 text-[#0d5c3a] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0">
                {activeTab === "spk"
                  ? `Total SPK: ${activeListLength}`
                  : activeTab === "sopp"
                    ? `Total SOPP: ${activeListLength}`
                    : `Total Serah Terima: ${activeListLength}`}
              </div>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="flex flex-wrap gap-4 border-t border-gray-100 dark:border-[#213527] pt-3">
            <div className="w-full sm:w-60">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                Jenis Surat
              </label>
              <select
                value={filterJenis}
                onChange={(e) => {
                  setFilterJenis(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a2b20] border border-gray-200 dark:border-[#213527] text-gray-800 dark:text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm cursor-pointer"
              >
                {activeTab === "spk" ? (
                  <>
                    <option value="all">Semua Jenis SPK</option>
                    <option value="renovasi">Renovasi</option>
                    <option value="kendaraan">Kendaraan</option>
                    <option value="elektronik">Elektronik</option>
                  </>
                ) : activeTab === "sopp" ? (
                  <>
                    <option value="all">Semua Jenis SOPP</option>
                    <option value="sewa">Sewa</option>
                    <option value="pengadaan">Pengadaan</option>
                  </>
                ) : (
                  <>
                    <option value="all">Semua Jenis Serah Terima</option>
                    <option value="Barang Masuk">Barang Masuk</option>
                    <option value="Barang Keluar">Barang Keluar</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "spk" ? (
            /* ================= TAB 1: SURAT PERINTAH KERJA TABLE ================= */
            <table className="w-full text-left border-collapse min-w-[1050px] text-xs">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="py-2.5 px-3 w-12 text-center border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th className="py-2.5 px-3 w-48 border border-[#0a4228] bg-[#0d5c3a]">Nomor SPK</th>
                  <th className="py-2.5 px-3 min-w-[140px] whitespace-nowrap border border-[#0a4228] bg-[#0d5c3a]">Tanggal</th>
                  <th className="py-2.5 px-3 w-32 border border-[#0a4228] bg-[#0d5c3a]">Jenis</th>
                  <th className="py-2.5 px-3 w-64 min-w-[220px] max-w-[280px] border border-[#0a4228] bg-[#0d5c3a]">Uraian</th>
                  <th className="py-2.5 px-3 min-w-[150px] whitespace-nowrap border border-[#0a4228] bg-[#0d5c3a]">Jumlah</th>
                  <th className={`py-2.5 px-3 text-center ${canDelete ? "w-36" : "w-28"} border border-[#0a4228] bg-[#0d5c3a]`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-25 dark:divide-[#213527] text-xs text-gray-800 dark:text-[#d1dcd4]">
                {spkHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                      <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-xs">Belum ada riwayat Surat Perintah Kerja.</p>
                    </td>
                  </tr>
                ) : filteredSpks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                      <Search className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-xs">Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSpkData.map((spk, idx) => {
                    const isEven = idx % 2 !== 0;
                    const bgClass = isEven 
                      ? "bg-slate-100 hover:bg-slate-200 dark:bg-[#213527] dark:hover:bg-[#273f2f]" 
                      : "bg-white hover:bg-slate-200 dark:bg-[#1a2b20] dark:hover:bg-[#273f2f]";
                    return (
                      <tr key={spk.id} className={`${bgClass} transition-colors`}>
                        <td className="py-2.5 px-3 text-gray-500 dark:text-[#ffffff] font-medium text-center border border-slate-200 dark:border-[#213527]">{startIndex + idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-850 dark:text-slate-100 border border-slate-200 dark:border-[#213527] whitespace-nowrap">{spk.nomorSpk}</td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527] whitespace-nowrap">
                          {spk.tanggal ? new Date(spk.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 dark:border-[#213527]">
                          <span className={`inline-flex w-24 justify-center py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                            spk.type === "elektronik" 
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30" 
                              : spk.type === "kendaraan"
                              ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
                          }`}>
                            {spk.type === "elektronik" ? "Elektronik" : spk.type === "kendaraan" ? "Kendaraan" : "Renovasi"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 dark:text-slate-355 border border-slate-200 dark:border-[#213527] max-w-[280px]">
                          <div className="truncate max-w-[260px]" title={spk.uraian}>
                            {spk.uraian}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600 dark:text-[#48a359] border border-slate-200 dark:border-[#213527] whitespace-nowrap">
                          Rp. {spk.jumlah},-
                        </td>
                        <td className="py-2.5 px-3 text-right border border-slate-200 dark:border-[#213527]">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handlePrintSpk(spk)}
                              title="Cetak SPK"
                              className="p-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLoadSpk(spk)}
                              title="Edit SPK"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteSpk(spk.id)}
                                title="Hapus SPK"
                                className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : activeTab === "sopp" ? (
            /* ================= TAB 3: SOPP TABLE ================= */
            <table className="w-full text-left border-collapse min-w-[900px] text-xs">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="py-2.5 px-3 w-12 text-center border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th className="py-2.5 px-3 w-48 border border-[#0a4228] bg-[#0d5c3a]">Nomor SOPP</th>
                  <th className="py-2.5 px-3 w-36 border border-[#0a4228] bg-[#0d5c3a]">Tanggal</th>
                  <th className="py-2.5 px-3 w-32 border border-[#0a4228] bg-[#0d5c3a]">Jenis</th>
                  <th className="py-2.5 px-3 min-w-[200px] max-w-[250px] border border-[#0a4228] bg-[#0d5c3a]">Dibayarkan Kepada</th>
                  <th className="py-2.5 px-3 w-40 border border-[#0a4228] bg-[#0d5c3a]">Jumlah</th>
                  <th className={`py-2.5 px-3 text-center ${canDelete ? "w-36" : "w-28"} border border-[#0a4228] bg-[#0d5c3a]`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-25 dark:divide-[#213527] text-xs text-gray-800 dark:text-[#d1dcd4]">
                {soppHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                      <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-xs">Belum ada riwayat SOPP.</p>
                    </td>
                  </tr>
                ) : filteredSopps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                      <Search className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-xs">Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSoppData.map((sopp, idx) => {
                    const isEven = idx % 2 !== 0;
                    const bgClass = isEven 
                      ? "bg-slate-100 hover:bg-slate-200 dark:bg-[#213527] dark:hover:bg-[#273f2f]" 
                      : "bg-white hover:bg-slate-200 dark:bg-[#1a2b20] dark:hover:bg-[#273f2f]";
                    return (
                      <tr key={sopp.id} className={`${bgClass} transition-colors`}>
                        <td className="py-2.5 px-3 text-gray-500 dark:text-[#ffffff] font-medium text-center border border-slate-200 dark:border-[#213527]">{startIndex + idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-850 dark:text-slate-100 border border-slate-200 dark:border-[#213527]">{sopp.nomorSopp}</td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                          {sopp.tanggal ? new Date(sopp.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 dark:border-[#213527]">
                          <span className={`inline-flex w-24 justify-center py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                            sopp.type === "sewa" 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30" 
                              : sopp.type === "renovasi"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                          }`}>
                            {sopp.type === "sewa" ? "Sewa" : (sopp.type === "renovasi" ? "Renovasi" : "Pengadaan")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 dark:text-slate-350 border border-slate-200 dark:border-[#213527] max-w-[250px]">
                          <div className="truncate max-w-[230px]" title={sopp.dibayarkanKepada}>
                            {sopp.dibayarkanKepada}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600 dark:text-[#48a359] border border-slate-200 dark:border-[#213527]">
                          {sopp.jumlah ? (sopp.jumlah.toString().startsWith("Rp") ? sopp.jumlah : `Rp. ${new Intl.NumberFormat("id-ID").format(sopp.jumlah)},-`) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right border border-slate-200 dark:border-[#213527]">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handlePrintSopp(sopp)}
                              title="Cetak SOPP"
                              className="p-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLoadSopp(sopp)}
                              title="Edit SOPP"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteSopp(sopp.id)}
                                title="Hapus SOPP"
                                className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* ================= TAB 2: SURAT SERAH TERIMA TABLE (EXISTING) ================= */
            <table className="w-full text-left border-collapse min-w-[900px] text-xs">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="py-2.5 px-3 w-12 text-center border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th className="py-2.5 px-3 w-40 border border-[#0a4228] bg-[#0d5c3a]">Tanggal</th>
                  <th className="py-2.5 px-3 w-48 border border-[#0a4228] bg-[#0d5c3a]">No. Surat</th>
                  <th className="py-2.5 px-3 w-32 border border-[#0a4228] bg-[#0d5c3a]">Jenis</th>
                  <th className="py-2.5 px-3 min-w-[200px] max-w-[250px] border border-[#0a4228] bg-[#0d5c3a]">Barang Terkait</th>
                  <th className="py-2.5 px-3 min-w-[200px] max-w-[250px] border border-[#0a4228] bg-[#0d5c3a]">Pihak Terlibat</th>
                  <th className={`py-2.5 px-3 text-center ${canDelete ? "w-36" : "w-28"} border border-[#0a4228] bg-[#0d5c3a]`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-25 dark:divide-[#213527] text-xs text-gray-800 dark:text-[#d1dcd4]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                      <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-xs">Belum ada transaksi.</p>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-[#ffffff] border border-slate-200 dark:border-[#213527]">
                      <Search className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-xs">Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTrxData.map((trx, idx) => {
                    const isEven = idx % 2 !== 0;
                    const bgClass = isEven 
                      ? "bg-slate-100 hover:bg-slate-200 dark:bg-[#213527] dark:hover:bg-[#273f2f]" 
                      : "bg-white hover:bg-slate-200 dark:bg-[#1a2b20] dark:hover:bg-[#273f2f]";
                    return (
                      <tr key={trx.id} className={`${bgClass} transition-colors`}>
                        <td className="py-2.5 px-3 text-gray-500 dark:text-[#ffffff] font-medium text-center border border-slate-200 dark:border-[#213527]">{startIndex + idx + 1}</td>
                        <td className="py-2.5 px-3 text-gray-655 dark:text-[#ffffff] font-medium border border-slate-200 dark:border-[#213527]">
                          {trx.tanggal ? new Date(trx.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-850 dark:text-slate-100 border border-slate-200 dark:border-[#213527]">{trx.nomorSurat}</td>
                        <td className="py-2.5 px-3 border border-slate-200 dark:border-[#213527]">
                          <span className={`inline-flex w-24 justify-center py-0.5 rounded text-[10px] font-bold tracking-wide border ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" : "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30"}`}>{trx.jenisTransaksi}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 dark:text-slate-350 border border-slate-200 dark:border-[#213527] max-w-[250px] break-words">
                          {trx.items && trx.items.length > 0 ? (
                            <div className="line-clamp-2 text-xs break-words break-all" title={trx.items.map(i => i.nama).join(", ")}>
                              {trx.items.map((i, idx) => (
                                <span key={i.id || idx}>{i.nama} <span className="text-gray-400 dark:text-slate-500">({i.kuantitas})</span>{idx < trx.items.length - 1 ? ", " : ""}</span>
                              ))}
                            </div>
                          ) : <span className="text-gray-400 italic text-xs">-</span>}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 dark:border-[#213527]">
                          <p className="text-gray-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">{trx.pengirimNama || "?"}</p>
                          <p className="text-gray-500 dark:text-[#ffffff] flex items-center gap-1 mt-0.5 truncate max-w-[200px]"><ArrowLeft className="w-3 h-3 transform rotate-180 shrink-0" />{trx.penerimaNama || "?"}</p>
                        </td>
                        <td className="py-2.5 px-3 text-right border border-slate-200 dark:border-[#213527]">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handlePrintTrx(trx)}
                              title="Cetak Surat Serah Terima"
                              className="p-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLoadTrx(trx)}
                              title="Edit Surat Serah Terima"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteTrx(trx.id)}
                                title="Hapus Surat Serah Terima"
                                className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* UI KONTROL PAGINASI */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#213527] bg-white dark:bg-[#0c1410] flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-[#ffffff] hidden sm:inline-block">
            {activeListLength > 0 ? (
              <>
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, activeListLength)} dari {activeListLength} data
              </>
            ) : (
              "Tidak ada data"
            )}
          </span>
          {totalPages > 1 && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-[#213527] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a2b20] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-[#ffffff]" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-[#1a2b20] rounded-lg border border-gray-200 dark:border-[#213527]">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-[#213527] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a2b20] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-[#ffffff]" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1410] border border-gray-100 dark:border-[#213527] rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-650 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Konfirmasi Hapus
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-[#ffffff] mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus surat {deleteConfirm.type === "sopp" ? "SOPP" : deleteConfirm.type === "spk" ? "SPK" : "Serah Terima"} ini dari riwayat? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, type: "" })}
                className="px-4 py-2 border border-gray-200 dark:border-[#2b4533] text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-[#1a2b20] rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
