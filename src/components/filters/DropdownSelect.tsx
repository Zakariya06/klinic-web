import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

export type DropdownSelectProps<T extends string> = {
  label: string;
  value: T | "";
  options: T[];
  placeholder?: string;
  onChange: (value: T | "") => void;
};

export function DropdownSelect<T extends string>({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <label className="block text-base font-semibold mb-2 text-gray-900">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 bg-white hover:border-blue-400 transition"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>

        <IoChevronDown
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
          {/* All option */}
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
              !value ? "text-blue-600 font-semibold" : ""
            }`}
          >
            All
          </button>

          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
                value === opt ? "bg-blue-100 text-blue-700 font-semibold" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
