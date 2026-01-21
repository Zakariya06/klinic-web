import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaCube,
  FaEdit,
  FaImage,
  FaSearch,
  FaShoppingBag,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import apiClient from "@/api/client";
import { productService, type Product } from "@/services/productService";
import { EditProductModal } from "./EditProductModal";
import { TbRotate } from "react-icons/tb";
import { IoCloseSharp, IoSearch } from "react-icons/io5";
import { AnimatedModal } from "../modal/AnimatedModal";

type SortBy = "name" | "price" | "quantity" | "date";
type SortOrder = "asc" | "desc";

interface ProductDetailsModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

function ProductDetailsModal({
  open,
  product,
  onClose,
}: ProductDetailsModalProps) {
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !product) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Product details"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="h-full max-w-3xl w-full overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <FaShoppingBag className="text-blue-500" size={18} />
            <div className="text-lg font-semibold text-gray-900">
              Product Details
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 cursor-pointer"
            aria-label="Close"
          >
            <FaTimes className="text-gray-500" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-auto p-4">
          {/* Image */}
          <div className="mb-5 flex justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="aspect-video w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-52 w-full flex-col items-center justify-center rounded-xl bg-gray-100">
                <FaImage size={48} className="text-gray-400" />
                <div className="mt-2 text-gray-400">No Image</div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-1">
            <div className="text-left text-xl font-semibold text-gray-900 capitalize">
              {product.name}
            </div>
            <div className="text-base leading-6 text-gray-500">
              {product.description}
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-sm font-semibold text-gray-900">
                  ₹{product.price.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div className="text-sm font-medium text-gray-500">
                  Available Quantity
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {product.availableQuantity}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div className="text-sm font-medium text-gray-500">Created</div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatDate(product.createdAt)}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div className="text-sm font-medium text-gray-500">
                  Last Updated
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatDate(product.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const MyProductsTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchMyProducts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("/api/v1/products/my-products");

      if (response.data?.success && response.data?.data) {
        const list: Product[] = response.data.data.products || [];
        setProducts(list);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error("MyProductsTab: Error fetching products:", error);
      window.alert("Failed to fetch your products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyProducts();
    setRefreshing(false);
  }, [fetchMyProducts]);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  }, []);

  const confirmDeleteProduct = useCallback(async (productId: string) => {
    try {
      setDeletingProduct(productId);
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      window.alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      window.alert("Failed to delete product");
    } finally {
      setDeletingProduct(null);
    }
  }, []);

  const handleDeleteProduct = useCallback(
    (product: Product) => {
      const ok = window.confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      );
      if (!ok) return;
      void confirmDeleteProduct(product._id);
    },
    [confirmDeleteProduct],
  );

  const handleViewDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  }, []);

  const displayProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "quantity":
          aValue = a.availableQuantity;
          bValue = b.availableQuantity;
          break;
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [products, searchQuery, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        <div className="mt-4 text-gray-700">Loading your products...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col   border-gray-200 bg-white rounded-xl lg:p-6 p-3">
      {/* Header */}
      <div className="mb-4 flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
        <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
          My Products{" "}
          <span className="rounded-xl py-1 px-2 bg-[#5570F11F] text-[#5570F1] text-[13px] font-normal">
            ({products.length}
            {products.length !== 1 ? "s" : ""}) product
          </span>
        </h3>

        <div className="flex items-center flex-1 flex-wrap justify-end gap-2">
          {/* Search */}
          <div className="focus-within:border-blue-700  flex items-center border border-[#CFD3D4] text-base font-inter rounded-lg px-3 py-2 lg:max-w-xs w-full">
            <IoSearch className="text-gray-500 mr-2" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent outline-none text-gray-800 text-base"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-blue-600 text-lg cursor-pointer font-bold"
                aria-label="Clear search"
              >
                <IoCloseSharp />
              </button>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base"
          >
            <TbRotate
              className={`text-2xl transition-transform duration-500 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-gray-500">Sort by:</div>

        <div className="flex flex-1 flex-wrap gap-2">
          {(
            [
              ["date", "Date"],
              ["name", "Name"],
              ["price", "Price"],
              ["quantity", "Quantity"],
            ] as const
          ).map(([key, label]) => {
            const active = sortBy === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSortBy(key)}
                className={[
                  "rounded-full px-3 py-1 text-sm font-medium cursor-pointer duration-150",
                  active
                    ? "bg-[#5570f1] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
          className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 duration-150"
          aria-label="Toggle sort order"
        >
          {sortOrder === "asc" ? (
            <FaSortAmountUpAlt className="text-primary" size={16} />
          ) : (
            <FaSortAmountDownAlt className="text-primary" size={16} />
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 mt-5">
        {displayProducts.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center px-10 py-16 text-center">
            <FaShoppingBag size={56} className="text-gray-400" />
            <div className="mt-4 text-xl font-semibold text-gray-900">
              {searchQuery ? "No Products Found" : "No Products Yet"}
            </div>
            <div className="mt-2 text-gray-500">
              {searchQuery
                ? "Try adjusting your search terms"
                : 'Start by adding your first product in the "Add Product" tab'}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 mb-5">
            {displayProducts.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-xl duration-300 hover:-translate-y-1.5 cursor-pointer border border-gray-200 bg-white shadow-sm"
              >
                <div
                  onClick={() => handleViewDetails(product)}
                  className="w-full p-4 text-left"
                >
                  <div className="h-80 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FaImage className="text-gray-400" size={22} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 mt-3">
                    <div className="line-clamp-2 lg:text-lg text-base font-semibold text-[#45464E]">
                      {product.name}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-[#8B8D97]">
                      {product.description}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-base font-bold text-primary">
                        ₹{product.price.toFixed(2)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCube size={12} className="text-gray-500" />
                        <span className="text-[#519C66]">
                          {product.availableQuantity}{" "}
                        </span>
                        left
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleEditProduct(product)}
                    className="flex flex-1 items-center justify-center duration-200 bg-[#5570f1] py-3 text-white hover:bg-[#5570f1]/85 cursor-pointer"
                  >
                    <FaEdit size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product)}
                    disabled={deletingProduct === product._id}
                    className={[
                      "flex flex-1 items-center justify-center py-3 duration-200 text-white cursor-pointer",
                      deletingProduct === product._id
                        ? "cursor-not-allowed bg-red-400"
                        : "bg-red-500 hover:bg-red-600",
                    ].join(" ")}
                  >
                    {deletingProduct === product._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    ) : (
                      <FaTrash size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <AnimatedModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        maxWidth="max-w-xl"
      >
        <EditProductModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onProductUpdated={() => {
            void fetchMyProducts();
            setShowEditModal(false);
            setEditingProduct(null);
          }}
        />
      </AnimatedModal>

      {/* Product Details Modal */}
      <AnimatedModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProduct(null);
        }}
        maxWidth="max-w-xl"
      >
        <ProductDetailsModal
          open={showDetailsModal}
          product={selectedProduct}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProduct(null);
          }}
        />
      </AnimatedModal>
    </div>
  );
};
