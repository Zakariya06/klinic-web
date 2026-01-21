import React, { useState, useEffect } from "react";
import { useDoctorStore } from "../../store/doctorStore";
import type { DoctorSearchFilters } from "../../services/doctorService";
import { IoChevronDown, IoClose } from "react-icons/io5";
import { DropdownSelect } from "./DropdownSelect";

interface DoctorFiltersProps {
  onApplyFilters: () => void;
  onClose: () => void;
}

type Gender = "male" | "female" | "other";
type ConsultationType = "in-person" | "online" | "both";

export default function DoctorFilters({
  onApplyFilters,
  onClose,
}: DoctorFiltersProps) {
  const { filters, availableFilters, setFilters, resetFilters, searchDoctors } =
    useDoctorStore();

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<DoctorSearchFilters>({
    ...filters,
  });

  // Fee range state
  const [minFee, setMinFee] = useState(localFilters.minFee?.toString() || "");
  const [maxFee, setMaxFee] = useState(localFilters.maxFee?.toString() || "");

  // Rating state
  const [minRating, setMinRating] = useState(
    localFilters.minRating?.toString() || "",
  );

  // Pin code state
  const [pinCode, setPinCode] = useState(localFilters.pinCode || "");

  // Reset local filters when global filters change
  useEffect(() => {
    setLocalFilters({ ...filters });
    setMinFee(filters.minFee?.toString() || "");
    setMaxFee(filters.maxFee?.toString() || "");
    setMinRating(filters.minRating?.toString() || "");
    setPinCode(filters.pinCode || "");
  }, [filters]);

  const handleFilterChange = (key: keyof DoctorSearchFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveFeeRange = () => {
    const min = minFee ? parseInt(minFee, 10) : undefined;
    const max = maxFee ? parseInt(maxFee, 10) : undefined;

    setLocalFilters((prev) => ({
      ...prev,
      minFee: min,
      maxFee: max,
    }));
  };

  const handleCancelFeeRange = () => {
    setMinFee(localFilters.minFee?.toString() || "");
    setMaxFee(localFilters.maxFee?.toString() || "");
  };

  const handleSaveRating = () => {
    const min = minRating ? parseInt(minRating, 10) : undefined;

    setLocalFilters((prev) => ({
      ...prev,
      minRating: min,
    }));
  };

  const handleCancelRating = () => {
    setMinRating(localFilters.minRating?.toString() || "");
  };

  const handleSavePinCode = () => {
    setLocalFilters((prev) => ({
      ...prev,
      pinCode: pinCode || undefined,
    }));
  };

  const handleCancelPinCode = () => {
    setPinCode(localFilters.pinCode || "");
  };

  const handleApplyFilters = () => {
    // Always reset to page 1 when applying filters
    setFilters({ ...localFilters, page: 1 });
    onApplyFilters();
  };

  const handleResetFilters = () => {
    resetFilters();
    // After resetting filters, explicitly search with page 1
    searchDoctors({ page: 1 });
    onClose();
  };

  return (
    <div>
      <div className="pb-4 px-4 flex flex-row justify-between items-center border-b border-gray-300">
        <h2 className="lg:text-2xl text-xl font-semibold font-poppins">
          Filter Doctors
        </h2>
        <button
          onClick={onClose}
          className="cursor-pointer hover:text-red-600 duration-300"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Scrollable Filters */}
      <div className=" px-4 pt-6 space-y-6">
        {/* City Filter */}
        <DropdownSelect
          label="City"
          value={localFilters.city || ""}
          placeholder="All Cities"
          options={[...new Set(availableFilters.cities)]}
          onChange={(val) => handleFilterChange("city", val)}
        />

        <DropdownSelect
          label="Specialization"
          value={localFilters.specialization || ""}
          placeholder="All Specializations"
          options={availableFilters.specializations}
          onChange={(val) => handleFilterChange("specialization", val)}
        />

        <DropdownSelect<Gender>
          label="Gender"
          value={localFilters.gender || ""}
          placeholder="All Genders"
          options={availableFilters.genderOptions as Gender[]}
          onChange={(val) => handleFilterChange("gender", val)}
        />

        {/* Consultation Type Filter */}
        <DropdownSelect<ConsultationType>
          label="Consultation Type"
          value={localFilters.consultationType || ""}
          placeholder="All Types"
          options={availableFilters.consultationTypes as ConsultationType[]}
          onChange={(val) => handleFilterChange("consultationType", val)}
        />

        {/* Reset & Apply Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            className="flex items-center justify-center px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base flex-1"
            onClick={handleResetFilters}
          >
            Reset
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base flex-1"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
