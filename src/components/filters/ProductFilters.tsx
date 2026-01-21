import React, { useEffect, useMemo, useState } from "react";
import { useProductStore } from "@/store/productStore";
import type { ProductSearchFilters } from "@/services/productService";
import { IoClose } from "react-icons/io5";

interface ProductFiltersProps {
  onApply: () => void;
  onCancel: () => void;
}

export default function ProductFilters({
  onApply,
  onCancel,
}: ProductFiltersProps) {
  const { filters, setFilters } = useProductStore();

  const [localFilters, setLocalFilters] = useState<ProductSearchFilters>({
    ...filters,
  });

  const [minPrice, setMinPrice] = useState(
    localFilters.minPrice?.toString() || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    localFilters.maxPrice?.toString() || "",
  );
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    setLocalFilters({ ...filters });
    setMinPrice(filters.minPrice?.toString() || "");
    setMaxPrice(filters.maxPrice?.toString() || "");
    setPriceError(null);
  }, [filters]);

  const handleFilterChange = (key: keyof ProductSearchFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceInputChange = (type: "min" | "max", value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    if (type === "min") setMinPrice(sanitized);
    else setMaxPrice(sanitized);
    setPriceError(null);
  };

  const validateAndSetPriceRange = () => {
    const min = minPrice && minPrice.trim() ? Number(minPrice) : undefined;
    const max = maxPrice && maxPrice.trim() ? Number(maxPrice) : undefined;

    if (
      (min !== undefined && Number.isNaN(min)) ||
      (max !== undefined && Number.isNaN(max)) ||
      (min !== undefined && min < 0) ||
      (max !== undefined && max < 0)
    ) {
      setPriceError("Please enter valid non-negative numbers.");
      return false;
    }

    if (min !== undefined && max !== undefined && min > max) {
      setPriceError("Minimum price cannot be greater than maximum price.");
      return false;
    }

    setLocalFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
    setPriceError(null);
    return true;
  };

  const handleApplyFilters = () => {
    if (!validateAndSetPriceRange()) return;

    setFilters({
      ...localFilters,
      minPrice: minPrice && minPrice.trim() ? Number(minPrice) : undefined,
      maxPrice: maxPrice && maxPrice.trim() ? Number(maxPrice) : undefined,
    });

    onApply();
  };

  const handleResetFilters = () => {
    const resetFilters: ProductSearchFilters = { page: 1, limit: 10 };
    setLocalFilters(resetFilters);
    setMinPrice("");
    setMaxPrice("");
    setPriceError(null);
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (minPrice && minPrice !== "0") || (maxPrice && maxPrice !== ""),
    );
  }, [minPrice, maxPrice]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="pb-4 px-4 flex flex-row justify-between items-center border-b border-gray-300">
        <h2 className="lg:text-2xl text-xl font-semibold font-poppins">
          Filter Products
        </h2>
        <button
          onClick={onCancel}
          className="cursor-pointer hover:text-red-600 duration-300"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {/* Price Range */}
        <div className="mb-6">
          <div className="mb-2.5 text-[17px] font-semibold text-[#22223B]">
            Price Range
          </div>

          <div className="mt-1 flex items-end rounded-xl border border-gray-300 bg-gray-50 p-3.5">
            <div className="flex-1 pr-2">
              <div className="mb-1.5 text-[15px] text-gray-500">Min (₹)</div>
              <input
                value={minPrice}
                onChange={(e) => handlePriceInputChange("min", e.target.value)}
                placeholder="0"
                inputMode="numeric"
                maxLength={8}
                aria-label="Minimum Price"
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-3 text-base text-[#22223B] outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex w-6 items-center justify-center pb-3">
              <span className="text-lg text-gray-500">–</span>
            </div>

            <div className="flex-1 pl-2">
              <div className="mb-1.5 text-[15px] text-gray-500">Max (₹)</div>
              <input
                value={maxPrice}
                onChange={(e) => handlePriceInputChange("max", e.target.value)}
                placeholder="No limit"
                inputMode="numeric"
                maxLength={8}
                aria-label="Maximum Price"
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-3 text-base text-[#22223B] outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {priceError ? (
            <div className="mt-2 text-center text-sm font-medium text-red-600">
              {priceError}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 mt-4">
          {/* Reset */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center justify-center px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base flex-1"
            >
              Reset All
            </button>
          )}

          <button
            type="button"
            onClick={handleApplyFilters}
            className="flex items-center justify-center px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base flex-1"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
