import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

interface TestFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (test: {
    name: string;
    description: string;
    price: number;
  }) => void;
}

const TestFormModal: React.FC<TestFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter a test name");
      return;
    }

    const priceValue = parseFloat(price);
    if (!price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
    });

    // Reset form
    setName("");
    setDescription("");
    setPrice("");
  };

  // Close on Escape
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-xl bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between mb-5 pt-1">
          <h2 className="text-xl font-bold text-gray-800">Add New Test</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <MdClose size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[75vh] pr-1">
          {/* Test Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter test name (e.g., Blood Sugar, CBC)"
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Test Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details about the test (e.g., fasting required, sample type)"
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Test Price <span className="text-red-500">*</span>
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder="Enter price in ₹ (e.g., 150)"
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-indigo-500 py-4 rounded-xl text-white font-bold text-base"
          >
            Add Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestFormModal;
