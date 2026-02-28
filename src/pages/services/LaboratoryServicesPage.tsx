// pages/laboratory/LaboratoryServicesPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaEdit, FaTrash, FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import { useLaboratoryProfileStore } from "../../store/profileStore";
import useProfileApi from "../../hooks/useProfileApi";
import apiClient from "../../api/client";
import type { LaboratoryService } from "../../types/laboratoryTypes";
import ServiceFormModal, {
  ServiceFormData,
} from "@/components/services/ServiceFormModal";

interface LaboratoryServicesPageProps {
  availableCategories?: string[];
}

const LaboratoryServicesPage: React.FC<LaboratoryServicesPageProps> = ({
  availableCategories = [],
}) => {
  const {
    laboratoryServices,
    addLaboratoryService,
    updateLaboratoryService,
    removeLaboratoryService,
    prepareProfileData,
    setServiceCoverImage,
    setSavedValues,
    savedValues,
    updateFromApiResponse,
  } = useLaboratoryProfileStore();

  const laboratoryProfileApi = useProfileApi({
    endpoint: "/api/v1/laboratory-profile",
  });

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] =
    useState<LaboratoryService | null>(null);
  const [uploadingCoverFor, setUploadingCoverFor] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data if not already loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (laboratoryServices.length > 0) return;

      setLoading(true);
      try {
        const profileData = await laboratoryProfileApi.fetchData();
        if (profileData) {
          updateFromApiResponse(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch laboratory profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ---- Upload logic ----
  const uploadFileWeb = async (file: File): Promise<string | null> => {
    try {
      const fileType = file.type || "application/octet-stream";
      const fileName = file.name || `file-${Date.now()}`;

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
      alert("Failed to upload file");
      return null;
    }
  };

  const handleCoverImagePick = (serviceId: string) => {
    setUploadingCoverFor(serviceId);
    fileInputRef.current?.click();
  };

  const onCoverImageSelected = async (file?: File | null) => {
    if (!file || !uploadingCoverFor) return;

    try {
      const imageUrl = await uploadFileWeb(file);
      if (!imageUrl) return;

      // Use the dedicated method
      setServiceCoverImage(uploadingCoverFor, imageUrl);

      const profileData = prepareProfileData();
      const ok = await laboratoryProfileApi.updateDataSilent(profileData);
      if (ok) {
        setSavedValues({
          ...savedValues,
          laboratoryServices: profileData.laboratoryServices,
        });
      }
    } catch (error) {
      console.error("Error uploading cover image:", error);
      alert("Failed to upload cover image");
    } finally {
      setUploadingCoverFor(null);
    }
  };

  const handleAddClick = () => {
    setEditingService(null);
    setModalVisible(true);
  };

  const handleEditClick = (service: LaboratoryService) => {
    setEditingService(service);
    setModalVisible(true);
  };

  const handleDeleteClick = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      removeLaboratoryService(serviceId);
      const profileData = prepareProfileData();
      const ok = await laboratoryProfileApi.updateData(profileData);
      if (ok) {
        setSavedValues({
          ...savedValues,
          laboratoryServices: profileData.laboratoryServices,
        });
      } else {
        alert("Failed to delete service. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  const handleModalSubmit = async (serviceData: ServiceFormData) => {
    try {
      if (editingService) {
        updateLaboratoryService(editingService.id, serviceData);
      } else {
        addLaboratoryService({
          ...serviceData,
          coverImage: serviceData.coverImage || "",
        });
      }

      const profileData = prepareProfileData();
      const ok = await laboratoryProfileApi.updateData(profileData);
      if (ok) {
        setSavedValues({
          ...savedValues,
          laboratoryServices: profileData.laboratoryServices,
        });
        setModalVisible(false);
        setEditingService(null);
      } else {
        alert("Failed to save service. Please try again.");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service. Please try again.");
      throw error; // re-throw so modal can handle submitting state
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file input for cover images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onCoverImageSelected(e.target.files?.[0] ?? null)}
      />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Services</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <IoAdd size={20} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Grid of services */}
      {laboratoryServices.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center min-h-[50vh] flex flex-col items-center justify-center">
          <p className="text-gray-500">No services added yet.</p>
          <button
            onClick={handleAddClick}
            className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Add your first service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {laboratoryServices.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Cover image area */}
              <div className="relative h-40 bg-gray-100">
                {service.coverImage ? (
                  <img
                    src={service.coverImage}
                    alt={service.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No cover
                  </div>
                )}
                {/* Upload button overlay */}
                <button
                  onClick={() => handleCoverImagePick(service.id)}
                  disabled={uploadingCoverFor === service.id}
                  className="absolute bottom-2 right-2 rounded-full bg-white p-2 shadow hover:bg-gray-100 disabled:opacity-50"
                  title="Upload cover image"
                >
                  {uploadingCoverFor === service.id ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaCloudUploadAlt size={16} />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {service.name}
                    </h3>
                    {service.category && (
                      <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                        {service.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(service)}
                      className="text-gray-500 hover:text-indigo-600"
                      aria-label="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(service.id)}
                      className="text-gray-500 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {service.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">
                    ₹{service.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {service.collectionType === "home"
                      ? "Home"
                      : service.collectionType === "lab"
                        ? "Lab"
                        : "Both"}
                  </span>
                </div>
                {service.tests && service.tests.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {service.tests.length} test(s) included
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ServiceFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingService(null);
        }}
        onSubmit={handleModalSubmit}
        uploadCoverImage={uploadFileWeb}
        availableCategories={availableCategories}
        initialData={
          editingService
            ? {
                name: editingService.name,
                description: editingService.description,
                collectionType: editingService.collectionType,
                price: editingService.price,
                category: editingService.category,
                tests: editingService.tests,
                coverImage: editingService.coverImage,
              }
            : undefined
        }
      />
    </div>
  );
};

export default LaboratoryServicesPage;
