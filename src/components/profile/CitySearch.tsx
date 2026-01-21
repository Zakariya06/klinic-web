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
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    inputRef.current?.blur();
  };

  const closeDropdown = () => setShowDropdown(false);

  // Close dropdown on outside click (web equivalent of TouchableWithoutFeedback)
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  return (
    <div ref={rootRef}>
      <label className="text-gray-700 font-medium text-base mb-2 block">
        City {isCityChanged && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className={[
          "border rounded-xl bg-white shadow-sm",
          isCityChanged ? "border-red-400" : "border-gray-200",
        ].join(" ")}
      >
        {/* Search input */}
        <div className="flex items-center px-4 py-3.5">
          <MdLocationCity
            size={22}
            className={isCityChanged ? "text-red-400" : "text-indigo-600"}
          />

          <input
            ref={inputRef}
            value={selectedCity || searchTerm}
            onChange={(e) => {
              const text = e.target.value;
              setSearchTerm(text);
              setShowDropdown(true);
              if (!text) onCitySelect("");
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for a city..."
            className="ml-3 flex-1 text-gray-800 outline-none bg-transparent"
          />

          {(selectedCity || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                onCitySelect("");
                setShowDropdown(true);
                inputRef.current?.focus();
              }}
              className="p-1"
              aria-label="Clear city"
            >
              <MdCancel size={18} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showDropdown && filteredCities.length > 0 && (
          <div className="border-t border-gray-200 max-h-40 overflow-auto">
            {filteredCities.slice(0, 10).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleCityPress(item)}
                className="w-full text-left px-4 py-2 border-b border-gray-100 hover:bg-gray-50"
              >
                <span className="text-gray-800">{item}</span>
              </button>
            ))}

            {filteredCities.length > 10 && (
              <div className="text-xs text-center text-gray-500 py-1">
                {filteredCities.length - 10} more results. Continue typing to
                refine.
              </div>
            )}
          </div>
        )}

        {showDropdown && filteredCities.length === 0 && searchTerm && (
          <div className="border-t border-gray-200 p-3">
            <div className="text-gray-500 text-center">
              No matching cities found
            </div>
          </div>
        )}
      </div>

      {selectedCity && (
        <div className="text-xs text-green-600 mt-1">
          Selected: {selectedCity}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
