import React, { useEffect, useMemo, useState } from "react";
import {
  MdAccessTime,
  MdAdd,
  MdCalendarMonth,
  MdCardMembership,
  MdClose,
  MdDelete,
  MdEmail,
  MdLocalHospital,
  MdMap,
  MdMoney,
  MdPhone,
  MdSchool,
  MdWork,
  MdPlace,
  MdLanguage,
} from "react-icons/md";
import { FaStethoscope } from "react-icons/fa";
import CitySearch from "./CitySearch";

interface DoctorProfileFormProps {
  description: string;
  experience: string;
  specializations: string[];
  availableSpecializations: string[];
  qualifications: string[];
  availableQualifications: string[];
  consultationFee: string;
  age: string;
  gender: string;
  consultationType: string;
  coverImage: string;
  registrationNumber: string;
  clinics: Array<{
    clinicName: string;
    clinicPhone: string;
    clinicEmail: string;
    clinicWebsite: string;
    clinicAddress: string;
    clinicPinCode: string;
    clinicCity: string;
    clinicGoogleMapsLink: string;
  }>;
  cities: string[];
  isAvailable: boolean;
  availableDays: string[];
  availableSlots: string[];
  uploadingCoverImage: boolean;

  onChangeDescription: (text: string) => void;
  onChangeExperience: (text: string) => void;
  onAddSpecialization: (text: string) => void;
  onRemoveSpecialization: (index: number) => void;
  onAddQualification: (text: string) => void;
  onRemoveQualification: (index: number) => void;
  onChangeConsultationFee: (text: string) => void;
  onChangeAge: (text: string) => void;
  onChangeGender: (gender: string) => void;
  onChangeConsultationType: (type: string) => void;
  onChangeCoverImage: () => void; // keep same signature (parent handles file picker)
  onChangeRegistrationNumber: (text: string) => void;

  onAddClinic: () => void;
  onRemoveClinic: (index: number) => void;
  onChangeClinicName: (text: string, index: number) => void;
  onChangeClinicPhone: (text: string, index: number) => void;
  onChangeClinicEmail: (text: string, index: number) => void;
  onChangeClinicWebsite: (text: string, index: number) => void;
  onChangeClinicAddress: (text: string, index: number) => void;
  onChangeClinicPinCode: (text: string, index: number) => void;
  onChangeClinicCity: (city: string, index: number) => void;
  onChangeClinicGoogleMapsLink: (text: string, index: number) => void;

  onChangeIsAvailable: (value: boolean) => void;
  onToggleAvailableDay: (day: string) => void;
  onAddAvailableSlot: (slot: string) => void;
  onRemoveAvailableSlot: (slot: string) => void;

  savedValues: {
    description: string;
    experience: string;
    specializations: string[];
    qualifications: string[];
    consultationFee: string;
    age: string;
    gender: string;
    consultationType: string;
    coverImage: string;
    registrationNumber: string;
    clinics: Array<{
      clinicName: string;
      clinicPhone: string;
      clinicEmail: string;
      clinicWebsite: string;
      clinicAddress: string;
      clinicPinCode: string;
      clinicCity: string;
      clinicGoogleMapsLink: string;
    }>;
    isAvailable: boolean;
    availableDays: string[];
    availableSlots: string[];
  };
}

