// src/hooks/printer/usePrinterCRUD.js
import { useState } from "react";
import { addPrinter, updatePrinter, deletePrinter } from "../../services/printerService";
import { emptyFormPrinter as emptyForm } from "../../utils/deviceUtils";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function usePrinterCRUD({ printerData, setPrinterData, showNotif, outletsList, inventoryList }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [isSaving, setIsSaving]       = useState(false);

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); };

  const openModalForAdd  = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (printer) => {
    setEditingId(printer.id);
    setFormData({ ...printer });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isOutletValid = outletsList.some((o) => o.nama === formData.outlet);
    const isProdukValid = inventoryList.some((i) => i.nama === formData.produk);
    if (!isOutletValid) return showNotif("Nama Outlet tidak ditemukan di Master Data.", "error");
    if (!isProdukValid) return showNotif("Produk Hardware tidak ditemukan di Master Data.", "error");

    setIsSaving(true);
    try {
      if (editingId) {
        await updatePrinter(APP_ID, editingId, formData);
        setPrinterData((prev) =>
          prev.map((item) => (item.id === editingId ? { id: editingId, ...formData } : item))
        );
        showNotif("Perubahan data printer berhasil disimpan!");
      } else {
        const newItem = await addPrinter(APP_ID, formData);
        setPrinterData((prev) => [newItem, ...prev]);
        showNotif("Data Printer baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showNotif("Gagal menyimpan data ke server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePrinter(APP_ID, id);
      setPrinterData((prev) => prev.filter((p) => p.id !== id));
      showNotif("Data printer berhasil dihapus.");
    } catch (err) {
      console.error(err);
      showNotif("Gagal menghapus data.", "error");
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    editingId, formData, setFormData,
    isSaving, setIsSaving,
    openModalForAdd, openModalForEdit,
    handleSave, handleDelete,
  };
}
