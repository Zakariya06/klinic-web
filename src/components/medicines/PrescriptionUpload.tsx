import React, { useId, useState } from "react";
import { FiCheckCircle, FiTrash2, FiUpload } from "react-icons/fi";

import useProfileApi from "@/hooks/useProfileApi";

interface PrescriptionUploadProps {
  onUploadComplete: (url: string) => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({
  onUploadComplete,
  isUploading = false,
}) => {
  const { uploadFile } = useProfileApi({ endpoint: "/api/v1/user-profile" });

  const inputId = useId();

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset the input so selecting the same file again triggers onChange
      e.target.value = "";

      if (file.type !== "application/pdf") {
        window.alert("Please select a PDF file.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        window.alert(
          "File Too Large. Please select a PDF file smaller than 5MB.",
        );
        return;
      }

      setIsProcessing(true);

      try {
        const fileName = file.name || `prescription-${Date.now()}.pdf`;

        // uploadFile supports File directly (per the web hook conversion)
        const publicUrl = await uploadFile("application/pdf", fileName, file);

        if (!publicUrl) throw new Error("Failed to upload prescription");

        setUploadedUrl(publicUrl);
        onUploadComplete(publicUrl);
        window.alert("Success: Prescription uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        window.alert(
          "Upload Failed: Failed to upload prescription. Please try again.",
        );
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("File picker error:", error);
      window.alert("Error: Failed to select document. Please try again.");
    }
  };

  const handleRemovePrescription = () => {
    const ok = window.confirm(
      "Are you sure you want to remove the uploaded prescription?",
    );
    if (!ok) return;

    setUploadedUrl(null);
    onUploadComplete("");
  };

  const disabled = isUploading || isProcessing;

  if (uploadedUrl) {
    return (
      <div className="mb-px">
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 py-4">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-900">
              Prescription uploaded successfully
            </span>
          </div>

          <button
            type="button"
            className="rounded-md p-1.5 transition hover:bg-emerald-100 cursor-pointer"
            onClick={handleRemovePrescription}
            aria-label="Remove prescription"
          >
            <FiTrash2 className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-px">
      <div className="rounded-xl border-2 border-dashed border-sky-600 bg-slate-50 text-center">
        {/* Clickable label to open file picker */}
        <label
          htmlFor={inputId}
          className={[
            "flex cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-10  ",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:bg-slate-100 transition",
          ].join(" ")}
          aria-disabled={disabled}
        >
          {disabled ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-sky-600" />
              <span className="text-sm font-medium text-sky-600">
                {isUploading ? "Uploading..." : "Processing..."}
              </span>
            </div>
          ) : (
            <>
              <FiUpload className="h-5 w-5 text-sky-600" />
              <div className="mt-1.5 text-sm font-semibold text-sky-600">
                Upload Prescription
              </div>
              <div className="text-xs text-gray-500">
                PDF files only, max 5MB
              </div>
            </>
          )}
        </label>

        <input
          id={inputId}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
