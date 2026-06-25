"use client";
import { ArrowLeft, Save, Printer } from "lucide-react";

const PreviewView = ({
  formData,
  items,
  activeTransaction,
  setView,
  handleSaveTransaction,
}) => (
  <div className="w-full max-w-4xl mx-auto bg-white mt-6 shadow-xl relative print:shadow-none print:m-0 print:p-0 print:max-w-none print:bg-transparent">
    {/* NAVBAR PREVIEW (Disembunyikan saat print) */}
    <div className="print:hidden p-4 bg-gray-100 flex justify-between items-center sticky top-0 z-10 border-b">
      <button
        onClick={() => setView(activeTransaction ? "riwayat" : "form")}
        className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />{" "}
        {activeTransaction ? "Ke Riwayat" : "Edit Kembali"}
      </button>
      <div className="flex gap-3">
        {!activeTransaction && (
          <button
            onClick={handleSaveTransaction}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Simpan Transaksi
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" /> Cetak Dokumen
        </button>
      </div>
    </div>

    {/* AREA CETAK */}
    <div
      className="p-8 sm:p-12 bg-white print:px-12 print:pt-12 text-sm print:text-[12px] relative"
      id="printable-area"
    >
      {/* Konten Utama */}
      <div className="print:pb-4">
        {/* Header Surat */}
        <div className="flex items-center justify-between mb-8 print:mb-6 border-b-[3px] border-black pb-5 print:pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-pegadaian.png"
            alt="Logo Pegadaian"
            className="h-16 print:h-14 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'></path><polyline points='3.27 6.96 12 12.01 20.73 6.96'></polyline><line x1='12' y1='22.08' x2='12' y2='12'></line></svg>";
            }}
          />
          <div className="text-right">
            <h1 className="text-2xl print:text-[18px] font-bold uppercase tracking-wider text-gray-900 leading-tight">
              Departemen Logistik
            </h1>
            <p className="text-gray-600 print:text-[11px]">
              Sistem Informasi Manajemen Barang
            </p>
          </div>
        </div>

        {/* Judul Surat */}
        <div className="text-center mb-6 print:mb-5">
          <h2 className="text-xl print:text-[14px] font-bold underline uppercase text-gray-900 leading-tight">
            Berita Acara Serah Terima {formData.jenisTransaksi}
          </h2>
          <p className="text-gray-700 mt-1 print:mt-1 print:text-[11px]">
            Nomor: {formData.nomorSurat}
          </p>
        </div>

        {/* Teks Pengantar */}
        <div className="mb-6 print:mb-5 text-gray-800 text-justify">
          <div className="mb-4 print:mb-3 border-yellow-400 print:bg-yellow-300 print:border-yellow-400">
            <h1 className="font-semibold inline mr-2 ">Penerima Barang:</h1>
            {formData.penerimaInstansi && (
              <strong className="uppercase">{formData.penerimaInstansi}</strong>
            )}
          </div>
          <p className="leading-relaxed print:leading-7">
            Pada hari ini, tanggal{" "}
            <strong>
              {new Date(formData.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>{" "}
            bertempat di <strong>{formData.lokasi}</strong>, telah dilakukan
            serah terima barang dengan rincian sebagai berikut:
          </p>
        </div>

        {/* Tabel Barang */}
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black py-2 px-2 text-center w-[5%]">
                No
              </th>
              <th className="border border-black py-2 px-2 text-left w-[25%]">
                Nama Barang
              </th>
              <th className="border border-black py-2 px-2 text-left w-[15%]">
                S/N
              </th>
              <th className="border border-black py-2 px-2 text-center w-[8%]">
                Qty
              </th>
              <th className="border border-black py-2 px-2 text-center w-[12%]">
                Satuan
              </th>
              <th className="border border-black py-2 px-2 text-left w-[20%]">
                Outlet Tujuan
              </th>
              <th className="border border-black py-2 px-2 text-left w-[15%]">
                Keterangan
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="break-inside-avoid">
                <td className="border border-black py-1 px-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-black py-1 px-2">{item.nama}</td>
                <td className="border border-black py-1 px-2 break-all">
                  {item.sn}
                </td>
                <td className="border border-black py-1 px-2 text-center">
                  {item.kuantitas}
                </td>
                <td className="border border-black py-1 px-2 text-center">
                  {item.satuan}
                </td>
                <td className="border border-black py-1 px-2">{item.outlet}</td>
                <td className="border border-black py-1 px-2">
                  {item.keterangan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Teks Penutup */}
        <div className="text-gray-800 mb-6 print:mb-4 text-justify">
          <p className="leading-relaxed print:leading-7">
            Demikian Berita Acara Serah Terima Barang ini dibuat dengan
            sebenarnya dalam keadaan sadar dan tanpa paksaan dari pihak manapun,
            untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>
        <div className="mb-8 print:mb-6">
          <p className="font-semibold mb-4 print:mb-3 border-yellow-400 print:bg-yellow-300 print:border-yellow-400">
            NOTE : MOHON UNTUK DISIMPAN SEBAGAI BUKTI SAH SERAH TERIMA BARANG
          </p>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-3 mt-8 print:mt-6 text-center text-gray-900 w-full break-inside-avoid">
          <div className="flex flex-col items-start">
            <p className="mb-20 print:mb-12">Yang Menerima,</p>
            <div className="h-10 flex flex-col items-start justify-end w-full">
              <p className="font-bold underline uppercase">
                {formData.penerimaNama || "( ........................ )"}
              </p>
              <p className="text-sm print:text-[11px] mt-1 text-left">
                {formData.penerimaJabatan}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-20 print:mb-12">Yang Menyerahkan,</p>
            <div className="h-10 flex flex-col items-center justify-end w-full">
              <p className="font-bold underline uppercase">
                {formData.pengirimNama || "( ........................ )"}
              </p>
              <p className="text-sm print:text-[11px] mt-1">
                {formData.pengirimJabatan}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="mb-20 print:mb-12">Mengetahui,</p>
            <div className="h-10 flex flex-col items-end justify-end w-full">
              <p className="font-bold underline uppercase">
                {formData.mengetahuiNama || "( ........................ )"}
              </p>
              <p className="text-sm print:text-[11px] mt-1 text-right">
                {formData.mengetahuiJabatan}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 print:mt-0 print:fixed print:bottom-4 print:left-12 print:right-12 print:bg-white text-left text-[11px] text-gray-800 border-t-[2px] border-black pt-4 print:pt-2 print:text-[10px]">
        <p className="font-bold text-[12px] print:text-[11px] text-gray-900 leading-tight">
          PT. PEGADAIAN
        </p>
        <p className="leading-tight mt-0.5">Kantor Wilayah VIII Jakarta 1</p>
        <p className="leading-tight mt-0.5">
          Jl. Senen Raya No. 36 Jakarta Pusat 10410
        </p>
        <p className="leading-tight mt-0.5">
          Telp : (021) 3840229 &nbsp;&nbsp;&nbsp; Fax : (021) 3454116
        </p>
      </div>
    </div>
  </div>
);

export default PreviewView;