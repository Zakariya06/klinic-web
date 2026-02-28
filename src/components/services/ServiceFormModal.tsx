// components/profile/laboratory/ServiceFormModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";

export interface ServiceFormData {
  name: string;
  description: string;
  collectionType: "home" | "lab" | "both";
  price: string;
  category?: string;
  tests?: { name: string; description: string; price: number }[];
  coverImage?: string;
}

interface ServiceFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (service: ServiceFormData) => void;
  uploadCoverImage?: (file: File) => Promise<string | null>;
  availableCategories?: string[];
  initialData?: ServiceFormData;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  uploadCoverImage,
  availableCategories = [],
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [collectionType, setCollectionType] = useState<"home" | "lab" | "both">(
    initialData?.collectionType || "both",
  );
  const [price, setPrice] = useState(initialData?.price || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [tests, setTests] = useState(initialData?.tests || []);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens with new initialData
  useEffect(() => {
    if (visible) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setCollectionType(initialData?.collectionType || "both");
      setPrice(initialData?.price || "");
      setCategory(initialData?.category || "");
      setTests(initialData?.tests || []);
      setCoverImage(initialData?.coverImage || "");
    }
  }, [visible, initialData]);

  const handleCoverImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCoverImage) return;

    setUploadingCover(true);
    try {
      const url = await uploadCoverImage(file);
      if (url) setCoverImage(url);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingCover(false);
      // Clear input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingCover || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        collectionType,
        price,
        category,
        tests,
        coverImage,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit Service" : "Add New Service"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
            disabled={submitting || uploadingCover}
          >
            <IoClose size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Cover Image Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cover Image (optional)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover || submitting}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploadingCover ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <IoCloudUploadOutline size={18} />
                  )}
                  <span>
                    {uploadingCover ? "Uploading..." : "Upload Image"}
                  </span>
                </button>
                {coverImage && (
                  <div className="relative h-10 w-10 overflow-hidden rounded border">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageSelect}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Service Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                placeholder="e.g. Complete Blood Count"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                placeholder="Brief description of the service..."
              />
            </div>

            {/* Collection Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Collection Type *
              </label>
              <select
                value={collectionType}
                onChange={(e) =>
                  setCollectionType(e.target.value as "home" | "lab" | "both")
                }
                required
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
              >
                <option value="both">Home & Lab</option>
                <option value="home">Home Collection Only</option>
                <option value="lab">At Lab Only</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                placeholder="e.g. 500"
              />
            </div>

            {/* Category */}
            {availableCategories.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                >
                  <option value="">Select category (optional)</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tests section - simplified */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Included Tests (optional)
              </label>
              <p className="text-xs text-gray-500">
                You can add tests after creating the service.
              </p>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploadingCover}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingCover}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              <span>
                {submitting
                  ? "Saving..."
                  : initialData
                    ? "Update Service"
                    : "Add Service"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
