// src/components/DataPerangkat/DataPrinter/QrLabelModal.jsx
"use client";

import { X, QrCode, Printer as PrinterIcon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrLabelModal({ data, onClose }) {
  if (!data) return null;

  const qrValue = [
    "ASET LOGISTIK KANWIL VIII",
    "",
    `Lokasi: ${data.outlet}`,
    `Perangkat: ${data.produk}`,
    `S/N: ${data.sn}`,
    `Status: ${data.status}`,
  ].join("\n");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:z-auto">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 print:border-none print:shadow-none print:p-0 print:w-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" /> Cetak Label Printer
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Label */}
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center text-center print:border-solid print:border-black print:p-4 print:rounded-none">
          <h2 className="font-extrabold text-lg text-gray-900 tracking-wide print:text-black mb-1 uppercase">
            ASET IT - KANWIL VIII JAKARTA
          </h2>
          <p className="text-xs font-bold text-gray-500 mb-5 print:text-black">{data.outlet}</p>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-0 mb-4">
            <QRCodeCanvas value={qrValue} size={140} level="M" includeMargin />
          </div>

          <p className="font-bold text-sm text-gray-800 print:text-black">{data.produk}</p>
          <div className="flex items-center justify-center mt-2 text-xs font-mono bg-gray-50 px-3 py-1.5 rounded-md print:bg-transparent print:p-0 print:text-black">
            <p>
              <span className="text-gray-400 font-sans print:text-gray-800">SN:</span> {data.sn}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <PrinterIcon className="w-4 h-4" /> Cetak Stiker
          </button>
        </div>
      </div>
    </div>
  );
}