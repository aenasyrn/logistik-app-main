// src/hooks/printer/usePrinterCRUD.js
import { useState } from "react";
import { addPrinter, updatePrinter, deletePrinter } from "../../services/printerService";
import { emptyFormPrinter as emptyForm } from "../../utils/deviceUtils";

export function usePrinterCRUD({ printerData, setPrinterData, showNotif, setCurrentPage, resetFilters }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [isSaving, setIsSaving]       = useState(false);

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); };

  const openModalForAdd  = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (printer) => {
    setEditingId(printer.id);
    const idOutlet = printer.idOutlet ?? printer.outlet_id ?? "";
    const tanggalMulai = printer.tanggalMulai ?? printer.tanggal_mulai ?? "";
    const tanggalSelesai = printer.tanggalSelesai ?? printer.tanggal_selesai ?? "";
    const vendor = printer.vendor ?? printer.penyedia ?? "";

    setFormData({
      idOutlet,
      outlet: printer.outlet ?? "",
      inventory_id: printer.inventory_id ?? printer.inventory?.id ?? null,
      produk: printer.produk ?? "",
      sn: printer.sn ?? "",
      tanggalMulai,
      tanggalSelesai,
      vendor,
      status: printer.status ?? "Inventaris",
      kondisi: printer.kondisi ?? "BAIK",
      keterangan: printer.keterangan ?? printer.deskripsi ?? "",
      mode_edit: "koreksi",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.outlet?.trim()) {
      showNotif("Nama Outlet harus diisi.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const resolvedOutletId = (formData.idOutlet && !isNaN(Number(formData.idOutlet)))
        ? Number(formData.idOutlet)
        : null;

      const payload = {
        ...formData,
        idOutlet: resolvedOutletId,
        outlet_id: resolvedOutletId,
        inventory_id: formData.inventory_id ? Number(formData.inventory_id) : null,
        tanggalMulai: formData.tanggalMulai?.trim() || null,
        tanggalSelesai: formData.tanggalSelesai?.trim() || null,
        tanggal_mulai: formData.tanggalMulai?.trim() || null,
        tanggal_selesai: formData.tanggalSelesai?.trim() || null,
        vendor: formData.vendor?.trim() || formData.penyedia?.trim() || null,
      };

      if (editingId) {
        const updatedItem = await updatePrinter(editingId, payload);
        const mergedItem = { ...formData, ...updatedItem, id: editingId };
        setPrinterData((prev) =>
          prev.map((item) => (item.id === editingId ? mergedItem : item))
        );
        showNotif("Perubahan data printer berhasil disimpan!");
      } else {
        const newItem = await addPrinter(payload);
        const mergedItem = { ...formData, ...newItem };
        setPrinterData((prev) => [mergedItem, ...prev]);
        if (setCurrentPage) setCurrentPage(1);
        if (resetFilters) resetFilters();
        showNotif("Data Printer baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Save printer error:", err);
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : null) ||
        err.message ||
        "Gagal menyimpan data ke server.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSaving(true);
    try {
      setPrinterData((prev) => prev.filter((p) => p.id !== id));
      const res = await deletePrinter(id);
      showNotif(res?.message || "Data printer berhasil dihapus.");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        showNotif("Data sudah tidak ada di server dan telah dihapus dari tampilan.");
      } else {
        const errorMsg = err.response?.data?.message || err.message || "Gagal menghapus data.";
        showNotif(errorMsg, "error");
      }
    } finally {
      setIsSaving(false);
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

