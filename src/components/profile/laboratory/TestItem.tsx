import React, { useState } from "react";
import { MdEdit, MdClose } from "react-icons/md";
import { LaboratoryTest } from "../../../types/laboratoryTypes";

interface TestItemProps {
  test: LaboratoryTest;
  onUpdate: (updates: Partial<Omit<LaboratoryTest, "id">>) => void;
  onDelete: () => void;
}

const TestItem: React.FC<TestItemProps> = ({ test, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(test.name);
  const [description, setDescription] = useState(test.description);
  const [price, setPrice] = useState(test.price?.toString() || "");

  const handleSaveChanges = () => {
    const priceValue = parseFloat(price);
    if (!price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price");
      return;
    }
    onUpdate({ name, description, price: priceValue });
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-2">
      {!isEditing ? (
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800">{test.name}</div>
            {test.description ? (
              <div className="text-gray-600 text-sm mt-1">{test.description}</div>
            ) : null}
            <div className="text-indigo-600 font-semibold text-sm mt-1">₹{test.price}</div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="mr-2 p-1 rounded hover:bg-gray-100"
              onClick={() => setIsEditing(true)}
              aria-label="Edit test"
            >
              <MdEdit size={18} className="text-indigo-500" />
            </button>

            <button
              type="button"
              className="p-1 rounded hover:bg-gray-100"
              onClick={onDelete}
              aria-label="Delete test"
            >
              <MdClose size={18} className="text-red-400" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Edit Mode */}
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">Test Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 text-sm outline-none"
            />
          </div>

          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">Description (Optional)</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 text-sm outline-none resize-none"
            />
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Price (₹)</div>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder="Enter price"
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 text-sm outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 py-1 px-3 rounded-md bg-gray-200 text-gray-700 text-xs"
              onClick={() => {
                setName(test.name);
                setDescription(test.description);
                setPrice(test.price?.toString() || "");
                setIsEditing(false);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="py-1 px-3 rounded-md bg-indigo-500 text-white text-xs"
              onClick={handleSaveChanges}
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TestItem;
