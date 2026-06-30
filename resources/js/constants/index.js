export const createInitialFormData = () => ({
  nomorSurat: "",
  tanggal: new Date().toISOString().split("T")[0],
  jenisTransaksi: "Barang Keluar",
  penerimaNama: "",
  penerimaJabatan: "",
  penerimaInstansi: "",
  pengirimNama: "Ahmad Dendy Syaputra",
  pengirimJabatan: "Staff Pengadaan dan Logistik",
  pengirimInstansi: "",
  mengetahuiNama: "Zoni Rahmawan Putra",
  mengetahuiJabatan: "Kabag Pengadaan dan Logistik",
  lokasi: "Jakarta",
});

export const createInitialItem = () => ({
  id: Date.now().toString(),
  nama: "",
  kuantitas: 1,
  satuan: "Pcs",
  sn: "",
  keterangan: "",
  outlet: "",
});