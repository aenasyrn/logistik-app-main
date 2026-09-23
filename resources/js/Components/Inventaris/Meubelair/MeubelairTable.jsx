// resources/js/Components/Inventaris/Meubelair/MeubelairTable.jsx
import React from "react";
import { Edit, Trash2, MapPin } from "lucide-react";
import { getMeubelairBadgeClass } from "../../../utils/meubelairColors";

export default function MeubelairTable({
  data = [],
  startIndex = 0,
  outlets = [],
  onEdit,
  onDelete,
  userRole,
}) {
  const getKondisiBadge = (kondisi) => {
    const k = (kondisi || "Baik").toLowerCase();
    if (k.includes("kurang") || k.includes("rusak")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    }
    return "bg-emerald-50 text-[#0d5c3a] border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
            <th className="p-2.5 w-12 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No</th>
            <th className="p-2.5 text-left align-middle border border-[#0a4228] bg-[#0d5c3a] min-w-[180px]">
              Lokasi / Outlet
            </th>
            <th className="p-2.5 text-left align-middle border border-[#0a4228] bg-[#0d5c3a] min-w-[140px]">
              Jenis Barang
            </th>
            <th className="p-2.5 text-left align-middle border border-[#0a4228] bg-[#0d5c3a] min-w-[180px]">
              Type Barang
            </th>
            <th className="p-2.5 w-24 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Quantity</th>
            <th className="p-2.5 w-28 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kondisi</th>
            <th className="p-2.5 w-36 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Tanggal Registrasi</th>
            <th className="p-2.5 text-left align-middle border border-[#0a4228] bg-[#0d5c3a] min-w-[150px]">Keterangan</th>
            {userRole !== "guest" && (
              <th className="p-2.5 w-24 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody className="text-xs text-gray-800 dark:text-slate-200 bg-white dark:bg-[#16251c]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={userRole === "guest" ? "8" : "9"} className="p-6 text-center text-gray-400 border border-slate-200 dark:border-[#213527]">
                Tidak ada data inventaris meubelair ditemukan.
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowNum = startIndex + index + 1;
              const lokasiName = item.lokasi || (item.outlet_rel ? (item.outlet_rel.nama || item.outlet_rel.nama_outlet) : "-");
              const kodeOutlet =
                item.outlet_rel?.code ||
                item.outlet_rel?.kode ||
                item.outlet_rel?.kode_outlet ||
                outlets.find(
                  (o) =>
                    (item.outlet_id && String(o.id) === String(item.outlet_id)) ||
                    (item.lokasi && (o.nama === item.lokasi || o.nama_outlet === item.lokasi))
                )?.code ||
                null;

              const jenisBarang = item.kategori
                ? (item.kategori.toLowerCase() === "ac"
                    ? "AC"
                    : item.kategori.charAt(0).toUpperCase() + item.kategori.slice(1))
                : "-";

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#1c3024] transition-colors border-b border-slate-200/80 dark:border-[#213527]"
                >
                  {/* No */}
                  <td className="p-2.5 text-center font-bold text-gray-500 dark:text-slate-400 border border-slate-200 dark:border-[#213527]">
                    {rowNum}
                  </td>

                  {/* Lokasi / Outlet */}
                  <td className="p-2.5 text-gray-700 dark:text-slate-300 border border-slate-200 dark:border-[#213527]">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-[#0d5c3a] dark:text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[220px]" title={lokasiName}>
                          {lokasiName}
                        </span>
                      </div>
                      {kodeOutlet && (
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 pl-5 font-semibold">
                          Kode: {kodeOutlet}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Jenis Barang */}
                  <td className="p-2.5 text-center align-middle border border-slate-200 dark:border-[#213527]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getMeubelairBadgeClass(
                        item.kategori
                      )}`}
                    >
                      {jenisBarang}
                    </span>
                  </td>

                  {/* Type Barang */}
                  <td className="p-2.5 font-bold text-gray-900 dark:text-slate-100 border border-slate-200 dark:border-[#213527]">
                    {item.jenis || "-"}
                  </td>

                  {/* Quantity */}
                  <td className="p-2.5 text-center font-extrabold text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-[#213527]">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                      {item.quantity || 1}
                    </span>
                  </td>

                  {/* Kondisi */}
                  <td className="p-2.5 text-center border border-slate-200 dark:border-[#213527]">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getKondisiBadge(
                        item.kondisi
                      )}`}
                    >
                      {item.kondisi && item.kondisi.toLowerCase().includes("kurang") ? "Kurang Baik" : "Baik"}
                    </span>
                  </td>

                  {/* Tanggal Registrasi */}
                  <td className="p-2.5 text-center font-medium text-gray-700 dark:text-slate-300 border border-slate-200 dark:border-[#213527] whitespace-nowrap">
                    {item.tanggal_register ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 font-semibold text-[11px]">
                        {formatDate(item.tanggal_register)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>

                  {/* Keterangan */}
                  <td
                    className="p-2.5 text-gray-500 dark:text-slate-400 border border-slate-200 dark:border-[#213527] max-w-[200px] truncate"
                    title={item.keterangan || "-"}
                  >
                    {item.keterangan || "-"}
                  </td>

                  {/* Aksi */}
                  {userRole !== "guest" && (
                    <td className="p-2.5 text-center border border-slate-200 dark:border-[#213527]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="Edit Data"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {userRole === "admin" && (
                          <button
                            type="button"
                            onClick={() => onDelete(item.id, item.jenis || item.kategori || "Barang")}
                            title="Hapus Data"
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
