import React, { useEffect, useRef, useState } from "react";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type DropdownProps<T extends string> = {
  options: Option<T>[];
  value?: T;
  placeholder?: string;
  onChange: (value: T) => void;
  label?: string;
};

export function Dropdown<T extends string>({
  options,
  value,
  placeholder = "Seleccione...",
  onChange,
  label,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  // cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-900">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`h-11 w-full rounded-xl border px-4 text-left text-sm shadow-sm flex items-center justify-between transition
                      border-slate-200
                      bg-white text-slate-700`
          }
        >
          {selected ? (
            <div className="flex gap-2">
              <span className="font-semibold">{selected.value}</span>
              <span className="text-slate-600">
                — {selected.label}
              </span>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}

          <span
            className={`ml-2 text-slate-400 transition-transform ${open ? "rotate-180" : ""
              }`}
          >
            ▼
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
            {options.map((opt) => {
              const isSelected = opt.value === value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition
                    ${isSelected
                      ? "bg-slate-100 font-medium"
                      : "hover:bg-slate-100"
                    }`}
                >
                  <span className="font-semibold">{opt.value}</span>

                  <span className="text-slate-600">
                    — {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}