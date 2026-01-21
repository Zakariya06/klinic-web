import React, { useState, useCallback } from "react";
import { IoCloseSharp, IoSearch } from "react-icons/io5";
import debounce from "lodash/debounce";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = "Search...",
}) => {
  const [searchText, setSearchText] = useState("");

  // Debounced search to prevent too many calls
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, 500),
    [],
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  return (
    <div className="focus-within:border-blue-700  flex items-center border border-[#CFD3D4] text-base font-inter rounded-lg px-3 py-2 lg:max-w-xs w-full">
      <IoSearch className="text-gray-500 mr-2" size={20} />
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-gray-800 text-base"
        placeholder={placeholder}
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchText && (
        <button
          onClick={() => handleSearch("")}
          className="ml-2 text-blue-600 text-lg cursor-pointer font-bold"
        >
          <IoCloseSharp />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
