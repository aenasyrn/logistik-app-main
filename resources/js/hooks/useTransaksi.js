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
  const handleSaveTransaction = async () => {
    try {
      const payload = {
        ...formData,
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
        // Sync states by reloading Inertia props
        router.reload({ only: ['transactions', 'inventory', 'activityLogs'] });

        // Set active transaction for previewing
        setActiveTransaction(response.data.transaction);
        showNotif("Transaksi berhasil disimpan & Stok diperbarui!");
        navigateTo("preview");
      } else {
        showNotif(response.data.message || "Gagal menyimpan transaksi.", "error");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Gagal menyimpan transaksi.";
      showNotif(errorMsg, "error");
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
  };
}