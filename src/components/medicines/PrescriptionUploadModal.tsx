import React, { useId, useMemo, useState } from "react";
import {
  FiX,
  FiStar,
  FiUpload,
  FiFileText,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";

import useProfileApi from "@/hooks/useProfileApi";
import ProductPaymentModal from "@/components/payment/ProductPaymentModal";
import { AnimatedModal } from "../modal/AnimatedModal";

interface PrescriptionUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SelectedFile = {
  name: string;
  size: number;
  file: File;
};

type OrderData = {
  prescription: string;
  needAssignment: boolean;
  totalPrice: number;
  products: any[];
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const PrescriptionUploadModal: React.FC<
  PrescriptionUploadModalProps
> = ({ visible, onClose, onSuccess }) => {
  const { uploadFile } = useProfileApi({ endpoint: "/api/v1/user-profile" });

  const inputId = useId();

  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null); // preserved from RN (even if not used)
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const disabled = useMemo(
    () => !selectedFile || isUploading || isCreatingOrder,
    [selectedFile, isUploading, isCreatingOrder],
  );

  const resetState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setIsCreatingOrder(false);
    setCreatedOrder(null);
    setOrderData(null);
    setShowPaymentModal(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePaymentSuccess = () => {
    setCreatedOrder(null);
    setOrderData(null);
    setShowPaymentModal(false);
    onSuccess();
    handleClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        window.alert("Please select a PDF file.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        window.alert(
          "File Too Large. Please select a PDF file smaller than 5MB.",
        );
        e.target.value = "";
        return;
      }

      setSelectedFile({
        name: file.name || `prescription-${Date.now()}.pdf`,
        size: file.size ?? 0,
        file,
      });
    } catch (error) {
      console.error("File picker error:", error);
      window.alert("Failed to select document. Please try again.");
    }
  };

  const handleUploadAndCreateOrder = async () => {
    if (!selectedFile) {
      window.alert(
        "No File Selected. Please select a prescription file first.",
      );
      return;
    }

    setIsUploading(true);
    setIsCreatingOrder(true);

    try {
      // Convert File -> object URL (or upload system might accept File directly)
      // Your existing uploadFile expects: (mime, filename, uri)
      // On web we can provide a Blob URL and let your uploader fetch it, OR you can update uploadFile to accept File.
      const objectUrl = URL.createObjectURL(selectedFile.file);

      try {
        const publicUrl = await uploadFile(
          "application/pdf",
          selectedFile.name,
          objectUrl,
        );

        if (!publicUrl) throw new Error("Failed to upload prescription");

        const payload: OrderData = {
          prescription: publicUrl,
          needAssignment: true,
          totalPrice: 0,
          products: [],
        };

        console.log("Preparing prescription order data:", payload);

        setOrderData(payload);
        setShowPaymentModal(true);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error("Error preparing prescription order:", error);
      window.alert(
        "Failed to prepare prescription order. Please try again or contact support if the issue persists.",
      );
    } finally {
      setIsUploading(false);
      setIsCreatingOrder(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <AnimatedModal
        open={visible}
        onClose={() => handleClose()}
        maxWidth="max-w-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2
            id="prescription-modal-title"
            className="lg:text-2xl text-xl font-semibold font-poppins"
          >
            Prescription Order
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-gray-100 p-2 transition hover:bg-gray-200 cursor-pointer"
            aria-label="Close"
          >
            <FiX className="h-6 w-6 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-3">
          {/* Instructions */}
          <div className="mt-5 mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <FiStar className="h-6 w-6 text-sky-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                How it works
              </h3>
            </div>
            <p className="whitespace-pre-line text-sm leading-6 text-blue-900">
              {"1. Upload your prescription PDF\n"}
              {"2. Our admin team reviews your prescription\n"}
              {"3. Admin assigns it to a suitable laboratory\n"}
              {"4. Laboratory processes and prices your order\n"}
              {"5. You receive notification to complete payment"}
            </p>
          </div>

          {/* File Selection */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Upload Prescription
            </h3>

            {selectedFile ? (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-1 items-center">
                  <FiFileText className="h-6 w-6 text-emerald-600" />
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-emerald-900">
                      {selectedFile.name}
                    </div>
                    <div className="mt-1 text-sm text-emerald-900">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="ml-4 flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 transition hover:bg-red-100"
                  aria-label="Remove file"
                >
                  <FiTrash2 className="h-[18px] w-[18px] text-red-500" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-sky-600 bg-slate-50 p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <FiUpload className="h-8 w-8 text-sky-600" />
                </div>

                <div className="mb-2 text-base font-semibold text-sky-600">
                  Select Prescription PDF
                </div>
                <div className="mb-4 text-sm text-gray-500">
                  PDF files only, max 5MB
                </div>

                <label
                  htmlFor={inputId}
                  className={[
                    "inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
                    "bg-sky-600 text-white hover:bg-sky-700 transition",
                    isUploading ? "pointer-events-none opacity-60" : "",
                  ].join(" ")}
                >
                  Choose File
                </label>

                <input
                  id={inputId}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6 flex items-center justify-center rounded-xl bg-gray-50 py-5">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-sky-600" />
              <div className="ml-3 text-base font-medium text-gray-900">
                Uploading prescription...
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Order Summary
            </h3>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-base text-gray-500">Order Type</span>
              <span className="text-base font-semibold text-gray-900">
                Prescription Only
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-base text-gray-500">Status</span>
              <span className="text-base font-semibold text-gray-900">
                Pending Assignment
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base text-gray-500">Processing</span>
              <span className="text-base font-semibold text-gray-900">
                Admin Review Required
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-gray-200  sm:flex-row flex-col-reverse px-3 py-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading || isCreatingOrder}
            className={[
              "flex items-center justify-center px-4 py-3.5 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base flex-1",
              isUploading || isCreatingOrder
                ? "cursor-not-allowed opacity-60"
                : "",
            ].join(" ")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUploadAndCreateOrder}
            disabled={disabled}
            className={[
              "flex items-center justify-center px-2 py-3.5 rounded-xl  duration-300 transition-all text-base flex-1 gap-2",
              disabled
                ? "cursor-not-allowed bg-[#FFCC9129] text-[#1C1D22]"
                : "bg-[#5570F1] hover:bg-[#5570F1]/85 text-white cursor-pointer",
            ].join(" ")}
          >
            {isCreatingOrder ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : (
              <FiCheckCircle className="h-5 w-5" />
            )}
            <span>
              {isCreatingOrder
                ? "Creating Order..."
                : "Create Prescription Order"}
            </span>
          </button>
        </div>
      </AnimatedModal>

      {/* Product Payment Modal */}
      {orderData && (
        <ProductPaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

PrescriptionUploadModal.displayName = "PrescriptionUploadModal";
