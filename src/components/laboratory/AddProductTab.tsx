import React, { useState } from "react";
import { MdAdd, MdClose, MdImage } from "react-icons/md";
import { productService } from "@/services/productService";
import apiClient from "@/api/client";
import ImagePickerModal from "@/components/profile/ImagePickerModal";

export const AddProductTab: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    availableQuantity: "",
    imageUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (
    fileType: string,
    fileName: string,
    file: File,
  ): Promise<string | null> => {
    try {
      const urlResponse = await apiClient.post("/api/v1/upload-url", {
        fileType,
        fileName,
      });

      const { uploadUrl, publicUrl } = urlResponse.data;

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": fileType },
      });

      return publicUrl;
    } catch (err) {
      console.error("Error uploading file:", err);
      window.alert("Failed to upload file");
      return null;
    }
  };

  const uploadProductImage = async (file: File) => {
    try {
      setUploadingImage(true);

      const fileName = `product-image-${Date.now()}.jpg`;
      const fileType = file.type || "image/jpeg";

      const imageUrl = await uploadFile(fileType, fileName, file);

      if (imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl }));
      } else {
        throw new Error("Failed to get URL for the uploaded image");
      }
    } catch (error) {
      console.error("Error uploading product image:", error);
      window.alert("Failed to upload product image");
    } finally {
      setUploadingImage(false);
    }
  };

  // web "gallery" -> file input picker
  const openGallery = async () => {
    try {
      setUploadingImage(true);

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          await uploadProductImage(file);
        }
        setUploadingImage(false);
        setShowImageOptions(false);
      };
      input.click();
    } catch (error) {
      console.error("Error picking image:", error);
      window.alert("Failed to pick image");
      setUploadingImage(false);
      setShowImageOptions(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        availableQuantity: Number(formData.availableQuantity),
        imageUrl: formData.imageUrl || undefined,
      };

      await productService.createProduct(productData);

      setFormData({
        name: "",
        description: "",
        price: "",
        availableQuantity: "",
        imageUrl: "",
      });

      window.alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      window.alert("Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePress = () => setShowImageOptions(true);

  const removeImage = () => setFormData((prev) => ({ ...prev, imageUrl: "" }));

  return (
    <div className="h-full w-full bg-white rounded-xl p-6">
      <h1 className="lg:text-xl text-lg text-[#45464E] font-medium font-poppins">
        Add Product
      </h1>
      <div className="mt-4">
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-3 mb-5">
          {/* Product Name */}
          <div>
            <label className="mb-1 block text-sm text-[#5E6366]">
              Medicine Name *
            </label>
            <input
              className="w-full rounded-lg text-[#5E6366] placeholder:text-black/85 bg-[#EFF1F999] px-4 py-3 text-base outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter medicine name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              maxLength={100}
            />
          </div>
          {/* Price */}
          <div>
            <label className="mb-1 block text-sm text-[#5E6366]">
              Price (₹) *
            </label>
            <input
              className="w-full rounded-lg text-[#5E6366] placeholder:text-black/85 bg-[#EFF1F999] px-4 py-3 text-base outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => updateFormData("price", e.target.value)}
              inputMode="numeric"
            />
          </div>

          {/* Available Quantity */}
          <div>
            <label className="mb-1 block text-sm text-[#5E6366]">
              Available Quantity *
            </label>
            <input
              className="w-full rounded-lg text-[#5E6366] placeholder:text-black/85 bg-[#EFF1F999] px-4 py-3 text-base outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter available quantity"
              value={formData.availableQuantity}
              onChange={(e) =>
                updateFormData("availableQuantity", e.target.value)
              }
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm text-[#5E6366]">
            Description *
          </label>
          <textarea
            className="min-h-25 resize-y w-full rounded-lg text-[#5E6366] placeholder:text-black/85 bg-[#EFF1F999] px-4 py-3 text-base outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter product description"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>

        {/* Product Image */}
        <div className="my-5">
          <label className="mb-1 block text-sm text-[#5E6366]">
            Product Image (Optional)
          </label>

          <button
            type="button"
            onClick={handleImagePress}
            disabled={uploadingImage}
            className={[
              "relative flex h-50 w-full items-center justify-center rounded-xl border-2 border-dashed bg-[#EFF1F999] cursor-pointer",
              formData.imageUrl ? "border-gray-300" : "border-gray-300",
              uploadingImage ? "opacity-70" : "hover:bg-gray-50",
            ].join(" ")}
          >
            {uploadingImage ? (
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <div className="mt-2 text-base text-gray-500">Uploading...</div>
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
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
                  aria-label="Remove image"
                >
                  <MdClose className="text-white" size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center px-4">
                <MdImage size={48} className="text-blue-500" />
                <div className="mt-2 text-base font-medium text-gray-500">
                  Upload product image
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  Tap to select an image
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={[
            "flex items-center gap-2 px-4 py-2  mt-3 rounded-xl text-white duration-300 cursor-pointer",
            isLoading ? "bg-gray-300" : "bg-[#5570F1] hover:bg-[#5570F1]/85",
          ].join(" ")}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <MdAdd size={20} className="text-white" />
          )}
          <span className="text-lg">
            {isLoading ? "Adding..." : "Add Product"}
          </span>
        </button>

        {/* Image Picker Modal */}
        <ImagePickerModal
          visible={showImageOptions}
          onClose={() => setShowImageOptions(false)}
          onChooseFromGallery={openGallery}
        />
      </div>
    </div>
  );
};
