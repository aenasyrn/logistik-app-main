// resources/js/services/masterMeubelairService.js
import axios from "axios";
import { router } from "@inertiajs/react";
import { downloadExcelTemplate } from "../utils/excelHelper";

export const addMasterMeubelair = async (data) => {
  const res = await axios.post("/master-meubelairs", data);
  router.reload({ only: ["masterMeubelairs", "activityLogs"] });
  return res.data;
};

export const updateMasterMeubelair = async (id, data) => {
  const res = await axios.put(`/master-meubelairs/${id}`, data);
  router.reload({ only: ["masterMeubelairs", "activityLogs"] });
  return res.data;
};

export const deleteMasterMeubelair = async (id) => {
  const res = await axios.delete(`/master-meubelairs/${id}`);
  router.reload({ only: ["masterMeubelairs", "activityLogs"] });
  return res.data;
};

export const importMasterMeubelairCSV = async (data) => {
  const res = await axios.post("/master-meubelairs/import", { data });
  router.reload({ only: ["masterMeubelairs", "activityLogs"] });
  return res.data.count;
};

export const importMasterMeubelairExcel = importMasterMeubelairCSV;

export const downloadMasterMeubelairTemplate = () => {
  const headers = [
    "Nama Barang",
    "Jenis Barang",
    "Stok",
    "Tanggal Registrasi",
    "Vendor",
    "Harga Satuan",
    "Jumlah Biaya",
    "Keterangan"
  ];
  const sampleRows = [
    [
      "Meja Kerja 1/2 Biro",
      "Meja",
      "10",
      "2024-02-15",
      "PT Sentra Mebel Indonesia",
      "1250000",
      "12500000",
      "Warna cokelat kayu standar kantor"
    ],
    [
      "Kursi Putar Staff",
      "Kursi",
      "25",
      "2024-03-01",
      "CV Mitra Office",
      "750000",
      "18750000",
      "Jaring hitam dengan sandaran tangan"
    ],
    [
      "Lemari Arsip Besi 2 Pintu",
      "Lemari",
      "5",
      "2024-01-20",
      "PT Steel Perkasa",
      "2400000",
      "12000000",
      "Kunci central lock abu-abu"
    ],
    [
      "Sofa Tamu Minimalis 3 Seater",
      "Sofa",
      "2",
      "2024-03-10",
      "PT Sentra Mebel Indonesia",
      "3500000",
      "7000000",
      "Bahan fabric abu-abu"
    ],
    [
      "AC Split 1.5 PK Inverter",
      "AC",
      "4",
      "2024-03-15",
      "CV Sejuk Sentosa",
      "4800000",
      "19200000",
      "Inverter hemat listrik"
    ]
  ];

  downloadExcelTemplate("Template_Master_Meubelair.xlsx", headers, sampleRows, "Master Meubelair");
};
