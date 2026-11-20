"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  countLabel?: string;
  loading?: boolean;
  allowCustom?: boolean;
  onChange: (value: string) => void;
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SearchableSelect({
  label,
  value,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Filtrar opciones...",
  countLabel,
  loading = false,
  allowCustom = false,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const normQuery = normalizeText(query.trim());
    return options.filter((opt) => normalizeText(opt).includes(normQuery));
  }, [options, query]);

  const hasExactMatch = useMemo(() => {
    const normQuery = normalizeText(query.trim());
    if (!normQuery) return true;
    return options.some((opt) => normalizeText(opt) === normQuery);
  }, [options, query]);

  function handleSelect(opt: string) {
    onChange(opt);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-[10px] font-semibold text-slate-400">
          {loading ? (
            <span className="inline-flex items-center gap-1 text-indigo-600">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              cargando...
            </span>
          ) : (
            countLabel || `${options.length} opc.`
          )}
        </span>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery("");
        }}
        className={`mt-1 flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2.5 text-left text-sm transition cursor-pointer ${
          open
            ? "border-indigo-600 ring-2 ring-indigo-600/15"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <span
          className={`truncate font-medium ${
            value ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180 text-indigo-600" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Buscador dentro del desplegable */}
          <div className="border-b border-slate-100 p-2">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`${searchPlaceholder} (${options.length})`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lista desplazable */}
          <ul className="max-h-60 overflow-y-auto p-1.5">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-slate-500">
                No hay coincidencias para &quot;{query}&quot;
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 font-bold text-indigo-700"
                          : "font-medium text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Opción personalizada si escribió algo nuevo */}
          {allowCustom && query.trim() && !hasExactMatch && (
            <div className="border-t border-slate-100 bg-slate-50 p-1.5">
              <button
                type="button"
                onClick={() => handleSelect(query.trim())}
                className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Usar &quot;{query.trim()}&quot;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
