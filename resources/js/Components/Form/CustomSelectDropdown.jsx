// resources/js/Components/Form/CustomSelectDropdown.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export default function CustomSelectDropdown({
  label,
  labelCls = "",
  icon: Icon,
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  onSelect,
  options = [],
  placeholder = "Pilih...",
  isTableCell = false,
  className = "",
  inputCls = "",
  disabled = false,
  required = false,
  onFocus,
  error = false,
  allowCustomInput = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalVal, setInternalVal] = useState(value !== undefined ? value : defaultValue);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 240, maxHeight: 240 });

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value);
    } else if (defaultValue !== undefined) {
      setInternalVal(defaultValue);
    }
  }, [value, defaultValue]);

  // Normalize options array into [{ label, value, subtext, raw }]
  const normalizedOptions = (options || []).map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { label: String(opt), value: String(opt), raw: opt };
    }
    const val = opt.value !== undefined ? String(opt.value) : String(opt.nama || opt.label || "");
    const lbl = opt.label !== undefined ? String(opt.label) : String(opt.nama || opt.value || "");
    const code = opt.code || opt.kode || opt.kode_outlet || "";
    const subtext = opt.subtext || (code ? `Kode: ${code}` : "");
    return { label: lbl, value: val, subtext, raw: opt };
  });

  const displayVal = internalVal || "";

  const filtered = normalizedOptions.filter((opt) => {
    const q = (displayVal || "").toLowerCase().trim();
    if (!q) return true;
    const isExactMatch = normalizedOptions.some(
      (item) => item.label.toLowerCase() === q || item.value.toLowerCase() === q
    );
    if (isExactMatch) return true;
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q) ||
      (opt.subtext && opt.subtext.toLowerCase().includes(q))
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
        top: rect.bottom + window.scrollY + 4,
        left: leftPos,
        width: dropdownWidth,
      });
    }
  };

  useEffect(() => {
    if (isOpen && isTableCell) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => {
        updatePosition();
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen, isTableCell]);

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
    ? "w-full text-xs pl-3 pr-8 py-2 border border-[#1b7e47] dark:border-emerald-500 focus:outline-none focus:border-[#1b7e47] focus:ring-2 focus:ring-[#1b7e47]/30 rounded-xl bg-white dark:bg-[#0f1712] transition-all font-semibold text-gray-900 dark:text-slate-100 placeholder:text-gray-400 shadow-2xs cursor-pointer"
    : "w-full text-xs pl-4 pr-9 py-3 rounded-xl border border-[#1b7e47] dark:border-emerald-500 bg-white dark:bg-[#0f1712] text-gray-900 dark:text-slate-100 focus:outline-none focus:border-[#1b7e47] focus:ring-2 focus:ring-[#1b7e47]/30 transition-all font-semibold placeholder:text-gray-400 shadow-2xs cursor-pointer";

  const computedInputClass = inputCls || className || defaultInputStyle;

  const handleSelectOption = (opt) => {
    setInternalVal(opt.value);
    if (onSelect) onSelect(opt.raw);
    if (onChange) {
      if (typeof onChange === "function") {
        onChange({ target: { name, value: opt.value } });
      }
    }
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInternalVal(val);
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
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

  const renderDropdownMenu = () => (
    <div
      ref={dropdownRef}
      style={
        isTableCell
          ? {
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: "260px",
              zIndex: 999999,
            }
          : {
              maxHeight: "260px",
            }
      }
      className={`${
        isTableCell
          ? ""
          : "absolute left-0 right-0 top-full mt-1.5 z-[99999]"
      } bg-white dark:bg-[#0f1712] border border-[#1b7e47]/60 dark:border-emerald-600 rounded-2xl shadow-xl overflow-y-auto divide-y divide-gray-100 dark:divide-[#1e3125] animate-in fade-in zoom-in-95 duration-100`}
    >
      {filtered.map((opt, idx) => {
        const isSelected = internalVal === opt.value || internalVal === opt.label;
        return (
          <div
            key={opt.value + "-" + idx}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelectOption(opt);
            }}
            className={`p-3 hover:bg-[#1b7e47]/10 dark:hover:bg-[#1a2b20] cursor-pointer transition-colors flex items-center justify-between gap-3 ${
              isSelected ? "bg-[#1b7e47]/15 dark:bg-[#1a2b20] font-bold text-[#1b7e47] dark:text-emerald-300" : "text-gray-900 dark:text-slate-100"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs leading-snug break-words">{opt.label}</div>
              {opt.subtext && (
                <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                  {opt.subtext}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? "z-30" : "z-10"}`}>
      {label && (
        <label className={labelCls || "block text-sm mb-2 font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5"}>
          {Icon ? <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : null}
          {label}
        </label>
      )}

      <div className="relative w-full">
        {name && <input type="hidden" name={name} value={internalVal || ""} required={required} />}
        
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={displayVal}
          readOnly={!allowCustomInput}
          onChange={allowCustomInput ? handleInputChange : undefined}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`${computedInputClass} ${!computedInputClass.includes("pr-") ? "pr-9" : ""} ${error ? "border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
        />
        <ChevronDown
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (isTableCell) updatePosition();
            }
          }}
          className="w-4 h-4 text-[#1b7e47] dark:text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-[#146036] dark:hover:text-emerald-300 transition-colors pointer-events-auto z-10"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        isTableCell && typeof document !== "undefined"
          ? createPortal(renderDropdownMenu(), document.body)
          : renderDropdownMenu()
      )}
    </div>
  );
}
