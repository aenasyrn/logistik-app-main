import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Settings, RefreshCw, Check, AlertCircle, X, Shield, Calendar, Hash, PackageMinus, PackageCheck } from "lucide-react";
import axios from "axios";

export default function LetterNumberSettingsModal({
  isOpen,
  onClose,
  letterType = "serah_terima_keluar",
  title = "Pengaturan Nomor Surat",
  onSettingsSaved = null,
  activeTanggal = null,
  jenisTransaksi = "Barang Keluar"
}) {
  // If letterType is serah_terima, allow switching between keluar and masuk
  const isSerahTerima = letterType.startsWith("serah_terima");
  const [subType, setSubType] = useState(
    letterType === "serah_terima_masuk" || jenisTransaksi === "Barang Masuk"
      ? "serah_terima_masuk"
      : "serah_terima_keluar"
  );

  const activeType = isSerahTerima ? subType : letterType;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mode, setMode] = useState("otomatis"); // 'otomatis' | 'reset_manual' | 'manual'
  const [currentNumber, setCurrentNumber] = useState(0);
  const [nextNumber, setNextNumber] = useState(1);
  const [manualStartNumber, setManualStartNumber] = useState(1);
  const [nextInfo, setNextInfo] = useState(null);

  // Menyimpan data asli saat modal dibuka untuk di-restore saat user klik "Tutup" (cancel perubahan)
  const initialDataRef = useRef(null);
  // Menandai jika user telah berinteraksi memilih mode secara manual agar tidak ditimpa oleh respon loadSettings async
  const userInteractedRef = useRef(false);

  useEffect(() => {
    if (isOpen && isSerahTerima) {
      const activeSub = (letterType === "serah_terima_masuk" || jenisTransaksi === "Barang Masuk")
        ? "serah_terima_masuk"
        : "serah_terima_keluar";
      setSubType(activeSub);
    }
  }, [isOpen, letterType, jenisTransaksi, isSerahTerima]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryDate = activeTanggal || new Date().toISOString().split("T")[0];
      const res = await axios.get("/api/letter-numbers/settings", {
        params: { letter_type: activeType, tanggal: queryDate },
      });
      const data = res.data;
      if (data.success) {
        const loadedMode = data.setting.mode || "otomatis";
        const cur = data.current_number !== undefined ? data.current_number : (data.setting.current_number || 0);
        const next = data.next_number || 1;
        const manualStart = data.setting.manual_start_number || 1;
        const nInfo = data.next_info || null;

        // Snapshot pengaturan awal dari database
        initialDataRef.current = {
          mode: loadedMode,
          manualStartNumber: manualStart,
          currentNumber: cur,
          nextNumber: next,
          nextInfo: nInfo,
        };

        // Hanya timpa pilihan mode di form jika user belum memilih mode secara manual saat fetching berlangsung
        if (!userInteractedRef.current) {
          setMode(loadedMode);
          setManualStartNumber(manualStart);
        }
        setCurrentNumber(cur);
        setNextNumber(next);
        setNextInfo(nInfo);
      } else {
        setError(data.message || "Gagal memuat pengaturan nomor surat.");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      setError(err.response?.data?.message || "Gagal memuat pengaturan nomor surat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      userInteractedRef.current = false;
      loadSettings();
    } else {
      userInteractedRef.current = false;
      setMessage(null);
      setError(null);
      setShowResetConfirm(false);
    }
  }, [isOpen, activeType]);

  // Fungsi batalkan perubahan dan tutup modal
  const handleCloseAndCancel = () => {
    if (initialDataRef.current) {
      setMode(initialDataRef.current.mode);
      setManualStartNumber(initialDataRef.current.manualStartNumber);
      setCurrentNumber(initialDataRef.current.currentNumber);
      setNextNumber(initialDataRef.current.nextNumber);
      setNextInfo(initialDataRef.current.nextInfo);
    }
    userInteractedRef.current = false;
    setMessage(null);
    setError(null);
    setShowResetConfirm(false);
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await axios.post("/api/letter-numbers/settings", {
        letter_type: activeType,
        mode,
        manual_start_number: mode === "manual" ? parseInt(manualStartNumber, 10) || 1 : undefined,
        current_number: mode === "manual" ? Math.max(0, (parseInt(manualStartNumber, 10) || 1) - 1) : undefined,
      });
      const data = res.data;
      if (data.success) {
        setMessage(data.message || "Pengaturan berhasil disimpan.");
        setMode(data.setting.mode || "otomatis");
        setCurrentNumber(data.current_number !== undefined ? data.current_number : (data.setting.current_number || 0));
        setNextNumber(data.next_number || 1);
        setNextInfo(data.next_info || null);

        // Perbarui snapshot data yang tersimpan
        initialDataRef.current = {
          mode: data.setting.mode || "otomatis",
          manualStartNumber: mode === "manual" ? (parseInt(manualStartNumber, 10) || 1) : 1,
          currentNumber: data.current_number !== undefined ? data.current_number : (data.setting.current_number || 0),
          nextNumber: data.next_number || 1,
          nextInfo: data.next_info || null,
        };

        if (onSettingsSaved) {
          onSettingsSaved(data);
        }
      } else {
        setError(data.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    setShowResetConfirm(false);
    setResetting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await axios.post("/api/letter-numbers/reset", {
        letter_type: activeType,
      });
      const data = res.data;
      if (data.success) {
        setMessage(data.message || "Nomor surat berhasil direset ke 1.");
        const cur = data.current_number !== undefined ? data.current_number : (data.setting.current_number ?? 0);
        const next = data.next_number !== undefined ? data.next_number : 1;
        const nInfo = data.next_info || null;

        setCurrentNumber(cur);
        setNextNumber(next);
        setNextInfo(nInfo);
        setMode("reset_manual");

        // Perbarui initialDataRef snapshot
        initialDataRef.current = {
          mode: "reset_manual",
          manualStartNumber: 1,
          currentNumber: cur,
          nextNumber: next,
          nextInfo: nInfo,
        };

        if (onSettingsSaved) {
          onSettingsSaved(data);
        }
      } else {
        setError(data.message || "Gagal mereset nomor surat.");
      }
    } catch (err) {
      console.error("Error resetting number:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat mereset nomor surat.");
    } finally {
      setResetting(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCloseAndCancel}
    >
      <div
        className="bg-white dark:bg-[#121f17] border border-gray-200 dark:border-[#213527] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e3325] flex items-center justify-between bg-gray-50/50 dark:bg-[#16271d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0d5c3a] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {title}
                <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-[#0d5c3a] dark:text-emerald-300 rounded-full flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Khusus Admin
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Konfigurasi penomoran surat otomatis dan sequence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseAndCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1c3024] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Sub-type switcher for Serah Terima Barang */}
          {isSerahTerima && (
            <div className="flex rounded-2xl bg-emerald-50/70 dark:bg-[#16271d] p-1.5 border border-emerald-200/90 dark:border-[#223829] gap-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setSubType("serah_terima_keluar")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  subType === "serah_terima_keluar"
                    ? "bg-[#0d5c3a] text-white shadow-sm font-extrabold"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#0d5c3a] hover:bg-emerald-100/60 dark:hover:bg-[#1c3325] dark:hover:text-white"
                }`}
              >
                <PackageMinus className={`w-4 h-4 ${subType === "serah_terima_keluar" ? "text-white" : "text-[#0d5c3a] dark:text-emerald-400"}`} />
                <span>Transaksi Barang Keluar</span>
              </button>
              <button
                type="button"
                onClick={() => setSubType("serah_terima_masuk")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  subType === "serah_terima_masuk"
                    ? "bg-[#0d5c3a] text-white shadow-sm font-extrabold"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#0d5c3a] hover:bg-emerald-100/60 dark:hover:bg-[#1c3325] dark:hover:text-white"
                }`}
              >
                <PackageCheck className={`w-4 h-4 ${subType === "serah_terima_masuk" ? "text-white" : "text-[#0d5c3a] dark:text-emerald-400"}`} />
                <span>Transaksi Barang Masuk</span>
              </button>
            </div>
          )}

          {/* Feedback alerts */}
          {message && (
            <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Display Card (Nomor Saat Ini, Nomor Berikutnya & Kuota Slot) */}
          <div className={`grid gap-3 p-4 bg-gray-50 dark:bg-[#16271d]/60 rounded-xl border border-gray-200/80 dark:border-[#1e3325] ${nextInfo?.slots_total ? "grid-cols-3" : "grid-cols-2"}`}>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-emerald-600" /> Nomor Saat Ini
              </span>
              <p className="text-xl font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                {loading ? "..." : (currentNumber !== undefined && currentNumber !== null ? String(currentNumber).padStart(3, "0") : "-")}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600" /> Nomor Berikutnya
              </span>
              <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {loading ? "..." : (nextNumber !== undefined && nextNumber !== null ? String(nextNumber).padStart(3, "0") : "-")}
              </p>
            </div>
            {nextInfo?.slots_total && (
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" /> Slot Tanggal
                </span>
                <p className="text-sm font-mono font-bold text-gray-900 dark:text-white mt-1">
                  {nextInfo.slots_used} / {nextInfo.slots_total}
                  <span className="text-[10px] font-sans font-medium text-gray-500 dark:text-gray-400 block">
                    Sisa: {nextInfo.slots_remaining} slot
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Mode Penomoran
            </label>

            <div className="space-y-2.5">
              {/* Option 1: Otomatis */}
              <div
                onClick={() => {
                  userInteractedRef.current = true;
                  setMode("otomatis");
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  mode === "otomatis"
                    ? "border-[#0d5c3a] bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-[#0d5c3a]/20"
                    : "border-gray-200 dark:border-[#213527] hover:border-gray-300 dark:hover:border-[#2b4533]"
                }`}
              >
                <input
                  type="radio"
                  name="numberMode"
                  value="otomatis"
                  checked={mode === "otomatis"}
                  onChange={() => {
                    userInteractedRef.current = true;
                    setMode("otomatis");
                  }}
                  className="mt-0.5 text-[#0d5c3a] focus:ring-[#0d5c3a] cursor-pointer"
                />
                <div className="text-xs flex-1 select-none">
                  <span className="font-bold text-gray-900 dark:text-white block">
                    1. Otomatis {isSerahTerima ? "(20 Slot / Hari)" : ""}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px] block mt-0.5 leading-relaxed">
                    {isSerahTerima
                      ? "Setiap hari dialokasikan 20 slot nomor surat secara independen untuk Barang Keluar & Barang Masuk. Pembuatan surat pada tanggal yang sama berlanjut sekuensial (maks 20 slot), dan tanggal hari baru otomatis melanjutkan dari setelah 20 slot hari sebelumnya."
                      : "Nomor dibuat otomatis berjalan berurutan dan reset ke 1 setiap awal tahun."}
                  </span>
                </div>
              </div>

              {/* Option 2: Reset Manual */}
              <div
                onClick={() => {
                  userInteractedRef.current = true;
                  setMode("reset_manual");
                }}
                className={`flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer ${
                  mode === "reset_manual"
                    ? "border-[#0d5c3a] bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-[#0d5c3a]/20"
                    : "border-gray-200 dark:border-[#213527] hover:border-gray-300 dark:hover:border-[#2b4533]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="numberMode"
                    value="reset_manual"
                    checked={mode === "reset_manual"}
                    onChange={() => {
                      userInteractedRef.current = true;
                      setMode("reset_manual");
                    }}
                    className="mt-0.5 text-[#0d5c3a] focus:ring-[#0d5c3a] cursor-pointer"
                  />
                  <div className="text-xs flex-1 select-none">
                    <span className="font-bold text-gray-900 dark:text-white block">2. Reset Manual</span>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px] block mt-0.5">
                      Admin dapat mereset nomor urut kembali ke nomor 1 sewaktu-waktu.
                    </span>
                  </div>
                </div>

                {mode === "reset_manual" && (
                  <div
                    className="mt-3 pt-2.5 border-t border-gray-200/80 dark:border-[#223a2b] flex items-center justify-between pl-7"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] text-gray-600 dark:text-gray-300">
                      Klik tombol di samping untuk mereset:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={resetting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
                      Reset ke 1
                    </button>
                  </div>
                )}
              </div>

              {/* Option 3: Manual */}
              <div
                onClick={() => {
                  userInteractedRef.current = true;
                  setMode("manual");
                }}
                className={`flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer ${
                  mode === "manual"
                    ? "border-[#0d5c3a] bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-[#0d5c3a]/20"
                    : "border-gray-200 dark:border-[#213527] hover:border-gray-300 dark:hover:border-[#2b4533]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="numberMode"
                    value="manual"
                    checked={mode === "manual"}
                    onChange={() => {
                      userInteractedRef.current = true;
                      setMode("manual");
                    }}
                    className="mt-0.5 text-[#0d5c3a] focus:ring-[#0d5c3a] cursor-pointer"
                  />
                  <div className="text-xs flex-1 select-none">
                    <span className="font-bold text-gray-900 dark:text-white block">3. Manual</span>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px] block mt-0.5">
                      Admin dapat menentukan nomor awal secara manual.
                    </span>
                  </div>
                </div>

                {mode === "manual" && (
                  <div
                    className="mt-3 pt-2.5 border-t border-gray-200/80 dark:border-[#223a2b] flex items-center gap-3 pl-7"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 shrink-0 select-none">
                      Input Nomor Awal:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualStartNumber}
                      onChange={(e) => {
                        userInteractedRef.current = true;
                        setManualStartNumber(e.target.value);
                      }}
                      placeholder="Contoh: 1"
                      className="w-28 px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#0f1712] border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-[#0d5c3a] text-gray-900 dark:text-white shadow-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1e3325] flex items-center justify-end gap-2 bg-gray-50/50 dark:bg-[#16271d]">
          <button
            type="button"
            onClick={handleCloseAndCancel}
            className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1c3024] rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0d5c3a] hover:bg-[#094229] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Modal Konfirmasi Reset Nomor Surat di Tengah Layar ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#15251c] border border-gray-100 dark:border-[#213527] rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150 relative">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Konfirmasi Reset Nomor
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Apakah Anda yakin ingin mereset nomor urut berikutnya kembali ke 1?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ya, Reset ke 1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
