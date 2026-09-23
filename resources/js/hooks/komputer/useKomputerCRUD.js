// src/hooks/komputer/useKomputerCRUD.js
import { useState } from "react";
import { addKomputer, updateKomputer, deleteKomputer } from "../../services/komputerService";
import { emptyFormKomputer as emptyForm } from "../../utils/deviceUtils";

export function useKomputerCRUD({ computerData, setComputerData, showNotif }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [isSaving, setIsSaving]       = useState(false);

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); };

  const openModalForAdd  = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (comp) => {
    setEditingId(comp.id);
    const idOutlet = comp.idOutlet ?? comp.outlet_id ?? "";
    const ipAddress = comp.ipAddress ?? comp.ip_address ?? "";
    const macAddress = comp.macAddress ?? comp.mac_address ?? "";
    const tanggalMulai = comp.tanggalMulai ?? comp.tanggal_mulai ?? "";
    const tanggalSelesai = comp.tanggalSelesai ?? comp.tanggal_selesai ?? "";
    const penyedia = comp.penyedia ?? comp.vendor ?? "";

    setFormData({
      idOutlet,
      outlet: comp.outlet ?? "",
      inventory_id: comp.inventory_id ?? comp.inventory?.id ?? null,
      ipAddress,
      macAddress,
      cpu: comp.cpu ?? "",
      ram: comp.ram ?? "",
      storage: comp.storage ?? "",
      os: comp.os ?? "",
      produk: comp.produk ?? "",
      sn: comp.sn ?? "",
      tanggalMulai,
      tanggalSelesai,
      penyedia,
      status: comp.status ?? "Inventaris",
      kondisi: comp.kondisi ?? "BAIK",
      keterangan: comp.keterangan ?? comp.deskripsi ?? "",
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
        ipAddress: formData.ipAddress?.trim() || null,
        ip_address: formData.ipAddress?.trim() || null,
        macAddress: formData.macAddress?.trim() || null,
        mac_address: formData.macAddress?.trim() || null,
      };

      if (editingId) {
        const updatedItem = await updateKomputer(editingId, payload);
        const mergedItem = { ...formData, ...updatedItem, id: editingId };
        setComputerData((prev) =>
          prev.map((item) => (item.id === editingId ? mergedItem : item))
        );
        showNotif("Perubahan data komputer berhasil disimpan!");
      } else {
        const newItem = await addKomputer(payload);
        const mergedItem = { ...formData, ...newItem };
        setComputerData((prev) => [mergedItem, ...prev]);
        showNotif("Data komputer baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Save computer error:", err);
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
      setComputerData((prev) => prev.filter((p) => p.id !== id));
      const res = await deleteKomputer(id);
      showNotif(res?.message || "Data komputer berhasil dihapus.");
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