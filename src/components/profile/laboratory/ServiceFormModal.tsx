import React, { forwardRef, useMemo, useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { MdClose, MdKeyboardArrowDown, MdKeyboardArrowUp, MdDelete } from "react-icons/md";

interface TestInput {
  name: string;
  description: string;
  price: number;
}

export interface ServiceFormModalRef {
  // kept for parity (RN used forwardRef); add methods later if you need
}

interface ServiceFormModalProps {
  visible: boolean;
  onClose: () => void;
  availableCategories?: string[];
  onSubmit: (service: {
    name: string;
    description: string;
    collectionType: "home" | "lab" | "both";
    price: string;
    category?: string;
    tests?: TestInput[];
  }) => void;
}

const ServiceFormModal = forwardRef<ServiceFormModalRef, ServiceFormModalProps>(
  ({ visible, onClose, onSubmit, availableCategories = [] }, _ref) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [collectionType, setCollectionType] = useState<"home" | "lab" | "both">("both");
    const [category, setCategory] = useState("");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Tests
    const [tests, setTests] = useState<TestInput[]>([]);
    const [currentTestName, setCurrentTestName] = useState("");
    const [currentTestDescription, setCurrentTestDescription] = useState("");
    const [currentTestPrice, setCurrentTestPrice] = useState("");

    const resetForm = () => {
      setName("");
      setDescription("");
      setPrice("");
      setCollectionType("both");
      setCategory("");
      setShowCategoryDropdown(false);
      setTests([]);
      setCurrentTestName("");
      setCurrentTestDescription("");
      setCurrentTestPrice("");
    };

    const calculateTestsTotal = useMemo(
      () => tests.reduce((sum, t) => sum + t.price, 0),
      [tests]
    );

    const handleAddTest = () => {
      if (!currentTestName.trim()) {
        alert("Please enter a test name");
        return;
      }

      const priceValue = parseFloat(currentTestPrice);
      if (!currentTestPrice.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
        alert("Please enter a valid test price");
        return;
      }

      setTests((prev) => [
        ...prev,
        {
          name: currentTestName.trim(),
          description: currentTestDescription.trim(),
          price: priceValue,
        },
      ]);

      setCurrentTestName("");
      setCurrentTestDescription("");
      setCurrentTestPrice("");
    };

    const handleRemoveTest = (index: number) => {
      setTests((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
      if (!name.trim()) {
        alert("Please enter a service name");
        return;
      }

      onSubmit({
        name: name.trim(),
        description: description.trim(),
        collectionType,
        price,
        category: category.trim(),
        tests: tests.length > 0 ? tests : undefined,
      });

      resetForm();
    };

    const handleClose = () => {
      resetForm();
      onClose();
    };

    // close when not visible (matches RN behavior)
    if (!visible) return null;

    return (
      <div
        className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          // click on overlay closes (RN overlay touch)
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="w-full max-w-2xl bg-white rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-hidden z-[1001]">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pt-1">
            <h2 className="text-xl font-bold text-gray-800">Add New Service</h2>
            <button type="button" onClick={handleClose} aria-label="Close" className="p-1">
              <MdClose size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="overflow-auto max-h-[80vh] pr-1">
            {/* Service Name */}
            <div className="mb-4">
              <label className="text-gray-700 font-medium mb-2 block">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter service name"
                className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 outline-none"
              />
            </div>

            {/* Category Dropdown */}
            {availableCategories.length > 0 && (
              <div className="mb-4">
                <label className="text-gray-700 font-medium mb-2 block">Service Category</label>

                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown((s) => !s)}
                  className="w-full border border-gray-300 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={category ? "text-gray-800" : "text-gray-400"}>
                      {category || "Select a category"}
                    </span>
                    {showCategoryDropdown ? (
                      <MdKeyboardArrowUp size={24} className="text-gray-500" />
                    ) : (
                      <MdKeyboardArrowDown size={24} className="text-gray-500" />
                    )}
                  </div>
                </button>

                {showCategoryDropdown && (
                  <div className="border border-gray-300 rounded-xl mt-1 max-h-40 overflow-auto">
                    {availableCategories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setCategory(item);
                          setShowCategoryDropdown(false);
                        }}
                        className={[
                          "w-full text-left p-3 border-b border-gray-200 last:border-b-0",
                          category === item ? "bg-indigo-50" : "bg-white",
                        ].join(" ")}
                      >
                        <span
                          className={category === item ? "text-indigo-600 font-medium" : "text-gray-700"}
                        >
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <label className="text-gray-700 font-medium mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter service description"
                rows={4}
                className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 outline-none resize-none"
              />
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="text-gray-700 font-medium mb-2 block">Package Price (₹)</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3">
                <FaRupeeSign className="text-gray-500" />
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={
                    tests.length > 0 ? `Auto-calculated: ${calculateTestsTotal}` : "Enter package price"
                  }
                  inputMode="numeric"
                  className="flex-1 p-3 text-gray-800 outline-none"
                />
              </div>

              {tests.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Individual tests total: ₹{calculateTestsTotal}. Leave blank to use auto-calculated
                  price.
                </p>
              )}
            </div>

            {/* Collection Type */}
            <div className="mb-4">
              <label className="text-gray-700 font-medium mb-2 block">Collection Type</label>
              <div className="flex justify-between">
                {(["home", "lab", "both"] as const).map((t, idx) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCollectionType(t)}
                    className={[
                      "flex-1 py-3 rounded-xl font-medium",
                      idx === 0 ? "mr-2" : idx === 1 ? "mx-1" : "ml-2",
                      collectionType === t ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700",
                    ].join(" ")}
                  >
                    {t === "home" ? "Home" : t === "lab" ? "Lab" : "Both"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tests Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Tests ({tests.length})</span>
              </div>

              {/* Add test form */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                <div className="text-gray-700 font-medium mb-1">Test Name</div>
                <input
                  value={currentTestName}
                  onChange={(e) => setCurrentTestName(e.target.value)}
                  placeholder="Enter test name (e.g., Blood Sugar, CBC)"
                  className="w-full border border-gray-300 rounded-lg p-2 mb-2 bg-white outline-none"
                />

                <div className="text-gray-700 font-medium mb-1">Test Description</div>
                <textarea
                  value={currentTestDescription}
                  onChange={(e) => setCurrentTestDescription(e.target.value)}
                  placeholder="Enter test description (optional)"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg p-2 mb-2 bg-white outline-none resize-none"
                />

                <div className="text-gray-700 font-medium mb-1">
                  Test Price (₹) <span className="text-red-500">*</span>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg px-2 mb-2 bg-white">
                  <FaRupeeSign className="text-gray-500" size={14} />
                  <input
                    value={currentTestPrice}
                    onChange={(e) => setCurrentTestPrice(e.target.value)}
                    placeholder="Enter test price"
                    inputMode="numeric"
                    className="flex-1 p-2 text-gray-800 outline-none"
                  />
                </div>

                <button
                  type="button"
                  className="w-full bg-indigo-500 py-2 rounded-lg text-white font-medium"
                  onClick={handleAddTest}
                >
                  Add Test
                </button>
              </div>

              {/* Tests list */}
              {tests.length > 0 ? (
                <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                  {tests.map((test, index) => (
                    <div
                      key={`${test.name}-${index}`}
                      className={["p-3", index < tests.length - 1 ? "border-b border-gray-200" : ""].join(
                        " "
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-2">
                          <div className="font-medium text-gray-800">{test.name}</div>
                          {!!test.description && (
                            <div className="text-gray-600 text-sm mt-1">{test.description}</div>
                          )}
                          <div className="text-indigo-600 font-semibold text-sm mt-1">₹{test.price}</div>
                        </div>

                        <button
                          type="button"
                          className="p-1"
                          onClick={() => handleRemoveTest(index)}
                          aria-label="Remove test"
                        >
                          <MdDelete size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 mb-4">
                  <span className="text-gray-500">No tests added yet. Add tests above.</span>
                </div>
              )}

              {/* Pricing Summary */}
              {tests.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                  <div className="text-blue-800 font-medium mb-2">Pricing Summary</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-700">Individual tests total:</span>
                    <span className="text-blue-700 font-semibold">₹{calculateTestsTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Package price:</span>
                    <span className="text-blue-700 font-semibold">₹{price || calculateTestsTotal}</span>
                  </div>
                  {!price && <div className="text-xs text-blue-600 mt-1">Using auto-calculated price</div>}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="w-full bg-indigo-500 py-4 rounded-xl text-white font-bold text-base mb-4"
              onClick={handleSubmit}
            >
              Add Service
            </button>

            {/* Optional: secondary close */}
            <button
              type="button"
              className="w-full bg-gray-100 py-3 rounded-xl text-gray-700 font-medium"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ServiceFormModal;
