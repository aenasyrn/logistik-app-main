// resources/js/Components/DataMaster/MasterMeubelairTable.jsx
import { Edit, Trash2 } from "lucide-react";
import { getMeubelairBadgeClass } from "../../utils/meubelairColors";

export default function MasterMeubelairTable({
  data = [],
  startIndex = 0,
  userRole = "user",
  onEdit,
  onDelete,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === "" || val === 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse border border-slate-200 dark:border-gray-700 min-w-[1050px]">
        <thead>
          <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
            <th className="p-2.5 w-12 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              NO
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              NAMA BARANG
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              JENIS BARANG
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              STOK
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              TANGGAL REGISTRASI
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              VENDOR
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              HARGA SATUAN
            </th>
            <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
              JUMLAH BIAYA
            </th>
            {userRole === "admin" && (
              <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">
                AKSI
              </th>
            )}
          </tr>
        </thead>
        <tbody className="text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-[#101e16]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={userRole === "admin" ? 9 : 8}
                className="p-4 text-center text-gray-400 dark:text-gray-500 border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#101e16]"
              >
                Tidak ada data barang meubelair ditemukan.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const rowNumber = startIndex + idx + 1;
              const isStokEmpty = (item.stok || 0) === 0;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#172b20] transition-colors"
                >
                  {/* NO */}
                  <td className="p-2.5 text-center align-middle font-bold text-gray-500 dark:text-gray-400 border border-slate-200 dark:border-gray-700">
                    {rowNumber}
                  </td>

                  {/* NAMA BARANG */}
                  <td className="p-2.5 align-middle border border-slate-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
                    {item.nama_barang}
                  </td>

                  {/* JENIS BARANG */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-gray-700">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getMeubelairBadgeClass(
                        item.jenis_barang
                      )}`}
                    >
                      {item.jenis_barang || "-"}
                    </span>
                  </td>

                  {/* STOK */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-gray-700">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs border ${
                        isStokEmpty
                          ? "border-red-200 text-red-600 bg-red-50/60 dark:border-red-800 dark:text-red-300 dark:bg-red-950/50"
                          : "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/50"
                      }`}
                    >
                      {item.stok !== undefined ? item.stok : 0}
                    </span>
                  </td>

                  {/* TANGGAL REGISTRASI */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(item.tanggal_registrasi)}
                  </td>

                  {/* VENDOR */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                    {item.vendor || "-"}
                  </td>

                  {/* HARGA SATUAN */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(item.harga_satuan)}
                  </td>

                  {/* JUMLAH BIAYA */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
                    {formatCurrency(item.biaya)}
                  </td>

                  {/* AKSI */}
                  {userRole === "admin" && (
                    <td className="p-2 border border-slate-200 dark:border-gray-700 text-center align-middle">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Meubelair"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id, item.nama_barang)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Meubelair"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
