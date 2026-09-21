// resources/js/Components/Form/VendorSelectDropdown.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Building2 } from "lucide-react";

export default function VendorSelectDropdown({
  label,
  icon: Icon,
  id,
  name,
  value,
  onChange,
  onSelect,
  vendors = [],
  placeholder = "Pilih atau ketik vendor...",
  isTableCell = false,
  className = "",
  inputCls = "",
  disabled = false,
  required = false,
  onFocus,
  error = false,
  openUpward = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 240, maxHeight: 240 });

  const filtered = (vendors || []).filter((v) => {
    const q = (value || "").toLowerCase().trim();
    if (!q) return true;
    const isExactMatch = (vendors || []).some((item) => (item.nama || "").toLowerCase() === q);
    if (isExactMatch) return true;
    const nama = (v.nama || "").toLowerCase();
    const pimpinan = (v.pimpinan || "").toLowerCase();
    const kota = (v.kota || "").toLowerCase();
    const noTelpon = (v.no_telpon || "").toLowerCase();
    const bidang = (v.bidang || "").toLowerCase();
    return (
      nama.includes(q) ||
      pimpinan.includes(q) ||
      kota.includes(q) ||
      noTelpon.includes(q) ||
      bidang.includes(q)
    );
  });

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = rect.width;

      let leftPos = rect.left + window.scrollX;
      if (leftPos + dropdownWidth > window.innerWidth + window.scrollX - 12) {
        leftPos = Math.max(12, window.innerWidth + window.scrollX - dropdownWidth - 12);
      }

      setCoords({
        top: openUpward ? rect.top + window.scrollY - 4 : rect.bottom + window.scrollY + 4,
        left: leftPos,
        width: dropdownWidth,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inContainer = containerRef.current && containerRef.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultInputStyle = isTableCell
    ? "w-full text-xs pl-3 pr-8 py-2 border border-[#1b7e47] dark:border-emerald-500 focus:outline-none focus:border-[#1b7e47] focus:ring-2 focus:ring-[#1b7e47]/30 rounded-xl bg-white dark:bg-[#0f1712] transition-all font-semibold text-gray-900 dark:text-slate-100 placeholder:text-gray-400 shadow-2xs"
    : "w-full text-xs pl-3.5 pr-9 py-2.5 rounded-xl border border-[#1b7e47] dark:border-emerald-500 bg-white dark:bg-[#0f1712] text-gray-900 dark:text-slate-100 focus:outline-none focus:border-[#1b7e47] focus:ring-2 focus:ring-[#1b7e47]/30 transition-all font-semibold placeholder:text-gray-400 shadow-2xs";

  const computedInputClass = inputCls || className || defaultInputStyle;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (onChange) onChange(val);
    setIsOpen(true);
  };

  const justFocusedRef = useRef(false);

  const handleInputFocus = (e) => {
    justFocusedRef.current = true;
    setIsOpen(true);
    updatePosition();
    if (onFocus) onFocus(e);
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (justFocusedRef.current) {
      justFocusedRef.current = false;
      setIsOpen(true);
      updatePosition();
    } else {
      setIsOpen((prev) => !prev);
      if (!isOpen) updatePosition();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
          {Icon ? <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : null}
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value || ""}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`${computedInputClass} ${error ? "border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
        />
        <ChevronDown
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen((prev) => !prev);
              updatePosition();
            }
          }}
          className="w-4 h-4 text-[#1b7e47] dark:text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-[#146036] dark:hover:text-emerald-300 transition-colors pointer-events-auto z-10"
        />
      </div>

      {isOpen && filtered.length > 0 && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: "260px",
            transform: openUpward ? "translateY(-100%)" : "none",
            zIndex: 999999,
          }}
          className="bg-white dark:bg-[#0f1712] border border-[#1b7e47]/60 dark:border-emerald-600 rounded-2xl shadow-xl overflow-y-auto divide-y divide-gray-100 dark:divide-[#1e3125] animate-in fade-in zoom-in-95 duration-100"
        >
          {filtered.map((v) => {
            const subtextParts = [];
            if (v.pimpinan) subtextParts.push(`Pimpinan: ${v.pimpinan}`);
            if (v.kota) subtextParts.push(`Kota: ${v.kota}`);
            if (v.no_telpon) subtextParts.push(`Telp: ${v.no_telpon}`);
            const subtext = subtextParts.join(" • ");

            return (
              <div
                key={v.id || v.nama}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (onSelect) onSelect(v);
                  if (onChange) onChange(v.nama);
                  setIsOpen(false);
                }}
                className={`p-3 hover:bg-[#1b7e47]/10 dark:hover:bg-[#1a2b20] cursor-pointer transition-colors flex items-start gap-3 ${
                  value === v.nama ? "bg-[#1b7e47]/15 dark:bg-[#1a2b20] font-bold text-[#1b7e47]" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-gray-900 dark:text-slate-100 leading-snug break-words flex items-center justify-between gap-2">
                    <span>{v.nama}</span>
                    {v.bidang && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1b7e47]/10 dark:bg-emerald-950/60 text-[#1b7e47] dark:text-emerald-300 font-semibold shrink-0">
                        {v.bidang}
                      </span>
                    )}
                  </div>
                  {subtext && (
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                      {subtext}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
