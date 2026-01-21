// src/components/profile/ImagePickerModal.tsx
import React, { useEffect } from "react";
import { MdImage } from "react-icons/md";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onChooseFromGallery: () => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onChooseFromGallery,
}) => {
  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/50">
      {/* Backdrop click closes */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close"
      />

      {/* Bottom sheet */}
      <div className="absolute bottom-0 w-full">
        <div className="mx-auto w-full max-w-2xl rounded-t-3xl bg-white px-4 py-6 shadow-2xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-gray-900">
            Upload Picture
          </h3>

          <button
            type="button"
            onClick={() => {
              onChooseFromGallery();
              onClose();
            }}
            className="flex w-full items-center gap-4 border-b border-gray-200 p-4 text-left hover:bg-gray-50 cursor-pointer"
          >
            <MdImage size={24} className="text-indigo-500" />
            <span className="text-lg text-gray-900">Choose from Computer</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 flex w-full items-center justify-center p-4 cursor-pointer"
          >
            <span className="text-lg font-medium text-red-500">Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePickerModal;
