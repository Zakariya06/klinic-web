import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IoAlertCircleOutline,
  IoFilterOutline,
  IoMedicalOutline,
  IoArrowUp,
} from "react-icons/io5";

import { useProductStore } from "@/store/productStore";
import SearchBox from "./SearchBox";
import ProductFilters from "./filters/ProductFilters";
import { ProductCard } from "./medicines/ProductCard";
import { LuFilter } from "react-icons/lu";
import { TbRotate } from "react-icons/tb";
import { AnimatedModal } from "./modal/AnimatedModal";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  availableQuantity: number;
  imageUrl?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductList() {
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const {
    products,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fetchProducts,
    refreshProducts,
    loadMore,
    setFilters,
    filters,
  } = useProductStore();

  const fetchProductsCallback = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProductsCallback();
  }, [fetchProductsCallback]);

  const handleSearch = useCallback(
    (query: string) => {
      setFilters({ search: query, page: 1 });
      fetchProducts({ search: query, page: 1 });
    },
    [setFilters, fetchProducts],
  );

  const handleApplyFilters = useCallback(() => {
    fetchProducts();
    setShowFilters(false);
  }, [fetchProducts]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.minPrice || filters.maxPrice || filters.search);
  }, [filters.minPrice, filters.maxPrice, filters.search]);

  const handleRefresh = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [pagination.hasNextPage, isLoading, isLoadingMore, loadMore]);

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowScrollToTop(el.scrollTop > 300);

    const thresholdPx = 250;
    const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (remaining < thresholdPx) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderFooter = useMemo(() => {
    if (!isLoadingMore) return null;
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-sky-600" />
      </div>
    );
  }, [isLoadingMore]);

  const renderEmptyState = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-sky-600" />
          <div className="mt-4 text-base font-medium text-gray-500">
            Loading products...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <IoAlertCircleOutline className="h-12 w-12 text-red-500" />
          <div className="mt-4 text-lg font-bold text-red-500">
            Error Loading Products
          </div>
          <div className="mt-2 text-sm text-gray-500">{error}</div>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <IoMedicalOutline className="h-12 w-12 text-gray-400" />
        <div className="mt-4 text-lg font-bold text-gray-500">
          No Products Found
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {hasActiveFilters
            ? "Try adjusting your filters or search terms"
            : "Products will appear here when they become available"}
        </div>
      </div>
    );
  }, [error, handleRefresh, hasActiveFilters, isLoading]);

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* Header */}
      <div className="flex lg:items-center gap-3 justify-between items-start mb-4 lg:flex-row flex-col">
        <div>
          <h1 className="lg:text-3xl text-2xl font-semibold font-poppins">
            Medicines List
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="flex lg:items-center items-end justify-end lg:flex-1 lg:w-auto w-full mb-4 lg:flex-row flex-col gap-2">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Search medicines..."
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={`ml-2 border border-[#53545C] text-[#53545C] rounded-lg py-2.5 px-6 cursor-pointer hover:bg-[#5570F1] hover:text-white flex items-center gap-1 duration-300 transition-all ${
                hasActiveFilters ? "bg-[#5570F1] text-white" : "bg-transparent"
              }`}
            >
              <IoFilterOutline className="text-lg" />{" "}
              <span className="shrink-0 text-sm">Filter</span>
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading && !isLoadingMore}
              className={[
                "flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-lg cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base",
                isLoading && !isLoadingMore
                  ? "cursor-not-allowed opacity-60"
                  : "",
              ].join(" ")}
            >
              {" "}
              <TbRotate
                className={`text-2xl transition-transform duration-500 ${
                  isLoading && !isLoadingMore ? "animate-spin" : ""
                }`}
              />
              {isLoading && !isLoadingMore ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={listRef}
        className="relative flex-1 overflow-y-auto"
        onScroll={onScroll}
      >
        {/* Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
          {products.map((p: Product) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="min-h-75">{renderEmptyState}</div>
        )}

        {/* Footer loader */}
        {renderFooter}
      </div>

      {/* Scroll to Top */}
      {showScrollToTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-3 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          aria-label="Scroll to top"
        >
          <IoArrowUp className="h-5.5 w-5.5 text-white" />
        </button>
      )}

      {/* Filters Modal */}
      <AnimatedModal open={showFilters} onClose={() => setShowFilters(false)}>
        <ProductFilters
          onApply={handleApplyFilters}
          onCancel={() => setShowFilters(false)}
        />
      </AnimatedModal> 
    </div>
  );
}
