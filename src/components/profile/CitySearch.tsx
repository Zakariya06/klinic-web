import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdLocationCity, MdCancel } from "react-icons/md";

interface CitySearchProps {
  allCities: string[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
  isCityChanged?: boolean;
}

const CitySearch: React.FC<CitySearchProps> = ({
  allCities,
  selectedCity,
  onCitySelect,
  isCityChanged = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter cities based on search term using regex (same logic)
  const filteredCities = useMemo(() => {
    if (!searchTerm) return allCities;

    try {
      const regex = new RegExp(searchTerm, "i");
      return allCities.filter((city) => regex.test(city));
    } catch {
      return allCities.filter((city) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [searchTerm, allCities]);

  const handleCityPress = (city: string) => {
    onCitySelect(city);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchTerm(text);
    setShowDropdown(true);
    if (!text) onCitySelect("");
  };

  const handleClear = () => {
    setSearchTerm("");
    onCitySelect("");
    setShowDropdown(true);
  };

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="text-gray-700 font-medium text-base mb-2 block">
        City {isCityChanged && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input container */}
      <div
        className={[
          "flex items-center px-4 py-3.5 border rounded-xl bg-white shadow-sm",
          isCityChanged ? "border-red-400" : "border-gray-200",
        ].join(" ")}
      >
        <MdLocationCity
          size={22}
          className={isCityChanged ? "text-red-400" : "text-indigo-600"}
        />

        <input
          value={selectedCity || searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search for a city..."
          className="ml-3 flex-1 text-gray-800 outline-none bg-transparent"
        />

        {(selectedCity || searchTerm) && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1"
            aria-label="Clear city"
          >
            <MdCancel size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCities.length > 0 ? (
            filteredCities.slice(0, 10).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityPress(city)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 transition-colors"
              >
                <span className="text-gray-800">{city}</span>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">
              No matching cities found
            </div>
          )}

          {filteredCities.length > 10 && (
            <div className="sticky bottom-0 text-xs text-center text-gray-500 py-1 bg-white border-t border-gray-100">
              {filteredCities.length - 10} more results. Continue typing to refine.
            </div>
          )}
        </div>
      )}

      {selectedCity && (
        <div className="text-xs text-green-600 mt-1">
          Selected: {selectedCity}
        </div>
      )}
    </div>
  );
};

export default CitySearch;