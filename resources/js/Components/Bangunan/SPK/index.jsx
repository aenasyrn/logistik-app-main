// resources/js/Components/Bangunan/SPK/index.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Plus, Trash2, Printer, RefreshCw } from "lucide-react";
import { router } from "@inertiajs/react";
import axios from "axios";

// Helper to convert month index to Roman numerals
function getRomanMonth(monthIndex) {
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romanMonths[monthIndex] || "";
}

// Format YYYY-MM-DD to "Tempat, DD Month YYYY"
function formatIndonesianDate(tempat, dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const days = date.getDate();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const city = tempat ? `${tempat}, ` : "";
  return `${city}${days} ${monthName} ${year}`;
}

// Format YYYY-MM-DD to "DD Month YYYY"
function formatDateOnly(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const days = date.getDate();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${days} ${monthName} ${year}`;
}

// Helper to format string numbers with dots (thousands separator)
function formatNumberWithDots(val) {
  if (val === undefined || val === null) return "";
  const clean = val.toString().replace(/[^0-9]/g, "");
  if (!clean) return "";
  return parseInt(clean, 10).toLocaleString("id-ID");
}

// Robust Indonesian Terbilang (number to words) converter
function terbilang(angka) {
  if (isNaN(angka)) return "";
  angka = Math.floor(angka);
  if (angka < 0) return "minus " + terbilang(Math.abs(angka));
  if (angka === 0) return "";

  const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  let temp = "";

  if (angka < 12) {
    temp = units[angka];
  } else if (angka < 20) {
    temp = terbilang(angka - 10) + " belas";
  } else if (angka < 100) {
    temp = terbilang(Math.floor(angka / 10)) + " puluh " + terbilang(angka % 10);
  } else if (angka < 200) {
    temp = "seratus " + terbilang(angka - 100);
  } else if (angka < 1000) {
    temp = terbilang(Math.floor(angka / 100)) + " ratus " + terbilang(angka % 100);
  } else if (angka < 2000) {
    temp = "seribu " + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    temp = terbilang(Math.floor(angka / 1000)) + " ribu " + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    temp = terbilang(Math.floor(angka / 1000000)) + " juta " + terbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    temp = terbilang(Math.floor(angka / 1000000000)) + " miliar " + terbilang(angka % 1000000000);
  } else if (angka < 1000000000000000) {
    temp = terbilang(Math.floor(angka / 1000000000000)) + " triliun " + terbilang(angka % 1000000000000);
  }

  return temp.replace(/\s+/g, " ").trim();
}

function convertToTerbilang(angka) {
  if (!angka || isNaN(angka)) return "nol rupiah";
  const hasil = terbilang(angka);
  return `(${hasil} rupiah)`.toLowerCase();
}

function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Auto-growing textarea for editable document preview fields (completely hides scrollbars)
function PreviewTextarea({ value, onChange, name, placeholder, className = "", ...props }) {
  const textareaRef = useRef(null);

  React.useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const hasAlignment = className.includes("text-center") || className.includes("text-left") || className.includes("text-right");
  const alignmentClass = hasAlignment ? "" : "text-justify";

  return (
    <textarea
      ref={textareaRef}
      name={name}
      value={value}
      onChange={onChange}
      onInput={handleInput}
      placeholder={placeholder}
      className={`bg-transparent w-full resize-none overflow-hidden outline-none border-b border-dashed border-transparent hover:border-gray-300 focus:border-emerald-600 focus:bg-white p-0 font-sans leading-relaxed ${alignmentClass} ${className}`}
      rows={1}
    />
  );
}

// Auto-expanding form textarea to prevent inner scrollbars in editor panel inputs
function FormTextarea({ value, onChange, placeholder, className = "", rows = 2, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  const handleInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onInput={handleInput}
      placeholder={placeholder}
      className={`resize-none overflow-hidden ${className}`}
      rows={rows}
      {...props}
    />
  );
}

export default function BangunanSPK({ type = "renovasi", setView, activeTab }) {
  // Get current Roman month and year
  const currentYear = new Date().getFullYear();
  const currentMonthTwoDigits = String(new Date().getMonth() + 1).padStart(2, "0");

  // Zoom control level for desktop screen view
  const [zoomLevel, setZoomLevel] = useState(0.7);

  // Synchronize zoom to 1.0 when browser print triggers
  useEffect(() => {
    const handleBeforePrint = () => {
      const el = document.getElementById(`spk-print-area-${type}`);
      if (el) {
        el.style.zoom = "1";
      }
    };
    const handleAfterPrint = () => {
      const el = document.getElementById(`spk-print-area-${type}`);
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

  const resetForm = () => {
    setLoadedId(null);
    setFormData({
      noSuratPrefix: "",
      noSurat: `.../00108.${currentMonthTwoDigits}/${currentYear}`,
      tempatSurat: "",
      tanggalSuratRaw: new Date().toISOString().split("T")[0],
      kepadanya: "",
      alamatTertuju: "",
      provinsi: "",
      ref1No: "",
      ref1TglRaw: "",
      ref2No: "",
      ref2TglRaw: "",
      ref3No: "",
      ref3TglRaw: "",
      syarat1Hari: type === "elektronik" ? "30" : "",
      syarat2DendaVal: "",
      syarat2DendaUnit: "‰",
      syarat2MaxVal: "",
      syarat2MaxUnit: "%",
      introText: type === "kendaraan"
        ? "Dengan ini PT Pegadaian Kanwil VIII Jakarta 1 sepakat menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk perpanjangan sewa tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagaimana terlampir."
        : type === "elektronik"
          ? "Dengan ini PT. Pegadaian Kanwil VIII Jakarta 1 sepakat Menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, Harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagai berikut:"
          : "Dengan ini PT PEGADAIAN sepakat Menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, Harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagai berikut:",
      syarat1Text: type === "elektronik"
        ? "Jangka Waktu Penyelesaian Pekerjaan adalah 30 (tiga puluh) hari kalender terhitung sejak SPK diterima."
        : "Jangka Waktu Penyelesaian Pekerjaan adalah 45 (empat puluh lima) hari kalender terhitung sejak SPK diterima.",
      syarat2Text: type === "elektronik"
        ? "Denda, Apabila jangka waktu Penyerahan Barang/Jasa terlambat akibat kesalahan Perusahaan Saudara, maka kami akan mengenakan denda sebesar 1% (satu permil) setinggi tingginya 5% (lima permil) setiap hari kalender dari total harga sebelum pajak sebagaimana tercantum dalam Surat Perintah Kerja (SPK)."
        : "Keterlambatan waktu penyerahan pertama dari jadwal yang telah ditetapkan maka dikenakan denda sebesar 1 ‰ (satu perseribu) untuk setiap hari keterlambatan dengan denda setinggi-tingginya 5% dari harga pekerjaan sebagaimana yang tercantum dalam Surat Perintah Kerja (SPK) dan/atau Perjanjian Kerja.",
      syarat3Text: "",
      syarat4IntroText: "Pembayaran dilakukan di Kas Kantor Wilayah VIII PT Pegadaian Jakarta dengan dilampiri :",
      syarat5Text: "Persyaratan Khusus :\nSyarat-syarat lain yang belum diatur didalam SPK ini akan diatur kemudian didalam perjanjian Kerja.",
      syarat6IntroText: "Persyaratan Lain :",
      closingText: "Demikian untuk diketahui dan atas kerjasamanya diucapkan terima kasih.",
      spkJumlah: "",
      spkJasa: "",
      spkSubTotal: "",
      spkPpn: "",
      spkTotal: "",
      spkDibulatkan: "",
      sigKiriPerusahaan: "",
      sigKiriNama: "",
      sigKiriJabatan: "",
      sigKananPerusahaan: "",
      sigKananNama: "",
      sigKananJabatan: "",
      // New electronic/kendaraan specific fields
      jenisElektronik: type === "kendaraan" ? "" : "Printer",
      hargaSewaPerUnit: "",
      syarat1aHari: "",
      spkBulan: "",
      syarat1bText: "",
      syarat1cText: "",
      syarat1dText: "",
      syarat2ElektronikText: "",
      syarat1aKendaraanText: "Harga yang tertera sudah termasuk Pajak-pajak 11%",
      syarat1bKendaraanText: "",
      syarat2KendaraanText: "",
      syarat3KendaraanText: "",
      syarat4KendaraanText: "Jumlah biaya/harga akan dibayarkan sesuai dengan jumlah unit yang digunakan.",
      syarat5IntroKendaraanText: "Pembayaran dilakukan di Kas Kantor Wilayah VIII PT Pegadaian Jakarta dengan dilampiri :",
      syarat6KendaraanText: "Persyaratan Khusus :\nsyarat-syarat lain yang belum diatur didalam SPK ini akan diatur kemudian didalam perjanjian Kerja.",
      tanggalPersetujuanRaw: new Date().toISOString().split("T")[0],
    });
    setProjectUraian("");
    setProjectJumlah("");
    setSyarat4Items([
      { key: "a", text: "Surat Permohonan Pembayaran bermaterai Rp10.000,-" },
      { key: "b", text: "Kuitansi rangkap 2 (dua), satu bermaterai Rp10.000,-" },
      { key: "c", text: "Foto Copy SPK." },
      { key: "d", text: "Berita Acara Pemeriksaan Pekerjaan." },
      { key: "e", text: "Berita Acara Serah Terima Pekerjaan." },
      { key: "f", text: "Foto Copy NPWP, SIUP, SBUJK" },
      { key: "g", text: "Faktur Pajak" },
      { key: "h", text: "Foto pekerjaan sebelum dan sesudah" }
    ]);
    setSyarat6Items([
      { key: "a", text: "Pekerjaan sebelum diserahkan akan diperiksa terlebih dahulu, dan apabila tidak memenuhi syarat akan dikembalikan kepada Perusahaan Saudara dengan beban dan biaya menjadi tanggungjawab Perusahaan Saudara." },
      { key: "b", text: "PT. PEGADAIAN dibebaskan dari segala bentuk tuntutan apapun dari pihak ketiga yang berkaitan dengan SPK ini." },
      { key: "c", text: "setiap perubahan mengenai jumlah, uraian pekerjaan, harga dan syarat yang tercantum dalam SPK ini harus disetujui secara tertulis oleh PT PEGADAIAN and Perusahaan Saudara." },
      { key: "d", text: "Sebagai konfirmasi Persetujuan, Perusahaan Saudara wajib menandatangani SPK asli ini di atas materai yang cukup, dan mengembalikan paling lambat 2 (dua) hari kerja, sejak diterimanya copy/tembusan SPK ini sebagai pemberitahuan, baik yang disampaikan melalui faksimile, email, maupun kurir." }
    ]);
    setItemsList([
      {
        id: "item-1",
        uraian: "",
        qty: "",
        hargaUnit: "",
        totalBulan: ""
      }
    ]);
    setCustomTerbilang("");
    setIsCustomTerbilang(false);
    setErrors({});
  };

  const mergeSyarat4Items = (loadedItems) => {
    if (!loadedItems || !Array.isArray(loadedItems)) return loadedItems;
    const defaults = [
      { key: "a", text: "Surat Permohonan Pembayaran bermaterai Rp10.000,-" },
      { key: "b", text: "Kuitansi rangkap 2 (dua), satu bermaterai Rp10.000,-" },
      { key: "c", text: "Foto Copy SPK." },
      { key: "d", text: "Berita Acara Pemeriksaan Pekerjaan." },
      { key: "e", text: "Berita Acara Serah Terima Pekerjaan." },
      { key: "f", text: "Foto Copy NPWP, SIUP, SBUJK" },
      { key: "g", text: "Faktur Pajak" },
      { key: "h", text: "Foto pekerjaan sebelum dan sesudah" }
    ];
    return defaults.map(def => {
      const found = loadedItems.find(item => item.key === def.key);
      return found ? found : def;
    });
  };

  // Load selected SPK from history if set or when the tab becomes active
  useEffect(() => {
    if (activeTab !== `spk_${type}`) return;

    try {
      const dataStr = localStorage.getItem("selected_spk_to_edit");
      if (dataStr) {
        if (dataStr === "NEW") {
          resetForm();
          localStorage.removeItem("selected_spk_to_edit");
          return;
        }
        const spk = JSON.parse(dataStr);
        if (spk.id) setLoadedId(spk.id);
        if (spk.formData) setFormData(spk.formData);
        if (spk.projectUraian) setProjectUraian(spk.projectUraian);
        if (spk.projectJumlah) setProjectJumlah(spk.projectJumlah);
        if (spk.syarat4Items) setSyarat4Items(mergeSyarat4Items(spk.syarat4Items));
        if (spk.syarat6Items) setSyarat6Items(spk.syarat6Items);
        if (spk.customTerbilang) setCustomTerbilang(spk.customTerbilang);
        if (spk.isCustomTerbilang !== undefined) setIsCustomTerbilang(spk.isCustomTerbilang);

        // Check if print flag is active
        const shouldPrint = localStorage.getItem("selected_spk_to_print");
        if (shouldPrint) {
          localStorage.removeItem("selected_spk_to_print");

          const styleEl = document.createElement("style");
          styleEl.id = "spk-print-page-style";
          styleEl.innerHTML = `@page { size: A4 !important; margin: 0 !important; }`;
          document.head.appendChild(styleEl);

          document.body.classList.add(`print-spk-${type}-only`);
          setTimeout(() => {
            window.print();
            document.body.classList.remove(`print-spk-${type}-only`);
            const el = document.getElementById("spk-print-page-style");
            if (el) el.remove();
          }, 350);
        }

        // Clean up
        localStorage.removeItem("selected_spk_to_edit");
      }
    } catch (e) {
      console.error("Failed to load selected SPK for editing:", e);
    }
  }, [activeTab]);

  // Listen to load document events for instant SPK edits/resets
  useEffect(() => {
    const handleLoadEvent = (e) => {
      const data = e.detail;
      if (!data) return;

      if (data === "NEW") {
        resetForm();
      } else {
        const spkType = data.tipe_spk || data.tipeSpk || data.type || "renovasi";
        if (spkType !== type) return;

        if (data.id) setLoadedId(data.id);
        if (data.formData) setFormData(data.formData);
        if (data.projectUraian) setProjectUraian(data.projectUraian);
        if (data.projectJumlah) setProjectJumlah(data.projectJumlah);
        if (data.syarat4Items) setSyarat4Items(mergeSyarat4Items(data.syarat4Items));
        if (data.syarat6Items) setSyarat6Items(data.syarat6Items);
        if (data.itemsList && Array.isArray(data.itemsList)) setItemsList(data.itemsList);
        if (data.customTerbilang) setCustomTerbilang(data.customTerbilang);
        if (data.isCustomTerbilang !== undefined) setIsCustomTerbilang(data.isCustomTerbilang);
      }
    };

    window.addEventListener("load-spk-document", handleLoadEvent);
    return () => {
      window.removeEventListener("load-spk-document", handleLoadEvent);
    };
  }, [type, currentMonthTwoDigits, currentYear]);

  // Listen to direct print request from history (without tab switching)
  useEffect(() => {
    const handlePrintDirect = (e) => {
      const spk = e.detail;
      if (!spk) return;

      const spkType = spk.tipe_spk || spk.tipeSpk || spk.type || "renovasi";
      if (spkType !== type) return;

      if (spk.formData) setFormData(spk.formData);
      if (spk.projectUraian) setProjectUraian(spk.projectUraian);
      if (spk.projectJumlah) setProjectJumlah(spk.projectJumlah);
      if (spk.syarat4Items) setSyarat4Items(mergeSyarat4Items(spk.syarat4Items));
      if (spk.syarat6Items) setSyarat6Items(spk.syarat6Items);
      if (spk.itemsList && Array.isArray(spk.itemsList)) setItemsList(spk.itemsList);
      if (spk.customTerbilang) setCustomTerbilang(spk.customTerbilang);
      if (spk.isCustomTerbilang !== undefined) setIsCustomTerbilang(spk.isCustomTerbilang);

      const styleEl = document.createElement("style");
      styleEl.id = "spk-print-page-style";
      styleEl.innerHTML = `@page { size: A4 !important; margin: 0 !important; }`;
      document.head.appendChild(styleEl);

      document.body.classList.add(`print-spk-${type}-only`);
      setTimeout(() => {
        window.print();
        document.body.classList.remove(`print-spk-${type}-only`);
        const el = document.getElementById("spk-print-page-style");
        if (el) el.remove();
      }, 600);
    };

    window.addEventListener("print-spk-direct", handlePrintDirect);
    return () => {
      window.removeEventListener("print-spk-direct", handlePrintDirect);
    };
  }, [type]);

  const [loadedId, setLoadedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Main form state
  const [formData, setFormData] = useState({
    noSuratPrefix: "",
    noSurat: `.../00108.${currentMonthTwoDigits}/${currentYear}`,
    tempatSurat: "",
    tanggalSuratRaw: new Date().toISOString().split("T")[0],
    kepadanya: "",
    alamatTertuju: "",
    provinsi: "",

    // Referensi (Menunjuk)
    ref1No: "",
    ref1TglRaw: "",
    ref2No: "",
    ref2TglRaw: "",
    ref3No: "",
    ref3TglRaw: "",

    // Syarat-syarat
    syarat1Hari: type === "elektronik" ? "30" : "",
    syarat2DendaVal: "",
    syarat2DendaUnit: "‰",
    syarat2MaxVal: "",
    syarat2MaxUnit: "%",

    // Editable Template Texts
    introText: type === "kendaraan"
      ? "Dengan ini PT Pegadaian Kanwil VIII Jakarta 1 sepakat menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk perpanjangan sewa tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagaimana terlampir."
      : type === "elektronik"
        ? "Dengan ini PT. Pegadaian Kanwil VIII Jakarta 1 sepakat Menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, Harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagai berikut:"
        : "Dengan ini PT PEGADAIAN sepakat Menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, Harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagai berikut:",
    syarat1Text: type === "elektronik"
      ? "Jangka Waktu Penyelesaian Pekerjaan adalah 30 (tiga puluh) hari kalender terhitung sejak SPK diterima."
      : "Jangka Waktu Penyelesaian Pekerjaan adalah 45 (empat puluh lima) hari kalender terhitung sejak SPK diterima.",
    syarat2Text: type === "elektronik"
      ? "Denda, Apabila jangka waktu Penyerahan Barang/Jasa terlambat akibat kesalahan Perusahaan Saudara, maka kami akan mengenakan denda sebesar 1% (satu permil) setinggi tingginya 5% (lima permil) setiap hari kalender dari total harga sebelum pajak sebagaimana tercantum dalam Surat Perintah Kerja (SPK)."
      : "Keterlambatan waktu penyerahan pertama dari jadwal yang telah ditetapkan maka dikenakan denda sebesar 1 ‰ (satu perseribu) untuk setiap hari keterlambatan dengan denda setinggi-tingginya 5% dari harga pekerjaan sebagaimana yang tercantum dalam Surat Perintah Kerja (SPK) dan/atau Perjanjian Kerja.",
    syarat3Text: "",
    syarat4IntroText: "Pembayaran dilakukan di Kas Kantor Wilayah VIII PT Pegadaian Jakarta dengan dilampiri :",
    syarat5Text: "Persyaratan Khusus :\nSyarat-syarat lain yang belum diatur didalam SPK ini akan diatur kemudian didalam perjanjian Kerja.",
    syarat6IntroText: "Persyaratan Lain :",
    closingText: "Demikian untuk diketahui dan atas kerjasamanya diucapkan terima kasih.",

    // Contractor summary calculations
    spkJumlah: "",
    spkJasa: "",
    spkSubTotal: "",
    spkPpn: "",
    spkTotal: "",
    spkDibulatkan: "",

    // Signatures
    sigKiriPerusahaan: "",
    sigKiriNama: "",
    sigKiriJabatan: "",

    sigKananPerusahaan: "",
    sigKananNama: "",
    sigKananJabatan: "",

    // New electronic/kendaraan specific fields
    jenisElektronik: type === "kendaraan" ? "" : "Printer",
    hargaSewaPerUnit: "",
    syarat1aHari: "",
    spkBulan: "",
    syarat1bText: "",
    syarat1cText: "",
    syarat1dText: "",
    syarat2ElektronikText: "",
    syarat1aKendaraanText: "Harga yang tertera sudah termasuk Pajak-pajak 11%",
    syarat1bKendaraanText: "",
    syarat2KendaraanText: "",
    syarat3KendaraanText: "",
    syarat4KendaraanText: "Jumlah biaya/harga akan dibayarkan sesuai dengan jumlah unit yang digunakan.",
    syarat5IntroKendaraanText: "Pembayaran dilakukan di Kas Kantor Wilayah VIII PT Pegadaian Jakarta dengan dilampiri :",
    syarat6KendaraanText: "Persyaratan Khusus :\nsyarat-syarat lain yang belum diatur didalam SPK ini akan diatur kemudian didalam perjanjian Kerja.",
    tanggalPersetujuanRaw: new Date().toISOString().split("T")[0],
  });

  // Project item details state
  const [projectUraian, setProjectUraian] = useState("");
  const [projectJumlah, setProjectJumlah] = useState("");

  // Multi-row items state for SPK Elektronik & Kendaraan
  const [itemsList, setItemsList] = useState([
    {
      id: "item-1",
      uraian: "",
      qty: "",
      hargaUnit: "",
      totalBulan: ""
    }
  ]);

  const handleAddItemRow = () => {
    setItemsList((prev) => {
      const next = [
        ...prev,
        {
          id: `item-${Date.now()}`,
          uraian: "",
          qty: "",
          hargaUnit: "",
          totalBulan: ""
        }
      ];
      return next;
    });
  };

  const handleRemoveItemRow = (index) => {
    if (itemsList.length <= 1) return;
    setItemsList((prev) => {
      const next = prev.filter((_, i) => i !== index);
      recalculateTableTotals(next);
      return next;
    });
  };

  const handleItemChange = (index, field, value) => {
    setItemsList((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;

        let val = value;
        if (field === "hargaUnit" || field === "totalBulan") {
          val = formatNumberWithDots(value);
        }

        const updated = { ...item, [field]: val };

        if (field === "hargaUnit" || field === "qty") {
          const cleanUnit = (field === "hargaUnit" ? val : (updated.hargaUnit || "")).replace(/[^0-9]/g, "");
          const unitNum = parseInt(cleanUnit, 10);
          const cleanQty = (updated.qty || "").replace(/[^0-9]/g, "");
          const qtyNum = parseInt(cleanQty, 10);

          if (!isNaN(unitNum) && !isNaN(qtyNum) && qtyNum > 0) {
            updated.totalBulan = formatNumberWithDots(unitNum * qtyNum);
          }
        }

        return updated;
      });

      if (index === 0) {
        if (field === "uraian") setProjectUraian(next[0].uraian);
        if (field === "qty") setProjectJumlah(next[0].qty);
        if (field === "hargaUnit") handleInlineEdit("hargaSewaPerUnit", next[0].hargaUnit);
        if (field === "totalBulan") handleInlineEdit("spkJumlah", next[0].totalBulan);
      }

      recalculateTableTotals(next);
      return next;
    });
  };

  const recalculateTableTotals = (items, currentMonths = formData.spkBulan) => {
    let sumMonthly = 0;
    items.forEach((item, idx) => {
      const valStr = item.totalBulan || (idx === 0 ? formData.spkJumlah : "");
      const clean = (valStr || "").toString().replace(/[^0-9]/g, "");
      const num = parseInt(clean, 10);
      if (!isNaN(num)) sumMonthly += num;
    });

    if (sumMonthly > 0) {
      const months = parseInt(currentMonths, 10) || (type === "kendaraan" ? 12 : 36);
      const totalSewa = sumMonthly * months;
      setFormData((prev) => ({
        ...prev,
        spkJumlah: formatNumberWithDots(sumMonthly),
        spkTotal: formatNumberWithDots(totalSewa),
        spkDibulatkan: formatNumberWithDots(totalSewa)
      }));
    }
  };

  // List templates for Syarat 4 and Syarat 6 that can also be edited
  const [syarat4Items, setSyarat4Items] = useState([
    { key: "a", text: "Surat Permohonan Pembayaran bermaterai Rp10.000,-" },
    { key: "b", text: "Kuitansi rangkap 2 (dua), satu bermaterai Rp10.000,-" },
    { key: "c", text: "Foto Copy SPK." },
    { key: "d", text: "Berita Acara Pemeriksaan Pekerjaan." },
    { key: "e", text: "Berita Acara Serah Terima Pekerjaan." },
    { key: "f", text: "Foto Copy NPWP, SIUP, SBUJK" },
    { key: "g", text: "Faktur Pajak" },
    { key: "h", text: "Foto pekerjaan sebelum dan sesudah" }
  ]);

  const [syarat6Items, setSyarat6Items] = useState([
    { key: "a", text: "Pekerjaan sebelum diserahkan akan diperiksa terlebih dahulu, dan apabila tidak memenuhi syarat akan dikembalikan kepada Perusahaan Saudara dengan beban dan biaya menjadi tanggungjawab Perusahaan Saudara." },
    { key: "b", text: "PT. PEGADAIAN dibebaskan dari segala bentuk tuntutan apapun dari pihak ketiga yang berkaitan dengan SPK ini." },
    { key: "c", text: "setiap perubahan mengenai jumlah, uraian pekerjaan, harga dan syarat yang tercantum dalam SPK ini harus disetujui secara tertulis oleh PT PEGADAIAN and Perusahaan Saudara." },
    { key: "d", text: "Sebagai konfirmasi Persetujuan, Perusahaan Saudara wajib menandatangani SPK asli ini di atas materai yang cukup, dan mengembalikan paling lambat 2 (dua) hari kerja, sejak diterimanya copy/tembusan SPK ini sebagai pemberitahuan, baik yang disampaikan melalui faksimile, email, maupun kurir." }
  ]);

  // Custom Terbilang override state
  const [customTerbilang, setCustomTerbilang] = useState("");
  const [isCustomTerbilang, setIsCustomTerbilang] = useState(false);

  // Active Editor Section Tab
  const [activeFormTab, setActiveFormTab] = useState("header");

  // Determine active total for Terbilang
  const activeTotalSum = formData.spkDibulatkan || formData.spkTotal || "";
  const totalHargaNumeric = parseInt(activeTotalSum.replace(/[^0-9]/g, ""), 10) || 0;
  const calculatedTerbilang = convertToTerbilang(totalHargaNumeric);
  const displayTerbilang = capitalizeFirstLetter(calculatedTerbilang.replace(/^\(|\)$/g, "").trim());



  // Handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear field error
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    let updatedValue = value;
    if (
      name === "spkJumlah" ||
      name === "spkJasa" ||
      name === "spkSubTotal" ||
      name === "spkPpn" ||
      name === "spkTotal" ||
      name === "spkDibulatkan" ||
      name === "hargaSewaPerUnit"
    ) {
      updatedValue = formatNumberWithDots(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: updatedValue };

      // If prefix changes, automatically update the full noSurat
      if (name === "noSuratPrefix") {
        updated.noSurat = `${value}/00108.${currentMonthTwoDigits}/${currentYear}`;
      }
      return updated;
    });

  };

  // Auto-calculate summary rows when base Jumlah (SPK Jumlah) changes
  const handleSpkJumlahChange = (val, customMonths = null) => {
    // Clear field error
    if (errors.spkJumlah) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.spkJumlah;
        return next;
      });
    }

    const clean = val.replace(/[^0-9]/g, "");
    const base = parseInt(clean, 10);

    if (isNaN(base)) {
      if (type === "elektronik" || type === "kendaraan") {
        setFormData(prev => ({
          ...prev,
          spkJumlah: val,
          spkTotal: "",
          spkDibulatkan: ""
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          spkJumlah: val,
          spkJasa: "",
          spkSubTotal: "",
          spkPpn: "",
          spkTotal: "",
          spkDibulatkan: ""
        }));
      }
      return;
    }

    if (type === "elektronik" || type === "kendaraan") {
      const defaultMonths = type === "kendaraan" ? 12 : 36;
      const months = parseInt(customMonths !== null ? customMonths : formData.spkBulan, 10) || defaultMonths;
      const totalSewa = base * months;
      setFormData(prev => ({
        ...prev,
        spkJumlah: formatNumberWithDots(base),
        spkTotal: formatNumberWithDots(totalSewa),
        spkDibulatkan: formatNumberWithDots(totalSewa)
      }));
    } else {
      const jasa = Math.round(base * 0.1);
      const subTotal = base + jasa;
      const ppn = Math.round(subTotal * 0.11);
      const total = subTotal + ppn;

      // Round to nearest fifty thousand (50.000) or similar
      const dibulatkan = Math.round(total / 100000) * 100000;

      setFormData(prev => ({
        ...prev,
        spkJumlah: formatNumberWithDots(base),
        spkJasa: formatNumberWithDots(jasa),
        spkSubTotal: formatNumberWithDots(subTotal),
        spkPpn: formatNumberWithDots(ppn),
        spkTotal: formatNumberWithDots(total),
        spkDibulatkan: formatNumberWithDots(dibulatkan)
      }));
    }
  };

  const handleSpkBulanChange = (val) => {
    if (errors.spkBulan) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.spkBulan;
        return next;
      });
    }

    const months = parseInt(val, 10);
    const monthlyRent = parseInt((formData.spkJumlah || "").replace(/[^0-9]/g, ""), 10) || 0;

    setFormData(prev => {
      const next = { ...prev, spkBulan: val };
      if (monthlyRent > 0 && !isNaN(months) && months > 0) {
        const total = monthlyRent * months;
        next.spkTotal = formatNumberWithDots(total);
        next.spkDibulatkan = formatNumberWithDots(total);
      } else {
        next.spkTotal = "";
        next.spkDibulatkan = "";
      }
      return next;
    });
  };

  // Sync Syarat 1 sentence when value changes in form
  const handleSyarat1HariChange = (val) => {
    // Clear field error
    if (errors.syarat1Hari) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.syarat1Hari;
        return next;
      });
    }

    setFormData((prev) => {
      const num = parseInt(val, 10);
      const word = isNaN(num) ? "" : terbilang(num);
      const textWord = word ? ` (${word})` : "";
      return {
        ...prev,
        syarat1Hari: val,
        syarat1Text: `Jangka Waktu Penyelesaian Pekerjaan adalah ${val}${textWord} hari kalender terhitung sejak SPK diterima.`
      };
    });
  };

  // Sync Syarat 2 sentence when values change in form
  const handleSyarat2Change = (field, val) => {
    // Clear field error
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    setFormData((prev) => {
      const nextFormData = { ...prev, [field]: val };
      const dendaVal = parseInt(nextFormData.syarat2DendaVal, 10);
      const dendaWord = isNaN(dendaVal) ? "" : ` (${terbilang(dendaVal)} ${nextFormData.syarat2DendaUnit === "%" ? "persen" : "perseribu"})`;

      const maxVal = parseInt(nextFormData.syarat2MaxVal, 10);
      const maxWord = isNaN(maxVal) ? "" : ` (${terbilang(maxVal)} ${nextFormData.syarat2MaxUnit === "%" ? "persen" : "perseribu"})`;

      const dendaStr = nextFormData.syarat2DendaVal ? `${nextFormData.syarat2DendaVal}${nextFormData.syarat2DendaUnit}${dendaWord}` : "...";
      const maxStr = nextFormData.syarat2MaxVal ? `${nextFormData.syarat2MaxVal}${nextFormData.syarat2MaxUnit}${maxWord}` : "...";

      nextFormData.syarat2Text = `Keterlambatan waktu penyerahan pertama dari jadwal yang telah ditetapkan maka dikenakan denda sebesar ${dendaStr} untuk setiap hari keterlambatan dengan denda setinggi-tingginya ${maxStr} dari harga pekerjaan sebagaimana yang tercantum dalam Surat Perintah Kerja (SPK) and/atau Perjanjian Kerja.`;

      return nextFormData;
    });
  };

  // Handle list item editing for Syarat 4 and Syarat 6
  const handleListChange = (type, key, value) => {
    if (type === "syarat4") {
      setSyarat4Items(prev => prev.map(item => item.key === key ? { ...item, text: value } : item));
    } else if (type === "syarat6") {
      setSyarat6Items(prev => prev.map(item => item.key === key ? { ...item, text: value } : item));
    }
  };

  // Handle inline contentEditable changes
  const handleInlineEdit = (name, value) => {
    let updatedValue = value;
    if (
      name === "spkJumlah" ||
      name === "spkJasa" ||
      name === "spkSubTotal" ||
      name === "spkPpn" ||
      name === "spkTotal" ||
      name === "spkDibulatkan" ||
      name === "hargaSewaPerUnit"
    ) {
      updatedValue = formatNumberWithDots(value);
    }

    setFormData((prev) => {
      return { ...prev, [name]: updatedValue };
    });

  };

  const saveToHistory = (silent = false, onSuccessCallback = null) => {
    setIsSubmitting(true);
    const startTime = Date.now();
    try {
      const newEntry = {
        id: loadedId || null,
        nomorSpk: formData.noSurat,
        tipeSpk: type,
        tanggal: formData.tanggalSuratRaw,
        perusahaan: formData.kepadanya || "Penerima/Perusahaan",
        uraian: projectUraian || "Tidak ada uraian",
        jumlah: formData.spkDibulatkan || formData.spkTotal || "0",

        // Save full document state
        formData,
        projectUraian,
        projectJumlah,
        syarat4Items,
        syarat6Items,
        itemsList,
        customTerbilang,
        isCustomTerbilang
      };

      axios.post('/spk-histories', newEntry)
        .then(async (res) => {
          if (res.data && res.data.id) {
            setLoadedId(res.data.id);
            window.dispatchEvent(new CustomEvent("spk-saved-to-db", { detail: res.data.id }));
          }

          // Enforce a minimum 6-second delay when submitting (has success callback)
          if (onSuccessCallback) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 6000 - elapsedTime);
            await new Promise((resolve) => setTimeout(resolve, remainingTime));
          }

          setIsSubmitting(false);
          if (!silent) {
            alert("Dokumen SPK berhasil disimpan ke riwayat.");
          }
          if (onSuccessCallback) {
            onSuccessCallback(res.data);
          }
        })
        .catch((err) => {
          setIsSubmitting(false);
          console.error("Failed to save SPK to DB:", err);
          if (!silent) {
            alert("Gagal menyimpan dokumen SPK ke riwayat.");
          }
        });
    } catch (e) {
      setIsSubmitting(false);
      console.error("Failed to save SPK history:", e);
      if (!silent) {
        alert("Gagal menyimpan dokumen SPK ke riwayat.");
      }
    }
  };

  const handleSubmitHistory = () => {
    const newErrors = {};

    // Validate formData keys
    const baseKeys = [
      { name: "noSuratPrefix", label: "Nomor Urut SPK wajib diisi" },
      { name: "tempatSurat", label: "Tempat Surat wajib diisi" },
      { name: "tanggalSuratRaw", label: "Tanggal Surat wajib diisi" },
      { name: "kepadanya", label: "Kepada Yth. wajib diisi" },
      { name: "alamatTertuju", label: "Alamat Tertuju wajib diisi" },
      { name: "provinsi", label: "Provinsi / Kota wajib diisi" },
      ...(type === "elektronik" ? [] : [
        { name: "ref1No", label: "Nomor Surat Penawaran" },
        { name: "ref1TglRaw", label: "Tanggal Surat Penawaran" },
        { name: "ref2No", label: "Nomor Berita Acara Negosiasi" },
        { name: "ref2TglRaw", label: "Tanggal Berita Acara Negosiasi" },
        { name: "ref3No", label: "Nomor Surat Penunjukan Pelaksana" },
        { name: "ref3TglRaw", label: "Tanggal Surat Penunjukan Pelaksana" },
      ]),
      { name: "spkJumlah", label: type === "elektronik" || type === "kendaraan" ? "Total Harga Sewa Per Bulan" : "Jumlah (Base Price)" },
      ...(type === "elektronik" || type === "kendaraan" ? [] : [
        { name: "spkJasa", label: "Jasa Kontraktor" },
        { name: "spkSubTotal", label: "Sub Total" },
        { name: "spkPpn", label: "PPN" },
        { name: "spkTotal", label: "Total" },
      ]),
      { name: "spkDibulatkan", label: type === "elektronik" || type === "kendaraan" ? "Total Harga Sewa" : "Dibulatkan" },
      { name: "sigKiriPerusahaan", label: "Nama Perusahaan Pelaksana (Pihak I)" },
      { name: "sigKiriNama", label: "Nama Lengkap Pihak I" },
      { name: "sigKiriJabatan", label: "Jabatan Pihak I" },
      { name: "sigKananPerusahaan", label: "Nama Lembaga Pihak II" },
      { name: "sigKananNama", label: "Nama Lengkap Pihak II" },
      { name: "sigKananJabatan", label: "Jabatan Pihak II" },
    ];

    const electronicKeys = [
      { name: "spkBulan", label: "Jangka Waktu Sewa (Bulan) wajib diisi" },
      { name: "syarat1aHari", label: "Jangka Waktu Hari wajib diisi" },
      { name: "syarat2ElektronikText", label: "Ketentuan Syarat 2 wajib diisi" },
      { name: "tanggalPersetujuanRaw", label: "Tanggal Persetujuan wajib diisi" },
    ];

    const kendaraanKeys = [
      { name: "spkBulan", label: "Jangka Waktu Sewa (Bulan) wajib diisi" },
      { name: "syarat1aKendaraanText", label: "Ketentuan Pajak (Syarat 1a) wajib diisi" },
      { name: "tanggalPersetujuanRaw", label: "Tanggal Persetujuan wajib diisi" },
    ];

    const standardKeys = [
      { name: "syarat1Hari", label: "Jangka Waktu Hari wajib diisi" },
      { name: "syarat2DendaVal", label: "Nilai Denda wajib diisi" },
      { name: "syarat2MaxVal", label: "Maksimal Denda wajib diisi" },
      { name: "syarat3Text", label: "Detail Pembayaran wajib diisi" },
    ];

    const requiredKeys = type === "elektronik"
      ? [...baseKeys, ...electronicKeys]
      : type === "kendaraan"
        ? [...baseKeys, ...kendaraanKeys]
        : [...baseKeys, ...standardKeys];

    requiredKeys.forEach((item) => {
      if (!formData[item.name] || !formData[item.name].toString().trim()) {
        newErrors[item.name] = item.label;
      }
    });

    // Validate projectUraian
    if (!projectUraian || !projectUraian.trim()) {
      newErrors.projectUraian = "Uraian Pekerjaan wajib diisi";
    }

    // Validate projectJumlah
    if (!projectJumlah || !projectJumlah.trim()) {
      newErrors.projectJumlah = "Jumlah Volume wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Automatically switch to the tab that has errors
      if (
        newErrors.noSuratPrefix ||
        newErrors.tempatSurat ||
        newErrors.tanggalSuratRaw ||
        newErrors.kepadanya ||
        newErrors.alamatTertuju ||
        newErrors.provinsi
      ) {
        setActiveFormTab("header");
      } else if (
        newErrors.ref1No ||
        newErrors.ref1TglRaw ||
        newErrors.ref2No ||
        newErrors.ref2TglRaw ||
        newErrors.ref3No ||
        newErrors.ref3TglRaw
      ) {
        setActiveFormTab("references");
      } else if (
        newErrors.projectUraian ||
        newErrors.projectJumlah ||
        newErrors.spkJumlah ||
        newErrors.spkBulan ||
        newErrors.spkJasa ||
        newErrors.spkSubTotal ||
        newErrors.spkPpn ||
        newErrors.spkTotal ||
        newErrors.spkDibulatkan
      ) {
        setActiveFormTab("items");
      } else {
        setActiveFormTab("terms");
      }

      setShowValidationModal(true);
      return;
    }

    setErrors({});
    if (loadedId) {
      localStorage.setItem("show_spk_success_toast", "edit");
    } else {
      localStorage.setItem("show_spk_success_toast", "true");
    }
    localStorage.setItem("riwayat_active_tab", "spk");

    saveToHistory(true, (savedData) => {
      window.dispatchEvent(
        new CustomEvent("optimistic-spk-added", {
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

  // Print PDF Handler
  const handlePrint = (shouldSave = false) => {
    const doPrint = () => {
      const styleEl = document.createElement("style");
      styleEl.id = "spk-print-page-style";
      styleEl.innerHTML = `@page { size: A4 !important; margin: 0 !important; }`;
      document.head.appendChild(styleEl);

      document.body.classList.add(`print-spk-${type}-only`);
      setTimeout(() => {
        window.print();
        document.body.classList.remove(`print-spk-${type}-only`);
        const el = document.getElementById("spk-print-page-style");
        if (el) el.remove();
      }, 600);
    };

    if (shouldSave) {
      saveToHistory(true, doPrint);
    } else {
      doPrint();
    }
  };

  // Auto-scroll helper
  const scrollToPreview = (id) => {
    const el = document.getElementById(`${id}-${type}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Header Logo SVG direct render to prevent flicker/disappear on re-renders
  const HeaderLogo = ({ id }) => (
    <div id={id} className="spk-header no-print-logo">
      <img
        src="/logo-pegadaian.png"
        alt="Logo Pegadaian"
        className="h-14 object-contain"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40' width='120' height='30'><g transform='translate(5, 5)'><circle cx='15' cy='15' r='12' fill='%23d2e460' opacity='0.9'/><circle cx='27' cy='15' r='12' fill='%2382c68c' opacity='0.9'/><circle cx='39' cy='15' r='12' fill='%233fb48f' opacity='0.9'/><text x='58' y='22' font-family='Arial, sans-serif' font-weight='bold' font-size='16' fill='%23065f46'>Pegadaian</text></g></svg>";
        }}
      />
    </div>
  );

  // Footer Component containing address details with green line above it
  const LetterFooter = () => (
    <div className="spk-footer pt-1 text-[8pt] text-gray-500 font-sans leading-normal shrink-0">
      {/* Horizontal divider line on top of details */}
      <hr className="w-full border-t-2 border-emerald-600 mb-1" />

      <div className="flex justify-between w-full">
        {/* Bagian Kiri */}
        <div className="text-left">
          <p className="font-bold text-emerald-600">
            PT PEGADAIAN – Kantor Wilayah VIII Jakarta
          </p>
          <p>Jl. Senen Raya No. 36</p>
          <p className="font-bold">Jakarta Pusat</p>
        </div>

        {/* Bagian Kanan */}
        <div className="text-left pr-4">
          {/* Baris pertama (kosong agar sejajar dengan PT Pegadaian) */}
          <p>&nbsp;</p>

          {/* Baris kedua */}
          <p>Telepon : 021-3840229</p>

          {/* Baris ketiga */}
          <div className="flex items-center gap-6">
            <span className="font-bold">
              Fax&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 021-3454116
            </span>
            <span className="text-emerald-600 font-semibold ml-6">www.pegadaian.co.id</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Define dynamic content section renderers with fully editable inline fields
  const renderIntro = () => (
    <div key="intro" id={`preview-header-intro-${type}`} className="w-full text-[10pt] leading-[1.35] text-gray-800">
      {/* 1. BAGIAN JUDUL & NOMOR SURAT (Rata Tengah) */}
      <div className="text-center mb-2 w-full">
        <h2 className="font-bold uppercase tracking-wide inline-block underline" style={{ fontSize: '12pt' }}>
          SURAT PERINTAH KERJA (SPK)
        </h2>
        <div className="flex items-center gap-1.5 justify-center mt-0.5" style={{ fontSize: '10pt' }}>
          <span>Nomor :</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("noSurat", e.target.innerText)}
            className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors min-w-[120px] text-left"
          >
            {formData.noSurat}
          </span>
        </div>
      </div>

      {/* Place & Date, Recipient (Right indented but left-aligned inside) */}
      <div id={`preview-tujuan-${type}`} className="w-full flex justify-end mb-2">
        <div className="w-[8cm] text-left leading-[1.3] space-y-1">
          <div className="border-b border-dashed border-transparent hover:border-gray-300 transition-colors py-0.5">
            <span
              className="outline-none px-0.5 rounded block text-gray-800"
            >
              {formatIndonesianDate(formData.tempatSurat, formData.tanggalSuratRaw) || "Jakarta, 27 April 2026"}
            </span>
          </div>

          <div style={{ marginTop: '10px' }} className="space-y-0.5">
            <div className="text-gray-800 text-[9.5pt]">Kepada Yth.</div>
            <div className="font-bold">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("kepadanya", e.target.innerText)}
                className="bg-transparent border-b border-dashed border-gray-300 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white px-0.5 py-0.5 outline-none text-[11pt] block w-full"
              >{formData.kepadanya || "Nama Penerima/Perusahaan..."}</span>
            </div>

            <div className="text-gray-800 leading-normal">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("alamatTertuju", e.target.innerText)}
                className="bg-transparent border-b border-dashed border-gray-300 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white px-0.5 py-0.5 outline-none text-[11pt] block w-full"
              >{formData.alamatTertuju || "Alamat Tertuju..."}</span>
            </div>

            {type !== "elektronik" && type !== "kendaraan" && <div className="text-gray-800 text-[9.5pt]">Di</div>}
            <div className={(type === "elektronik" || type === "kendaraan") ? "text-gray-800 leading-normal" : "font-bold underline uppercase"}>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("provinsi", e.target.innerText)}
                className={(type === "elektronik" || type === "kendaraan")
                  ? "bg-transparent border-b border-dashed border-gray-300 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white px-0.5 py-0.5 outline-none text-[11pt] block w-full"
                  : "bg-transparent border-b border-dashed border-gray-300 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white px-0.5 py-0.5 outline-none font-bold underline text-[11pt] uppercase block w-full"
                }
              >{formData.provinsi || "Provinsi/Kota"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menunjuk Section */}
      {type !== "elektronik" && (
        <div id={`preview-references-${type}`} className="mb-2">
          <p className="mb-1 text-gray-800">Menunjuk :</p>
          <div className="space-y-1">
            {/* Point 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '4px', textIndent: '0px', textAlign: 'justify' }} className="pl-6 text-gray-800">
              <div>1.</div>
              <div>
                {type === "kendaraan" ? "Surat Penawaran Harga dari Perusahaan Saudara Nomor : " : "Surat Penawaran Harga dari Perusahaan Saudara Nomor: "}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("ref1No", e.target.innerText)}
                  className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors"
                >
                  {formData.ref1No || "..."}
                </span>{" "}
                tanggal{" "}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("ref1TglRaw", e.target.innerText)}
                  className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors"
                >
                  {formatDateOnly(formData.ref1TglRaw) || "..."}
                </span>.
              </div>
            </div>

            {/* Point 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '4px', textIndent: '0px', textAlign: 'justify' }} className="pl-6 text-gray-800">
              <div>2.</div>
              <div>
                {type === "kendaraan" ? "Berita Acara Klarifikasi dan Negosiasi Nomor : " : "Berita Acara Negosiasi Harga Nomor: "}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("ref2No", e.target.innerText)}
                  className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors"
                >
                  {formData.ref2No || "..."}
                </span>{" "}
                tanggal{" "}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("ref2TglRaw", e.target.innerText)}
                  className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors"
                >
                  {formatDateOnly(formData.ref2TglRaw) || "..."}
                </span>.
              </div>
            </div>

            {/* Point 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '4px', textIndent: '0px', textAlign: 'justify' }} className="pl-6 text-gray-800">
              <div>3.</div>
              <div>
                {type === "kendaraan" ? "Surat Penunjukan Pelaksana Penyedia Barang/Jasa Nomor : " : "Surat Penunjukan Pelaksanaan Pekerjaan: "}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("ref3No", e.target.innerText)}
                  className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors"
                >
                  {formData.ref3No || "..."}
                </span>{" "}
                tanggal{" "}
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("ref3TglRaw", e.target.innerText)}
                  className="hover:bg-gray-100 focus:bg-white outline-none px-1 rounded transition-colors"
                >
                  {formatDateOnly(formData.ref3TglRaw) || "..."}
                </span>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kalimat Pengantar */}
      <div className="mb-2 text-justify leading-normal text-gray-800">
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleInlineEdit("introText", e.target.innerText)}
          className="outline-none block hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors"
        >
          {formData.introText}
        </span>
      </div>
    </div>
  );

  // Renders the high-fidelity 6-row spanned layout table matching user's reference mockup
  const renderTable = () => {
    if (type === "elektronik" || type === "kendaraan") {
      const col4Title = type === "kendaraan" ? "Harga Sewa per Unit per Bulan" : "Harga Sewa per Unit";
      const col5Title = type === "kendaraan" ? "Jumlah" : "Jumlah Harga Sewa Perbulan";
      const row2Title = type === "kendaraan" ? "Jumlah Harga Sewa per Bulan" : "Total Harga Sewa Per Bulan";
      const row3Title = formData.spkBulan
        ? `Total Harga Sewa (${formData.spkBulan} Bulan)`
        : "Total Harga Sewa";

      const activeRows = itemsList.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            uraian: item.uraian || projectUraian,
            qty: item.qty || projectJumlah,
            hargaUnit: item.hargaUnit || formData.hargaSewaPerUnit,
            totalBulan: item.totalBulan || formData.spkJumlah
          };
        }
        return item;
      });

      return (
        <div key="table" id={`preview-table-${type}`} className="mb-2 overflow-visible">
          <table className="w-full border-collapse border border-black text-[10pt] text-left table-fixed">
            <thead>
              <tr className="border-b border-black bg-gray-50/50">
                <th className="border-r border-black p-1 text-center w-[6%] font-normal">No</th>
                <th className="border-r border-black p-1 text-center w-[40%] font-normal font-sans">Uraian Pekerjaan</th>
                <th className="border-r border-black p-1 text-center w-[12%] font-normal font-sans">QTY.</th>
                <th className="border-r border-black p-1 text-center w-[18%] font-normal font-sans">{col4Title}</th>
                <th className="p-1 text-center w-[24%] font-normal font-sans">{col5Title}</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-black">
                  <td className="border-r border-black p-1 text-center align-top">{idx + 1}.</td>
                  <td className="border-r border-black p-1 align-top text-left font-normal uppercase leading-tight whitespace-pre-wrap">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "uraian", e.target.innerText)}
                      className="outline-none block w-full min-h-[2.5em]"
                    >
                      {item.uraian}
                    </span>
                  </td>
                  <td className="border-r border-black p-1 text-center align-top font-bold">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "qty", e.target.innerText)}
                      className="outline-none block w-full text-center"
                    >
                      {item.qty}
                    </span>
                  </td>
                  <td className="border-r border-black p-1 text-center align-top font-bold font-mono">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "hargaUnit", e.target.innerText.replace(/,-$/, ""))}
                      className={`outline-none inline-block text-center ${!item.hargaUnit ? "text-gray-400 italic" : ""}`}
                    >
                      {item.hargaUnit || "..."}
                    </span>
                    ,-
                  </td>
                  <td className="p-1 text-center align-top font-bold font-mono">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "totalBulan", e.target.innerText.replace(/,-$/, ""))}
                      className="outline-none inline-block text-center"
                    >
                      {item.totalBulan ? `${item.totalBulan},-` : "...,-"}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Row 2: Total Harga Sewa Per Bulan */}
              <tr className="border-b border-black font-bold">
                <td colSpan={4} className="border-r border-black p-1 text-right pr-4 font-sans">
                  {row2Title}
                </td>
                <td className="p-1 text-left font-mono">
                  Rp {formData.spkJumlah ? `${formData.spkJumlah},-` : "-"}
                </td>
              </tr>

              {/* Row 3: Total Harga Sewa (36 Bulan) */}
              <tr className="border-b border-black font-bold">
                <td colSpan={4} className="border-r border-black p-1 text-right pr-4 font-sans">
                  {row3Title}
                </td>
                <td className="p-1 text-left font-mono">
                  Rp {formData.spkDibulatkan || formData.spkTotal ? `${formData.spkDibulatkan || formData.spkTotal},-` : "-"}
                </td>
              </tr>

              {/* Terbilang block */}
              <tr>
                <td colSpan={5} className="p-1 italic leading-normal border-t border-black text-gray-800 text-center font-bold">
                  “{isCustomTerbilang ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setCustomTerbilang(e.target.innerText)}
                      className="outline-none px-0.5"
                    >
                      {customTerbilang}
                    </span>
                  ) : (
                    <span>{displayTerbilang}</span>
                  )}”
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div key="table" id={`preview-table-${type}`} className="mb-2 overflow-visible">
        <table className="w-full border-collapse border border-black text-[10pt] text-left table-fixed">
          <thead>
            <tr className="border-b border-black bg-gray-50/50">
              <th className="border-r border-black p-1 text-center w-[6%] font-bold">No</th>
              <th className="border-r border-black p-1 text-center w-[40%] font-bold">Uraian</th>
              <th className="border-r border-black p-1 text-center w-[12%] font-bold">Jumlah</th>
              <th className="border-r border-black p-1 text-center w-[18%] font-bold">Harga Satuan</th>
              <th className="p-1 text-center w-[24%] font-bold">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 text-center align-top" rowSpan={6}>1.</td>
              <td className="border-r border-black p-1 align-top text-left uppercase leading-tight whitespace-pre-wrap" rowSpan={6}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setProjectUraian(e.target.innerText)}
                  className="outline-none block w-full min-h-[4em]"
                >
                  {projectUraian}
                </span>
              </td>
              <td className="border-r border-black p-1 text-center align-top" rowSpan={6}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setProjectJumlah(e.target.innerText)}
                  className="outline-none block w-full text-center"
                >
                  {projectJumlah}
                </span>
              </td>
              <td className="border-r border-black p-1 align-top text-left font-sans">Jumlah</td>
              <td className="p-1 text-right align-top font-mono">
                Rp. {formData.spkJumlah},-
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 align-top text-left font-sans">Jasa Kontraktor 10%</td>
              <td className="p-1 text-right align-top font-mono">
                Rp. {formData.spkJasa},-
              </td>
            </tr>

            {/* Row 3 */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 align-top text-left font-sans">Sub Total</td>
              <td className="p-1 text-right align-top font-mono font-semibold">
                Rp. {formData.spkSubTotal},-
              </td>
            </tr>

            {/* Row 4 */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 align-top text-left font-sans">PPN 11%</td>
              <td className="p-1 text-right align-top font-mono">
                Rp. {formData.spkPpn},-
              </td>
            </tr>

            {/* Row 5 */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 align-top text-left font-sans">Total</td>
              <td className="p-1 text-right align-top font-mono font-bold">
                Rp. {formData.spkTotal},-
              </td>
            </tr>

            {/* Row 6 */}
            <tr className="border-b border-black font-bold">
              <td className="border-r border-black p-1 align-top text-left font-sans">Dibulatkan</td>
              <td className="p-1 text-right align-top font-mono text-[10.5pt]">
                Rp. {formData.spkDibulatkan},-
              </td>
            </tr>

            {/* Terbilang block */}
            <tr>
              <td colSpan={5} className="p-1 italic leading-normal border-t border-black text-gray-800">
                <strong>Terbilang :</strong>{" "}
                {isCustomTerbilang ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setCustomTerbilang(e.target.innerText)}
                    className="outline-none font-semibold px-0.5"
                  >
                    {customTerbilang}
                  </span>
                ) : (
                  <span>{calculatedTerbilang}</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderSyaratHeading = () => (
    <p key="syarath" className="mb-1 text-[9.5pt]">Syarat-syarat:</p>
  );

  const renderSyarat1 = () => {
    if (type === "elektronik") {
      return (
        <div key="s1" id={`preview-terms-${type}`} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }}>
            <div>1.</div>
            <div className="space-y-1">
              {/* Point a */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', textIndent: '0px', textAlign: 'justify' }}>
                <div>a.</div>
                <div>
                  Jangka Waktu Penyelesaian Pekerjaan adalah{" "}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit("syarat1aHari", e.target.innerText)}
                    className={`font-bold border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.syarat1aHari ? "text-gray-400 italic" : ""}`}
                  >
                    {formData.syarat1aHari || "..."}
                  </span>{" "}
                  hari kalender terhitung sejak SPK diterima.
                </div>
              </div>

              {/* Point b */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', textIndent: '0px', textAlign: 'justify' }}>
                <div>b.</div>
                <div>
                  Jangka waktu penyerahan Pekerjaan Barang/Jasa adalah{" "}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit("syarat1bText", e.target.innerText)}
                    className={`border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.syarat1bText ? "text-gray-400 italic font-medium" : ""}`}
                  >
                    {formData.syarat1bText || "[Tuliskan jangka waktu penyerahan, contoh: 30 hari kerja sejak SPK diterima]"}
                  </span>
                </div>
              </div>

              {/* Point c */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', textIndent: '0px', textAlign: 'justify' }}>
                <div>c.</div>
                <div>
                  Jangka waktu sewa adalah{" "}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit("syarat1cText", e.target.innerText)}
                    className={`border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.syarat1cText ? "text-gray-400 italic font-medium" : ""}`}
                  >
                    {formData.syarat1cText || "[Tuliskan jangka waktu sewa, contoh: 36 Bulan sejak serah terima barang]"}
                  </span>
                </div>
              </div>

              {/* Point d */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', textIndent: '0px', textAlign: 'justify' }}>
                <div>d.</div>
                <div>
                  Jangka waktu berlakunya Surat Perintah Kerja (SPK) adalah{" "}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit("syarat1dText", e.target.innerText)}
                    className={`border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.syarat1dText ? "text-gray-400 italic font-medium" : ""}`}
                  >
                    {formData.syarat1dText || "[Tuliskan jangka waktu berlakunya SPK, contoh: selama 36 Bulan terhitung sejak Serah Terima]"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === "kendaraan") {
      return (
        <div key="s1" id={`preview-terms-${type}`} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }}>
            <div>1.</div>
            <div className="space-y-1">
              {/* Point a */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', textIndent: '0px', textAlign: 'justify' }}>
                <div>a.</div>
                <div>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit("syarat1aKendaraanText", e.target.innerText)}
                    className="outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors"
                  >
                    {formData.syarat1aKendaraanText || "Harga yang tertera sudah termasuk Pajak-pajak 11%"}
                  </span>
                </div>
              </div>

              {/* Point b */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', textIndent: '0px', textAlign: 'justify' }}>
                <div>b.</div>
                <div>
                  Jangka waktu berlakunya sewa menyewa adalah{" "}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit("syarat1bKendaraanText", e.target.innerText)}
                    className={`border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.syarat1bKendaraanText ? "text-gray-400 italic font-medium" : ""}`}
                  >
                    {formData.syarat1bKendaraanText || "[Tuliskan jangka waktu sewa, contoh: selama 12 Bulan. Berlaku dari 23 Juli sampai dengan 22 Juli 2025]"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key="s1" id={`preview-terms-${type}`} style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800">
        <div>1.</div>
        <div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("syarat1Text", e.target.innerText)}
            className="outline-none block w-full"
          >
            {formData.syarat1Text}
          </span>
        </div>
      </div>
    );
  };

  const renderSyarat2 = () => {
    if (type === "elektronik") {
      return (
        <div key="s2" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div>2.</div>
          <div>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("syarat2ElektronikText", e.target.innerText)}
              className={`outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors ${!formData.syarat2ElektronikText ? "text-gray-400 italic font-medium" : ""}`}
            >
              {formData.syarat2ElektronikText || "Tuliskan detail denda..."}
            </span>
          </div>
        </div>
      );
    }

    if (type === "kendaraan") {
      return (
        <div key="s2" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div>2.</div>
          <div>
            SPK ini merupakan bagian yang tidak terpisahkan dari {" "}
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("syarat2KendaraanText", e.target.innerText)}
              className={`border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.syarat2KendaraanText ? "text-gray-400 italic font-medium" : ""}`}
            >
              {formData.syarat2KendaraanText || "[Tuliskan nomor SPK referensi, contoh: SPK nomor 1142/00020.02/2020]"}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key="s2" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800">
        <div>2.</div>
        <div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("syarat2Text", e.target.innerText)}
            className="outline-none block w-full"
          >
            {formData.syarat2Text}
          </span>
        </div>
      </div>
    );
  };

  const renderSyarat3 = () => {
    if (type === "elektronik") {
      return (
        <div key="s3" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div>3.</div>
          <div>
            Barang yang diserahkan adalah 100% baru sesuai dengan spesifikasi dan jumlah yang disepakati, tidak mempunyai cacat material/bahan atau cacat teknis dan siap digunakan/pakai.
          </div>
        </div>
      );
    }

    if (type === "kendaraan") {
      return (
        <div key="s3" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div>3.</div>
          <div>
            Sifat kontrak yang digunakan pada perpanjangan sewa ini adalah bersifat Sementara, sehingga jika sudah ada pergantian jumlah unit {" "}
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("jenisElektronik", e.target.innerText)}
              className={`font-bold border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.jenisElektronik ? "text-gray-400 italic font-medium" : ""}`}
            >
              {formData.jenisElektronik || "[Tuliskan jenis kendaraan, contoh: Motor Honda Supra X125 PGM FI CW Tahun 2020]"}
            </span>{" "}
            yang baru, maka ketentuan perjanjian sewa menyewa ini dapat dinyatakan selesai atau berakhir.
          </div>
        </div>
      );
    }

    return (
      <div key="s3" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800">
        <div>3.</div>
        <div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("syarat3Text", e.target.innerText)}
            className="outline-none block w-full font-sans"
          >
            {formData.syarat3Text || "Tuliskan detail tahapan pembayaran..."}
          </span>
        </div>
      </div>
    );
  };

  const renderSyarat4Part1 = () => {
    if (type === "elektronik") {
      return (
        <div key="s4_elektronik" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans syarat-list-item">
          <div>4.</div>
          <div>
            Sifat kontrak yang digunakan pada pengadaan ini adalah <strong className="font-bold">Harga Satuan</strong>, sehingga jika ada permintaan penambahan jumlah unit{" "}
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("jenisElektronik", e.target.innerText)}
              className={`font-bold border-b border-dashed border-gray-350 px-0.5 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none ${!formData.jenisElektronik ? "text-gray-400 italic font-medium" : ""}`}
            >
              {formData.jenisElektronik || "[Tuliskan jenis elektronik, contoh: Printer]"}
            </span>
            , ketentuan jumlah biaya/harga dapat berubah menyesuaikan dengan jumlah awal.
          </div>
        </div>
      );
    }

    if (type === "kendaraan") {
      const part1Items = syarat4Items.filter(item => ["a", "b", "c", "d"].includes(item.key));
      return (
        <div key="s4_part1_kendaraan" className="syarat-list-item text-[9.5pt] leading-[1.35] text-gray-800 font-sans space-y-1">
          {/* Syarat 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 syarat-list-item">
            <div>4.</div>
            <div>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("syarat4KendaraanText", e.target.innerText)}
                className="outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors"
              >
                {formData.syarat4KendaraanText || "Jumlah biaya/harga akan dibayarkan sesuai dengan jumlah unit yang digunakan."}
              </span>
            </div>
          </div>

          {/* Syarat 5 */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-0.5 syarat-list-item">
            <div>5.</div>
            <div>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("syarat5IntroKendaraanText", e.target.innerText)}
                className="outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors"
              >
                {formData.syarat5IntroKendaraanText || "Pembayaran dilakukan di Kas Kantor Wilayah VIII PT Pegadaian Jakarta dengan dilampiri :"}
              </span>
            </div>
          </div>

          {/* List items a through d */}
          <div className="space-y-0.5" style={{ paddingLeft: '0.8cm' }}>
            {part1Items.map((item) => (
              <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.2cm', textIndent: '0px', textAlign: 'justify' }} className="syarat-list-item">
                <div>{item.key}.</div>
                <div>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleListChange("syarat4", item.key, e.target.innerText)}
                    className="outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors"
                  >
                    {item.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const part1Items = syarat4Items.filter(item => ["a", "b", "c", "d"].includes(item.key));
    return (
      <div key="s4p1" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans syarat-list-item">
        <div>4.</div>
        <div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("syarat4IntroText", e.target.innerText)}
            className="outline-none block w-full mb-1"
          >
            {formData.syarat4IntroText}
          </span>
          {part1Items.map((subItem) => (
            <div key={subItem.key} style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5 syarat-list-item">
              <div>{subItem.key}.</div>
              <div>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleListChange("syarat4", subItem.key, e.target.innerText)}
                  className="outline-none block w-full"
                >
                  {subItem.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSyarat4Part2 = () => {
    if (type === "elektronik") return null;

    if (type === "kendaraan") {
      const part2Items = syarat4Items.filter(item => ["e", "f", "g", "h"].includes(item.key));
      return (
        <div key="s4_part2_kendaraan" className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans space-y-0.5" style={{ paddingLeft: '0.8cm' }}>
          {part2Items.map((item) => (
            <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.2cm', textIndent: '0px', textAlign: 'justify' }} className="syarat-list-item">
              <div>{item.key}.</div>
              <div>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleListChange("syarat4", item.key, e.target.innerText)}
                  className="outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors"
                >
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const part2Items = syarat4Items.filter(item => ["e", "f", "g", "h"].includes(item.key));
    return (
      <div key="s4p2" className="mb-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
        {/* On page 2, sub-items e through h are formatted with marginLeft: '1.6cm' matching a through d */}
        {part2Items.map((subItem) => (
          <div key={subItem.key} style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '1.6cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5 syarat-list-item">
            <div>{subItem.key}.</div>
            <div>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleListChange("syarat4", subItem.key, e.target.innerText)}
                className="outline-none block w-full"
              >
                {subItem.text}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSyarat5 = () => {
    if (type === "elektronik") {
      return (
        <div key="s5" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div>5.</div>
          <div>
            Jumlah biaya/harga akan dibayarkan sesuai dengan jumlah barang yang dipesan.
          </div>
        </div>
      );
    }

    if (type === "kendaraan") {
      return (
        <div key="s5_kendaraan" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
          <div>6.</div>
          <div>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("syarat6KendaraanText", e.target.innerText)}
              className="outline-none block w-full hover:bg-gray-50 focus:bg-white p-0.5 rounded transition-colors whitespace-pre-wrap"
            >
              {formData.syarat6KendaraanText}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key="s5" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
        <div>5.</div>
        <div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("syarat5Text", e.target.innerText)}
            className="outline-none block w-full whitespace-pre-wrap"
          >
            {formData.syarat5Text}
          </span>
        </div>
      </div>
    );
  };

  const renderSyarat6 = () => {
    if (type === "kendaraan") return null;

    if (type === "elektronik") {
      return (
        <>
          {/* Syarat 6 */}
          <div key="s6" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
            <div>6.</div>
            <div>
              Pembayaran
              <br />
              Metode Pembayaran dilakukan melalui transfer ke rekening Bank Perusahaan Saudara setelah pekerjaan selesai dilaksanakan sesuai jumlah tagihan dilampiri :
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-1">
                <div>-</div>
                <div>Surat permohonan Pembayaran bermaterai @Rp 10.000 yang mencantumkan Nomor Rekening Bank Perusahaan.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>-</div>
                <div>Berita Acara Serah Terima Pekerjaan.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>-</div>
                <div>Faktur Pajak ;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>-</div>
                <div>Foto Copy SPK;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>-</div>
                <div>Kwitansi pembayaran bermaterai @ Rp 10.000.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>-</div>
                <div>Fotocopy SIUP & NPWP.</div>
              </div>
            </div>
          </div>

          {/* Syarat 7 */}
          <div key="s7" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
            <div>7.</div>
            <div>
              Persyaratan Khusus:
              <br />
              syarat-syarat lain yang belum diatur didalam SPK ini akan diatur kemudian didalam perjanjian Kerja (jika diperlukan).
            </div>
          </div>

          {/* Syarat 8 */}
          <div key="s8" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9.5pt] leading-[1.35] text-gray-800 font-sans">
            <div>8.</div>
            <div>
              Persyaratan Lain :
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-1">
                <div>a.</div>
                <div>Barang/Jasa sebelum diserahkan akan diperiksa terlebih dahulu, dan apabila tidak memenuhi syarat spesifikasi tehnis dan jumlah akan dikembalikan kepada Perusahaan Saudara dengan beban dan biaya menjadi tanggungjawab perusahaan Saudara;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>b.</div>
                <div>PT PEGADAIAN dibebaskan dari segala bentuk tuntutan apapun dari Pihak Ketiga yang berkaitan dengan SPK ini;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>c.</div>
                <div>setiap perubahan mengenai jumlah, uraian pekerjaan, harga, dan syarat yang tercantum dalam SPK ini harus disetujui secara tertulis oleh PT PEGADAIAN dan Perusahaan Saudara;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
                <div>d.</div>
                <div>Sebagai konfirmasi persetujuan, Saudara wajib menandatangani SPK asli ini diatas meterai yang cukup, dan mengembalikan 2 (dua) hari kerja sejak diterimanya SPK ini sebagai pemberitahuan, baik yang disampaikan melalui email maupun kurir.</div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <div key="s6" style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0cm', textIndent: '0px', textAlign: 'justify' }} className="mb-1 mt-1 text-[9pt] leading-[1.3] text-gray-800 font-sans">
        <div>6.</div>
        <div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineEdit("syarat6IntroText", e.target.innerText)}
            className="outline-none block w-full mb-1"
          >
            {formData.syarat6IntroText}
          </span>
          {syarat6Items.map((subItem) => (
            <div key={subItem.key} style={{ display: 'grid', gridTemplateColumns: '0.4cm 1fr', gap: '0.4cm', marginLeft: '0.8cm', textIndent: '0px', textAlign: 'justify' }} className="mt-0.5">
              <div>{subItem.key}.</div>
              <div>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleListChange("syarat6", subItem.key, e.target.innerText)}
                  className="outline-none block w-full"
                >
                  {subItem.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderClosing = () => {
    if (type === "elektronik" || type === "kendaraan") return null;
    return (
      <div key="closing" className="mb-2 mt-2 text-[9pt] text-justify w-full leading-[1.3] text-gray-800 font-sans">
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleInlineEdit("closingText", e.target.innerText)}
          className="outline-none block w-full"
        >
          {formData.closingText}
        </span>
      </div>
    );
  };

  const renderSignatures = () => (
    <div key="signatures" id={`preview-signatures-${type}`} className="flex flex-col w-full text-[9.5pt] mb-1 mt-3">
      {(type === "elektronik" || type === "kendaraan") && (
        <div className="text-center mb-6 font-normal leading-[1.3] text-[9.5pt]">
          <div>Diterima dan disetujui</div>
          <div>
            pada tanggal :{" "}
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("tanggalPersetujuanRaw", e.target.innerText)}
              className="border-b border-dashed border-gray-350 px-1 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white outline-none font-sans font-normal"
            >
              {formatDateOnly(formData.tanggalPersetujuanRaw)}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-center">
        {/* Pelaksana / Left */}
        <div className="flex flex-col justify-between h-[115px]">
          <div className="flex flex-col items-center justify-start h-12 leading-tight">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("sigKiriPerusahaan", e.target.innerText)}
              className="outline-none font-bold text-center w-full uppercase"
            >
              {formData.sigKiriPerusahaan || "Nama Perusahaan Pihak I"}
            </span>
          </div>

          {/* Space for Materai and signature */}
          <div className="flex flex-col items-center mt-auto">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("sigKiriNama", e.target.innerText)}
              className="outline-none font-bold text-center w-full uppercase underline"
            >
              {formData.sigKiriNama || "Nama Pihak I"}
            </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("sigKiriJabatan", e.target.innerText)}
              className="outline-none text-center w-full text-gray-700 font-sans text-xs mt-0.5"
            >
              {formData.sigKiriJabatan || "Jabatan"}
            </span>
          </div>
        </div>

        {/* Pegadaian / Right */}
        <div className="flex flex-col justify-between h-[115px]">
          <div className="flex flex-col items-center justify-start h-12 leading-tight">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("sigKananPerusahaan", e.target.innerText)}
              className="outline-none font-bold text-center w-full whitespace-pre-wrap uppercase"
            >
              {formData.sigKananPerusahaan || "Nama Perusahaan Pihak II"}
            </span>
          </div>

          <div className="flex flex-col items-center mt-auto">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("sigKananNama", e.target.innerText)}
              className="outline-none font-bold text-center w-full uppercase underline"
            >
              {formData.sigKananNama || "Nama Pihak II"}
            </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("sigKananJabatan", e.target.innerText)}
              className="outline-none text-center w-full text-gray-700 font-sans text-xs mt-0.5"
            >
              {formData.sigKananJabatan || "Jabatan"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const getDocumentBlocks = () => {
    const blocks = [];

    // 1. Intro
    blocks.push({
      id: "intro",
      type: "intro",
      render: () => renderIntro()
    });

    // 2. Table
    if (type === "elektronik" || type === "kendaraan") {
      // Split the table into header, rows, and calculations
      blocks.push({
        id: "table-header",
        type: "table-header",
        render: () => (
          <table className="w-full border-collapse border border-black text-[10pt] text-left table-fixed">
            <thead>
              <tr className="border-b border-black bg-gray-50/50">
                <th className="border-r border-black p-1 text-center w-[6%] font-normal">No</th>
                <th className="border-r border-black p-1 text-center w-[40%] font-normal font-sans">Uraian Pekerjaan</th>
                <th className="border-r border-black p-1 text-center w-[12%] font-normal font-sans">QTY.</th>
                <th className="border-r border-black p-1 text-center w-[18%] font-normal font-sans">
                  {type === "kendaraan" ? "Harga Sewa per Unit/Bln" : "Harga Sewa per Unit"}
                </th>
                <th className="p-1 text-center w-[24%] font-normal font-sans">
                  {type === "kendaraan" ? "Jumlah" : "Jumlah Harga Sewa Perbulan"}
                </th>
              </tr>
            </thead>
          </table>
        )
      });

      // Individual rows
      const activeRows = itemsList.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            uraian: item.uraian || projectUraian,
            qty: item.qty || projectJumlah,
            hargaUnit: item.hargaUnit || formData.hargaSewaPerUnit,
            totalBulan: item.totalBulan || formData.spkJumlah
          };
        }
        return item;
      });

      activeRows.forEach((item, idx) => {
        blocks.push({
          id: `table-row-${idx}`,
          type: "table-row",
          index: idx,
          render: () => (
            <table className="w-full border-collapse border-l border-r border-b border-black text-[10pt] text-left table-fixed">
              <tbody>
                <tr className="border-b border-black last:border-b-0">
                  <td className="border-r border-black p-1 text-center align-top w-[6%]">{idx + 1}.</td>
                  <td className="border-r border-black p-1 align-top text-left leading-tight whitespace-pre-wrap w-[40%]">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "uraian", e.target.innerText)}
                      className="outline-none block w-full min-h-[2.5em]"
                    >
                      {item.uraian}
                    </span>
                  </td>
                  <td className={`border-r border-black p-1 text-center align-top w-[12%] ${type === "kendaraan" ? "font-bold" : "font-normal"}`}>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "qty", e.target.innerText)}
                      className="outline-none block w-full text-center"
                    >
                      {item.qty}
                    </span>
                  </td>
                  <td className={`border-r border-black p-1 text-center align-top font-mono w-[18%] ${type === "kendaraan" ? "font-bold" : "font-normal"}`}>
                    {type === "kendaraan" ? "Rp. " : "Rp "}&nbsp;
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "hargaUnit", e.target.innerText.replace(/^Rp\.?\s*/i, "").replace(/,-$/, ""))}
                      className={`outline-none inline-block text-center ${!item.hargaUnit ? "text-gray-400 italic" : ""}`}
                    >
                      {item.hargaUnit || "..."}
                    </span>
                    ,-
                  </td>
                  <td className={`p-1 text-center align-top font-mono w-[24%] ${type === "kendaraan" ? "font-bold" : "font-normal"}`}>
                    {type === "kendaraan" ? "Rp. " : "Rp "}&nbsp;
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "totalBulan", e.target.innerText.replace(/^Rp\.?\s*/i, "").replace(/,-$/, ""))}
                      className="outline-none inline-block text-center"
                    >
                      {item.totalBulan ? `${item.totalBulan}` : "..."}
                    </span>
                    ,-
                  </td>
                </tr>
              </tbody>
            </table>
          )
        });
      });

      // Calculations and Terbilang
      blocks.push({
        id: "table-calculations",
        type: "table-calculations",
        render: () => {
          const row2Title = type === "kendaraan" ? "Jumlah Harga Sewa per Bulan" : "Total Harga Sewa Per Bulan";
          const row3Title = formData.spkBulan
            ? `Total Harga Sewa (${formData.spkBulan} Bulan)`
            : "Total Harga Sewa";

          return (
            <table className="w-full border-collapse border-l border-r border-b border-black text-[10pt] text-left table-fixed">
              <tbody>
                <tr className="border-b border-black font-bold">
                  <td className="border-r border-black p-1 text-right pr-4 font-sans w-[76%]">
                    {row2Title}
                  </td>
                  <td className="p-1 text-left font-mono w-[24%]">
                    {type === "kendaraan" ? "Rp. " : "Rp "}{formData.spkJumlah ? `${formData.spkJumlah},-` : "-"}
                  </td>
                </tr>
                <tr className="border-b border-black font-bold">
                  <td className="border-r border-black p-1 text-right pr-4 font-sans w-[76%]">
                    {row3Title}
                  </td>
                  <td className="p-1 text-left font-mono w-[24%]">
                    {type === "kendaraan" ? "Rp. " : "Rp "}{formData.spkDibulatkan || formData.spkTotal ? `${formData.spkDibulatkan || formData.spkTotal},-` : "-"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-1 italic leading-normal border-t border-black text-gray-800 text-center font-bold">
                    “{isCustomTerbilang ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setCustomTerbilang(e.target.innerText)}
                        className="outline-none px-0.5"
                      >
                        {customTerbilang}
                      </span>
                    ) : (
                      <span>{displayTerbilang}</span>
                    )}”
                  </td>
                </tr>
              </tbody>
            </table>
          );
        }
      });
    } else {
      // Renovasi table is rendered as a single block
      blocks.push({
        id: "table-renovasi",
        type: "table-renovasi",
        render: () => renderTable()
      });
    }

    // 3. Syarat Heading
    blocks.push({
      id: "syarat-heading",
      type: "syarat-heading",
      render: () => renderSyaratHeading()
    });

    // 4. Syarat 1, 2, 3
    blocks.push({
      id: "syarat-1",
      type: "syarat-1",
      render: () => renderSyarat1()
    });
    blocks.push({
      id: "syarat-2",
      type: "syarat-2",
      render: () => renderSyarat2()
    });
    blocks.push({
      id: "syarat-3",
      type: "syarat-3",
      render: () => renderSyarat3()
    });

    // 5. Syarat 4
    if (type === "elektronik") {
      blocks.push({
        id: "syarat-4-elektronik",
        type: "syarat-4-elektronik",
        render: () => renderSyarat4Part1()
      });
    } else if (type === "kendaraan") {
      blocks.push({
        id: "syarat-4-part-1-kendaraan",
        type: "syarat-4-part-1-kendaraan",
        render: () => renderSyarat4Part1()
      });
      blocks.push({
        id: "syarat-4-part-2-kendaraan",
        type: "syarat-4-part-2-kendaraan",
        render: () => renderSyarat4Part2()
      });
    } else {
      // Renovasi has Syarat 4 items grouped like Kendaraan to ensure clean page breaks
      blocks.push({
        id: "syarat-4-part-1-renovasi",
        type: "syarat-4-part-1-renovasi",
        render: () => renderSyarat4Part1()
      });
      blocks.push({
        id: "syarat-4-part-2-renovasi",
        type: "syarat-4-part-2-renovasi",
        render: () => renderSyarat4Part2()
      });
    }

    // 6. Syarat 5
    blocks.push({
      id: "syarat-5",
      type: "syarat-5",
      render: () => renderSyarat5()
    });

    // 7. Syarat 6 (and above for elektronik)
    if (type === "elektronik") {
      // In elektronik, syarat 6, 7, 8 are rendered together
      blocks.push({
        id: "syarat-6-7-8-elektronik",
        type: "syarat-6-7-8-elektronik",
        render: () => renderSyarat6()
      });
    } else if (type === "renovasi") {
      // Renovasi has Syarat 6 items grouped into a single block to ensure clean page breaks
      blocks.push({
        id: "syarat-6-renovasi",
        type: "syarat-6-renovasi",
        render: () => renderSyarat6()
      });
    }

    // 8. Closing
    if (type !== "elektronik" && type !== "kendaraan") {
      blocks.push({
        id: "closing",
        type: "closing",
        render: () => renderClosing()
      });
    }

    // 9. Signatures
    blocks.push({
      id: "signatures",
      type: "signatures",
      render: () => renderSignatures()
    });

    return blocks;
  };

  const [pageGroups, setPageGroups] = useState(null);
  const measureContainerRef = useRef(null);

  const getDefaultPageGroups = () => {
    const blocks = getDocumentBlocks();
    const page1Ids = [];
    const page2Ids = [];

    blocks.forEach((block) => {
      if (
        block.id === "intro" ||
        block.id.startsWith("table-row-") ||
        block.id === "table-header" ||
        block.id === "table-renovasi" ||
        block.id === "table-calculations" ||
        block.id === "syarat-heading" ||
        block.id === "syarat-1" ||
        block.id === "syarat-2" ||
        block.id === "syarat-3" ||
        block.id.startsWith("syarat-4-part-1")
      ) {
        page1Ids.push(block.id);
      } else {
        page2Ids.push(block.id);
      }
    });

    return [page1Ids, page2Ids];
  };

  React.useLayoutEffect(() => {
    if (!measureContainerRef.current) return;

    const container = measureContainerRef.current;
    const children = Array.from(container.querySelectorAll("[data-block-id]"));
    const blockHeights = {};
    children.forEach((child) => {
      const id = child.getAttribute("data-block-id");
      blockHeights[id] = child.getBoundingClientRect().height;
    });



    // Hitung tinggi maksimal halaman secara presisi berdasarkan ukuran A4 nyata,
    // bukan angka tebakan, supaya konten tidak overflow dan tanda tangan tidak terpotong.
    const MM_TO_PX = 3.7795; // konversi mm ke px pada 96dpi
    const PAPER_HEIGHT_MM = 297;
    const PADDING_TOP_MM = 5;
    const PADDING_BOTTOM_MM = 5;
    const HEADER_MM = 14;
    const FOOTER_MM = 16;
    const CONTENT_MARGIN_TOP_MM = 20;
    const CONTENT_MARGIN_BOTTOM_MM = 23;
    const SAFETY_BUFFER_MM = 12; // buffer ekstra kustom agar aman

    const usableHeightMM =
      PAPER_HEIGHT_MM - PADDING_TOP_MM - PADDING_BOTTOM_MM - CONTENT_MARGIN_TOP_MM - CONTENT_MARGIN_BOTTOM_MM - SAFETY_BUFFER_MM;
    const maxPageHeight = usableHeightMM * MM_TO_PX;

    // Tinggi blok tanda tangan diambil terpisah agar bisa dicek khusus
    const signatureHeight = blockHeights["signatures"] || 0;

    const newPageGroups = [];
    let currentPage = [];
    let currentPageHeight = 0;

    const blocks = getDocumentBlocks();

    blocks.forEach((block) => {
      let height = blockHeights[block.id] || 0;
      const isSignatureBlock = block.id === "signatures";

      if (currentPage.length === 0) {
        currentPage.push(block.id);
        currentPageHeight = height;
        if (block.type === "table-row") {
          const headerHeight = blockHeights["table-header"] || 0;
          currentPageHeight += headerHeight;
        }
      } else if (currentPageHeight + height > maxPageHeight) {
        newPageGroups.push(currentPage);
        currentPage = [block.id];
        currentPageHeight = height;
        if (block.type === "table-row") {
          const headerHeight = blockHeights["table-header"] || 0;
          currentPageHeight += headerHeight;
        }
      } else if (
        isSignatureBlock &&
        currentPageHeight + signatureHeight > maxPageHeight
      ) {
        // Khusus tanda tangan: jika sisa ruang halaman ini tidak cukup
        // untuk menampung SELURUH blok tanda tangan, pindahkan ke halaman baru
        // agar tidak terpotong di tengah.
        newPageGroups.push(currentPage);
        currentPage = [block.id];
        currentPageHeight = height;
      } else {
        currentPage.push(block.id);
        currentPageHeight += height;
      }
    });

    if (currentPage.length > 0) {
      newPageGroups.push(currentPage);
    }

    if (JSON.stringify(newPageGroups) !== JSON.stringify(pageGroups)) {
      setPageGroups(newPageGroups);
    }
  }, [
    formData,
    projectUraian,
    projectJumlah,
    syarat4Items,
    syarat6Items,
    itemsList,
    customTerbilang,
    isCustomTerbilang,
    type,
    pageGroups
  ]);

  const activePageGroups = pageGroups || getDefaultPageGroups();

  const renderPageBlocks = (pageBlockIds) => {
    const rendered = [];
    let currentTableRows = [];
    let currentTableCalculations = null;
    let renderHeader = false;

    const flushTable = (key) => {
      if (currentTableRows.length === 0 && !renderHeader) return;

      rendered.push(
        <table key={`table-group-${key}`} className="w-full border-collapse border border-black text-[10pt] text-left table-fixed mb-2">
          {renderHeader && (
            <thead>
              <tr className="border-b border-black bg-gray-50/50">
                <th className="border-r border-black p-1 text-center w-[6%] font-normal">No</th>
                <th className="border-r border-black p-1 text-center w-[40%] font-normal font-sans">Uraian Pekerjaan</th>
                <th className="border-r border-black p-1 text-center w-[12%] font-normal font-sans">QTY.</th>
                <th className="border-r border-black p-1 text-center w-[18%] font-normal font-sans">
                  {type === "kendaraan" ? "Harga Sewa per Unit/Bln" : "Harga Sewa per Unit"}
                </th>
                <th className="p-1 text-center w-[24%] font-normal font-sans">
                  {type === "kendaraan" ? "Jumlah" : "Jumlah Harga Sewa Perbulan"}
                </th>
              </tr>
            </thead>
          )}
          <tbody>
            {currentTableRows.map((rowBlock) => {
              const idx = rowBlock.index;
              const item = itemsList[idx] || {};
              const activeItem = idx === 0 ? {
                ...item,
                uraian: item.uraian || projectUraian,
                qty: item.qty || projectJumlah,
                hargaUnit: item.hargaUnit || formData.hargaSewaPerUnit,
                totalBulan: item.totalBulan || formData.spkJumlah
              } : item;

              return (
                <tr key={`row-${idx}`} className="border-b border-black last:border-b-0">
                  <td className="border-r border-black p-1 text-center align-top w-[6%]">{idx + 1}.</td>
                  <td className="border-r border-black p-1 align-top text-left leading-tight whitespace-pre-wrap w-[40%]">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "uraian", e.target.innerText)}
                      className="outline-none block w-full min-h-[2.5em]"
                    >
                      {activeItem.uraian}
                    </span>
                  </td>
                  <td className={`border-r border-black p-1 text-center align-top w-[12%] ${type === "kendaraan" ? "font-bold" : "font-normal"}`}>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "qty", e.target.innerText)}
                      className="outline-none block w-full text-center"
                    >
                      {activeItem.qty}
                    </span>
                  </td>
                  <td className={`border-r border-black p-1 text-center align-top font-mono w-[18%] ${type === "kendaraan" ? "font-bold" : "font-normal"}`}>
                    {type === "kendaraan" ? "Rp. " : "Rp "}&nbsp;
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "hargaUnit", e.target.innerText.replace(/^Rp\.?\s*/i, "").replace(/,-$/, ""))}
                      className={`outline-none inline-block text-center ${!activeItem.hargaUnit ? "text-gray-400 italic" : ""}`}
                    >
                      {activeItem.hargaUnit || "..."}
                    </span>
                    ,-
                  </td>
                  <td className={`p-1 text-center align-top font-mono w-[24%] ${type === "kendaraan" ? "font-bold" : "font-normal"}`}>
                    {type === "kendaraan" ? "Rp. " : "Rp "}&nbsp;
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemChange(idx, "totalBulan", e.target.innerText.replace(/^Rp\.?\s*/i, "").replace(/,-$/, ""))}
                      className="outline-none inline-block text-center"
                    >
                      {activeItem.totalBulan ? `${activeItem.totalBulan}` : "..."}
                    </span>
                    ,-
                  </td>
                </tr>
              );
            })}

            {currentTableCalculations && (() => {
              const row2Title = type === "kendaraan" ? "Jumlah Harga Sewa per Bulan" : "Total Harga Sewa Per Bulan";
              const row3Title = formData.spkBulan
                ? `Total Harga Sewa (${formData.spkBulan} Bulan)`
                : "Total Harga Sewa";

              return (
                <>
                  <tr className="border-b border-black font-bold">
                    <td colSpan={4} className="border-r border-black p-1 text-right pr-4 font-sans">
                      {row2Title}
                    </td>
                    <td className="p-1 text-left font-mono">
                      {type === "kendaraan" ? "Rp. " : "Rp "}{formData.spkJumlah ? `${formData.spkJumlah},-` : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-black font-bold">
                    <td colSpan={4} className="border-r border-black p-1 text-right pr-4 font-sans">
                      {row3Title}
                    </td>
                    <td className="p-1 text-left font-mono">
                      Rp {formData.spkDibulatkan || formData.spkTotal ? `${formData.spkDibulatkan || formData.spkTotal},-` : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-1 italic leading-normal border-t border-black text-gray-800 text-center font-bold">
                      “{isCustomTerbilang ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setCustomTerbilang(e.target.innerText)}
                          className="outline-none px-0.5"
                        >
                          {customTerbilang}
                        </span>
                      ) : (
                        <span>{displayTerbilang}</span>
                      )}”
                    </td>
                  </tr>
                </>
              );
            })()}
          </tbody>
        </table>
      );

      currentTableRows = [];
      currentTableCalculations = null;
      renderHeader = false;
    };

    const hasHeader = pageBlockIds.includes("table-header");
    const hasRows = pageBlockIds.some(id => id.startsWith("table-row-"));
    if (hasRows && !hasHeader) {
      renderHeader = true;
    }

    pageBlockIds.forEach((blockId, idx) => {
      const block = getDocumentBlocks().find((b) => b.id === blockId);
      if (!block) return;

      if (block.type === "table-header") {
        renderHeader = true;
      } else if (block.type === "table-row") {
        currentTableRows.push(block);
      } else if (block.type === "table-calculations") {
        currentTableCalculations = block;
      } else {
        flushTable(idx);
        rendered.push(<React.Fragment key={block.id}>{block.render()}</React.Fragment>);
      }
    });

    flushTable("final");

    return rendered;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start p-6 print:bg-white print:p-0 print:h-auto print:overflow-visible">

      {/* Dynamic Print CSS Injection */}
      <style>{`
        @media screen {
          /* Force container visibility off-screen during print measurement phase when triggered from background tabs */
          body[class*="print-spk-"] #spk_renovasi,
          body[class*="print-spk-"] #spk_elektronik,
          body[class*="print-spk-"] #spk_kendaraan {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            z-index: -9999 !important;
          }
        }

        /* Global rules for SPK document preview that apply on screen */
        .spk-paper {
          width: 210mm;
          height: 297mm;
          min-height: 297mm;
          max-height: 297mm;
          padding: 5mm 12mm 5mm 12mm;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          background: white;
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #111;
          overflow: hidden;
        }
        .spk-header {
          position: absolute;
          top: 8mm;
          left: 12mm;
          right: 12mm;
          height: 14mm;
          display: flex;
          align-items: center;
          margin: 0;
          padding: 0;
        }
        .spk-content {
          margin-top: 20mm;
          margin-bottom: 23mm;
          flex: 1 1 0%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .spk-footer {
          position: absolute;
          bottom: 10mm;
          left: 12mm;
          right: 12mm;
          height: 16mm;
          box-sizing: border-box;
        }

        span[contenteditable="true"] {
          border-bottom: 1px dashed transparent;
          transition: all 0.2s ease;
        }
        span[contenteditable="true"]:hover {
          border-bottom-color: #cbd5e1;
          background-color: rgba(243, 244, 246, 0.4);
        }
        span[contenteditable="true"]:focus {
          border-bottom-color: #007c55ff;
          background-color: #ffffff;
          outline: none;
        }

        @media print {
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.print-spk-${type}-only, body.print-spk-${type}-only html, body.print-spk-${type}-only.dark, body.print-spk-${type}-only.dark body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          body.print-spk-${type}-only #dashboard,
          body.print-spk-${type}-only #riwayat,
          body.print-spk-${type}-only #log_aktivitas,
          body.print-spk-${type}-only #kelola_user,
          body.print-spk-${type}-only #bangunan_tanah,
          body.print-spk-${type}-only #bangunan_sewa,
          body.print-spk-${type}-only #bangunan_renovasi,
          body.print-spk-${type}-only #bangunan_sarana,
          body.print-spk-${type}-only #sopp_pengadaan,
          body.print-spk-${type}-only #sopp_sewa${type === "renovasi" ? "" : ", body.print-spk-" + type + "-only #spk_renovasi"
        }${type === "elektronik" ? "" : ", body.print-spk-" + type + "-only #spk_elektronik"
        }${type === "kendaraan" ? "" : ", body.print-spk-" + type + "-only #spk_kendaraan"
        } {
            display: none !important;
          }
          body.print-spk-${type}-only #spk_${type} {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: static !important;
            left: auto !important;
            top: auto !important;
            z-index: auto !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            background-color: transparent !important;
            background: transparent !important;
            color: #000000 !important;
          }
          body.print-spk-${type}-only #root,
          body.print-spk-${type}-only .flex-1.bg-white.pb-12,
          body.print-spk-${type}-only .min-h-screen {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: transparent !important;
          }
          
          /* Show screen preview container during print, force zoom to 1 */
          body.print-spk-${type}-only #spk-print-area-${type} {
            display: flex !important;
            flex-direction: column !important;
            gap: 0 !important;
            zoom: 1 !important;
            width: auto !important;
            max-width: none !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Global visibility reset for print elements */
          body.print-spk-${type}-only * {
            visibility: hidden;
          }

          /* Display the screen preview layout and its descendants */
          body.print-spk-${type}-only #spk-print-area-${type},
          body.print-spk-${type}-only #spk-print-area-${type} * {
            visibility: visible !important;
            color: #000000 !important;
          }

          /* Preserve original colors for the footer elements */
          body.print-spk-${type}-only #spk-print-area-${type} .spk-footer,
          body.print-spk-${type}-only #spk-print-area-${type} .spk-footer * {
            color: #6b7280 !important; /* text-gray-500 */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.print-spk-${type}-only #spk-print-area-${type} .spk-footer .text-emerald-600 {
            color: #059669 !important; /* text-emerald-600 */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Styling of the spk-paper for printing */
          body.print-spk-${type}-only .spk-paper {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 !important;
            padding: 5mm 12mm 5mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            box-sizing: border-box !important;
          }

          body.print-spk-${type}-only .spk-paper:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

           /* Keep header and footer positions absolute relative to the spk-paper */
          body.print-spk-${type}-only .spk-header {
            position: absolute !important;
            top: 8mm !important;
            left: 12mm !important;
            right: 12mm !important;
            height: 14mm !important;
          }

          body.print-spk-${type}-only .spk-footer {
            position: absolute !important;
            bottom: 10mm !important;
            left: 12mm !important;
            right: 12mm !important;
            height: 16mm !important;
          }

          #preview-signatures-renovasi,
          #preview-signatures-elektronik,
          #preview-signatures-kendaraan {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .syarat-list-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Completely hide input borders, backgrounds and outline boxes during print */
          input, textarea {
            border: none !important;
            outline: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            resize: none !important;
            overflow: hidden !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          input::placeholder, textarea::placeholder {
            color: transparent !important;
          }
          span[contenteditable="true"] {
            border-bottom: none !important;
            background-color: transparent !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* LEFT PANE: Editor Panel */}
      <div className="xl:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col no-print shrink-0 overflow-hidden max-h-[85vh]">
        {/* Panel Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base leading-tight">Surat Perintah Kerja</h3>
              <p className="text-xs text-gray-500">
                {type === "elektronik"
                  ? "Editor Surat SPK Elektronik"
                  : type === "kendaraan"
                    ? "Editor Surat SPK Kendaraan"
                    : "Editor Surat SPK Bangunan"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 bg-gray-50/30 text-xs font-medium text-gray-500 overflow-x-auto">
          {[
            { id: "header", label: "Kop & Pihak" },
            ...(type === "elektronik" ? [] : [{ id: "references", label: "Menunjuk" }]),
            { id: "items", label: "Uraian Kerja" },
            { id: "terms", label: "Syarat & TTD" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFormTab(tab.id)}
              className={`flex-1 py-3 px-4 border-b-2 text-center whitespace-nowrap transition-colors ${activeFormTab === tab.id
                ? "border-emerald-600 text-emerald-700 font-semibold bg-emerald-50/10"
                : "border-transparent hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {activeFormTab === "header" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Nomor Urut SPK (Running Number) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    name="noSuratPrefix"
                    value={formData.noSuratPrefix}
                    onChange={handleChange}
                    onFocus={() => scrollToPreview("preview-header-intro")}
                    placeholder="Contoh: 1506"
                    className={`w-1/3 px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm ${errors.noSuratPrefix ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                  />
                  <span className="text-gray-400 font-mono text-sm">/00108.{currentMonthTwoDigits}/{currentYear}</span>
                </div>
                {errors.noSuratPrefix && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.noSuratPrefix}</p>}
                <p className="text-[10px] text-gray-400 mt-1">Ketik nomor urut surat, bulan berjalan dan tahun akan otomatis terbuat di preview.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Tempat Surat <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                  </label>
                  <input
                    type="text"
                    name="tempatSurat"
                    value={formData.tempatSurat}
                    onChange={handleChange}
                    onFocus={() => scrollToPreview("preview-tujuan")}
                    placeholder="Contoh: Jakarta"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm ${errors.tempatSurat ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                  />
                  {errors.tempatSurat && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.tempatSurat}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Tanggal Surat <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggalSuratRaw"
                    value={formData.tanggalSuratRaw}
                    onChange={handleChange}
                    onFocus={() => scrollToPreview("preview-tujuan")}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm ${errors.tanggalSuratRaw ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                  />
                  {errors.tanggalSuratRaw && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.tanggalSuratRaw}</p>}
                </div>
              </div>

              <hr className="my-4 border-gray-100" />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Kepada Yth. (Nama Penerima/Perusahaan) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                </label>
                <input
                  type="text"
                  name="kepadanya"
                  value={formData.kepadanya}
                  onChange={handleChange}
                  onFocus={() => scrollToPreview("preview-tujuan")}
                  placeholder="Nama Penerima/Perusahaan"
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm ${errors.kepadanya ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                />
                {errors.kepadanya && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.kepadanya}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Alamat Tertuju <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                </label>
                <textarea
                  name="alamatTertuju"
                  value={formData.alamatTertuju}
                  onChange={handleChange}
                  onFocus={() => scrollToPreview("preview-tujuan")}
                  rows={3}
                  placeholder="Alamat lengkap..."
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm ${errors.alamatTertuju ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                />
                {errors.alamatTertuju && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.alamatTertuju}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Provinsi / Kota <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                </label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  onFocus={() => scrollToPreview("preview-tujuan")}
                  placeholder="Nama Provinsi/Kota"
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm ${errors.provinsi ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                />
                {errors.provinsi && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.provinsi}</p>}
              </div>
            </div>
          )}

          {activeFormTab === "references" && type !== "elektronik" && (
            <div className="space-y-4">
              {/* Referensi 1 */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">1. Surat Penawaran Harga</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Nomor Surat <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="text"
                      name="ref1No"
                      value={formData.ref1No}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-references")}
                      className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.ref1No ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.ref1No && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.ref1No}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Tanggal <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="date"
                      name="ref1TglRaw"
                      value={formData.ref1TglRaw}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-references")}
                      className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.ref1TglRaw ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.ref1TglRaw && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.ref1TglRaw}</p>}
                  </div>
                </div>
              </div>

              {/* Referensi 2 */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">2. Berita Acara Negosiasi</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Nomor Surat <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="text"
                      name="ref2No"
                      value={formData.ref2No}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-references")}
                      className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.ref2No ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.ref2No && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.ref2No}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Tanggal <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="date"
                      name="ref2TglRaw"
                      value={formData.ref2TglRaw}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-references")}
                      className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.ref2TglRaw ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.ref2TglRaw && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.ref2TglRaw}</p>}
                  </div>
                </div>
              </div>

              {/* Referensi 3 */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">3. Surat Penunjukan Pelaksana</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Nomor Surat <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="text"
                      name="ref3No"
                      value={formData.ref3No}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-references")}
                      className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.ref3No ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.ref3No && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.ref3No}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Tanggal <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="date"
                      name="ref3TglRaw"
                      value={formData.ref3TglRaw}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-references")}
                      className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.ref3TglRaw ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.ref3TglRaw && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.ref3TglRaw}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFormTab === "items" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Rincian Proyek Pekerjaan</h4>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-4">
                {type === "kendaraan" ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Jenis Kendaraan</label>
                    <input
                      type="text"
                      name="jenisElektronik"
                      value={formData.jenisElektronik || ""}
                      onChange={handleChange}
                      placeholder="Contoh: Motor Honda Supra X125 PGM FI CW Tahun 2020"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-xs"
                    />
                  </div>
                ) : type === "elektronik" && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5">Jenis Elektronik</label>
                    <div className="flex gap-4">
                      {["Komputer/PC", "Printer", "Laptop"].map((option) => (
                        <label key={option} className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="jenisElektronik"
                            value={option}
                            checked={formData.jenisElektronik === option}
                            onChange={handleChange}
                            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(type === "elektronik" || type === "kendaraan") ? (
                  <div className="space-y-4">
                    {itemsList.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-3 relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                            Baris {idx + 1}
                          </span>
                          {idx === 0 ? (
                            <button
                              type="button"
                              onClick={handleAddItemRow}
                              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold text-xs py-1 px-2.5 rounded-lg hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                              <span>Tambah Baris</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 py-1 px-2 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            Uraian Pekerjaan (Deskripsi Proyek) {idx === 0 && <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>}
                          </label>
                          <FormTextarea
                            value={item.uraian !== undefined ? item.uraian : (idx === 0 ? projectUraian : "")}
                            onChange={(e) => handleItemChange(idx, "uraian", e.target.value)}
                            onFocus={() => scrollToPreview("preview-table")}
                            rows={2}
                            placeholder={type === "elektronik" ? "Contoh: PENGADAAN PRINTER OUTLET PEGADAIAN" : "Contoh: SEWA SEPEDAMOTOR OUTLET"}
                            className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${idx === 0 && errors.projectUraian ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                          />
                          {idx === 0 && errors.projectUraian && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.projectUraian}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              Jumlah Volume / Qty {idx === 0 && <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>}
                            </label>
                            <input
                              type="text"
                              value={item.qty !== undefined ? item.qty : (idx === 0 ? projectJumlah : "")}
                              onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                              onFocus={() => scrollToPreview("preview-table")}
                              placeholder="Contoh: 1 Paket"
                              className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${idx === 0 && errors.projectJumlah ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                            />
                            {idx === 0 && errors.projectJumlah && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.projectJumlah}</p>}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              {type === "kendaraan" ? "Harga Sewa per Unit/Bln" : "Harga Sewa per Unit"}
                            </label>
                            <input
                              type="text"
                              value={item.hargaUnit !== undefined ? item.hargaUnit : (idx === 0 ? formData.hargaSewaPerUnit : "")}
                              onChange={(e) => handleItemChange(idx, "hargaUnit", e.target.value)}
                              onFocus={() => scrollToPreview("preview-table")}
                              placeholder="Contoh: 275.000"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            {type === "kendaraan" ? "Jumlah Harga Sewa per Bulan" : "Jumlah Harga Sewa Perbulan"}
                          </label>
                          <input
                            type="text"
                            value={item.totalBulan !== undefined ? item.totalBulan : (idx === 0 ? formData.spkJumlah : "")}
                            onChange={(e) => handleItemChange(idx, "totalBulan", e.target.value)}
                            onFocus={() => scrollToPreview("preview-table")}
                            placeholder="Contoh: 27.500.000"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    ))}

                    <hr className="border-gray-200 my-2" />

                    {/* Jangka Waktu Sewa & Dynamic Summary Totals */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Jangka Waktu Sewa (Bulan) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="number"
                          name="spkBulan"
                          value={formData.spkBulan || ""}
                          onChange={(e) => {
                            handleSpkBulanChange(e.target.value);
                            recalculateTableTotals(itemsList, e.target.value);
                          }}
                          onFocus={() => scrollToPreview("preview-table")}
                          placeholder="Contoh: 36"
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono ${errors.spkBulan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkBulan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkBulan}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            {type === "kendaraan" ? "Jumlah Harga Sewa per Bulan" : "Total Harga Sewa Per Bulan"} <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                          </label>
                          <input
                            type="text"
                            name="spkJumlah"
                            value={formData.spkJumlah}
                            onChange={(e) => handleSpkJumlahChange(e.target.value, formData.spkBulan)}
                            onFocus={() => scrollToPreview("preview-table")}
                            className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono ${errors.spkJumlah ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                          />
                          {errors.spkJumlah && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkJumlah}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            {type === "kendaraan" ? "Harga Total Sewa" : "Total Harga Sewa"} <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                          </label>
                          <input
                            type="text"
                            name="spkDibulatkan"
                            value={formData.spkDibulatkan}
                            onChange={handleChange}
                            onFocus={() => scrollToPreview("preview-table")}
                            className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono font-black text-emerald-700 ${errors.spkDibulatkan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                          />
                          {errors.spkDibulatkan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkDibulatkan}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Uraian Pekerjaan (Deskripsi Proyek) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <FormTextarea
                        value={projectUraian}
                        onChange={(e) => setProjectUraian(e.target.value)}
                        onFocus={() => scrollToPreview("preview-table")}
                        placeholder="Contoh: Pekerjaan Renovasi Gedung..."
                        className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.projectUraian ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.projectUraian && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.projectUraian}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Jumlah Volume / Qty <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="text"
                        value={projectJumlah}
                        onChange={(e) => setProjectJumlah(e.target.value)}
                        onFocus={() => scrollToPreview("preview-table")}
                        placeholder="Contoh: 1 Ls"
                        className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs ${errors.projectJumlah ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.projectJumlah && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.projectJumlah}</p>}
                    </div>

                    <hr className="border-gray-200 my-2" />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Jumlah (Base Price) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="spkJumlah"
                          value={formData.spkJumlah}
                          onChange={(e) => handleSpkJumlahChange(e.target.value)}
                          onFocus={() => scrollToPreview("preview-table")}
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono ${errors.spkJumlah ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkJumlah && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkJumlah}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Jasa Kontraktor 10% <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="spkJasa"
                          value={formData.spkJasa}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-table")}
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono ${errors.spkJasa ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkJasa && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkJasa}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Sub Total <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="spkSubTotal"
                          value={formData.spkSubTotal}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-table")}
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono font-semibold ${errors.spkSubTotal ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkSubTotal && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkSubTotal}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          PPN 11% <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="spkPpn"
                          value={formData.spkPpn}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-table")}
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono ${errors.spkPpn ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkPpn && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkPpn}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Total <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="spkTotal"
                          value={formData.spkTotal}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-table")}
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono font-bold ${errors.spkTotal ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkTotal && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkTotal}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Dibulatkan (Final) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="spkDibulatkan"
                          value={formData.spkDibulatkan}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-table")}
                          className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono font-black text-emerald-700 ${errors.spkDibulatkan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.spkDibulatkan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.spkDibulatkan}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terbilang Custom override */}
              <div className="p-4 bg-amber-50/50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-amber-800 dark:text-amber-400">Teks Terbilang Rupiah</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTerbilang(!isCustomTerbilang)}
                    className="flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 px-2.5 py-1 rounded transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> {isCustomTerbilang ? "Gunakan Otomatis" : "Tulis Manual"}
                  </button>
                </div>
                {isCustomTerbilang ? (
                  <textarea
                    value={customTerbilang}
                    onChange={(e) => setCustomTerbilang(e.target.value)}
                    onFocus={() => scrollToPreview("preview-table")}
                    rows={2}
                    placeholder="Contoh: (dua ratus dua puluh tujuh juta lima ratus ribu rupiah)"
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg outline-none text-xs text-amber-900 dark:bg-[#0f1712] dark:border-amber-900/80 dark:text-amber-350"
                  />
                ) : (
                  <p className="text-xs text-gray-700 dark:text-amber-300 font-bold italic break-words bg-white/70 dark:bg-amber-950/40 p-2.5 rounded-lg border border-gray-100 dark:border-amber-900/40 shadow-inner">
                    {type === "elektronik" ? displayTerbilang : calculatedTerbilang}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeFormTab === "terms" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Syarat & Ketentuan</h4>
                {type === "kendaraan" ? (
                  <div className="space-y-4">
                    {/* Syarat 1 (a,b) */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-3">
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Syarat 1 (Perpajakan & Sewa)</span>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Poin a (Pajak) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="text"
                          name="syarat1aKendaraanText"
                          value={formData.syarat1aKendaraanText}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          placeholder="Harga yang tertera sudah termasuk Pajak-pajak 11%"
                          className={`w-full px-4 py-2 bg-white border rounded-xl outline-none text-xs ${errors.syarat1aKendaraanText ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.syarat1aKendaraanText && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat1aKendaraanText}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Poin b (Jangka Waktu Sewa)</label>
                        <textarea
                          name="syarat1bKendaraanText"
                          value={formData.syarat1bKendaraanText}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          rows={2}
                          placeholder="Contoh: selama 12 Bulan. Berlaku dari 23 Juli sampai dengan 22 Juli 2025"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Syarat 2 */}
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">Syarat 2: Hubungan SPK</label>
                      <textarea
                        name="syarat2KendaraanText"
                        value={formData.syarat2KendaraanText}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-terms")}
                        rows={2}
                        placeholder="Contoh: SPK ini merupakan bagian yang tidak terpisahkan dari SPK nomor 1142/00020.02/2020"
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none text-xs ${errors.syarat2KendaraanText ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.syarat2KendaraanText && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat2KendaraanText}</p>}
                    </div>

                    {/* Syarat 4 */}
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">Syarat 4: Ketentuan Pembayaran Unit</label>
                      <textarea
                        name="syarat4KendaraanText"
                        value={formData.syarat4KendaraanText}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-terms")}
                        rows={2}
                        placeholder="Jumlah biaya/harga akan dibayarkan sesuai dengan jumlah unit yang digunakan."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
                      />
                    </div>

                    {/* Syarat 5: Checklist Kelengkapan Dokumen */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-3">
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Syarat 5 (Kelengkapan Dokumen Pembayaran)</span>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Pengantar Syarat 5</label>
                        <input
                          type="text"
                          name="syarat5IntroKendaraanText"
                          value={formData.syarat5IntroKendaraanText}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500">Daftar Dokumen (a s/d h)</label>
                        {syarat4Items.map((item) => (
                          <div key={item.key} className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-gray-500 w-4">{item.key}.</span>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => handleListChange("syarat4", item.key, e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg outline-none text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Syarat 6 */}
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">Syarat 6: Ketentuan Khusus</label>
                      <textarea
                        name="syarat6KendaraanText"
                        value={formData.syarat6KendaraanText}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-terms")}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
                      />
                    </div>

                    {/* Tanggal Persetujuan */}
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">
                        Tanggal Penerimaan & Persetujuan <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="date"
                        name="tanggalPersetujuanRaw"
                        value={formData.tanggalPersetujuanRaw}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-signatures")}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none text-xs ${errors.tanggalPersetujuanRaw ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.tanggalPersetujuanRaw && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.tanggalPersetujuanRaw}</p>}
                    </div>
                  </div>
                ) : type === "elektronik" ? (
                  <div className="space-y-4">
                    {/* Syarat 1 (a,b,c,d) */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-3">
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Syarat 1 (Jangka Waktu & Sewa)</span>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">
                          Poin a <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="number"
                          name="syarat1aHari"
                          value={formData.syarat1aHari}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          placeholder="Contoh: 30"
                          className={`w-full px-4 py-2 bg-white border rounded-xl outline-none text-xs ${errors.syarat1aHari ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.syarat1aHari && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat1aHari}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Poin b</label>
                        <textarea
                          name="syarat1bText"
                          value={formData.syarat1bText}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          rows={2}
                          placeholder="Contoh: 30 (tiga puluh) hari kerja sejak SPK ini diterima langsung..."
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Poin c</label>
                        <textarea
                          name="syarat1cText"
                          value={formData.syarat1cText}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          rows={2}
                          placeholder="Contoh: 36 (Tiga Puluh Enam) Bulan sejak serah terima barang"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Poin d</label>
                        <textarea
                          name="syarat1dText"
                          value={formData.syarat1dText}
                          onChange={handleChange}
                          onFocus={() => scrollToPreview("preview-terms")}
                          rows={2}
                          placeholder="Contoh: selama 36 (Tiga Puluh Enam) Bulan terhitung sejak Serah Terima."
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Syarat 2 */}
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">
                        Syarat 2: Ketentuan Denda <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <textarea
                        name="syarat2ElektronikText"
                        value={formData.syarat2ElektronikText}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-terms")}
                        rows={3}
                        placeholder="Tuliskan detail denda..."
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none text-xs ${errors.syarat2ElektronikText ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.syarat2ElektronikText && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat2ElektronikText}</p>}
                    </div>

                    {/* Tanggal Persetujuan */}
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">
                        Tanggal Penerimaan & Persetujuan <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="date"
                        name="tanggalPersetujuanRaw"
                        value={formData.tanggalPersetujuanRaw}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-signatures")}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none text-xs ${errors.tanggalPersetujuanRaw ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.tanggalPersetujuanRaw && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.tanggalPersetujuanRaw}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 font-medium mb-1">
                        Syarat 1: Jangka Waktu (Hari) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="number"
                        name="syarat1Hari"
                        value={formData.syarat1Hari}
                        onChange={(e) => handleSyarat1HariChange(e.target.value)}
                        onFocus={() => scrollToPreview("preview-terms")}
                        placeholder="Contoh: 30"
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none text-xs ${errors.syarat1Hari ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.syarat1Hari && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat1Hari}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        <label className="block text-xs text-gray-600 font-medium">
                          Syarat 2: Nilai Denda <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="number"
                          name="syarat2DendaVal"
                          value={formData.syarat2DendaVal}
                          onChange={(e) => handleSyarat2Change("syarat2DendaVal", e.target.value)}
                          onFocus={() => scrollToPreview("preview-terms")}
                          className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs ${errors.syarat2DendaVal ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.syarat2DendaVal && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat2DendaVal}</p>}
                        <select
                          name="syarat2DendaUnit"
                          value={formData.syarat2DendaUnit}
                          onChange={(e) => handleSyarat2Change("syarat2DendaUnit", e.target.value)}
                          onFocus={() => scrollToPreview("preview-terms")}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none text-xs cursor-pointer"
                        >
                          <option value="‰">Perseribu (‰)</option>
                          <option value="%">Persen (%)</option>
                        </select>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        <label className="block text-xs text-gray-600 font-medium">
                          Syarat 2: Maksimal Denda <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                        </label>
                        <input
                          type="number"
                          name="syarat2MaxVal"
                          value={formData.syarat2MaxVal}
                          onChange={(e) => handleSyarat2Change("syarat2MaxVal", e.target.value)}
                          onFocus={() => scrollToPreview("preview-terms")}
                          className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs ${errors.syarat2MaxVal ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                        />
                        {errors.syarat2MaxVal && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat2MaxVal}</p>}
                        <select
                          name="syarat2MaxUnit"
                          value={formData.syarat2MaxUnit}
                          onChange={(e) => handleSyarat2Change("syarat2MaxUnit", e.target.value)}
                          onFocus={() => scrollToPreview("preview-terms")}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none text-xs cursor-pointer"
                        >
                          <option value="%">Persen (%)</option>
                          <option value="‰">Perseribu (‰)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 font-medium mb-1">
                        Syarat 3: Detail Pembayaran (Tahapan) <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <textarea
                        name="syarat3Text"
                        value={formData.syarat3Text}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-terms")}
                        rows={4}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none text-xs ${errors.syarat3Text ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.syarat3Text && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.syarat3Text}</p>}
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-4 border-gray-100" />

              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Tanda Tangan Pihak</h4>

                {/* TTD KIRI */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-3 space-y-3">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Pihak I (Pelaksana / Kiri)</span>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Nama Perusahaan <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <input
                      type="text"
                      name="sigKiriPerusahaan"
                      value={formData.sigKiriPerusahaan}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-signatures")}
                      className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs font-semibold ${errors.sigKiriPerusahaan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.sigKiriPerusahaan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.sigKiriPerusahaan}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Nama Lengkap <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="text"
                        name="sigKiriNama"
                        value={formData.sigKiriNama}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-signatures")}
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs ${errors.sigKiriNama ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.sigKiriNama && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.sigKiriNama}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Jabatan <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="text"
                        name="sigKiriJabatan"
                        value={formData.sigKiriJabatan}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-signatures")}
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs ${errors.sigKiriJabatan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.sigKiriJabatan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.sigKiriJabatan}</p>}
                    </div>
                  </div>
                </div>

                {/* TTD KANAN */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Pihak II (Pemberi Tugas / Kanan)</span>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Nama Lembaga <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                    </label>
                    <textarea
                      name="sigKananPerusahaan"
                      value={formData.sigKananPerusahaan}
                      onChange={handleChange}
                      onFocus={() => scrollToPreview("preview-signatures")}
                      rows={2}
                      className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs font-semibold ${errors.sigKananPerusahaan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                    />
                    {errors.sigKananPerusahaan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.sigKananPerusahaan}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Nama Lengkap <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="text"
                        name="sigKananNama"
                        value={formData.sigKananNama}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-signatures")}
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs ${errors.sigKananNama ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.sigKananNama && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.sigKananNama}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Jabatan <span className="text-red-500 font-bold ml-0.5" title="Wajib diisi">*</span>
                      </label>
                      <input
                        type="text"
                        name="sigKananJabatan"
                        value={formData.sigKananJabatan}
                        onChange={handleChange}
                        onFocus={() => scrollToPreview("preview-signatures")}
                        className={`w-full px-3 py-1.5 bg-white border rounded-lg outline-none text-xs ${errors.sigKananJabatan ? "border-red-500 focus:border-red-500" : "border-gray-200"}`}
                      />
                      {errors.sigKananJabatan && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.sigKananJabatan}</p>}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Live Interactive Preview */}
      <div className="xl:col-span-7 flex flex-col items-center overflow-y-auto w-full pr-2 max-h-[90vh] print:h-auto print:overflow-visible">
        {/* Helper bar */}
        <div className="w-full max-w-[210mm] bg-amber-50 border border-amber-200/70 p-3 rounded-xl mb-3 flex items-center justify-between no-print shadow-sm text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>Anda dapat mengedit tulisan secara langsung di lembar pratinjau A4.</span>
          </div>
          <button
            type="button"
            onClick={handleSubmitHistory}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow transition-all text-xs cursor-pointer shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
            title="Submit dan simpan SPK ke Riwayat"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Submit</span>
            )}
          </button>
        </div>

        {/* Zoom Control Bar */}
        <div className="w-full max-w-[210mm] bg-white border border-gray-200 shadow-sm p-3 rounded-xl mb-4 flex flex-col sm:flex-row items-center justify-between no-print text-xs gap-3">
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
              onClick={() => setZoomLevel(0.7)}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold transition-colors"
              title="Reset ke Default"
            >
              70%
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

        {/* The Document Paper (Dynamic A4 Paged SPK Layout) */}
        <div 
          className="w-full flex justify-center print:h-auto print:overflow-visible shrink-0" 
          style={{ height: `${((activePageGroups.length * 1122.5) + ((activePageGroups.length - 1) * 24)) * zoomLevel + 32}px`, overflow: 'hidden' }}
        >
          <div id={`spk-print-area-${type}`} className="flex flex-col gap-6 w-full max-w-[210mm] print:gap-0 print:w-auto origin-top shrink-0" style={{ zoom: zoomLevel }}>
            {activePageGroups.map((pageBlockIds, pageIdx) => {
              return (
                <div key={pageIdx} className="spk-paper w-full shadow-md select-text print:shadow-none print:border-none relative shrink-0 pb-16 print:pb-0">
                  <HeaderLogo id={`page-header-${pageIdx}`} />
                  <div className="spk-content pb-4">
                    {renderPageBlocks(pageBlockIds)}
                  </div>
                  <LetterFooter key={`page-footer-${pageIdx}`} />
                </div>
              );
            })}
          </div>
        </div>





        {/* Off-screen measurement wrapper */}
        <div
          ref={measureContainerRef}
          className="absolute left-[-9999px] top-0 pointer-events-none no-print"
          style={{ width: "210mm", height: 0, overflow: "hidden", fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.4", color: "#111", padding: "0 12mm", boxSizing: "border-box" }}
        >
          {getDocumentBlocks().map((block) => (
            <div key={block.id} data-block-id={block.id} className="w-full overflow-hidden">
              {block.render()}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Validation Error Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white dark:bg-[#1a2b20] border border-gray-200 dark:border-[#2b4533] rounded-2xl max-w-md w-full shadow-2xl p-6 transition-all duration-200 transform scale-100 animate-scale-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2">Formulir Belum Lengkap</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Harap lengkapi semua field input yang wajib diisi sebelum menyimpan dokumen SPK ke riwayat.
              </p>
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
