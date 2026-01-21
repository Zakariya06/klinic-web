import React, { useEffect, useRef, useState } from "react";
import {
  MdMoreVert,
  MdEdit,
  MdAddPhotoAlternate,
  MdDelete,
  MdCategory,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import { FaRupeeSign } from "react-icons/fa";

import type { LaboratoryService, LaboratoryTest } from "../../../types/laboratoryTypes";
import TestItem from "./TestItem";
import TestFormModal from "./TestFormModal";

interface ServiceCardProps {
  service: LaboratoryService;
  onUpdate: (updates: Partial<Omit<LaboratoryService, "id" | "tests">>) => void;
  onDelete: () => void;
  onAddTest: (test: Omit<LaboratoryTest, "id">) => void;
  onUpdateTest: (testId: string, updates: Partial<Omit<LaboratoryTest, "id">>) => void;
  onDeleteTest: (testId: string) => void;
  onUploadCoverImage: (serviceId: string) => void;
  availableCategories?: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onUpdate,
  onDelete,
  onAddTest,
  onUpdateTest,
  onDeleteTest,
  onUploadCoverImage,
  availableCategories = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Local state for editing
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price);
  const [collectionType, setCollectionType] = useState(service.collectionType);
  const [category, setCategory] = useState(service.category || "");

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Keep local edit fields in sync when service changes (important in React web lists)
  useEffect(() => {
    if (!isEditing) {
      setName(service.name);
      setDescription(service.description);
      setPrice(service.price);
      setCollectionType(service.collectionType);
      setCategory(service.category || "");
    }
  }, [service, isEditing]);

  // Close action menu when clicking outside
  useEffect(() => {
    if (!showActionMenu) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showActionMenu]);

  const collectionOptions: Array<{ value: "home" | "lab" | "both"; label: string }> = [
    { value: "home", label: "Home Collection" },
    { value: "lab", label: "Lab Visit" },
    { value: "both", label: "Both" },
  ];

  const handleSaveChanges = () => {
    onUpdate({
      name,
      description,
      price,
      collectionType: collectionType as "home" | "lab" | "both",
      category,
    });
    setIsEditing(false);
    setShowCategoryDropdown(false);
  };

  const handleAddTest = (test: Omit<LaboratoryTest, "id">) => {
    onAddTest(test);
    setShowTestModal(false);
  };

  const getCollectionTypeDisplay = (type: string) => {
    switch (type) {
      case "home":
        return "Home Collection";
      case "lab":
        return "Lab Visit";
      case "both":
        return "Home & Lab";
      default:
        return "Not Specified";
    }
  };

  const getCollectionIcon = () => {
    // react-icons doesn't have a single perfect match for RN icons here; keep it simple
    // and reuse MdCategory/IoAdd style vibe. You can swap later.
    return service.collectionType === "home" ? "🏠" : "🧪";
  };

  return (
    <div className="relative bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1">
          <div className="font-bold text-base text-gray-800">{service.name}</div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            className="p-1"
            onClick={() => setShowActionMenu((v) => !v)}
            aria-label="More actions"
          >
            <MdMoreVert size={22} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Action Menu */}
      {showActionMenu && (
        <div
          ref={menuRef}
          className="absolute top-12 right-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[220px]"
        >
          <button
            type="button"
            className="w-full flex items-center p-3 border-b border-gray-100 text-left hover:bg-gray-50"
            onClick={() => {
              setIsEditing(true);
              setShowActionMenu(false);
            }}
          >
            <MdEdit size={18} className="text-indigo-500" />
            <span className="ml-2 text-gray-700">Edit Service</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center p-3 border-b border-gray-100 text-left hover:bg-gray-50"
            onClick={() => {
              onUploadCoverImage(service.id);
              setShowActionMenu(false);
            }}
          >
            <MdAddPhotoAlternate size={18} className="text-indigo-500" />
            <span className="ml-2 text-gray-700">
              {service.coverImage ? "Change Cover Image" : "Add Cover Image"}
            </span>
          </button>

          <button
            type="button"
            className="w-full flex items-center p-3 text-left hover:bg-gray-50"
            onClick={() => {
              onDelete();
              setShowActionMenu(false);
            }}
          >
            <MdDelete size={18} className="text-red-400" />
            <span className="ml-2 text-gray-700">Delete Service</span>
          </button>
        </div>
      )}

      {/* Details */}
      {!isEditing ? (
        <div>
          {/* Category */}
          {service.category && (
            <div className="mb-3 flex items-center">
              <MdCategory size={16} className="text-indigo-500" />
              <span className="text-indigo-600 font-medium text-sm ml-1 px-2 py-1 bg-indigo-50 rounded-md">
                {service.category}
              </span>
            </div>
          )}

          {/* Description */}
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">Description</div>
            <div className="text-gray-700">{service.description || "No description provided."}</div>
          </div>

          {/* Image */}
          {service.coverImage ? (
            <div className="mb-3">
              <img
                src={service.coverImage}
                alt={`${service.name} cover`}
                className="w-full h-40 rounded-lg object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <button
              type="button"
              className="w-full mb-3 border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center bg-gray-50 h-24"
              onClick={() => onUploadCoverImage(service.id)}
            >
              <MdAddPhotoAlternate size={24} className="text-gray-500" />
              <span className="text-gray-500 mt-2">Add cover image</span>
            </button>
          )}

          {/* Price + Collection */}
          <div className="flex items-center mb-3">
            <div className="flex-1 flex items-center flex-row">
              <FaRupeeSign size={16} className="text-indigo-500" />
              <span className="text-gray-800 text-base font-medium ml-2">
                {service.price ? `₹${service.price}` : "Price not set"}
              </span>
            </div>

            <div className="flex items-center flex-row">
              <span className="text-indigo-500 text-lg leading-none">{getCollectionIcon()}</span>
              <span className="text-gray-700 ml-2">{getCollectionTypeDisplay(service.collectionType)}</span>
            </div>
          </div>

          {/* Tests */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-gray-800">Tests ({service.tests.length})</div>

              <button
                type="button"
                className="bg-indigo-100 py-1 px-3 rounded-lg flex items-center"
                onClick={() => setShowTestModal(true)}
              >
                <IoAdd size={16} className="text-indigo-600" />
                <span className="text-indigo-600 font-medium ml-1">Add Test</span>
              </button>
            </div>

            {service.tests.length === 0 ? (
              <div className="text-gray-500 text-center py-3">No tests added yet.</div>
            ) : (
              service.tests.map((test: LaboratoryTest) => (
                <TestItem
                  key={test.id}
                  test={test}
                  onUpdate={(updates) => onUpdateTest(test.id, updates)}
                  onDelete={() => onDeleteTest(test.id)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        // Edit Mode
        <div>
          {/* Name */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Service Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 outline-none"
            />
          </div>

          {/* Category */}
          {availableCategories.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Category</div>

              <button
                type="button"
                onClick={() => setShowCategoryDropdown((v) => !v)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <div className="flex items-center justify-between">
                  <span className={category ? "text-gray-800" : "text-gray-400"}>
                    {category || "Select a category"}
                  </span>
                  {showCategoryDropdown ? (
                    <MdKeyboardArrowUp size={22} className="text-gray-500" />
                  ) : (
                    <MdKeyboardArrowDown size={22} className="text-gray-500" />
                  )}
                </div>
              </button>

              {showCategoryDropdown && (
                <div className="border border-gray-300 rounded-lg mt-1 max-h-40 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left p-2 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="text-gray-400">None</span>
                  </button>

                  {availableCategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setShowCategoryDropdown(false);
                      }}
                      className={[
                        "w-full text-left p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50",
                        category === item ? "bg-indigo-50" : "bg-white",
                      ].join(" ")}
                    >
                      <span className={category === item ? "text-indigo-600 font-medium" : "text-gray-700"}>
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 outline-none resize-none"
            />
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Price (₹)</div>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 outline-none"
            />
          </div>

          {/* Collection Type */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Collection Type</div>
            <div className="flex flex-wrap gap-2">
              {collectionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={[
                    "py-2 px-3 rounded-lg",
                    collectionType === option.value ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-700",
                  ].join(" ")}
                  onClick={() => setCollectionType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              className="mr-3 py-2 px-4 rounded-lg bg-gray-200 text-gray-700"
              onClick={() => {
                setName(service.name);
                setDescription(service.description);
                setPrice(service.price);
                setCollectionType(service.collectionType);
                setCategory(service.category || "");
                setIsEditing(false);
                setShowCategoryDropdown(false);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="py-2 px-4 rounded-lg bg-indigo-500 text-white font-medium"
              onClick={handleSaveChanges}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Test Form Modal */}
      <TestFormModal visible={showTestModal} onClose={() => setShowTestModal(false)} onSubmit={handleAddTest} />
    </div>
  );
};

export default ServiceCard;
