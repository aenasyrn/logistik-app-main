// resources/js/Components/DataMaster/MasterVendorPlaceholder.jsx
"use client";

import { Users, Hammer, ArrowLeftRight, HardHat } from "lucide-react";

export default function MasterVendorPlaceholder() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" /> Master Vendor
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data vendor, penanggung jawab, dan kontrak kerja sama.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <HardHat className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Fitur Master Vendor Sedang Dikembangkan
        </h3>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
          Halaman ini nantinya akan mempermudah Anda dalam mengelola database rekanan kerja, vendor pengadaan barang, vendor konstruksi, serta memantau status keaktifan dokumen PKS.
        </p>
      </div>
    </div>
  );
}
