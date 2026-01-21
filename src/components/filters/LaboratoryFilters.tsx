import React, { useState, useEffect } from "react";
import { useLaboratoryStore } from "../../store/laboratoryStore";
import type { LaboratorySearchFilters } from "../../services/laboratoryService";
import {
  IoChevronDown,
  IoChevronForward,
  IoClose,
  IoStar,
  IoStarOutline,
} from "react-icons/io5";
import { DropdownSelect } from "./DropdownSelect";

interface LaboratoryFiltersProps {
  onApplyFilters: () => void;
  onClose: () => void;
}

interface ModalOverlayProps {
  isOpen: boolean;
  title: string;
  onCloseModal: () => void;
  children: React.ReactNode;
}

type Gender = "male" | "female" | "other";
type ConsultationType = "in-person" | "online" | "both";

export default function LaboratoryFilters({
  onApplyFilters,
  onClose,
}: LaboratoryFiltersProps) {
  const {
    filters,
    availableFilters,
    setFilters,
    resetFilters,
    searchLaboratories,
  } = useLaboratoryStore();

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<LaboratorySearchFilters>({
    ...filters,
  });

  // Modal states
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPinCodeModal, setShowPinCodeModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Price range state
  const [minPrice, setMinPrice] = useState(
    localFilters.minPrice?.toString() || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    localFilters.maxPrice?.toString() || "",
  );

  // Rating state
  const [minRating, setMinRating] = useState(
    localFilters.minRating?.toString() || "",
  );

  // Pin code state
  const [pinCode, setPinCode] = useState(localFilters.pinCode || "");

  // Reset local filters when global filters change
  useEffect(() => {
    setLocalFilters({ ...filters });
    setMinPrice(filters.minPrice?.toString() || "");
    setMaxPrice(filters.maxPrice?.toString() || "");
    setMinRating(filters.minRating?.toString() || "");
    setPinCode(filters.pinCode || "");
  }, [filters]);

  const handleFilterChange = (
    key: keyof LaboratorySearchFilters,
    value: any,
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePriceRange = () => {
    const min = minPrice ? parseInt(minPrice, 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice, 10) : undefined;

    setLocalFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));

    setShowPriceModal(false);
  };

  const handleCancelPriceRange = () => {
    setMinPrice(localFilters.minPrice?.toString() || "");
    setMaxPrice(localFilters.maxPrice?.toString() || "");
    setShowPriceModal(false);
  };

  const handleSaveRating = () => {
    const min = minRating ? parseInt(minRating, 10) : undefined;

    setLocalFilters((prev) => ({
      ...prev,
      minRating: min,
    }));

    setShowRatingModal(false);
  };

  const handleCancelRating = () => {
    setMinRating(localFilters.minRating?.toString() || "");
    setShowRatingModal(false);
  };

  const handleSavePinCode = () => {
    setLocalFilters((prev) => ({
      ...prev,
      pinCode: pinCode || undefined,
    }));

    setShowPinCodeModal(false);
  };

  const handleCancelPinCode = () => {
    setPinCode(localFilters.pinCode || "");
    setShowPinCodeModal(false);
  };

  const handleApplyFilters = () => {
    // Always reset to page 1 when applying filters
    setFilters({ ...localFilters, page: 1 });
    onApplyFilters();
  };

  const handleResetFilters = () => {
    resetFilters();
    // After resetting filters, explicitly search with page 1
    searchLaboratories({ page: 1 });
    onClose();
  };

  const ModalOverlay = ({
    isOpen,
    title,
    onCloseModal,
    children,
  }: ModalOverlayProps) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onCloseModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose size={24} className="text-gray-700" />
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="pb-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="lg:text-2xl text-xl font-semibold font-poppins">
          Filter Laboratories
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <IoClose size={24} className="text-gray-800" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto max-h-[50vh]  px-4 py-6 space-y-6">
        {/* City Filter */}
        <DropdownSelect
          label="City"
          value={localFilters.city || ""}
          placeholder="All Cities"
          options={[...new Set(availableFilters.cities)]}
          onChange={(val) => handleFilterChange("city", val)}
        />

        {/* Category Filter */}
        <section>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Test Category
          </label>
          <button
            className="w-full flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors"
            onClick={() => setShowCategoryModal(true)}
          >
            <span className="text-gray-900">
              {localFilters.category || "All Categories"}
            </span>
            <IoChevronDown size={20} className="text-gray-500" />
          </button>
          {/* Similar Modal logic as City would go here */}
        </section>

        {/* Collection Type Filter */}
        <section>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Collection Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !localFilters.collectionType
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange("collectionType", "")}
            >
              All Types
            </button>
            {availableFilters.collectionTypes.map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  localFilters.collectionType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterChange("collectionType", type)}
              >
                {type === "home"
                  ? "Home"
                  : type === "lab"
                    ? "Lab Visit"
                    : type === "both"
                      ? "Home & Lab"
                      : type}
              </button>
            ))}
          </div>
        </section>

        {/* Price Range */}
        <section>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Price Range
          </label>
          <button
            className="w-full flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors"
            onClick={() => setShowPriceModal(true)}
          >
            <span className="text-gray-900">
              {localFilters.minPrice || localFilters.maxPrice
                ? `₹${localFilters.minPrice || 0} - ₹${
                    localFilters.maxPrice || "Any"
                  }`
                : "Set Price Range"}
            </span>
            <IoChevronForward size={20} className="text-gray-500" />
          </button>

          <ModalOverlay
            isOpen={showPriceModal}
            title="Set Price Range"
            onCloseModal={handleCancelPriceRange}
          >
            <div className="space-y-4">
              <div>
                <span className="block text-sm text-gray-600 mb-1">
                  Minimum Price (₹)
                </span>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                />
              </div>
              <div>
                <span className="block text-sm text-gray-600 mb-1">
                  Maximum Price (₹)
                </span>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleCancelPriceRange}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePriceRange}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </ModalOverlay>
        </section>

        {/* Rating Filter */}
        <section>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Minimum Rating
          </label>
          <button
            className="w-full flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors"
            onClick={() => setShowRatingModal(true)}
          >
            <span className="text-gray-900">
              {localFilters.minRating
                ? `${localFilters.minRating}+ Stars`
                : "Any Rating"}
            </span>
            <IoChevronForward size={20} className="text-gray-500" />
          </button>

          <ModalOverlay
            isOpen={showRatingModal}
            title="Minimum Rating"
            onCloseModal={handleCancelRating}
          >
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating.toString())}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  {parseInt(minRating) >= rating ? (
                    <IoStar size={40} className="text-yellow-400" />
                  ) : (
                    <IoStarOutline size={40} className="text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCancelRating}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRating}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold"
              >
                Save
              </button>
            </div>
          </ModalOverlay>
        </section>

        {/* Pin Code */}
        <section className="pb-24">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Pin Code
          </label>
          <button
            className="w-full flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors"
            onClick={() => setShowPinCodeModal(true)}
          >
            <span className="text-gray-900">
              {localFilters.pinCode || "Enter Pin Code"}
            </span>
            <IoChevronForward size={20} className="text-gray-500" />
          </button>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-gray-200 flex gap-4">
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
    </>
  );
}