const DoctorProfileForm: React.FC<DoctorProfileFormProps> = ({
  description = "",
  experience = "",
  specializations = [],
  availableSpecializations = [],
  qualifications = [],
  availableQualifications = [],
  consultationFee = "",
  age = "",
  gender = "",
  consultationType = "",
  coverImage = "",
  registrationNumber = "",
  clinics = [],
  cities = [],
  isAvailable = false,
  availableDays = [],
  availableSlots = [],
  uploadingCoverImage = false,
  onChangeDescription,
  onChangeExperience,
  onAddSpecialization,
  onRemoveSpecialization,
  onAddQualification,
  onRemoveQualification,
  onChangeConsultationFee,
  onChangeAge,
  onChangeGender,
  onChangeConsultationType,
  onChangeCoverImage,
  onChangeRegistrationNumber,
  onAddClinic,
  onRemoveClinic,
  onChangeClinicName,
  onChangeClinicPhone,
  onChangeClinicEmail,
  onChangeClinicWebsite,
  onChangeClinicAddress,
  onChangeClinicPinCode,
  onChangeClinicCity,
  onChangeClinicGoogleMapsLink,
  onChangeIsAvailable,
  onToggleAvailableDay,
  onAddAvailableSlot,
  onRemoveAvailableSlot,
  savedValues,
}) => {
  const genderOptions = ["Male", "Female"];
  const consultationTypeOptions = ["in-person", "online", "both"] as const;
  const dayOptions = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [newSpecialization, setNewSpecialization] = useState("");
  const [newQualification, setNewQualification] = useState("");

  const [showSpecializationSuggestions, setShowSpecializationSuggestions] =
    useState(false);
  const [showQualificationSuggestions, setShowQualificationSuggestions] =
    useState(false);

  const [filteredSpecializations, setFilteredSpecializations] = useState<
    string[]
  >([]);
  const [filteredQualifications, setFilteredQualifications] = useState<
    string[]
  >([]);

  // Time slot: keep same "custom time picker" idea, but for web we use <select>
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<"start" | "end">(
    "start",
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [tempHour, setTempHour] = useState<number>(9);
  const [tempMinute, setTempMinute] = useState<number>(0);
  const [tempAmPm, setTempAmPm] = useState<"AM" | "PM">("AM");

  // --- Unsaved changes checks (same logic) ---
  const isDescriptionChanged = description !== savedValues.description;
  const isExperienceChanged = experience !== savedValues.experience;
  const isSpecializationsChanged =
    JSON.stringify(specializations) !==
    JSON.stringify(savedValues.specializations);
  const isQualificationsChanged =
    JSON.stringify(qualifications) !==
    JSON.stringify(savedValues.qualifications);
  const isConsultationFeeChanged =
    consultationFee !== savedValues.consultationFee;
  const isAgeChanged = age !== savedValues.age;
  const isGenderChanged = gender !== savedValues.gender;
  const isConsultationTypeChanged =
    consultationType !== savedValues.consultationType;
  const isCoverImageChanged = coverImage !== savedValues.coverImage;
  const isRegistrationNumberChanged =
    registrationNumber !== savedValues.registrationNumber;
  const isClinicsChanged =
    JSON.stringify(clinics) !== JSON.stringify(savedValues.clinics);
  const isAvailableChanged = isAvailable !== savedValues.isAvailable;
  const isAvailableDaysChanged =
    JSON.stringify(availableDays) !== JSON.stringify(savedValues.availableDays);
  const isAvailableSlotsChanged =
    JSON.stringify(availableSlots) !==
    JSON.stringify(savedValues.availableSlots);

  const hasUnsavedChanges =
    isDescriptionChanged ||
    isExperienceChanged ||
    isSpecializationsChanged ||
    isQualificationsChanged ||
    isConsultationFeeChanged ||
    isAgeChanged ||
    isGenderChanged ||
    isConsultationTypeChanged ||
    isCoverImageChanged ||
    isRegistrationNumberChanged ||
    isClinicsChanged ||
    isAvailableChanged ||
    isAvailableDaysChanged ||
    isAvailableSlotsChanged;

  // --- Suggestions filtering (same logic) ---
  useEffect(() => {
    if (!newSpecialization.trim()) {
      setFilteredSpecializations([]);
      setShowSpecializationSuggestions(false);
      return;
    }

    const search = newSpecialization.toLowerCase().trim();
    const filtered = availableSpecializations.filter((spec) =>
      spec.toLowerCase().includes(search),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower === search) return -1;
      if (bLower === search) return 1;

      const aStarts = aLower.startsWith(search);
      const bStarts = bLower.startsWith(search);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.localeCompare(b);
    });

    setFilteredSpecializations(sorted);
    setShowSpecializationSuggestions(sorted.length > 0);
  }, [newSpecialization, availableSpecializations]);

  useEffect(() => {
    if (!newQualification.trim()) {
      setFilteredQualifications([]);
      setShowQualificationSuggestions(false);
      return;
    }

    const search = newQualification.toLowerCase().trim();
    const filtered = availableQualifications.filter((q) =>
      q.toLowerCase().includes(search),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower === search) return -1;
      if (bLower === search) return 1;

      const aStarts = aLower.startsWith(search);
      const bStarts = bLower.startsWith(search);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.localeCompare(b);
    });

    setFilteredQualifications(sorted);
    setShowQualificationSuggestions(sorted.length > 0);
  }, [newQualification, availableQualifications]);

  const handleAddSpecialization = () => {
    const value = newSpecialization.trim();
    if (!value) return;
    if (specializations.includes(value)) {
      window.alert("This specialization is already in your list.");
      return;
    }
    onAddSpecialization(value);
    setNewSpecialization("");
    setShowSpecializationSuggestions(false);
  };

  const handleAddQualification = () => {
    const value = newQualification.trim();
    if (!value) return;
    if (qualifications.includes(value)) {
      window.alert("This qualification is already in your list.");
      return;
    }
    onAddQualification(value);
    setNewQualification("");
    setShowQualificationSuggestions(false);
  };

  const selectSpecialization = (value: string) => {
    onAddSpecialization(value);
    setNewSpecialization("");
    setShowSpecializationSuggestions(false);
  };

  const selectQualification = (value: string) => {
    onAddQualification(value);
    setNewQualification("");
    setShowQualificationSuggestions(false);
  };

  // --- Time slot helpers (same logic) ---
  const formatTimeSlot = (slot: string): string => {
    if (!slot.includes("AM") && !slot.includes("PM")) {
      const [start24, end24] = slot.split("-");
      if (start24 && end24) {
        const [sh, sm] = start24.split(":").map(Number);
        const [eh, em] = end24.split(":").map(Number);

        const sAm = sh >= 12 ? "PM" : "AM";
        const eAm = eh >= 12 ? "PM" : "AM";
        const sH = sh % 12 || 12;
        const eH = eh % 12 || 12;

        const s = `${sH}:${sm < 10 ? "0" + sm : sm} ${sAm}`;
        const e = `${eH}:${em < 10 ? "0" + em : em} ${eAm}`;
        return `${s}-${e}`;
      }
    }
    return slot;
  };

  const openCustomTimePicker = (mode: "start" | "end") => {
    setTimePickerMode(mode);
    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    const ampm: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    setTempHour(hour);
    setTempMinute(minute);
    setTempAmPm(ampm);
    setShowCustomTimePicker(true);
  };

  const handleTimeSelected = () => {
    const mm = tempMinute < 10 ? `0${tempMinute}` : `${tempMinute}`;
    const timeString = `${tempHour}:${mm} ${tempAmPm}`;
    if (timePickerMode === "start") setStartTime(timeString);
    else setEndTime(timeString);
    setShowCustomTimePicker(false);
  };

  const handleAddTimeSlot = () => {
    if (!startTime || !endTime) {
      window.alert("Please select both start and end times");
      return;
    }
    onAddAvailableSlot(`${startTime}-${endTime}`);
    setStartTime("");
    setEndTime("");
  };

  const consultationLabel = (value: string) =>
    value === "in-person"
      ? "In-Person"
      : value === "online"
        ? "Online"
        : "Both (Online & In-Person)";

  // For selects
  const hoursOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    [],
  );
  const minutesOptions = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    [],
  );

  return (
    <div className="w-full bg-white rounded-xl">
      <div className="p-4">
        {hasUnsavedChanges && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              Fields with red highlights have unsaved changes. Click the
              &quot;Save Changes&quot; button to save your updates.
            </p>
          </div>
        )}

        {/* Availability Toggle */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium text-gray-800">
              Available?{" "}
              {isAvailableChanged && <span className="text-red-500">*</span>}
            </div>

            {/* Switch */}
            <button
              type="button"
              onClick={() => onChangeIsAvailable(!isAvailable)}
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition",
                isAvailable ? "bg-indigo-300" : "bg-gray-300",
              ].join(" ")}
              aria-pressed={isAvailable}
            >
              <span
                className={[
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                  isAvailable ? "translate-x-5" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        {/* Available Days */}
        <div className="mb-6">
          <div className="mb-2 text-base font-medium text-gray-700">
            Available Days{" "}
            {isAvailableDaysChanged && <span className="text-red-500">*</span>}
          </div>
          <div
            className={[
              "rounded-xl border bg-white p-3",
              isAvailableDaysChanged ? "border-red-400" : "border-gray-200",
            ].join(" ")}
          >
            <div className="mb-2 flex flex-wrap gap-2">
              {dayOptions.map((day) => {
                const selected = availableDays.includes(day);
                const activeClass = selected
                  ? isAvailableDaysChanged
                    ? "bg-red-400 border-red-400 text-white"
                    : "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-gray-200 text-gray-800";
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onToggleAvailableDay(day)}
                    className={[
                      "rounded-lg border px-3 py-2 text-center font-medium",
                      activeClass,
                    ].join(" ")}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {availableDays.length === 0 && (
              <div className="text-center text-sm text-gray-500">
                Select the days you are available
              </div>
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <div className="mb-2 text-base font-medium text-gray-700">
            Available Time Slots{" "}
            {isAvailableSlotsChanged && <span className="text-red-500">*</span>}
          </div>

          <div
            className={[
              "rounded-xl border bg-white p-3",
              isAvailableSlotsChanged ? "border-red-400" : "border-gray-200",
            ].join(" ")}
          >
            <div className="mb-3">
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => openCustomTimePicker("start")}
                  className="flex flex-1 items-center rounded-lg border border-gray-200 p-2"
                >
                  <MdAccessTime className="text-indigo-600" size={20} />
                  <span className="ml-2 text-gray-800">
                    {startTime || "Start Time"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openCustomTimePicker("end")}
                  className="flex flex-1 items-center rounded-lg border border-gray-200 p-2"
                >
                  <MdAccessTime className="text-indigo-600" size={20} />
                  <span className="ml-2 text-gray-800">
                    {endTime || "End Time"}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddTimeSlot}
                disabled={!startTime || !endTime}
                className={[
                  "w-full rounded-lg p-2 text-center font-medium",
                  startTime && endTime
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                Add Time Slot
              </button>
            </div>

            <div>
              {availableSlots.length === 0 ? (
                <div className="py-2 text-center text-gray-500">
                  No time slots added yet
                </div>
              ) : (
                <div className="max-h-[120px] overflow-auto">
                  {availableSlots.map((slot, idx) => (
                    <div
                      key={`${slot}-${idx}`}
                      className="flex items-center justify-between border-b border-gray-100 py-2"
                    >
                      <div className="flex items-center">
                        <MdAccessTime className="text-indigo-600" size={16} />
                        <span className="ml-2 text-gray-800">
                          {formatTimeSlot(slot)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveAvailableSlot(slot)}
                        className="text-red-500"
                      >
                        <MdClose size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="mb-6">
          <div className="mb-2 text-base font-medium text-gray-700">
            Cover Image{" "}
            {isCoverImageChanged && <span className="text-red-500">*</span>}
          </div>

          <button
            type="button"
            onClick={onChangeCoverImage}
            disabled={uploadingCoverImage}
            className={[
              "relative flex h-50 w-full items-center justify-center rounded-xl border-2 border-dashed bg-white",
              isCoverImageChanged ? "border-red-400" : "border-gray-300",
              uploadingCoverImage
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            {uploadingCoverImage ? (
              <div className="flex flex-col items-center">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
                <span className="mt-2 text-gray-500">Uploading...</span>
              </div>
            ) : coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="h-full w-full rounded-[10px] object-cover"
              />
            ) : (
              <div className="flex flex-col items-center p-4">
                <MdAdd className="text-indigo-600" size={48} />
                <div className="mt-2 text-gray-500">
                  Upload clinic cover image
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Tap to select an image
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <div className="mb-4 text-lg font-bold text-gray-800">
            Personal Information
          </div>

          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            {/* Age */}
            <div className="flex-1">
              <div className="mb-2 text-base font-medium text-gray-700">
                Age {isAgeChanged && <span className="text-red-500">*</span>}
              </div>
              <div
                className={[
                  "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                  isAgeChanged ? "border-red-400" : "border-gray-200",
                ].join(" ")}
              >
                <MdCalendarMonth
                  className={isAgeChanged ? "text-red-400" : "text-indigo-600"}
                  size={22}
                />
                <input
                  value={age}
                  onChange={(e) => onChangeAge(e.target.value)}
                  placeholder="Enter age"
                  inputMode="numeric"
                  className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="flex-1">
              <div className="mb-2 text-base font-medium text-gray-700">
                Gender{" "}
                {isGenderChanged && <span className="text-red-500">*</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {genderOptions.map((opt) => {
                  const selected = gender === opt;
                  const cls = selected
                    ? isGenderChanged
                      ? "bg-red-400 border-red-400 text-white"
                      : "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-800";
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChangeGender(opt)}
                      className={[
                        "rounded-xl border px-4 py-2.5 font-medium",
                        cls,
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="mb-6">
          <div className="mb-4 text-lg font-bold text-gray-800">
            Professional Information
          </div>

          {/* Registration */}
          <div className="mb-6">
            <div className="mb-2 text-base font-medium text-gray-700">
              Registration Number{" "}
              {isRegistrationNumberChanged && (
                <span className="text-red-500">*</span>
              )}
            </div>
            <div
              className={[
                "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                isRegistrationNumberChanged
                  ? "border-red-400"
                  : "border-gray-200",
              ].join(" ")}
            >
              <MdCardMembership
                className={
                  isRegistrationNumberChanged
                    ? "text-red-400"
                    : "text-indigo-600"
                }
                size={22}
              />
              <input
                value={registrationNumber}
                onChange={(e) => onChangeRegistrationNumber(e.target.value)}
                placeholder="Enter your medical registration number"
                className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* Experience + Fee */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <div className="mb-2 text-base font-medium text-gray-700">
                Experience (years){" "}
                {isExperienceChanged && <span className="text-red-500">*</span>}
              </div>
              <div
                className={[
                  "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                  isExperienceChanged ? "border-red-400" : "border-gray-200",
                ].join(" ")}
              >
                <MdWork
                  className={
                    isExperienceChanged ? "text-red-400" : "text-indigo-600"
                  }
                  size={22}
                />
                <input
                  value={experience}
                  onChange={(e) => onChangeExperience(e.target.value)}
                  placeholder="e.g., 5"
                  inputMode="numeric"
                  className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-2 text-base font-medium text-gray-700">
                Consultation Fee (₹){" "}
                {isConsultationFeeChanged && (
                  <span className="text-red-500">*</span>
                )}
              </div>
              <div
                className={[
                  "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                  isConsultationFeeChanged
                    ? "border-red-400"
                    : "border-gray-200",
                ].join(" ")}
              >
                <MdMoney
                  className={
                    isConsultationFeeChanged
                      ? "text-red-400"
                      : "text-indigo-600"
                  }
                  size={22}
                />
                <input
                  value={consultationFee}
                  onChange={(e) => onChangeConsultationFee(e.target.value)}
                  placeholder="e.g., 500"
                  inputMode="numeric"
                  className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="mb-2 text-base font-medium text-gray-700">
              Professional Description{" "}
              {isDescriptionChanged && <span className="text-red-500">*</span>}
            </div>
            <div
              className={[
                "flex items-start rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                isDescriptionChanged ? "border-red-400" : "border-gray-200",
              ].join(" ")}
            >
              <MdCardMembership
                className={
                  isDescriptionChanged ? "text-red-400" : "text-indigo-600"
                }
                size={22}
              />
              <textarea
                value={description}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder="Describe your professional experience, expertise, and accomplishments..."
                rows={6}
                className="ml-3 min-h-37.5 w-full flex-1 resize-y bg-transparent text-gray-800 outline-none"
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              A detailed professional description helps patients understand your
              expertise and experience better.
            </div>
          </div>

          {/* Consultation Type */}
          <div className="mb-6">
            <div className="mb-2 text-base font-medium text-gray-700">
              Consultation Type{" "}
              {isConsultationTypeChanged && (
                <span className="text-red-500">*</span>
              )}
            </div>
            <div
              className={[
                "overflow-hidden rounded-xl border bg-white shadow-sm",
                isConsultationTypeChanged
                  ? "border-red-400"
                  : "border-gray-200",
              ].join(" ")}
            >
              <div className="p-3">
                {consultationTypeOptions.map((opt) => {
                  const selected = consultationType === opt;
                  const cls = selected
                    ? isConsultationTypeChanged
                      ? "bg-red-400 border-red-400 text-white"
                      : "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-800";
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChangeConsultationType(opt)}
                      className={[
                        "mb-2 w-full rounded-xl border px-4 py-3 text-center font-medium",
                        cls,
                      ].join(" ")}
                    >
                      {consultationLabel(opt)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {consultationType
                ? `Selected: ${consultationLabel(consultationType)}`
                : "Please select a consultation type"}
            </div>
          </div>

          {/* Specializations */}
          <div className="mb-6">
            <div className="mb-2 text-base font-medium text-gray-700">
              Specializations{" "}
              {isSpecializationsChanged && (
                <span className="text-red-500">*</span>
              )}
            </div>
            <div
              className={[
                "rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                isSpecializationsChanged ? "border-red-400" : "border-gray-200",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center">
                <input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add specialization (e.g., Cardiology)"
                  className="w-full flex-1 border-b border-gray-200 pb-2 text-gray-800 outline-none"
                  onFocus={() => {
                    if (filteredSpecializations.length > 0)
                      setShowSpecializationSuggestions(true);
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSpecialization}
                  disabled={!newSpecialization.trim()}
                  className="ml-2 rounded-full bg-indigo-600 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  title="Add"
                >
                  <MdAdd size={20} />
                </button>
              </div>

              {showSpecializationSuggestions && (
                <div className="mb-3 max-h-32 overflow-auto rounded-lg border border-gray-200">
                  {filteredSpecializations.length > 0 ? (
                    filteredSpecializations.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectSpecialization(item)}
                        className="block w-full border-b border-gray-100 px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                      >
                        {item}
                      </button>
                    ))
                  ) : (
                    <div className="py-2 text-center text-gray-500">
                      No matching specializations
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2">
                {specializations.length === 0 ? (
                  <div className="py-2 text-center text-gray-400">
                    No specializations added yet
                  </div>
                ) : (
                  specializations.map((item, idx) => (
                    <div
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between border-b border-gray-100 py-2"
                    >
                      <div className="flex items-center">
                        <FaStethoscope className="text-indigo-600" size={16} />
                        <span className="ml-2 text-gray-800">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveSpecialization(idx)}
                        className="text-red-500"
                      >
                        <MdClose size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="mb-6">
            <div className="mb-2 text-base font-medium text-gray-700">
              Qualifications{" "}
              {isQualificationsChanged && (
                <span className="text-red-500">*</span>
              )}
            </div>
            <div
              className={[
                "rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                isQualificationsChanged ? "border-red-400" : "border-gray-200",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center">
                <input
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="Add qualification (e.g., MBBS, MD)"
                  className="w-full flex-1 border-b border-gray-200 pb-2 text-gray-800 outline-none"
                  onFocus={() => {
                    if (filteredQualifications.length > 0)
                      setShowQualificationSuggestions(true);
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddQualification}
                  disabled={!newQualification.trim()}
                  className="ml-2 rounded-full bg-indigo-600 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  title="Add"
                >
                  <MdAdd size={20} />
                </button>
              </div>

              {showQualificationSuggestions && (
                <div className="mb-3 max-h-32 overflow-auto rounded-lg border border-gray-200">
                  {filteredQualifications.length > 0 ? (
                    filteredQualifications.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectQualification(item)}
                        className="block w-full border-b border-gray-100 px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                      >
                        {item}
                      </button>
                    ))
                  ) : (
                    <div className="py-2 text-center text-gray-500">
                      No matching qualifications
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2">
                {qualifications.length === 0 ? (
                  <div className="py-2 text-center text-gray-400">
                    No qualifications added yet
                  </div>
                ) : (
                  qualifications.map((item, idx) => (
                    <div
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between border-b border-gray-100 py-2"
                    >
                      <div className="flex items-center">
                        <MdSchool className="text-indigo-600" size={16} />
                        <span className="ml-2 text-gray-800">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveQualification(idx)}
                        className="text-red-500"
                      >
                        <MdClose size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Information */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-bold text-gray-800">
              Clinic Information
            </div>
            <button
              type="button"
              onClick={onAddClinic}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white"
            >
              Add Clinic
            </button>
          </div>

          {clinics.map((clinic, index) => (
            <div
              key={index}
              className="mb-6 rounded-xl bg-white border border-gray-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-base font-medium text-gray-700">
                  Clinic {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveClinic(index)}
                  className="rounded-lg bg-red-100 p-2 text-red-500"
                >
                  <MdDelete size={20} />
                </button>
              </div>

              {/* Clinic Name */}
              <div className="mb-4">
                <div className="mb-2 text-base font-medium text-gray-700">
                  Clinic Name{" "}
                  {isClinicsChanged && <span className="text-red-500">*</span>}
                </div>
                <div
                  className={[
                    "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                    isClinicsChanged ? "border-red-400" : "border-gray-200",
                  ].join(" ")}
                >
                  <MdLocalHospital
                    className={
                      isClinicsChanged ? "text-red-400" : "text-indigo-600"
                    }
                    size={22}
                  />
                  <input
                    value={clinic.clinicName}
                    onChange={(e) => onChangeClinicName(e.target.value, index)}
                    placeholder="Enter clinic name"
                    className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                  />
                </div>
              </div>

              {/* Phone + Email */}
              <div className="mb-4 flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <div className="mb-2 text-base font-medium text-gray-700">
                    Clinic Phone{" "}
                    {isClinicsChanged && (
                      <span className="text-red-500">*</span>
                    )}
                  </div>
                  <div
                    className={[
                      "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                      isClinicsChanged ? "border-red-400" : "border-gray-200",
                    ].join(" ")}
                  >
                    <MdPhone
                      className={
                        isClinicsChanged ? "text-red-400" : "text-indigo-600"
                      }
                      size={22}
                    />
                    <input
                      value={clinic.clinicPhone}
                      onChange={(e) =>
                        onChangeClinicPhone(e.target.value, index)
                      }
                      placeholder="e.g., 9876543210"
                      inputMode="tel"
                      className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-2 text-base font-medium text-gray-700">
                    Clinic Email{" "}
                    {isClinicsChanged && (
                      <span className="text-red-500">*</span>
                    )}
                  </div>
                  <div
                    className={[
                      "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                      isClinicsChanged ? "border-red-400" : "border-gray-200",
                    ].join(" ")}
                  >
                    <MdEmail
                      className={
                        isClinicsChanged ? "text-red-400" : "text-indigo-600"
                      }
                      size={22}
                    />
                    <input
                      value={clinic.clinicEmail}
                      onChange={(e) =>
                        onChangeClinicEmail(e.target.value, index)
                      }
                      placeholder="e.g., clinic@example.com"
                      inputMode="email"
                      className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="mb-4">
                <div className="mb-2 text-base font-medium text-gray-700">
                  Clinic Website{" "}
                  {isClinicsChanged && <span className="text-red-500">*</span>}
                </div>
                <div
                  className={[
                    "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                    isClinicsChanged ? "border-red-400" : "border-gray-200",
                  ].join(" ")}
                >
                  <MdLanguage
                    className={
                      isClinicsChanged ? "text-red-400" : "text-indigo-600"
                    }
                    size={22}
                  />
                  <input
                    value={clinic.clinicWebsite}
                    onChange={(e) =>
                      onChangeClinicWebsite(e.target.value, index)
                    }
                    placeholder="e.g., https://www.example.com"
                    inputMode="url"
                    className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                  />
                </div>
              </div>

              {/* Pin + City */}
              <div className="mb-4 flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <div className="mb-2 text-base font-medium text-gray-700">
                    Clinic Pin Code{" "}
                    {isClinicsChanged && (
                      <span className="text-red-500">*</span>
                    )}
                  </div>
                  <div
                    className={[
                      "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                      isClinicsChanged ? "border-red-400" : "border-gray-200",
                    ].join(" ")}
                  >
                    <MdPlace
                      className={
                        isClinicsChanged ? "text-red-400" : "text-indigo-600"
                      }
                      size={22}
                    />
                    <input
                      value={clinic.clinicPinCode}
                      onChange={(e) =>
                        onChangeClinicPinCode(e.target.value.slice(0, 6), index)
                      }
                      placeholder="Enter clinic pin code"
                      inputMode="numeric"
                      maxLength={6}
                      className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <CitySearch
                    allCities={cities}
                    selectedCity={clinic.clinicCity}
                    onCitySelect={(city) => onChangeClinicCity(city, index)}
                    isCityChanged={isClinicsChanged}
                  />
                </div>
              </div>

              {/* Google Maps */}
              <div className="mb-4">
                <div className="mb-2 text-base font-medium text-gray-700">
                  Google Maps Link{" "}
                  {isClinicsChanged && <span className="text-red-500">*</span>}
                </div>
                <div
                  className={[
                    "flex items-center rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                    isClinicsChanged ? "border-red-400" : "border-gray-200",
                  ].join(" ")}
                >
                  <MdMap
                    className={
                      isClinicsChanged ? "text-red-400" : "text-indigo-600"
                    }
                    size={22}
                  />
                  <input
                    value={clinic.clinicGoogleMapsLink}
                    onChange={(e) =>
                      onChangeClinicGoogleMapsLink(e.target.value, index)
                    }
                    placeholder="Paste Google Maps link for your clinic"
                    inputMode="url"
                    className="ml-3 w-full flex-1 bg-transparent text-gray-800 outline-none"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Add a Google Maps link to help patients find your clinic
                  easily
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <div className="mb-2 text-base font-medium text-gray-700">
                  Clinic Address{" "}
                  {isClinicsChanged && <span className="text-red-500">*</span>}
                </div>
                <div
                  className={[
                    "flex items-start rounded-xl border bg-white px-4 py-3.5 shadow-sm",
                    isClinicsChanged ? "border-red-400" : "border-gray-200",
                  ].join(" ")}
                >
                  <MdPlace
                    className={
                      isClinicsChanged ? "text-red-400" : "text-indigo-600"
                    }
                    size={22}
                  />
                  <textarea
                    value={clinic.clinicAddress}
                    onChange={(e) =>
                      onChangeClinicAddress(e.target.value, index)
                    }
                    placeholder="Enter clinic address"
                    rows={3}
                    className="ml-3 min-h-[80px] w-full flex-1 resize-y bg-transparent text-gray-800 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          {clinics.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
              No clinics added yet. Click &quot;Add Clinic&quot; to add your
              first clinic.
            </div>
          )}
        </div>
      </div>

      {/* Custom Time Picker Modal */}
      {showCustomTimePicker && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onMouseDown={() => setShowCustomTimePicker(false)}
        >
          <div
            className="w-[320px] rounded-xl bg-white p-5 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-5 text-center text-lg font-bold text-gray-800">
              Select {timePickerMode === "start" ? "Start" : "End"} Time
            </div>

            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <div className="mb-1 font-medium text-gray-600">Hour</div>
                <select
                  value={tempHour}
                  onChange={(e) => setTempHour(Number(e.target.value))}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-lg"
                >
                  {hoursOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1 font-medium text-gray-600">Minute</div>
                <select
                  value={tempMinute}
                  onChange={(e) => setTempMinute(Number(e.target.value))}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-lg"
                >
                  {minutesOptions.map((m) => (
                    <option key={m} value={m}>
                      {m < 10 ? `0${m}` : m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1 font-medium text-gray-600">AM/PM</div>
                <select
                  value={tempAmPm}
                  onChange={(e) => setTempAmPm(e.target.value as "AM" | "PM")}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-lg"
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
                className="flex-1 rounded-lg bg-gray-200 px-5 py-3 text-center font-medium text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTimeSelected}
                className="flex-1 rounded-lg bg-indigo-600 px-5 py-3 text-center font-medium text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfileForm;
