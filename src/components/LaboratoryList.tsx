import React, { useState, useEffect } from "react";
import {
  IoSearchOutline,
  IoOptionsOutline,
  IoFlaskOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { BiLoaderAlt } from "react-icons/bi";
import LaboratoryCard from "./LaboratoryCard";
import SearchBox from "./SearchBox";
import LaboratoryFilters from "./filters/LaboratoryFilters";
import { useLaboratoryStore } from "../store/laboratoryStore";
import { Laboratory } from "@/services/laboratoryService";
import { LuFilter } from "react-icons/lu";
import { AnimatedModal } from "./modal/AnimatedModal";

// interface Laboratory {
//   _id: string;
//   [key: string]: any;
// }

export default function LaboratoryList() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    laboratories,
    pagination,
    isLoading,
    isLoadingMore,
    searchLaboratories,
    loadMore,
    setFilters,
    filters,
  } = useLaboratoryStore();

  useEffect(() => {
    searchLaboratories();
  }, []);

  const handleSearch = (query: string) => {
    setFilters({ search: query, page: 1 });
    searchLaboratories({ search: query, page: 1 });
  };

  const handleApplyFilters = () => {
    searchLaboratories();
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.category ||
      filters.collectionType ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRating ||
      filters.city ||
      filters.pinCode
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when 80% down the list
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (pagination.hasNextPage && !isLoading && !isLoadingMore) {
        loadMore();
      }
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <div className="py-4 flex justify-center">
        <BiLoaderAlt className="animate-spin text-blue-500" size={24} />
      </div>
    );
  };

  const renderEmptyList = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <IoFlaskOutline size={48} className="text-gray-300" />
      <h3 className="text-lg text-gray-500 mt-4 font-semibold">
        No laboratories found
      </h3>
      <p className="text-base text-gray-400 mt-1 px-8">
        Try adjusting your search or filter criteria.
      </p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex lg:items-center gap-3 justify-between items-start mb-4 lg:flex-row flex-col">
        <div>
          <h1 className="lg:text-3xl text-2xl font-semibold font-poppins">
            Laboratories List
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="flex lg:items-center items-end justify-end lg:flex-1 lg:w-auto w-full mb-4 lg:flex-row flex-col gap-2">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Search labs by name or service..."
          />

          <button
            onClick={() => setShowFilters(true)}
            className={`ml-2 border border-[#53545C] text-[#53545C] rounded-lg py-2.5 px-6 cursor-pointer hover:bg-[#5570F1] hover:text-white flex items-center gap-1 duration-300 transition-all relative ${
              hasActiveFilters() ? "bg-[#5570F1] text-white" : "bg-transparent"
            }`}
          >
            <LuFilter className="text-lg" />{" "}
            <span className="shrink-0 text-sm">Filter</span>
            {hasActiveFilters() && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Overlay/Modal */}
      <AnimatedModal open={showFilters} onClose={() => setShowFilters(false)}>
        <LaboratoryFilters
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      </AnimatedModal>

      {/* Main Content Area */}
      <div>
        {isLoading && laboratories.length === 0 ? (
          <div className="flex justify-center py-20">
            <BiLoaderAlt className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {laboratories.map((item: Laboratory) => (
              <LaboratoryCard key={item._id} laboratory={item} />
            ))}
          </div>
        )}
        {!isLoading && laboratories.length === 0 && renderEmptyList()}
        {renderFooter()} 
      </div>
    </div>
  );
}
