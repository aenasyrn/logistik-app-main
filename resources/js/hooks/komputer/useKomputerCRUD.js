// src/hooks/komputer/useKomputerCRUD.js
import { useState } from "react";
import { addKomputer, updateKomputer, deleteKomputer } from "../../services/komputerService";
import { emptyFormKomputer as emptyForm } from "../../utils/deviceUtils";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function useKomputerCRUD({ computerData, setComputerData, showNotif }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [isSaving, setIsSaving]       = useState(false);

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); };

  const openModalForAdd  = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (comp) => {
    setEditingId(comp.id);
    setFormData({ ...comp });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateKomputer(APP_ID, editingId, formData);
        setComputerData((prev) =>
          prev.map((item) => item.id === editingId ? { id: editingId, ...formData } : item)
        );
        showNotif("Perubahan data komputer berhasil disimpan!");
      } else {
        const newItem = await addKomputer(APP_ID, formData);
        setComputerData((prev) => [newItem, ...prev]);
        showNotif("Data komputer baru berhasil ditambahkan!");
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
      await deleteKomputer(APP_ID, id);
      setComputerData((prev) => prev.filter((p) => p.id !== id));
      showNotif("Data komputer berhasil dihapus.");
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