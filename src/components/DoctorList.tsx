import React, { useState, useEffect, useRef } from "react";
import DoctorCard from "./DoctorCard";
import SearchBox from "./SearchBox";
import DoctorFilters from "./filters/DoctorFilters";
import { useDoctorStore } from "../store/doctorStore";
import { LuFilter } from "react-icons/lu";
import { AnimatedModal } from "./modal/AnimatedModal";

interface Doctor {
  _id: string;
  [key: string]: any;
}

export default function DoctorList() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    doctors,
    pagination,
    isLoading,
    isLoadingMore,
    searchDoctors,
    loadMore,
    setFilters,
    filters,
  } = useDoctorStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only search if no doctors are loaded yet
    if (doctors.length === 0 && !isLoading) {
      searchDoctors();
    }
  }, []);

  const handleSearch = (query: string) => {
    setFilters({ search: query, page: 1 });
    searchDoctors({ search: query, page: 1 });
  };

  const handleApplyFilters = () => {
    searchDoctors();
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.specialization ||
      filters.gender ||
      filters.consultationType ||
      filters.minFee ||
      filters.maxFee ||
      filters.minRating ||
      filters.city ||
      filters.pinCode
    );
  };

  const handleRefresh = () => {
    searchDoctors(undefined, true);
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isLoading || isLoadingMore || !pagination.hasNextPage)
      return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  };

  return (
    <div className=" " onScroll={handleScroll} ref={scrollContainerRef}>
      <div className="flex lg:items-center gap-3 justify-between items-start mb-4 lg:flex-row flex-col">
        <div>
          <h1 className="lg:text-3xl text-2xl font-semibold font-poppins">
            Doctors List
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="flex lg:items-center items-end justify-end lg:flex-1 lg:w-auto w-full mb-4 lg:flex-row flex-col gap-2">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Search doctors by name or clinic..."
          />

          <button
            onClick={() => setShowFilters(true)}
            className={`ml-2 border border-[#53545C] text-[#53545C] rounded-lg py-2.5 px-6 cursor-pointer hover:bg-[#5570F1] hover:text-white flex items-center gap-1 duration-300 transition-all ${
              hasActiveFilters() ? "bg-[#5570F1] text-white" : "bg-transparent"
            }`}
          >
            <LuFilter className="text-lg" />{" "}
            <span className="shrink-0 text-sm">Filter</span>
            {hasActiveFilters() && (
              <div className="ml-1 h-2 w-2 rounded-full bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Modal */}

      <AnimatedModal open={showFilters} onClose={() => setShowFilters(false)}>
        <DoctorFilters
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      </AnimatedModal>

      {/* Doctors List */}
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor._id} doctor={doctor} />
        ))}

        {/* Loading Footer */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Empty State */}
      {doctors.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 mt-8">No doctors found.</div>
      )}
    </div>
  );
}
