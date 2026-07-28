// resources/js/hooks/useTransaksi.js
// Form surat, generate nomor, log aktivitas, save + update stok
"use client";

import { useState } from "react";
import axios from 'axios';
import { router } from '@inertiajs/react';
import { createInitialFormData, createInitialItem } from "../constants";

/**
 * Menangani:
 * - State formData & items untuk form surat
 * - Generate nomor surat
 * - Simpan transaksi + update stok inventory ke Laravel MySQL
 */
export function useTransaksi({
  user,
  appId,
  transactions,
  inventory,
  setTransactions,
  setInventory,
  setActivityLogs,
  showNotif,
  navigateTo,   // fungsi (viewId) => void, untuk navigasi setelah aksi
}) {
  const [formData, setFormData]               = useState(() => createInitialFormData());
  const [items, setItems]                     = useState(() => [createInitialItem()]);
  const [activeTransaction, setActiveTransaction] = useState(null);

  // ── Mulai dokumen baru ─────────────────────────────────────────────────
  const startNewDocument = (jenis = "Barang Keluar") => {
    setFormData({
      ...createInitialFormData(),
      nomorSurat: "",
      jenisTransaksi: jenis,
    });
    setItems([createInitialItem()]);
    setActiveTransaction(null);
    navigateTo("form");
  };

  // ── Handler input ──────────────────────────────────────────────────────
  const addItem = () =>
    setItems((prev) => [...prev, createInitialItem()]);

  const removeItem = (id) => {
    if (items.length > 1)
      setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let updated = { ...item, [field]: value };
        if (field === "nama") {
          const found = inventory.find((i) => i.nama === value);
          if (found) updated.satuan = found.satuan;
        }
        return updated;
      })
    );
  };

  // ── Simpan transaksi ───────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  // ── Simpan transaksi ───────────────────────────────────────────────────
  const handleSaveTransaction = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const startTime = Date.now();
    try {
      const payload = {
        id: activeTransaction?.id || null,
        nomorSurat: formData.nomorSurat,
        tanggal: formData.tanggal,
        jenisTransaksi: formData.jenisTransaksi,
        penerimaNama: formData.penerimaNama,
        penerimaJabatan: formData.penerimaJabatan,
        penerimaInstansi: formData.penerimaInstansi,
        pengirimNama: formData.pengirimNama,
        pengirimJabatan: formData.pengirimJabatan,
        pengirimInstansi: formData.pengirimInstansi,
        mengetahuiNama: formData.mengetahuiNama,
        mengetahuiJabatan: formData.mengetahuiJabatan,
        lokasi: formData.lokasi,
        items: items.map(item => ({
          nama: item.nama,
          kuantitas: Number(item.kuantitas),
          satuan: item.satuan,
          sn: item.sn || null,
          keterangan: item.keterangan || null,
          outlet_id: item.outlet_id || null,
          outlet: item.outlet || null
        }))
      };

      const response = await axios.post('/transactions', payload);
      
      if (response.data.success) {
        const savedTrx = response.data.transaction;

        // Update local transactions state optimistically to bypass loading latency
        setTransactions(prev => {
          const exists = prev.some(t => t.id === savedTrx.id);
          if (exists) {
            return prev.map(t => t.id === savedTrx.id ? savedTrx : t);
          } else {
            return [savedTrx, ...prev];
          }
        });

        // Set active transaction & save focused tab
        setActiveTransaction(savedTrx);
        localStorage.setItem("riwayat_active_tab", "serah_terima");
        localStorage.setItem("show_trx_success_toast", "true");
        
        // Enforce a minimum 6-second delay to match SOPP timing
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 6000 - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        // Navigate immediately so user doesn't get stuck in loading state
        navigateTo("riwayat");

        // Sync states completely in the background
        router.reload({ 
          only: ['transactions', 'inventory', 'activityLogs'],
          showProgress: false
        });
      } else {
        showNotif(response.data.message || "Gagal menyimpan transaksi.", "error");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Gagal menyimpan transaksi.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData, setFormData,
    items, setItems,
    activeTransaction, setActiveTransaction,
    startNewDocument,
    addItem, removeItem,
    handleInputChange, handleItemChange,
    handleSaveTransaction,
    isSaving,
  };
}