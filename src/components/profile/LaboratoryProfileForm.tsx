import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { MdMedicalServices } from "react-icons/md";
import { FaClock, FaRegClock, FaTimesCircle } from "react-icons/fa";

import {
  useLaboratoryProfileStore,
  useProfileUIStore,
} from "../../store/profileStore";
import useProfileApi from "../../hooks/useProfileApi";

import ServiceCard from "./laboratory/ServiceCard";
import ServiceFormModal from "./laboratory/ServiceFormModal";
import CitySearch from "./CitySearch";

import type {
  LaboratoryService,
  LaboratoryTest,
} from "../../types/laboratoryTypes";

interface LaboratoryProfileFormProps {
  availableCategories?: string[];
  onServiceCoverImagePick?: (serviceId: string) => void;
}

type TimePickerMode = "start" | "end";

const dayOptions = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const LaboratoryProfileForm: React.FC<LaboratoryProfileFormProps> = ({
  availableCategories = [],
  onServiceCoverImagePick,
}) => {
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // debounce timer ref
  const debounceTimerRef = useRef<number | null>(null);

  const {
    laboratoryName,
    laboratoryPhone,
    laboratoryEmail,
    laboratoryWebsite,
    laboratoryAddress,
    laboratoryPinCode,
    laboratoryCity,
    laboratoryGoogleMapsLink,
    laboratoryServices,
    isAvailable,
    availableDays,
    availableSlots,
    setLaboratoryName,
    setLaboratoryPhone,
    setLaboratoryEmail,
    setLaboratoryWebsite,
    setLaboratoryAddress,
    setLaboratoryPinCode,
    setLaboratoryCity,
    setLaboratoryGoogleMapsLink,
    setIsAvailable,
    toggleAvailableDay,
    addAvailableSlot,
    removeAvailableSlot,
    addLaboratoryService,
    updateLaboratoryService,
    removeLaboratoryService,
    addTest,
    updateTest,
    removeTest,
    prepareProfileData,
    setSavedValues,
    savedValues,
  } = useLaboratoryProfileStore();

  const uiStore = useProfileUIStore();

  const laboratoryProfileApi = useProfileApi({
    endpoint: "/api/v1/laboratory-profile",
  });

  // changed flags (for highlight + autosave)
  const isNameChanged = laboratoryName !== savedValues.laboratoryName;
  const isPhoneChanged = laboratoryPhone !== savedValues.laboratoryPhone;
  const isEmailChanged = laboratoryEmail !== savedValues.laboratoryEmail;
  const isWebsiteChanged = laboratoryWebsite !== savedValues.laboratoryWebsite;
  const isAddressChanged = laboratoryAddress !== savedValues.laboratoryAddress;
  const isPinCodeChanged = laboratoryPinCode !== savedValues.laboratoryPinCode;
  const isCityChanged = laboratoryCity !== savedValues.laboratoryCity;
  const isGoogleMapsLinkChanged =
    laboratoryGoogleMapsLink !== savedValues.laboratoryGoogleMapsLink;
  const areServicesChanged =
    JSON.stringify(laboratoryServices) !==
    JSON.stringify(savedValues.laboratoryServices);
  const isAvailableChanged = isAvailable !== savedValues.isAvailable;
  const isAvailableDaysChanged =
    JSON.stringify(availableDays) !== JSON.stringify(savedValues.availableDays);
  const isAvailableSlotsChanged =
    JSON.stringify(availableSlots) !==
    JSON.stringify(savedValues.availableSlots);

  const hasUnsavedChanges =
    isNameChanged ||
    isPhoneChanged ||
    isEmailChanged ||
    isWebsiteChanged ||
    isAddressChanged ||
    isPinCodeChanged ||
    isCityChanged ||
    isGoogleMapsLinkChanged ||
    areServicesChanged ||
    isAvailableChanged ||
    isAvailableDaysChanged ||
    isAvailableSlotsChanged;

  // Time slots
  const [timePickerMode, setTimePickerMode] = useState<TimePickerMode>("start");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Custom time picker modal (web)
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(9);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmPm, setTempAmPm] = useState<"AM" | "PM">("AM");

  const formatTimeSlot = (slot: string): string => {
    if (!slot.includes("AM") && !slot.includes("PM")) {
      const [startTime24, endTime24] = slot.split("-");
      if (startTime24 && endTime24) {
        const [sh, sm] = startTime24.split(":").map(Number);
        const [eh, em] = endTime24.split(":").map(Number);

        const sAMPM = sh >= 12 ? "PM" : "AM";
        const eAMPM = eh >= 12 ? "PM" : "AM";

        const sHour = sh % 12 || 12;
        const eHour = eh % 12 || 12;

        const s = `${sHour}:${sm < 10 ? "0" + sm : sm} ${sAMPM}`;
        const e = `${eHour}:${em < 10 ? "0" + em : em} ${eAMPM}`;
        return `${s}-${e}`;
      }
    }
    return slot;
  };

  const handleAddTimeSlot = () => {
    if (startTime && endTime) {
      addAvailableSlot(`${startTime}-${endTime}`);
      setStartTime("");
      setEndTime("");
    } else {
      window.alert("Please select both start and end times");
    }
  };

  const openCustomTimePicker = (mode: TimePickerMode) => {
    setTimePickerMode(mode);

    // default to current time
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const ap: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    setTempHour(h);
    setTempMinute(m);
    setTempAmPm(ap);
    setShowCustomTimePicker(true);
  };

  const handleTimeSelected = () => {
    const mm = tempMinute < 10 ? `0${tempMinute}` : `${tempMinute}`;
    const timeString = `${tempHour}:${mm} ${tempAmPm}`;
    if (timePickerMode === "start") setStartTime(timeString);
    else setEndTime(timeString);
    setShowCustomTimePicker(false);
  };

  const handleServiceCoverImagePick = (serviceId: string) => {
    onServiceCoverImagePick?.(serviceId);
  };

  // CRUD: services/tests (same logic)
  const autoSaveChanges = async () => {
    try {
      if (debounceTimerRef.current)
        window.clearTimeout(debounceTimerRef.current);

      return await new Promise<boolean>((resolve) => {
        debounceTimerRef.current = window.setTimeout(async () => {
          try {
            console.log("Auto-saving laboratory profile...");
            const profileData = prepareProfileData();
            const ok = await laboratoryProfileApi.updateDataSilent(profileData);

            if (ok) {
              setSavedValues({
                laboratoryName,
                laboratoryPhone,
                laboratoryEmail,
                laboratoryWebsite,
                laboratoryAddress,
                laboratoryPinCode,
                laboratoryCity,
                laboratoryGoogleMapsLink,
                laboratoryServices,
                coverImage: savedValues.coverImage,
                isAvailable,
                availableDays,
                availableSlots,
              });
              resolve(true);
            } else {
              console.error("Auto-save failed - API returned false");
              resolve(false);
            }
          } catch (e) {
            console.error("Auto-save error:", e);
            resolve(false);
          }
        }, 1000);
      });
    } catch (error) {
      console.error("Error auto-saving laboratory profile:", error);
      return false;
    }
  };

  const handleAddService = async (service: {
    name: string;
    description: string;
    collectionType: "home" | "lab" | "both";
    price: string;
    category?: string;
    tests?: { name: string; description: string; price: number }[];
  }) => {
    try {
      addLaboratoryService({ ...service, coverImage: "" });
      setShowAddServiceModal(false);
      await autoSaveChanges();
    } catch (error) {
      console.error("Error adding laboratory service:", error);
    }
  };

  const handleUpdateService = async (
    serviceId: string,
    updates: Partial<Omit<LaboratoryService, "id" | "tests">>,
  ) => {
    try {
      updateLaboratoryService(serviceId, updates);
      await autoSaveChanges();
    } catch (error) {
      console.error("Error updating laboratory service:", error);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      console.log(`Removing service with ID: ${serviceId}`);
      removeLaboratoryService(serviceId);

      // immediately save (same as RN)
      const profileData = prepareProfileData();
      const result = await laboratoryProfileApi.updateData(profileData);

      if (result) {
        setSavedValues({
          laboratoryName,
          laboratoryPhone,
          laboratoryEmail,
          laboratoryWebsite,
          laboratoryAddress,
          laboratoryPinCode,
          laboratoryCity,
          laboratoryGoogleMapsLink,
          laboratoryServices,
          coverImage: savedValues.coverImage,
          isAvailable,
          availableDays,
          availableSlots,
        });
      } else {
        window.alert("Failed to delete service. Please try again.");
      }
    } catch (error) {
      console.error("Error removing laboratory service:", error);
      window.alert("Failed to delete service. Please try again.");
    }
  };

  const handleAddTest = async (
    serviceId: string,
    test: Omit<LaboratoryTest, "id">,
  ) => {
    try {
      addTest(serviceId, test);
      await autoSaveChanges();
    } catch (error) {
      console.error("Error adding laboratory test:", error);
    }
  };

  const handleUpdateTest = async (
    serviceId: string,
    testId: string,
    updates: Partial<Omit<LaboratoryTest, "id">>,
  ) => {
    try {
      updateTest(serviceId, testId, updates);
      await autoSaveChanges();
    } catch (error) {
      console.error("Error updating laboratory test:", error);
    }
  };

  const handleRemoveTest = async (serviceId: string, testId: string) => {
    try {
      removeTest(serviceId, testId);
      await autoSaveChanges();
    } catch (error) {
      console.error("Error removing laboratory test:", error);
    }
  };

  // autosave when fields change
  useEffect(() => {
    if (hasUnsavedChanges) autoSaveChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    laboratoryName,
    laboratoryPhone,
    laboratoryEmail,
    laboratoryWebsite,
    laboratoryAddress,
    laboratoryPinCode,
    laboratoryCity,
    laboratoryGoogleMapsLink,
    laboratoryServices,
    isAvailable,
    availableDays,
    availableSlots,
  ]);

  // cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current)
        window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const formattedSlots = useMemo(
    () => availableSlots.map(formatTimeSlot),
    [availableSlots],
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-white rounded-xl">
      <div className="p-4">
        {/* Unsaved changes message */}
        {hasUnsavedChanges && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              Fields with red highlights have unsaved changes. Click the "Save
              Changes" button to save your updates.
            </p>
          </div>
        )}

        {/* Availability toggle */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium text-gray-800">
              Available?
              {isAvailableChanged && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </div>

            {/* Switch -> checkbox styled as toggle */}
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <div className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-indigo-200 transition" />
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-gray-400 peer-checked:bg-indigo-600 peer-checked:translate-x-5 transition" />
            </label>
          </div>
        </div>

        {/* Available Days */}
        <div className="mb-6">
          <div className="mb-2 text-base font-medium text-gray-700">
            Available Days
            {isAvailableDaysChanged && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </div>

          <div
            className={`rounded-xl border bg-white p-3 ${
              isAvailableDaysChanged ? "border-red-400" : "border-gray-200"
            }`}
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {dayOptions.map((day) => {
                const active = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAvailableDay(day)}
                    className={[
                      "rounded-lg border px-3 py-2 text-center font-medium",
                      active
                        ? isAvailableDaysChanged
                          ? "bg-red-400 border-red-400 text-white"
                          : "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-gray-200 text-gray-800",
                    ].join(" ")}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>

            {availableDays.length === 0 && (
              <div className="py-1 text-center text-sm text-gray-500">
                Select the days you are available
              </div>
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <div className="mb-2 text-base font-medium text-gray-700">
            Available Time Slots
            {isAvailableSlotsChanged && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </div>

          <div
            className={`rounded-xl border bg-white p-3 ${
              isAvailableSlotsChanged ? "border-red-400" : "border-gray-200"
            }`}
          >
            {/* picker row */}
            <div className="mb-3">
              <div className="mb-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => openCustomTimePicker("start")}
                  className="flex-1 rounded-lg border border-gray-200 p-2 flex items-center gap-2"
                >
                  <FaRegClock className="text-indigo-600" />
                  <span className="text-gray-800">
                    {startTime || "Start Time"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openCustomTimePicker("end")}
                  className="flex-1 rounded-lg border border-gray-200 p-2 flex items-center gap-2"
                >
                  <FaRegClock className="text-indigo-600" />
                  <span className="text-gray-800">{endTime || "End Time"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddTimeSlot}
                disabled={!startTime || !endTime}
                className={[
                  "w-full rounded-lg p-2 font-medium",
                  startTime && endTime
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500",
                ].join(" ")}
              >
                Add Time Slot
              </button>
            </div>

            {/* list */}
            {availableSlots.length === 0 ? (
              <div className="py-2 text-center text-gray-500">
                No time slots added yet
              </div>
            ) : (
              <div className="max-h-[120px] overflow-y-auto">
                {availableSlots.map((slot, idx) => (
                  <div
                    key={`${slot}-${idx}`}
                    className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <FaClock className="text-indigo-600" />
                      <span className="text-gray-800">
                        {formatTimeSlot(slot)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAvailableSlot(slot)}
                      aria-label="Remove slot"
                    >
                      <FaTimesCircle className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Time Picker Modal */}
        {showCustomTimePicker && (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/30 p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowCustomTimePicker(false);
            }}
          >
            <div className="w-[320px] rounded-xl bg-white p-5 shadow-xl">
              <div className="mb-5 text-center text-lg font-bold text-gray-800">
                Select {timePickerMode === "start" ? "Start" : "End"} Time
              </div>

              <div className="mb-6 flex items-end justify-center gap-3">
                {/* Hour */}
                <div className="text-center">
                  <div className="mb-1 font-medium text-gray-600">Hour</div>
                  <select
                    className="h-[44px] w-[90px] rounded-lg bg-gray-100 px-3 text-lg text-black outline-none"
                    value={tempHour}
                    onChange={(e) => setTempHour(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minute */}
                <div className="text-center">
                  <div className="mb-1 font-medium text-gray-600">Minute</div>
                  <select
                    className="h-[44px] w-[90px] rounded-lg bg-gray-100 px-3 text-lg text-black outline-none"
                    value={tempMinute}
                    onChange={(e) => setTempMinute(Number(e.target.value))}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m}>
                        {m < 10 ? `0${m}` : `${m}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AM/PM */}
                <div className="text-center">
                  <div className="mb-1 font-medium text-gray-600">AM/PM</div>
                  <select
                    className="h-[44px] w-[90px] rounded-lg bg-gray-100 px-3 text-lg text-black outline-none"
                    value={tempAmPm}
                    onChange={(e) => setTempAmPm(e.target.value as "AM" | "PM")}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomTimePicker(false)}
                  className="flex-1 rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTimeSelected}
                  className="flex-1 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basic Details */}
        <div className="mb-6">
          <div className="mb-4 text-lg font-bold text-gray-800">
            Laboratory Details
          </div>

          <div className="mb-4">
            <div className="mb-2 text-base font-medium text-gray-700">
              Laboratory Name
              {isNameChanged && <span className="ml-1 text-red-500">*</span>}
            </div>
            <input
              value={laboratoryName}
              onChange={(e) => setLaboratoryName(e.target.value)}
              placeholder="Enter laboratory name"
              className={[
                "w-full rounded-xl bg-white p-3 text-gray-800 border",
                isNameChanged ? "border-red-400" : "border-gray-300",
              ].join(" ")}
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 text-base font-medium text-gray-700">
              Phone Number
              {isPhoneChanged && <span className="ml-1 text-red-500">*</span>}
            </div>
            <input
              value={laboratoryPhone}
              onChange={(e) => setLaboratoryPhone(e.target.value)}
              placeholder="Enter phone number"
              inputMode="tel"
              className={[
                "w-full rounded-xl bg-white p-3 text-gray-800 border",
                isPhoneChanged ? "border-red-400" : "border-gray-300",
              ].join(" ")}
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 text-base font-medium text-gray-700">
              Email Address
              {isEmailChanged && <span className="ml-1 text-red-500">*</span>}
            </div>
            <input
              value={laboratoryEmail}
              onChange={(e) => setLaboratoryEmail(e.target.value)}
              placeholder="Enter email address"
              inputMode="email"
              autoCapitalize="none"
              className={[
                "w-full rounded-xl bg-white p-3 text-gray-800 border",
                isEmailChanged ? "border-red-400" : "border-gray-300",
              ].join(" ")}
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 text-base font-medium text-gray-700">
              Website (Optional)
              {isWebsiteChanged && <span className="ml-1 text-red-500">*</span>}
            </div>
            <input
              value={laboratoryWebsite}
              onChange={(e) => setLaboratoryWebsite(e.target.value)}
              placeholder="Enter website URL"
              inputMode="url"
              autoCapitalize="none"
              className={[
                "w-full rounded-xl bg-white p-3 text-gray-800 border",
                isWebsiteChanged ? "border-red-400" : "border-gray-300",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <div className="mb-4 text-lg font-bold text-gray-800">
            Laboratory Address
          </div>

          <div className="mb-4">
            <div className="mb-2 text-base font-medium text-gray-700">
              Address
              {isAddressChanged && <span className="ml-1 text-red-500">*</span>}
            </div>
            <textarea
              value={laboratoryAddress}
              onChange={(e) => setLaboratoryAddress(e.target.value)}
              placeholder="Enter laboratory address"
              rows={3}
              className={[
                "w-full rounded-xl bg-white p-3 text-gray-800 border",
                isAddressChanged ? "border-red-400" : "border-gray-300",
              ].join(" ")}
            />
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <div className="mb-2 text-base font-medium text-gray-700">
                Pin Code
                {isPinCodeChanged && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </div>
              <input
                value={laboratoryPinCode}
                onChange={(e) => setLaboratoryPinCode(e.target.value)}
                placeholder="Enter PIN code"
                inputMode="numeric"
                className={[
                  "w-full rounded-xl bg-white p-3 text-gray-800 border",
                  isPinCodeChanged ? "border-red-400" : "border-gray-300",
                ].join(" ")}
              />
            </div>

            <div className="flex-1">
              <CitySearch
                selectedCity={laboratoryCity}
                onCitySelect={setLaboratoryCity}
                allCities={uiStore.cities}
                isCityChanged={isCityChanged}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-base font-medium text-gray-700">
              Google Maps Link (Optional)
              {isGoogleMapsLinkChanged && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </div>
            <input
              value={laboratoryGoogleMapsLink}
              onChange={(e) => setLaboratoryGoogleMapsLink(e.target.value)}
              placeholder="Enter Google Maps link"
              autoCapitalize="none"
              className={[
                "w-full rounded-xl bg-white p-3 text-gray-800 border",
                isGoogleMapsLinkChanged ? "border-red-400" : "border-gray-300",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Services */}
        <div className="mb-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-bold text-gray-800">
              Laboratory Services
            </div>
            <button
              type="button"
              onClick={() => setShowAddServiceModal(true)}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-white font-medium flex items-center gap-2"
            >
              <IoAdd size={18} />
              <span>Add Service</span>
            </button>
          </div>

          {!laboratoryServices || laboratoryServices.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="flex justify-center">
                <MdMedicalServices className="text-gray-400" size={40} />
              </div>
              <div className="mt-2 text-gray-500">
                No laboratory services added yet.
              </div>
              <div className="mt-1 text-sm text-gray-400">
                Click the "Add Service" button to add your first service.
              </div>
            </div>
          ) : (
            <div>
              {(laboratoryServices || []).map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onUpdate={(updates) =>
                    handleUpdateService(service.id, updates)
                  }
                  onDelete={() => handleRemoveService(service.id)}
                  onAddTest={(test) => handleAddTest(service.id, test)}
                  onUpdateTest={(testId, updates) =>
                    handleUpdateTest(service.id, testId, updates)
                  }
                  onDeleteTest={(testId) =>
                    handleRemoveTest(service.id, testId)
                  }
                  onUploadCoverImage={handleServiceCoverImagePick}
                  availableCategories={availableCategories}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      <ServiceFormModal
        visible={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        onSubmit={handleAddService}
        availableCategories={availableCategories}
      />
    </div>
  );
};

export default LaboratoryProfileForm;
