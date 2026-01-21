// src/components/laboratory/EditProductModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdImage, MdAddPhotoAlternate, MdClose } from "react-icons/md";

import { productService, type Product } from "@/services/productService";
import ImagePickerModal from "@/components/profile/ImagePickerModal";

interface EditProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated: () => void;
}

type FormState = {
  name: string;
  description: string;
  price: string;
  availableQuantity: string;
  imageUrl: string;
};

const defaultForm: FormState = {
  name: "",
  description: "",
  price: "",
  availableQuantity: "",
  imageUrl: "",
};

const getApiBaseUrl = () => {
  // Vite envs
  const vite = (import.meta as any).env?.VITE_TEST_BE_URL as string | undefined;
  // fallback if you used a different name:
  const alt = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

  return vite || alt || "http://localhost:3000";
};

export const EditProductModal: React.FC<EditProductModalProps> = ({
  visible,
  onClose,
  product,
  onProductUpdated,
}) => {
  const [formData, setFormData] = useState<FormState>(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        availableQuantity: String(product.availableQuantity),
        imageUrl: product.imageUrl || "",
      });
    }
  }, [product]);

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const updateFormData = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const uploadProductImage = async (
    fileOrBlob: File | Blob,
    fileName?: string,
  ) => {
    try {
      setUploadingImage(true);

      const fd = new FormData();
      const name = fileName || `product_${Date.now()}.jpg`;

      // If it's a Blob, wrap it as File for name/type (optional)
      const file =
        fileOrBlob instanceof File
          ? fileOrBlob
          : new File([fileOrBlob], name, { type: "image/jpeg" });

      fd.append("file", file);

      const res = await fetch(`${apiBase}/api/v1/upload`, {
        method: "POST",
        body: fd,
        // NOTE: do NOT set Content-Type manually for multipart/form-data in browser
      });

      if (!res.ok) throw new Error("Failed to upload image");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (e) {
      console.error("Error uploading image:", e);
      window.alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
      setShowImageOptions(false);
    }
  };

  const openGallery = async () => {
    // Web: open hidden file input
    fileInputRef.current?.click();
  };

  const handleFilePicked = async (file: File | null) => {
    if (!file) return;
    await uploadProductImage(file, file.name);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!product) return;

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        availableQuantity: Number(formData.availableQuantity),
        imageUrl: formData.imageUrl || undefined,
      };

      await productService.updateProduct(product._id, payload);

      window.alert("Product updated successfully!");
      onProductUpdated();
      onClose();
    } catch (e) {
      console.error("Error updating product:", e);
      window.alert("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // simple escape close
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, onClose]);

  if (!visible || !product) return null;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="text-lg font-medium text-gray-900">Edit Product</div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
          aria-label="Close"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[80vh] overflow-auto">
        <div className="space-y-5 py-4 pr-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-regular text-[#5E6366]">
              Medicine Name *
            </label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#EFF1F999] px-3 py-2.5 text-base outline-none focus:border-blue-500"
              placeholder="Enter medicine name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-1 block text-sm font-regular text-[#5E6366]">
              Price (₹) *
            </label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#EFF1F999] px-3 py-2.5 text-base outline-none focus:border-blue-500"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => updateFormData("price", e.target.value)}
              inputMode="numeric"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-regular text-[#5E6366]">
              Available Quantity *
            </label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#EFF1F999] px-3 py-2.5 text-base outline-none focus:border-blue-500"
              placeholder="Enter available quantity"
              value={formData.availableQuantity}
              onChange={(e) =>
                updateFormData("availableQuantity", e.target.value)
              }
              inputMode="numeric"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-regular text-[#5E6366]">
              Description *
            </label>
            <textarea
              className="min-h-27.5 resize-y w-full rounded-lg border border-transparent bg-[#EFF1F999] px-3 py-2.5 text-base outline-none focus:border-blue-500"
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Image */}
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-900">
              Product Image (Optional)
            </div>

            <button
              type="button"
              onClick={() => setShowImageOptions(true)}
              disabled={uploadingImage}
              className={[
                "relative flex h-50 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#EFF1F999]",
                uploadingImage ? "opacity-70" : "hover:bg-gray-50",
              ].join(" ")}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                  <div className="mt-2 text-base text-gray-500">
                    Uploading...
                  </div>
                </div>
              ) : formData.imageUrl ? (
                <div className="relative h-full w-full">
                  <img
                    src={formData.imageUrl}
                    alt="Product"
                    className="h-full w-full rounded-[10px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    aria-label="Remove image"
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center px-4">
                  <MdAddPhotoAlternate className="text-primary" size={48} />
                  <div className="mt-2 text-base font-medium text-gray-500">
                    Upload product image
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    Tap to select an image
                  </div>
                </div>
              )}
            </button>

            {/* Hidden file input (web gallery) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilePicked(e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={[
              "mt-2 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-base cursor-pointer font-medium text-white duration-200",
              isLoading ? "bg-gray-300" : "bg-[#5570F1] hover:bg-[#5570F1]/85",
            ].join(" ")}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : (
              <FaCheck size={18} />
            )}
            <span>Update Product</span>
          </button>
        </div>
      </div>

      {/* Image Picker Modal (same prop names as RN version) */}
      <ImagePickerModal
        visible={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onChooseFromGallery={openGallery}
      />
    </>
  );
};
