import { Activity, ArrowDownLeft, ArrowUpRight, ClipboardList, Plus } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export default function TransactionActivity({ transactions = [], setView, startNewDocument }) {
  const latestTransactions = [...transactions]
    .sort((first, second) => {
      const firstDate = new Date(first.tanggal || first.created_at || 0).getTime() || 0;
      const secondDate = new Date(second.tanggal || second.created_at || 0).getTime() || 0;
      return secondDate - firstDate;
    })
    .slice(0, 5);

  const openHistory = () => {
    localStorage.setItem("riwayat_active_tab", "serah_terima");
    setView?.("riwayat");
  };

  const createDocument = () => {
    if (typeof startNewDocument === "function") startNewDocument("Barang Keluar");
    else setView?.("form");
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400">
            <Activity className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">Aktivitas Transaksi</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{transactions.length.toLocaleString("id-ID")} dokumen tercatat</p>
          </div>
        </div>
        <button type="button" onClick={openHistory} className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          Lihat semua
        </button>
      </header>

      {latestTransactions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center text-slate-400">
          <ClipboardList className="mb-2 h-9 w-9 opacity-50" />
          <p className="text-sm">Belum ada aktivitas transaksi.</p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {latestTransactions.map((transaction) => {
            const type = String(transaction.jenisTransaksi || transaction.jenis_transaksi || "").toLowerCase();
            const isIncoming = type.includes("masuk");
            const number = transaction.nomorSurat || transaction.nomor_surat || "Nomor surat belum tersedia";
            const sender = transaction.pengirimNama || transaction.pengirim_nama || "Pengirim belum diisi";
            const recipient = transaction.penerimaNama || transaction.penerima_nama || "Penerima belum diisi";

            return (
              <article key={transaction.id || number} className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-5">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isIncoming ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400"}`}>
                  {isIncoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <p className="max-w-full truncate text-xs font-bold text-slate-800 dark:text-slate-100" title={number}>{number}</p>
                    <time className="shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {formatDate(transaction.tanggal || transaction.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={`${sender} - ${recipient}`}>
                    {sender} <span className="px-1 text-slate-300">/</span> {recipient}
                  </p>
                </div>
                <span className={`mt-0.5 shrink-0 rounded-md border px-2 py-1 text-[9px] font-extrabold tracking-wide ${isIncoming ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                  {isIncoming ? "MASUK" : "KELUAR"}
                </span>
              </article>
            );
          })}
        </div>
      )}

      <footer className="border-t border-slate-100 p-4 dark:border-slate-800 sm:px-5">
        <button type="button" onClick={createDocument} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500">
          <Plus className="h-4 w-4" /> Buat Surat BAST
        </button>
      </footer>
    </section>
  );
}