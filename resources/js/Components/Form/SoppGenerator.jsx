import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, Printer, Plus, Trash2, ClipboardList } from "lucide-react";
import { router } from "@inertiajs/react";

// Menerima parameter type untuk menentukan jenis SOPP (Pengadaan atau Sewa)
// serta setView untuk mengatur perpindahan halaman.
// Menentukan jenis SOPP berdasarkan props 'type'.
// Variabel ini digunakan sebagai acuan seluruh logika,
// seperti PPh, akun jurnal, warna header, dan judul dokumen. 
export default function SoppGenerator({ type, setView, activeTab }) {
  const isPengadaan = type === "pengadaan";
  const isTabTransition = useRef(false);
  const loadedDataRef = useRef(null);

  // Format Date to YYYY-MM-DD
  const getTodayISO = () => {
    return new Date().toISOString().split("T")[0];
  };

  // State Declarations
  const [loadedId, setLoadedId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [tanggal, setTanggal] = useState(getTodayISO());

  // Synchronize zoom to 1.0 when browser print triggers
  useEffect(() => {
    const handleBeforePrint = () => {
      const el = document.getElementById(`sopp-print-area-${type}`);
      if (el) {
        el.style.zoom = "1";
      }
    };
    const handleAfterPrint = () => {
      const el = document.getElementById(`sopp-print-area-${type}`);
      if (el) {
        el.style.zoom = zoomLevel.toString();
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [zoomLevel, type]);

  // Listen to direct print request from history (without tab switching)
  useEffect(() => {
    const handlePrintDirect = (e) => {
      const sopp = e.detail;
      if (!sopp) return;
      if (sopp.type !== type) return;

      loadedDataRef.current = {
        dasarPengenaan: sopp.dasarPengenaan !== undefined ? sopp.dasarPengenaan : "",
        nilaiPajak: sopp.nilaiPajak !== undefined ? sopp.nilaiPajak : "",
        jumlah: sopp.jumlah !== undefined ? sopp.jumlah : "",
        pajakAda: sopp.pajakAda !== undefined ? sopp.pajakAda : true,
        pphPasal: sopp.pphPasal !== undefined ? sopp.pphPasal : ""
      };

      flushSync(() => {
        setLoadedId(sopp.id || sopp.loadedId || null);
        if (sopp.nomorUrut !== undefined) setNomorUrut(sopp.nomorUrut);
        if (sopp.tanggal !== undefined) setTanggal(sopp.tanggal);
        if (sopp.unitKerja !== undefined) setUnitKerja(sopp.unitKerja);
        if (sopp.dibayarkanKepada !== undefined) setDibayarkanKepada(sopp.dibayarkanKepada);
        if (sopp.jumlah !== undefined) setJumlah(sopp.jumlah);
        if (sopp.via !== undefined) setVia(sopp.via);
        if (sopp.noRekening !== undefined) setNoRekening(sopp.noRekening);
        if (sopp.atasNama !== undefined) setAtasNama(sopp.atasNama);
        if (sopp.namaBank !== undefined) setNamaBank(sopp.namaBank);
        if (sopp.cabang !== undefined) setCabang(sopp.cabang);
        if (sopp.npwp !== undefined) setNpwp(sopp.npwp);
        if (sopp.pajakAda !== undefined) setPajakAda(sopp.pajakAda);
        if (sopp.dasarPengenaan !== undefined) setDasarPengenaan(sopp.dasarPengenaan);
        if (sopp.pphPasal !== undefined) setPphPasal(sopp.pphPasal);
        if (sopp.tarif !== undefined) setTarif(sopp.tarif);
        if (sopp.nilaiPajak !== undefined) setNilaiPajak(sopp.nilaiPajak);
        if (sopp.rows !== undefined) setRows(sopp.rows);
        if (sopp.checklist !== undefined) setChecklist(sopp.checklist);
        if (sopp.dibuatNama !== undefined) setDibuatNama(sopp.dibuatNama);
        if (sopp.dibuatJabatan !== undefined) setDibuatJabatan(sopp.dibuatJabatan);
        if (sopp.diperiksaNama !== undefined) setDiperiksaNama(sopp.diperiksaNama);
        if (sopp.diperiksaJabatan !== undefined) setDiperiksaJabatan(sopp.diperiksaJabatan);
        if (sopp.disetujuiNama !== undefined) setDisetujuiNama(sopp.disetujuiNama);
        if (sopp.disetujuiJabatan !== undefined) setDisetujuiJabatan(sopp.disetujuiJabatan);
      });

      document.body.classList.add(`print-sopp-${type}-only`);
      setTimeout(() => {
        window.print();
        document.body.classList.remove(`print-sopp-${type}-only`);
      }, 1000);
    };

    window.addEventListener("print-sopp-direct", handlePrintDirect);
    return () => {
      window.removeEventListener("print-sopp-direct", handlePrintDirect);
    };
  }, [type]);

  const resetForm = () => {
    setLoadedId(null);
    setNomorUrut("");
    setTanggal(getTodayISO());
    setUnitKerja("Logistik Kanwil VIII Jakarta");
    setDibayarkanKepada("");
    setJumlah("");
    setVia("");
    setNoRekening("");
    setAtasNama("");
    setNamaBank("");
    setCabang("");
    setNpwp("");
    setPajakAda(true);
    setDasarPengenaan("");
    setPphPasal("");
    setTarif("");
    setNilaiPajak("");
    const isSewaType = type === "sewa";
    setRows([
      { id: 1, kode: isSewaType ? "514.13.05" : "144.01.01", uraian: isSewaType ? "Biaya Sewa" : "Pembelian", debet: "", kredit: "" },
      { id: 2, kode: "214.02.02", uraian: isSewaType ? "Pajak PPN 11%" : "PPN 11%", debet: "", kredit: "" },
      { id: 3, kode: isSewaType ? "214.02.03" : "214.01.08", uraian: isSewaType ? "Pajak Pph 23" : "PPh 22", debet: "", kredit: "" },
      { id: 4, kode: "112.01.03", uraian: "Bank BRI", debet: "", kredit: "" }
    ]);
    setChecklist({
      tagihan: true,
      fakturPajak: true,
      suratJalan: false,
      spk: false,
      kwitansi: true,
      bast: true,
      sopp: true,
      bap: false,
      soa: true,
      foto: false,
      lainLain: false,
      lainLainText: ""
    });
    setDibuatNama("ZONI RAHMAWAN PUTRA");
    setDibuatJabatan("Kabag Pengadaan & Logistik");
    setDiperiksaNama("MAMAN SURATMAN");
    setDiperiksaJabatan("Kadept Logistik & Umum");
    setDisetujuiNama("PRABOWO JADI SUBROTO");
    setDisetujuiJabatan("Deputy Operasional");
  };

  // Load selected SOPP from history if set
  useEffect(() => {
    if (activeTab !== (type === "sewa" ? "sopp_sewa" : "sopp_pengadaan")) return;

    try {
      const dataStr = localStorage.getItem("selected_sopp_to_edit");
      if (dataStr) {
        if (dataStr === "NEW") {
          resetForm();
        } else {
          const sopp = JSON.parse(dataStr);
          loadedDataRef.current = {
            dasarPengenaan: sopp.dasarPengenaan !== undefined ? sopp.dasarPengenaan : "",
            nilaiPajak: sopp.nilaiPajak !== undefined ? sopp.nilaiPajak : "",
            jumlah: sopp.jumlah !== undefined ? sopp.jumlah : "",
            pajakAda: sopp.pajakAda !== undefined ? sopp.pajakAda : true,
            pphPasal: sopp.pphPasal !== undefined ? sopp.pphPasal : ""
          };
          setLoadedId(sopp.id || sopp.loadedId || null);
          if (sopp.nomorUrut !== undefined) setNomorUrut(sopp.nomorUrut);
          if (sopp.tanggal !== undefined) setTanggal(sopp.tanggal);
          if (sopp.unitKerja !== undefined) setUnitKerja(sopp.unitKerja);
          if (sopp.dibayarkanKepada !== undefined) setDibayarkanKepada(sopp.dibayarkanKepada);
          if (sopp.jumlah !== undefined) setJumlah(sopp.jumlah);
          if (sopp.via !== undefined) setVia(sopp.via);
          if (sopp.noRekening !== undefined) setNoRekening(sopp.noRekening);
          if (sopp.atasNama !== undefined) setAtasNama(sopp.atasNama);
          if (sopp.namaBank !== undefined) setNamaBank(sopp.namaBank);
          if (sopp.cabang !== undefined) setCabang(sopp.cabang);
          if (sopp.npwp !== undefined) setNpwp(sopp.npwp);
          if (sopp.pajakAda !== undefined) setPajakAda(sopp.pajakAda);
          if (sopp.dasarPengenaan !== undefined) setDasarPengenaan(sopp.dasarPengenaan);
          if (sopp.pphPasal !== undefined) setPphPasal(sopp.pphPasal);
          if (sopp.tarif !== undefined) setTarif(sopp.tarif);
          if (sopp.nilaiPajak !== undefined) setNilaiPajak(sopp.nilaiPajak);
          if (sopp.rows !== undefined) setRows(sopp.rows);
          if (sopp.checklist !== undefined) setChecklist(sopp.checklist);
          if (sopp.dibuatNama !== undefined) setDibuatNama(sopp.dibuatNama);
          if (sopp.dibuatJabatan !== undefined) setDibuatJabatan(sopp.dibuatJabatan);
          if (sopp.diperiksaNama !== undefined) setDiperiksaNama(sopp.diperiksaNama);
          if (sopp.diperiksaJabatan !== undefined) setDiperiksaJabatan(sopp.diperiksaJabatan);
          if (sopp.disetujuiNama !== undefined) setDisetujuiNama(sopp.disetujuiNama);
          if (sopp.disetujuiJabatan !== undefined) setDisetujuiJabatan(sopp.disetujuiJabatan);

          // Check if print flag is active
          const shouldPrint = localStorage.getItem("selected_sopp_to_print");
          if (shouldPrint) {
            localStorage.removeItem("selected_sopp_to_print");
            document.body.classList.add(`print-sopp-${type}-only`);
            setTimeout(() => {
              window.print();
              document.body.classList.remove(`print-sopp-${type}-only`);
            }, 650);
          }
        }

        // Clean up immediately
        localStorage.removeItem("selected_sopp_to_edit");
      }
    } catch (e) {
      console.error("Failed to load selected SOPP for editing:", e);
    }
  }, [activeTab, type]);

  // Listen to load document events for instant edits/resets
  useEffect(() => {
    const handleLoadEvent = (e) => {
      const data = e.detail;
      if (!data) return;

      if (data === "NEW") {
        resetForm();
      } else if (data.type === type) {
        loadedDataRef.current = {
          dasarPengenaan: data.dasarPengenaan !== undefined ? data.dasarPengenaan : "",
          nilaiPajak: data.nilaiPajak !== undefined ? data.nilaiPajak : "",
          jumlah: data.jumlah !== undefined ? data.jumlah : "",
          pajakAda: data.pajakAda !== undefined ? data.pajakAda : true,
          pphPasal: data.pphPasal !== undefined ? data.pphPasal : ""
        };
        setLoadedId(data.id || data.loadedId || null);
        if (data.nomorUrut !== undefined) setNomorUrut(data.nomorUrut);
        if (data.tanggal !== undefined) setTanggal(data.tanggal);
        if (data.unitKerja !== undefined) setUnitKerja(data.unitKerja);
        if (data.dibayarkanKepada !== undefined) setDibayarkanKepada(data.dibayarkanKepada);
        if (data.jumlah !== undefined) setJumlah(data.jumlah);
        if (data.via !== undefined) setVia(data.via);
        if (data.noRekening !== undefined) setNoRekening(data.noRekening);
        if (data.atasNama !== undefined) setAtasNama(data.atasNama);
        if (data.namaBank !== undefined) setNamaBank(data.namaBank);
        if (data.cabang !== undefined) setCabang(data.cabang);
        if (data.npwp !== undefined) setNpwp(data.npwp);
        if (data.pajakAda !== undefined) setPajakAda(data.pajakAda);
        if (data.dasarPengenaan !== undefined) setDasarPengenaan(data.dasarPengenaan);
        if (data.pphPasal !== undefined) setPphPasal(data.pphPasal);
        if (data.tarif !== undefined) setTarif(data.tarif);
        if (data.nilaiPajak !== undefined) setNilaiPajak(data.nilaiPajak);
        if (data.rows !== undefined) setRows(data.rows);
        if (data.checklist !== undefined) setChecklist(data.checklist);
        if (data.dibuatNama !== undefined) setDibuatNama(data.dibuatNama);
        if (data.dibuatJabatan !== undefined) setDibuatJabatan(data.dibuatJabatan);
        if (data.diperiksaNama !== undefined) setDiperiksaNama(data.diperiksaNama);
        if (data.diperiksaJabatan !== undefined) setDiperiksaJabatan(data.diperiksaJabatan);
        if (data.disetujuiNama !== undefined) setDisetujuiNama(data.disetujuiNama);
        if (data.disetujuiJabatan !== undefined) setDisetujuiJabatan(data.disetujuiJabatan);
      }
    };

    window.addEventListener("load-sopp-document", handleLoadEvent);
    return () => {
      window.removeEventListener("load-sopp-document", handleLoadEvent);
    };
  }, [type]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nomorUrut, setNomorUrut] = useState("");
  const [unitKerja, setUnitKerja] = useState("Logistik Kanwil VIII Jakarta");

  const [dibayarkanKepada, setDibayarkanKepada] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [via, setVia] = useState(""); // Kas, Cek, BG

  // Bank Details
  const [noRekening, setNoRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [namaBank, setNamaBank] = useState("");
  const [cabang, setCabang] = useState("");
  const [npwp, setNpwp] = useState("");

  // Pajak & Dasar Pengenaan
  const [pajakAda, setPajakAda] = useState(true); // true = Ada, false = Tidak ada
  const [dasarPengenaan, setDasarPengenaan] = useState("");
  const [pphPasal, setPphPasal] = useState("");
  const [tarif, setTarif] = useState(type === "sewa" ? "" : "");
  const [nilaiPajak, setNilaiPajak] = useState("");

  const [rows, setRows] = useState(() => {
    const isSewa = type === "sewa";
    return [
      { id: 1, kode: isSewa ? "514.13.05" : "144.01.01", uraian: isSewa ? "Biaya Sewa" : "Pembelian", debet: "", kredit: "" },
      { id: 2, kode: "214.02.02", uraian: isSewa ? "Pajak PPN 11%" : "PPN 11%", debet: "", kredit: "" },
      { id: 3, kode: isSewa ? "214.02.03" : "214.01.08", uraian: isSewa ? "Pajak Pph 23" : "PPh 22", debet: "", kredit: "" },
      { id: 4, kode: "112.01.03", uraian: "Bank BRI", debet: "", kredit: "" }
    ];
  });

  // Menentukan jenis SOPP berdasarkan props 'type'.
  // Variabel ini digunakan sebagai acuan seluruh logika,
  // seperti PPh, akun jurnal, warna header, dan judul dokumen.
  const isSewa = type === "sewa";
  const headerBgColor = isSewa ? "#92d050" : "#90c5e3";

  const getJumlahDisplay = () => {
    const bankRow = rows.find(r => r.uraian?.toLowerCase().includes("bank bri") || r.kode === "112.01.03");
    return bankRow ? bankRow.kredit : "";
  };

  useEffect(() => {
    if (activeTab === (type === "sewa" ? "sopp_sewa" : "sopp_pengadaan")) {
      isTabTransition.current = true;
    }
  }, [activeTab, type]);

  useEffect(() => {
    if (isTabTransition.current) {
      isTabTransition.current = false;
      return;
    }
    if (loadedDataRef.current) {
      const cleanStateDP = String(dasarPengenaan || "").replace(/[^0-9]/g, "");
      const cleanRefDP = String(loadedDataRef.current.dasarPengenaan || "").replace(/[^0-9]/g, "");

      const cleanStateNP = String(nilaiPajak || "").replace(/[^0-9]/g, "");
      const cleanRefNP = String(loadedDataRef.current.nilaiPajak || "").replace(/[^0-9]/g, "");

      const cleanStateJml = String(jumlah || "").replace(/[^0-9]/g, "");
      const cleanRefJml = String(loadedDataRef.current.jumlah || "").replace(/[^0-9]/g, "");

      const isIdentical =
        cleanStateDP === cleanRefDP &&
        cleanStateNP === cleanRefNP &&
        cleanStateJml === cleanRefJml &&
        Boolean(pajakAda) === Boolean(loadedDataRef.current.pajakAda) &&
        String(pphPasal || "") === String(loadedDataRef.current.pphPasal || "");

      if (isIdentical) {
        return;
      } else {
        loadedDataRef.current = null;
      }
    }

    const cleanDP = String(dasarPengenaan || "").replace(/[^0-9]/g, "");
    const cleanNP = String(nilaiPajak || "").replace(/[^0-9]/g, "");
    const cleanJml = String(jumlah || "").replace(/[^0-9]/g, "");

    const dp = parseFloat(cleanDP) || 0;
    const np = parseFloat(cleanNP) || 0;
    const jml = parseFloat(cleanJml) || 0;
    const ppnVal = pajakAda ? Math.round((dp * 11) / 111) : 0;
    const bankVal = pajakAda ? (dp - ppnVal - np) : jml;

    // Automatically sync jumlah if pajakAda is true
    if (pajakAda && bankVal > 0) {
      const bankValStr = String(bankVal);
      if (jumlah !== bankValStr) {
        setJumlah(bankValStr);
      }
    }

    setRows(prev => {
      const defaultR1Kode = isSewa ? "514.13.05" : "144.01.01";
      const defaultR1Uraian = isSewa ? "Biaya Sewa" : "Pembelian";
      const defaultR2Uraian = isSewa ? "Pajak PPN 11%" : "PPN 11%";
      const defaultR3Kode = isSewa ? "214.02.03" : "214.01.08";
      const defaultR3Uraian = isSewa
        ? `Pajak Pph ${pphPasal || "23"}`
        : `PPh ${pphPasal || "22"}`;

      const r1 = prev.find(r => r.id === 1 || r.kode === defaultR1Kode) || { id: 1, kode: defaultR1Kode, uraian: defaultR1Uraian, debet: "", kredit: "" };
      const r2 = prev.find(r => r.id === 2 || r.kode === "214.02.02") || { id: 2, kode: "214.02.02", uraian: defaultR2Uraian, debet: "", kredit: "" };
      const r3 = prev.find(r => r.id === 3 || r.kode === defaultR3Kode) || { id: 3, kode: defaultR3Kode, uraian: defaultR3Uraian, debet: "", kredit: "" };
      const r4 = prev.find(r => r.id === 4 || r.kode === "112.01.03") || { id: 4, kode: "112.01.03", uraian: "Bank BRI", debet: "", kredit: "" };

      const customRows = prev.filter(r => r.id !== 1 && r.id !== 2 && r.id !== 3 && r.id !== 4);

      return [
        {
          ...r1,
          id: 1,
          kode: r1.kode || defaultR1Kode,
          uraian: r1.uraian || defaultR1Uraian,
          debet: pajakAda ? (dp ? String(dp) : "") : (jml ? String(jml) : ""),
          kredit: ""
        },
        {
          ...r2,
          id: 2,
          kode: r2.kode || "214.02.02",
          uraian: r2.uraian || defaultR2Uraian,
          debet: "",
          kredit: pajakAda ? (ppnVal ? String(ppnVal) : "") : ""
        },
        {
          ...r3,
          id: 3,
          kode: r3.kode || defaultR3Kode,
          uraian: r3.uraian || defaultR3Uraian,
          debet: "",
          kredit: pajakAda ? (np ? String(np) : "") : ""
        },
        ...customRows,
        {
          ...r4,
          id: 4,
          kode: r4.kode || "112.01.03",
          uraian: r4.uraian || "Bank BRI",
          debet: "",
          kredit: bankVal ? String(bankVal) : ""
        }
      ];
    });
  }, [dasarPengenaan, nilaiPajak, jumlah, pajakAda, pphPasal, dibayarkanKepada, isSewa]);

  useEffect(() => {
    if (rows.length < 2) return;

    const pembelianRow = rows[0];
    const bankRow = rows[rows.length - 1];

    if (bankRow) {
      const cleanDebet = String(pembelianRow?.debet || "").replace(/[^0-9]/g, "");
      const debetPembelian = parseFloat(cleanDebet) || 0;

      let totalKreditPajak = 0;
      for (let i = 1; i < rows.length - 1; i++) {
        const cleanKredit = String(rows[i].kredit || "").replace(/[^0-9]/g, "");
        totalKreditPajak += parseFloat(cleanKredit) || 0;
      }

      const calculatedBankKredit = debetPembelian - totalKreditPajak;
      const cleanBankKredit = String(bankRow.kredit || "").replace(/[^0-9]/g, "");
      const currentBankKredit = parseFloat(cleanBankKredit) || 0;

      if (calculatedBankKredit !== currentBankKredit) {
        setRows(prev => prev.map((r, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...r,
              kredit: calculatedBankKredit > 0 ? String(calculatedBankKredit) : ""
            };
          }
          return r;
        }));
      }
    }
  }, [rows]);

  const scrollToPreviewField = (selectorId) => {
    const container = document.getElementById(`sopp-preview-scroll-container-${type}`);
    const target = document.getElementById(`${selectorId}-${type}`);
    if (container && target) {
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({
        top: relativeTop - containerRect.height / 3,
        behavior: "smooth"
      });
    }
  };

  // Document Checklist State
  const [checklist, setChecklist] = useState({
    tagihan: true,
    fakturPajak: true,
    suratJalan: false,
    spk: false,
    kwitansi: true,
    bast: true,
    sopp: true,
    bap: false,
    soa: true,
    foto: false,
    lainLain: false,
    lainLainText: ""
  });

  // Signature Block State
  const [dibuatNama, setDibuatNama] = useState("ZONI RAHMAWAN PUTRA");
  const [dibuatJabatan, setDibuatJabatan] = useState("Kabag Pengadaan & Logistik");
  const [diperiksaNama, setDiperiksaNama] = useState("MAMAN SURATMAN");
  const [diperiksaJabatan, setDiperiksaJabatan] = useState("Kadept Logistik & Umum");
  const [disetujuiNama, setDisetujuiNama] = useState("PRABOWO JADI SUBROTO");
  const [disetujuiJabatan, setDisetujuiJabatan] = useState("Deputy Operasional");

  // Format date to DD-MMM-YY (e.g. 08-Jul-26)
  const formatDatePreview = (dateStr) => {
    if (!dateStr) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Dynamic real-time calculation of Month (MM) and Year (YYYY) for suffix
  const getDynamicSuffix = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return "/SOPP-00108.00/2026";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `/SOPP-00108.${month}/${year}`;
  };

  // Helper to format currency
  const formatNumberDot = (numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num) || num === 0) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatRupiah = (numStr) => {
    const formatted = formatNumberDot(numStr);
    if (!formatted) return "";
    return `Rp${formatted}`;
  };

  const formatRibuan = (value) => {
    if (value === null || value === undefined) return "";
    const cleanVal = String(value).replace(/[^0-9]/g, "");
    if (!cleanVal) return "";
    return new Intl.NumberFormat("id-ID").format(parseFloat(cleanVal));
  };

  const parseRibuan = (formattedValue) => {
    return formattedValue.replace(/[^0-9]/g, "");
  };

  const handleRowChange = (id, field, value) => {
    setRows(prev => prev.map(row => row.id === id ? { ...prev.find(r => r.id === id), [field]: value } : row));
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows(prev => [...prev, { id: newId, kode: "", uraian: "", debet: "0", kredit: "0" }]);
  };

  const removeRow = (id) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const saveToHistory = (silent = false, onSuccessCallback = null) => {
    setIsSubmitting(true);
    const startTime = Date.now();
    try {
      const currentNomor = nomorUrut ? `${nomorUrut}${getDynamicSuffix(tanggal)}` : `SOPP-DRAFT-${Date.now()}`;

      const newEntry = {
        id: loadedId || null,
        nomorSopp: currentNomor,
        tanggal: tanggal,
        dibayarkanKepada: dibayarkanKepada || "Penerima/Rekanan",
        type: type, // "pengadaan" or "sewa"
        jumlah: getJumlahDisplay() || jumlah || "0",

        // Full state
        nomorUrut,
        unitKerja,
        via,
        noRekening,
        atasNama,
        namaBank,
        cabang,
        npwp,
        pajakAda,
        dasarPengenaan,
        pphPasal,
        tarif,
        nilaiPajak,
        rows: rows.filter(row => {
          if (!pajakAda && (row.id === 2 || row.id === 3 || row.kode === "214.02.02" || row.kode === "214.01.08" || row.kode === "214.02.03")) {
            return false;
          }
          return true;
        }),
        checklist,
        dibuatNama,
        dibuatJabatan,
        diperiksaNama,
        diperiksaJabatan,
        disetujuiNama,
        disetujuiJabatan
      };

      axios.post('/sopp-histories', newEntry)
        .then(async (res) => {
          if (res.data && res.data.id) {
            setLoadedId(res.data.id);
            window.dispatchEvent(new CustomEvent("sopp-saved-to-db", { detail: res.data.id }));
          }
          
          // Enforce a minimum 6-second delay when submitting (has success callback)
          if (onSuccessCallback) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 6000 - elapsedTime);
            await new Promise((resolve) => setTimeout(resolve, remainingTime));
          }

          setIsSubmitting(false);
          if (!silent) {
            alert("Dokumen SOPP berhasil disimpan ke riwayat.");
          }
          if (onSuccessCallback) {
            onSuccessCallback(res.data);
          }
        })
        .catch((err) => {
          setIsSubmitting(false);
          console.error("Failed to save SOPP to DB:", err);
          if (!silent) {
            alert("Gagal menyimpan dokumen SOPP ke riwayat.");
          }
        });
    } catch (e) {
      setIsSubmitting(false);
      console.error("Failed to save SOPP history:", e);
      if (!silent) {
        alert("Gagal menyimpan dokumen SOPP ke riwayat.");
      }
    }
  };

  const handleSubmitHistory = () => {
    localStorage.setItem("show_sopp_success_toast", "true");
    localStorage.setItem("riwayat_active_tab", "sopp");
    saveToHistory(true, (savedData) => {
      window.dispatchEvent(
        new CustomEvent("optimistic-sopp-added", {
          detail: savedData,
        })
      );

      if (setView) {
        setView("riwayat");
      }
    });
  };

  const handleSaveHistoryOnly = () => {
    saveToHistory(false);
  };

  const handlePrint = () => {
    saveToHistory(true, () => {
      document.body.classList.add(`print-sopp-${type}-only`);
      window.print();
      setTimeout(() => {
        document.body.classList.remove(`print-sopp-${type}-only`);
      }, 650);
    });
  };

  const totalDebet = rows.reduce((sum, r) => {
    const cleanVal = String(r.debet || "").replace(/[^0-9]/g, "");
    return sum + (parseFloat(cleanVal) || 0);
  }, 0);
  const totalKredit = rows.reduce((sum, r) => {
    const cleanVal = String(r.kredit || "").replace(/[^0-9]/g, "");
    return sum + (parseFloat(cleanVal) || 0);
  }, 0);

  const abs = (left, top, width, height) => ({
    position: "absolute",
    left: `${left}pt`,
    top: `${top}pt`,
    width: `${width}pt`,
    height: height != null ? `${height}pt` : undefined
  });

  const fieldBox = (left, top, width, height = 12, align = "center") => ({
    ...abs(left, top, width, height),
    border: "0.75pt solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: align === "center" ? "center" : "flex-start",
    paddingLeft: align === "center" ? 0 : "2pt",
    fontSize: "7.8pt",
    fontFamily: "inherit",
    boxSizing: "border-box",
    overflow: "hidden",
    whiteSpace: "nowrap"
  });

  const checkbox = (left, top, width, height = 12, checked) => (
    <div
      style={{
        ...abs(left, top, width, height),
        border: "0.75pt solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "9pt",
        fontWeight: 700,
        boxSizing: "border-box"
      }}
    >
      {checked ? "X" : ""}
    </div>
  );

  const label = (left, top, width, text, bold = false, id = undefined) => (
    <div
      id={id ? `${id}-${type}` : undefined}
      style={{
        ...abs(left, top, width),
        fontSize: "7.8pt",
        fontWeight: bold ? 700 : 400,
        whiteSpace: "nowrap"
      }}
    >
      {text}
    </div>
  );

  const blackMark = (top) => (
    <div style={{ ...abs(26.3, top, 10.8, 12), background: "#000" }} />
  );

  // Kolom tabel jurnal (lebar exact dari PDF, total = 517.3pt)
  const TABLE_LEFT = 60.4;
  const TABLE_TOP = 313.3;
  const COL_NO = 21.9;
  const COL_KODE = 107.5;
  const COL_URAIAN = 257.2;
  const COL_DEBET = 62;
  const COL_KREDIT = 68.7;
  const HEADER_H = 12;
  const ROW_H = 11.3;

  // Checklist grid
  const CHK_ROW_H = 22.6;
  const CHK_TOP0 = 414.8;
  const chkCol1 = [
    { key: "tagihan", text: "Surat permohonan tagihan dari rekanan" },
    { key: "suratJalan", text: "Faktur surat jalan termasuk harga satuan" },
    { key: "kwitansi", text: "Kwitansi/Invoice bermeterai" },
    { key: "sopp", text: "SOPP" },
    { key: "soa", text: "SOA" }
  ];
  const chkCol2 = [
    { key: "fakturPajak", text: "Faktur Pajak" },
    { key: "spk", text: "Surat Perintah Kerja" },
    { key: "bast", text: "Berita Acara Serah Terima Barang/pekerjaan" },
    { key: "bap", text: "Berita Acara Pemeriksaan" },
    { key: "foto", text: "Foto pekerjaan" }
  ];

  // Pusat kolom tanda tangan (exact dari PDF, tidak sama lebar / tidak simetris grid 3 kolom biasa)
  const sigCols = [
    { center: 125.8, label: "Dibuat oleh", nama: dibuatNama, jabatan: dibuatJabatan },
    { center: 342.1, label: "Diperiksa oleh", nama: diperiksaNama, jabatan: diperiksaJabatan },
    { center: 505.0, label: "Disetujui (otorisator)", nama: disetujuiNama, jabatan: disetujuiJabatan }
  ];
  const SIG_COL_WIDTH = 170;

  return (
    <div className="max-w-7xl mx-auto mt-6">
      {/* Stylesheet scoped to print target */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.print-sopp-${type}-only #sopp_${type},
          body.print-sopp-${type}-only #sopp-preview-scroll-container-${type} {
            display: block !important;
          }
          body.print-sopp-${type}-only * { visibility: hidden !important; }
          body.print-sopp-${type}-only #sopp-print-area-${type},
          body.print-sopp-${type}-only #sopp-print-area-${type} * { visibility: visible !important; color: #000000 !important; }
          body.print-sopp-${type}-only #sopp-print-area-${type} {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            background: #ffffff !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            zoom: 1 !important;
          }
        }
      `}</style>

      {/* HEADER BAR */}
      <div className="bg-white dark:bg-[#0c1410] rounded-2xl shadow-sm border border-gray-100 dark:border-[#213527] mb-6 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              SOPP - Otorisasi Pembayaran ({isSewa ? "Sewa" : "Pengadaan"})
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
              Kelola dokumen otorisasi permintaan pembayaran dengan template persis cetak.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSubmitHistory}
            disabled={isSubmitting}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : "Submit"}
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* INPUT EDITOR (LEFT PANEL) */}
        <div className="xl:col-span-5 space-y-6 max-h-[85vh] overflow-y-auto pr-1 custom-scrollbar no-print">

          {/* Section 1: Info Dokumen */}
          <div className="bg-white dark:bg-[#0c1410] rounded-2xl border border-gray-100 dark:border-[#213527] p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-gray-100 dark:border-[#213527] pb-2">
              Informasi Umum
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Nomor Urut
                </label>
                <input
                  type="text"
                  value={nomorUrut}
                  onChange={(e) => setNomorUrut(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-nomor-urut")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-tanggal")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                Nama Unit Kerja / Divisi
              </label>
              <input
                type="text"
                value={unitKerja}
                onChange={(e) => setUnitKerja(e.target.value)}
                onFocus={() => scrollToPreviewField("pv-unit-kerja")}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Pembayaran */}
          <div className="bg-white dark:bg-[#0c1410] rounded-2xl border border-gray-100 dark:border-[#213527] p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-gray-100 dark:border-[#213527] pb-2">
              Pembayaran & Rekening
            </h3>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                Dibayarkan Kepada
              </label>
              <input
                type="text"
                value={dibayarkanKepada}
                onChange={(e) => setDibayarkanKepada(e.target.value)}
                onFocus={() => scrollToPreviewField("pv-dibayarkan-kepada")}
                className="w-[400px] h-[50px] px-3 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Jumlah (Nominal Rp)
                </label>
                <input
                  type="text"
                  value={formatRibuan(getJumlahDisplay())}
                  onChange={(e) => setJumlah(parseRibuan(e.target.value))}
                  onFocus={() => scrollToPreviewField("pv-jumlah")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Via Pembayaran
                </label>
                <select
                  value={via}
                  onChange={(e) => setVia(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                >
                  <option value="Kas">Kas</option>
                  <option value="Cek">Cek</option>
                  <option value="BG">BG (Bilyet Giro)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 dark:border-[#213527] pt-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={noRekening}
                  onChange={(e) => setNoRekening(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-nomor-rekening")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Atas Nama Rekening
                </label>
                <input
                  type="text"
                  value={atasNama}
                  onChange={(e) => setAtasNama(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-nomor-rekening")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-nama-bank")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  Cabang Bank
                </label>
                <input
                  type="text"
                  value={cabang}
                  onChange={(e) => setCabang(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-nama-bank")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  NPWP (Bila Ada)
                </label>
                <input
                  type="text"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-npwp")}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3] focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pajak & Dasar Pengenaan */}
          <div className="bg-white dark:bg-[#0c1410] rounded-2xl border border-gray-100 dark:border-[#213527] p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-gray-100 dark:border-[#213527] pb-2">
              Pajak & Dasar Pengenaan
            </h3>

            <div className="flex gap-4 items-center">
              <span className="text-xs text-gray-700 dark:text-slate-300">Pajak:</span>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="radio"
                  name="pajakAda"
                  checked={pajakAda}
                  onChange={() => {
                    setPajakAda(true);
                    setChecklist(prev => ({ ...prev, fakturPajak: true }));
                  }}
                  onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                  className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Ada
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="radio"
                  name="pajakAda"
                  checked={!pajakAda}
                  onChange={() => {
                    setPajakAda(false);
                    setChecklist(prev => ({ ...prev, fakturPajak: false }));
                  }}
                  onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                  className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Tidak ada
              </label>
            </div>

            {pajakAda && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                    Dasar Pengenaan (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatRibuan(dasarPengenaan)}
                    onChange={(e) => setDasarPengenaan(parseRibuan(e.target.value))}
                    onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                    PPh Pasal
                  </label>
                  <input
                    type="text"
                    value={pphPasal}
                    onChange={(e) => setPphPasal(e.target.value)}
                    onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                    Tarif (%)
                  </label>
                  <input
                    type="text"
                    value={tarif}
                    onChange={(e) => setTarif(e.target.value)}
                    onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                    Nilai Pajak (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatRibuan(nilaiPajak)}
                    onChange={(e) => setNilaiPajak(parseRibuan(e.target.value))}
                    onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Tabel Rincian */}
          <div className="bg-white dark:bg-[#0c1410] rounded-2xl border border-gray-100 dark:border-[#213527] p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#213527] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Rincian Perkiraan
              </h3>
              <button
                onClick={addRow}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-3">
              {rows.filter(row => {
                if (!pajakAda && (row.id === 2 || row.id === 3 || row.kode === "214.02.02" || row.kode === "214.01.08" || row.kode === "214.02.03")) {
                  return false;
                }
                return true;
              }).map((row, index) => (
                <div key={row.id} className="border border-gray-100 dark:border-[#213527] rounded-xl p-3 space-y-2 relative bg-gray-50/50 dark:bg-[#0f1712]/30">
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    className="absolute right-3 top-3 text-red-500 hover:text-red-700 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-[10px] font-bold text-gray-400">Baris {index + 1}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase">Kode Perkiraan</label>
                      <input
                        type="text"
                        value={row.kode}
                        onChange={(e) => handleRowChange(row.id, "kode", e.target.value)}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className="w-full p-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-md text-gray-800 dark:text-[#f1f5f3] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase">Uraian</label>
                      <input
                        type="text"
                        value={row.uraian}
                        onChange={(e) => handleRowChange(row.id, "uraian", e.target.value)}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className="w-full p-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-md text-gray-800 dark:text-[#f1f5f3]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase">Debet (Rp)</label>
                      <input
                        type="text"
                        value={formatRibuan(row.debet)}
                        onChange={(e) => handleRowChange(row.id, "debet", parseRibuan(e.target.value))}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className="w-full p-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-md text-gray-800 dark:text-[#f1f5f3]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase">Kredit (Rp)</label>
                      <input
                        type="text"
                        value={formatRibuan(row.kredit)}
                        onChange={(e) => handleRowChange(row.id, "kredit", parseRibuan(e.target.value))}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className="w-full p-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-md text-gray-800 dark:text-[#f1f5f3]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Kelengkapan Dokumen */}
          <div className="bg-white dark:bg-[#0c1410] rounded-2xl border border-gray-100 dark:border-[#213527] p-6 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-gray-100 dark:border-[#213527] pb-2">
              Kelengkapan Dokumen (Checklist)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.keys(checklist).filter(key => key !== "lainLainText").map((key) => (
                <label key={key} className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 cursor-pointer p-1 rounded-md hover:bg-gray-50 dark:hover:bg-[#1a2b20]/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist[key]}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                    onFocus={() => scrollToPreviewField("pv-kelengkapan-dokumen")}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="capitalize">{
                    key === "tagihan" ? "Surat Permohonan Tagihan"
                      : key === "fakturPajak" ? "Faktur Pajak"
                        : key === "suratJalan" ? "Faktur Surat Jalan"
                          : key === "spk" ? "Surat Perintah Kerja (SPK)"
                            : key === "kwitansi" ? "Kwitansi / Invoice"
                              : key === "bast" ? "BAST Pekerjaan"
                                : key === "sopp" ? "SOPP"
                                  : key === "bap" ? "BAP Pemeriksaan"
                                    : key === "soa" ? "SOA"
                                      : key === "foto" ? "Foto Pekerjaan"
                                        : "Lain-lain"
                  }</span>
                </label>
              ))}
            </div>

            {checklist.lainLain && (
              <div className="pt-2">
                <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-1">
                  Nama Dokumen Lainnya
                </label>
                <input
                  type="text"
                  value={checklist.lainLainText}
                  onChange={(e) => setChecklist(prev => ({ ...prev, lainLainText: e.target.value }))}
                  onFocus={() => scrollToPreviewField("pv-kelengkapan-dokumen")}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg outline-none text-gray-800 dark:text-[#f1f5f3]"
                  placeholder="Sebutkan..."
                />
              </div>
            )}
          </div>

          {/* Section 6: Penandatangan */}
          <div className="bg-white dark:bg-[#0c1410] rounded-2xl border border-gray-100 dark:border-[#213527] p-6 space-y-4 shadow-2xs pb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-gray-100 dark:border-[#213527] pb-2">
              Penandatangan Dokumen
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Dibuat Oleh</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={dibuatNama} onChange={(e) => setDibuatNama(e.target.value)} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Nama" className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg text-gray-800 dark:text-[#f1f5f3]" />
                  <input type="text" value={dibuatJabatan} onChange={(e) => setDibuatJabatan(e.target.value)} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Jabatan" className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg text-gray-800 dark:text-[#f1f5f3]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Diperiksa Oleh</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={diperiksaNama} onChange={(e) => setDiperiksaNama(e.target.value)} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Nama" className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg text-gray-800 dark:text-[#f1f5f3]" />
                  <input type="text" value={diperiksaJabatan} onChange={(e) => setDiperiksaJabatan(e.target.value)} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Jabatan" className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg text-gray-800 dark:text-[#f1f5f3]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Disetujui Oleh</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={disetujuiNama} onChange={(e) => setDisetujuiNama(e.target.value)} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Nama" className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg text-gray-800 dark:text-[#f1f5f3]" />
                  <input type="text" value={disetujuiJabatan} onChange={(e) => setDisetujuiJabatan(e.target.value)} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Jabatan" className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-lg text-gray-800 dark:text-[#f1f5f3]" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PRINTABLE PREVIEW PANEL (RIGHT PANEL) */}
         <div id={`sopp-preview-scroll-container-${type}`} className="xl:col-span-7 flex flex-col items-center overflow-y-auto w-full pr-2 max-h-[90vh]">
          {/* Zoom Control Bar */}
          <div className="w-full max-w-[210mm] bg-white border border-gray-200 shadow-sm p-3 rounded-xl mb-4 flex flex-col sm:flex-row items-center justify-between no-print text-xs gap-3 select-none">
            <div className="flex items-center gap-2 text-gray-700 font-semibold w-full sm:w-auto justify-between sm:justify-start">
              <span>🔎 Ukuran Pratinjau:</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-32 accent-emerald-600 cursor-pointer"
              />
              <span className="font-mono w-10 text-right">{Math.round(zoomLevel * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition-colors"
                title="Perkecil"
              >
                -
              </button>
              <button
                onClick={() => setZoomLevel(0.85)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold transition-colors"
                title="Reset ke Default"
              >
                85%
              </button>
              <button
                onClick={() => setZoomLevel(1.0)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold transition-colors"
                title="Ukuran Nyata"
              >
                100%
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition-colors"
                title="Perbesar"
              >
                +
              </button>
          </div>
        </div>
        {/* The Document Paper */}
        <div 
          className="w-full flex justify-center print:h-auto print:overflow-visible shrink-0" 
          style={{ height: `${842 * zoomLevel + 24}pt`, overflow: 'hidden' }}
        >
          <div
            id={`sopp-print-area-${type}`}
            style={{ width: "595pt", height: "842pt", position: "relative", fontFamily: "'Arial Narrow', 'Arial', sans-serif", zoom: zoomLevel }}
            className="bg-white border border-gray-300 shadow-md text-black select-none flex-shrink-0"
          >
            {/* Tanda registrasi hitam (persis posisi PDF asli) */}
            {blackMark(144.1)}
            {blackMark(166.7)}
            {blackMark(189.2)}
            {blackMark(245.6)}
            {blackMark(268.2)}
            {blackMark(392.6)}

            {/* JUDUL DOKUMEN */}
            <div style={{ ...abs(0, 55.8, 612), textAlign: "center", fontSize: "8.6pt", fontWeight: 800, letterSpacing: "0.3pt" }}>
              SURAT OTORISASI PERMINTAAN PEMBAYARAN
            </div>
            <div style={{ ...abs(0, 67.1, 612), textAlign: "center", fontSize: "7.8pt", fontWeight: 400, color: "#000000" }}>
              (Otorisasi Pembayaran)
            </div>
            <div id={`pv-nomor-urut-${type}`} style={{ ...abs(0, 78.4, 612), textAlign: "center", fontSize: "7.8pt", fontWeight: 400 }}>
              Nomor : {nomorUrut}{getDynamicSuffix(tanggal)}
            </div>

            {/* Tanggal */}
            {label(62.2, 101.6, 85, "Tanggal", false, "pv-tanggal")}
            {label(148.9, 101.6, 10, ":")}
            {label(191.6, 101.6, 200, formatDatePreview(tanggal), false)}

            {/* Nama Unit Kerja/Divisi */}
            {label(62.2, 124.2, 85, "Nama Unit Kerja/Divisi", false, "pv-unit-kerja")}
            {label(148.9, 124.2, 10, ":")}
            {label(191.6, 124.2, 380, unitKerja, false)}

            {/* Dibayarkan kepada */}
            {blackMark(144.1)}
            {label(62.2, 146.7, 85, "Dibayarkan kepada", false, "pv-dibayarkan-kepada")}
            <div style={fieldBox(147.1, 144.1, 147.9, 12, "center")}>
              <span>{dibayarkanKepada}</span>
            </div>

            {/* Jumlah + Via */}
            {blackMark(166.7)}
            {label(62.2, 169.3, 85, "Jumlah", false, "pv-jumlah")}
            <div style={fieldBox(147.1, 166.7, 147.9, 12, "center")}>
              <span>{formatRupiah(getJumlahDisplay()) || "Rp"}</span>
            </div>
            {label(360.8, 169.3, 30, "Via:")}
            {label(449.1, 169.3, 25, "Kas")}
            {checkbox(461.4, 166.7, 15.1, 12, via === "Kas")}
            {label(496.5, 169.3, 25, "Cek")}
            {checkbox(509.0, 166.7, 16.8, 12, via === "Cek")}
            {label(551.5, 169.3, 20, "BG")}
            {checkbox(561.8, 166.7, 15.9, 12, via === "BG")}

            {/* Kelengkapan data via BG */}
            {blackMark(189.2)}
            {label(62.2, 191.8, 200, "Kelengkapan data via BG", false, "pv-kelengkapan-bg")}

            {/* Nomor Rekening / Atas Nama */}
            {label(62.2, 203.1, 85, "Nomor Rekening", false, "pv-nomor-rekening")}
            <div style={fieldBox(147.1, 200.5, 130.2, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{noRekening}</span>
            </div>
            {label(360.8, 203.1, 60, "Atas Nama:", false, "pv-atas-nama")}
            <div style={fieldBox(447.0, 200.5, 130.7, 12, "left")}>
              <span>{atasNama}</span>
            </div>

            {/* Nama Bank / Cabang */}
            {label(62.2, 225.7, 85, "Nama Bank", false, "pv-nama-bank")}
            <div style={fieldBox(147.1, 223.1, 130.2, 12, "center")}>
              <span style={{ textTransform: "uppercase" }}>{namaBank}</span>
            </div>
            {label(360.8, 225.7, 60, "Cabang:")}
            <div style={fieldBox(447.0, 223.1, 130.7, 12, "left")}>
              <span>{cabang}</span>
            </div>

            {/* NPWP (bila ada) */}
            {blackMark(245.6)}
            {label(62.2, 248.2, 85, "NPWP (bila ada)", false, "pv-npwp")}
            <div style={fieldBox(147.1, 245.6, 130.2, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{npwp || "-"}</span>
            </div>

            {/* Pajak: Ada / Tidak ada */}
            {blackMark(268.2)}
            {label(62.2, 270.8, 85, "Pajak: Ada", false, "pv-pajak-ada")}
            {checkbox(147.1, 268.2, 35.1, 12, pajakAda)}
            {label(196.2, 270.8, 85, "Tidak ada")}
            {checkbox(242.2, 268.2, 35.1, 12, !pajakAda)}

            {/* Dasar Pengenaan / Pph Pasal / Tarif / Pajak */}
            {label(62.2, 293.4, 85, "Dasar Pengenaan", false, "pv-dasar-pengenaan")}
            <div style={fieldBox(147.1, 290.8, 130.2, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{pajakAda ? formatNumberDot(dasarPengenaan) : ""}</span>
            </div>
            {label(290.8, 293.4, 60, "Pph Pasal")}
            <div style={fieldBox(334.8, 290.8, 30.5, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{pajakAda ? pphPasal : ""}</span>
            </div>
            {label(380.2, 293.4, 60, "Tarif")}
            <div style={fieldBox(402.2, 290.8, 15.5, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{pajakAda && tarif ? `${tarif}%` : ""}</span>
            </div>
            {label(430.8, 293.4, 60, "Pajak")}
            <div style={fieldBox(460.8, 290.8, 60.5, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{pajakAda ? formatNumberDot(nilaiPajak) : ""}</span>
            </div>

            {/* ============================ TABEL JURNAL ============================ */}
            <div id={`pv-rincian-perkiraan-${type}`} style={{ ...abs(TABLE_LEFT, TABLE_TOP, 517.3), fontSize: "7.8pt", fontFamily: "inherit" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "0.75pt solid #000" }}>
                <thead>
                  <tr style={{ height: `${HEADER_H}pt`, backgroundColor: headerBgColor }}>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_NO}pt` }}>No.</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_KODE}pt` }}>Kode Perkiraan</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700 }}>Uraian</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_DEBET}pt` }}>Debet</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_KREDIT}pt` }}>Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(row => {
                    if (!pajakAda && (row.id === 2 || row.id === 3 || row.kode === "214.02.02" || row.kode === "214.01.08" || row.kode === "214.02.03")) {
                      return false;
                    }
                    return true;
                  }).map((row, idx) => (
                    <tr key={row.id} style={{ height: `${ROW_H}pt` }}>
                      <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "left", paddingLeft: "3pt", fontFamily: "monospace" }}>{row.kode}</td>
                      <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "left", paddingLeft: "3pt" }}>{row.uraian}</td>
                      <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "right", paddingRight: "3pt", fontFamily: "monospace" }}>
                        {parseFloat(row.debet) > 0 ? formatRupiah(row.debet) : ""}
                      </td>
                      <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "right", paddingRight: "3pt", fontFamily: "monospace" }}>
                        {parseFloat(row.kredit) > 0 ? formatRupiah(row.kredit) : ""}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ height: `${ROW_H}pt` }}>
                    <td colSpan={5} style={{ border: "0.75pt solid #000" }}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ============================ CHECKLIST ============================ */}
            {blackMark(392.3)}
            <div id={`pv-kelengkapan-dokumen-${type}`} style={{ ...abs(62.2, 394.9, 300), fontSize: "7.8pt", fontWeight: 400 }}>
              Kelengkapan Dokumen
            </div>

            {chkCol1.map((item, i) => (
              <React.Fragment key={item.key}>
                {checkbox(TABLE_LEFT + 0.7, CHK_TOP0 + i * CHK_ROW_H, 22, 12, checklist[item.key])}
                {label(84.1, CHK_TOP0 + i * CHK_ROW_H + 2.6, 210, item.text)}
              </React.Fragment>
            ))}

            {chkCol2.map((item, i) => (
              <React.Fragment key={item.key}>
                {checkbox(295.0, CHK_TOP0 + i * CHK_ROW_H, 25.2, 12, checklist[item.key])}
                {label(321.1, CHK_TOP0 + i * CHK_ROW_H + 2.6, 260, item.text)}
              </React.Fragment>
            ))}

            {/* Lain-lain (baris ke-6, hanya kolom kiri) */}
            {checkbox(TABLE_LEFT + 0.7, CHK_TOP0 + 5 * CHK_ROW_H, 22, 12, checklist.lainLain)}
            <div style={{ ...abs(84.1, CHK_TOP0 + 5 * CHK_ROW_H + 2.6, 460), fontSize: "7.8pt", display: "flex", alignItems: "baseline", gap: "4pt" }}>
              <span>Lain-lain : {checklist.lainLain ? checklist.lainLainText : ""}</span>
            </div>

            {/* ============================ TANDA TANGAN ============================ */}
            <div id={`pv-tanda-tangan-${type}`}>
              {sigCols.map((col, i) => (
                <div
                  key={i}
                  style={{
                    ...abs(col.center - SIG_COL_WIDTH / 2, 563.9, SIG_COL_WIDTH),
                    textAlign: "center",
                    fontSize: "7.8pt"
                  }}
                >
                  <div>{col.label}</div>
                  <div style={{ height: "37pt" }} />
                  <div style={{ fontWeight: 700, textTransform: "uppercase", textDecoration: "underline", lineHeight: 1.2 }}>
                    {col.nama || "...................................."}
                  </div>
                  <div style={{ fontSize: "7pt", color: "#333", textTransform: "uppercase", marginTop: "3pt" }}>
                    {col.jabatan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
