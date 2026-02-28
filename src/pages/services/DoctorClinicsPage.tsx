import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocalHospital,
  MdPhone,
  MdEmail,
  MdLanguage,
  MdPlace,
  MdMap,
  MdClose,
} from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { useDoctorProfileStore, useProfileUIStore } from "@/store/profileStore";
import { useCustomAlert } from "@/components/CustomAlert";
import CitySearch from "@/components/profile/CitySearch";
import { AnimatedModal } from "@/components/modal/AnimatedModal";
import useProfileApi from "@/hooks/useProfileApi"; // 👈 import the hook

interface ClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => Promise<void>;
  clinic: any; // clinic object
  index: number;
  isNew?: boolean;
}

const ClinicModal: React.FC<ClinicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clinic,
  index,
  isNew = false,
}) => {
  const [localClinic, setLocalClinic] = useState(clinic);
  const { cities } = useProfileUIStore();
  const doctorProfileStore = useDoctorProfileStore();

  useEffect(() => {
    setLocalClinic(clinic);
  }, [clinic]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setLocalClinic((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Update the store with all fields
    doctorProfileStore.updateClinic(
      index,
      "clinicName",
      localClinic.clinicName,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicPhone",
      localClinic.clinicPhone,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicEmail",
      localClinic.clinicEmail,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicWebsite",
      localClinic.clinicWebsite,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicAddress",
      localClinic.clinicAddress,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicPinCode",
      localClinic.clinicPinCode,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicCity",
      localClinic.clinicCity,
    );
    doctorProfileStore.updateClinic(
      index,
      "clinicGoogleMapsLink",
      localClinic.clinicGoogleMapsLink,
    );

    // Save to backend if callback provided
    if (onSave) {
      await onSave();
    }

    onClose();
  };

  return (
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="bg-white flex justify-between items-center py-2 px-1 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          {isNew ? "Add New Clinic" : "Edit Clinic"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MdClose size={24} />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Clinic Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clinic Name *
          </label>
          <input
            value={localClinic.clinicName}
            onChange={(e) => handleChange("clinicName", e.target.value)}
            placeholder="Enter clinic name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              value={localClinic.clinicPhone}
              onChange={(e) => handleChange("clinicPhone", e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              value={localClinic.clinicEmail}
              onChange={(e) => handleChange("clinicEmail", e.target.value)}
              placeholder="Enter email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            value={localClinic.clinicWebsite}
            onChange={(e) => handleChange("clinicWebsite", e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            value={localClinic.clinicAddress}
            onChange={(e) => handleChange("clinicAddress", e.target.value)}
            placeholder="Enter clinic address"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Pin Code & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pin Code *
            </label>
            <input
              value={localClinic.clinicPinCode}
              onChange={(e) =>
                handleChange("clinicPinCode", e.target.value.slice(0, 6))
              }
              placeholder="Enter pin code"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <CitySearch
              allCities={cities}
              selectedCity={localClinic.clinicCity}
              onCitySelect={(city) => handleChange("clinicCity", city)}
              isCityChanged={false}
            />
          </div>
        </div>

        {/* Google Maps Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Maps Link
          </label>
          <input
            value={localClinic.clinicGoogleMapsLink}
            onChange={(e) =>
              handleChange("clinicGoogleMapsLink", e.target.value)
            }
            placeholder="Paste Google Maps link"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Add a Google Maps link to help patients find your clinic.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white flex justify-end gap-3 px-2 pt-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const DoctorClinicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useCustomAlert();
  const doctorProfileStore = useDoctorProfileStore();
  const { cities } = useProfileUIStore();

  // 👇 Create the same API hook used in Profile
  const doctorProfileApi = useProfileApi({
    endpoint: "/api/v1/doctor-profile",
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null,
  );

  const clinics = doctorProfileStore.clinics || [];

  // Load doctor profile data on mount if not already in store
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await doctorProfileApi.fetchData(); // uses the hook's fetch
        if (response && doctorProfileStore.updateFromApiResponse) {
          doctorProfileStore.updateFromApiResponse(response);
        }
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          showAlert({
            title: "Error",
            message: "Failed to load clinic data.",
            type: "error",
          });
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Save clinics to backend using the same API hook
  const saveClinics = async () => {
    setSaving(true);
    try {
      const profileData = doctorProfileStore.prepareProfileData();
      console.log("Saving clinics with data:", profileData); // for debugging

      // Use the hook's updateData method (handles both create and update)
      const response = await doctorProfileApi.updateData(profileData);
      console.log("Save response:", response);

      // Update saved values in store
      doctorProfileStore.setSavedValues({
        ...doctorProfileStore.savedValues,
        clinics: doctorProfileStore.clinics,
      });

      showAlert({
        title: "Success",
        message: "Clinics updated successfully.",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error saving clinics:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save clinics.";
      showAlert({
        title: "Error",
        message: errorMsg,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddClinic = () => {
    doctorProfileStore.addClinic(); // adds empty clinic
    const newIndex = clinics.length; // after add, length increased by 1
    setEditingIndex(newIndex);
    setModalOpen(true);
  };

  const handleEditClinic = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleDeleteClinic = async (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = async () => {
    if (deleteConfirmIndex === null) return;
    doctorProfileStore.removeClinic(deleteConfirmIndex);
    await saveClinics();
    setDeleteConfirmIndex(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIndex(null);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mb-4" />
          <p className="text-gray-600">Loading clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Manage Clinics
          </h1>
          <p className="text-gray-600">
            Add, edit, or remove your clinic locations.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleAddClinic}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <MdAdd size={20} />
            Add Clinic
          </button>
        </div>
      </div>

      {/* Clinics Grid */}
      {clinics.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <MdLocalHospital size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clinics added yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first clinic to start managing appointments.
          </p>
          <button
            onClick={handleAddClinic}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <MdAdd size={20} />
            Add Clinic
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <MdLocalHospital className="text-indigo-600" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {clinic.clinicName || "Unnamed Clinic"}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClinic(index)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClinic(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {clinic.clinicPhone && (
                    <div className="flex items-center text-gray-700">
                      <MdPhone className="text-gray-400 mr-2" size={16} />
                      <span>{clinic.clinicPhone}</span>
                    </div>
                  )}
                  {clinic.clinicEmail && (
                    <div className="flex items-center text-gray-700">
                      <MdEmail className="text-gray-400 mr-2" size={16} />
                      <span className="truncate">{clinic.clinicEmail}</span>
                    </div>
                  )}
                  {clinic.clinicWebsite && (
                    <div className="flex items-center text-gray-700">
                      <MdLanguage className="text-gray-400 mr-2" size={16} />
                      <a
                        href={clinic.clinicWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {clinic.clinicWebsite.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {clinic.clinicAddress && (
                    <div className="flex items-start text-gray-700">
                      <MdPlace
                        className="text-gray-400 mr-2 mt-0.5"
                        size={16}
                      />
                      <span>{clinic.clinicAddress}</span>
                    </div>
                  )}
                  {clinic.clinicCity && clinic.clinicPinCode && (
                    <div className="flex items-center text-gray-700">
                      <span className="ml-6 text-gray-600">
                        {clinic.clinicCity}, {clinic.clinicPinCode}
                      </span>
                    </div>
                  )}
                  {clinic.clinicGoogleMapsLink && (
                    <div className="flex items-center text-gray-700">
                      <MdMap className="text-gray-400 mr-2" size={16} />
                      <a
                        href={clinic.clinicGoogleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                      >
                        View on Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {modalOpen && editingIndex !== null && (
        <AnimatedModal
          open={modalOpen}
          onClose={handleModalClose}
          maxWidth="max-w-2xl"
        >
          <ClinicModal
            isOpen={modalOpen}
            onClose={handleModalClose}
            onSave={saveClinics}
            clinic={clinics[editingIndex]}
            index={editingIndex}
            isNew={
              editingIndex === clinics.length - 1 &&
              clinics[editingIndex]?.clinicName === ""
            }
          />
        </AnimatedModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmIndex !== null && (
        <AnimatedModal
          open={deleteConfirmIndex !== null}
          onClose={() => setDeleteConfirmIndex(null)}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Delete Clinic
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this clinic? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmIndex(null)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Delete
            </button>
          </div>
        </AnimatedModal>
      )}

      {/* Global saving indicator */}
      {saving && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-full p-3 border border-gray-200 flex items-center gap-2">
          <FaSpinner className="animate-spin text-indigo-600" size={20} />
          <span className="text-sm font-medium">Saving...</span>
        </div>
      )}

      <AlertComponent />
    </div>
  );
};

export default DoctorClinicsPage;
