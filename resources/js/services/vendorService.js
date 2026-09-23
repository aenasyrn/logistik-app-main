import axios from 'axios';
import { downloadExcelTemplate } from '../utils/excelHelper';

export const importVendorCSV = async (data) => {
  const res = await axios.post('/vendors/import', { data });
  return typeof res.data?.total === 'number' ? res.data.total : data.length;
};

export const importVendorExcel = importVendorCSV;

export const downloadVendorTemplate = () => {
  const headers = ["Nama Perusahaan", "Pimpinan", "Jabatan", "Bidang", "Sertifikat DRM", "Masa Berlaku Awal", "Masa Berlaku Akhir", "Kota", "No Telpon", "Alamat"];
  const sampleRows = [
    ["PT Solusi Utama", "Bpk. Ahmad", "Direktur Utama", "Pengadaan IT", "001/DRM/IT/2026", "2026-01-01", "2027-01-01", "Jakarta Pusat", "021-5551234", "Jl. Sudirman No. 45 Jakarta"],
    ["CV Logistik Jaya", "Ibu Sinta", "Manajer Operasional", "Renovasi Gedung", "002/DRM/RG/2026", "2026-02-15", "2028-02-15", "Jakarta Selatan", "081234567890", "Jl. Gatot Subroto No. 12 Jakarta"],
  ];
  downloadExcelTemplate("Template_Master_Vendor.xlsx", headers, sampleRows, "Master Vendor");
};
