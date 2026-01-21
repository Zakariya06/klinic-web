import React, { useMemo } from "react";
import { FaRegFilePdf, FaEye, FaTimesCircle, FaPlus } from "react-icons/fa";
import { MdLocationOn, MdMedicalServices } from "react-icons/md";
import { RiCalendar2Line } from "react-icons/ri";
import { HiOutlineMapPin } from "react-icons/hi2";

import CitySearch from "./CitySearch";
import { UserRole } from "@/types/userTypes";

interface UserProfileFormProps {
  age: string;
  gender: string;
  address: string;
  pinCode: string;
  city: string;
  medicalHistory: string;
  medicalHistoryPdfs: string[] | null;
  uploadingPdf: boolean;
  cities: string[];
  userRole?: UserRole;

  onChangeAge: (text: string) => void;
  onChangeGender: (gender: string) => void;
  onChangeAddress: (text: string) => void;
  onChangePinCode: (text: string) => void;
  onChangeCity: (city: string) => void;
  onChangeMedicalHistory: (text: string) => void;
  onDocumentPick: () => void; // in web: open file picker upstream
  onDocumentDelete: (index: number) => void;

  savedValues: {
    age: string;
    gender: string;
    address: string;
    pinCode: string;
    city: string;
    medicalHistory: string;
    medicalHistoryPdfs: string[];
  };
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  age,
  gender,
  address,
  pinCode,
  city,
  medicalHistory,
  medicalHistoryPdfs,
  uploadingPdf,
  cities,
  userRole = UserRole.USER,
  onChangeAge,
  onChangeGender,
  onChangeAddress,
  onChangePinCode,
  onChangeCity,
  onChangeMedicalHistory,
  onDocumentPick,
  onDocumentDelete,
  savedValues,
}) => {
  const genderOptions = ["Male", "Female"];
  const isDeliveryPartner = userRole === UserRole.DELIVERY_BOY;

  // Open PDF in a new tab (web equivalent of Linking.openURL)
  const openPdfExternally = (pdfUrl: string) => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  // Unsaved changes checks
  const isAgeChanged = age !== savedValues.age;
  const isGenderChanged = gender !== savedValues.gender;
  const isAddressChanged = address !== savedValues.address;
  const isPinCodeChanged = pinCode !== savedValues.pinCode;
  const isCityChanged = city !== savedValues.city;
  const isMedicalHistoryChanged = medicalHistory !== savedValues.medicalHistory;
  const isPdfsChanged =
    JSON.stringify(medicalHistoryPdfs ?? []) !==
    JSON.stringify(savedValues.medicalHistoryPdfs ?? []);

  const showUnsavedBanner = useMemo(() => {
    if (
      isAgeChanged ||
      isGenderChanged ||
      isAddressChanged ||
      isPinCodeChanged ||
      isCityChanged
    )
      return true;
    if (!isDeliveryPartner && (isMedicalHistoryChanged || isPdfsChanged))
      return true;
    return false;
  }, [
    isAgeChanged,
    isGenderChanged,
    isAddressChanged,
    isPinCodeChanged,
    isCityChanged,
    isDeliveryPartner,
    isMedicalHistoryChanged,
    isPdfsChanged,
  ]);

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Unsaved changes banner */}
      {showUnsavedBanner && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">
            Fields with red highlights have unsaved changes. Click the "Save
            Changes" button to save your updates.
          </p>
        </div>
      )}
 

      {/* Age + Gender */}
      <div className="flex sm:flex-row flex-col gap-3 mb-2.5">
        {/* Age */}
        <div className="flex-1">
          <label className="block text-gray-700 font-medium text-base mb-2">
            Age{isAgeChanged && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div
            className={[
              "flex items-center border rounded-xl px-4 py-3.5 bg-white shadow-sm",
              isAgeChanged ? "border-red-400" : "border-gray-200",
            ].join(" ")}
          >
            <RiCalendar2Line
              size={22}
              className={isAgeChanged ? "text-red-400" : "text-indigo-500"}
            />
            <input
              value={age}
              onChange={(e) => onChangeAge(e.target.value)}
              placeholder="Enter age"
              inputMode="numeric"
              className="ml-3 flex-1 text-gray-800 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="flex-1">
          <label className="block text-gray-700 font-medium text-base mb-2">
            Gender
            {isGenderChanged && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex flex-wrap">
            {genderOptions.map((option) => {
              const selected = gender === option;
              const cls = selected
                ? isGenderChanged
                  ? "bg-red-400 border-red-400 text-white"
                  : "border-black text-black"
                : "bg-white border-gray-200 text-gray-800";

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChangeGender(option)}
                  className={`mr-2 px-4 py-2.5 rounded-xl border font-medium cursor-pointer ${cls}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pin Code + City */}
      <div className="flex sm:flex-row flex-col gap-3 mb-6.5">
        {/* Pin Code */}
        <div className="flex-1">
          <label className="block text-gray-700 font-medium text-base mb-2">
            Pin Code
            {isPinCodeChanged && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div
            className={[
              "flex items-center border rounded-xl px-4 py-3.5 bg-white shadow-sm",
              isPinCodeChanged ? "border-red-400" : "border-gray-200",
            ].join(" ")}
          >
            <HiOutlineMapPin
              size={22}
              className={isPinCodeChanged ? "text-red-400" : "text-indigo-500"}
            />
            <input
              value={pinCode}
              onChange={(e) => onChangePinCode(e.target.value)}
              placeholder="Enter your area pin code"
              inputMode="numeric"
              maxLength={6}
              className="ml-3 flex-1 text-gray-800 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* CitySearch */}
        <div className="flex-1">
          <CitySearch
            allCities={cities}
            selectedCity={city}
            onCitySelect={onChangeCity}
            isCityChanged={isCityChanged}
          />
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium text-base mb-2">
          Address
          {isAddressChanged && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div
          className={[
            "flex items-start border rounded-xl px-4 py-3.5 bg-white shadow-sm",
            isAddressChanged ? "border-red-400" : "border-gray-200",
          ].join(" ")}
        >
          <MdLocationOn
            size={22}
            className={isAddressChanged ? "text-red-400" : "text-indigo-500"}
            style={{ marginTop: 2 }}
          />
          <textarea
            value={address}
            onChange={(e) => onChangeAddress(e.target.value)}
            placeholder="Enter your address"
            rows={3}
            className="ml-3 flex-1 text-gray-800 outline-none bg-transparent resize-none min-h-[80px]"
          />
        </div>
      </div>

      {/* Medical History (hidden for delivery partners) */}
      {!isDeliveryPartner && (
        <>
          {/* Medical History */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium text-base mb-2">
              Medical History
              {isMedicalHistoryChanged && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div
              className={[
                "flex items-start border rounded-xl px-4 py-3.5 bg-white shadow-sm",
                isMedicalHistoryChanged ? "border-red-400" : "border-gray-200",
              ].join(" ")}
            >
              <MdMedicalServices
                size={22}
                className={
                  isMedicalHistoryChanged ? "text-red-400" : "text-indigo-500"
                }
                style={{ marginTop: 2 }}
              />
              <textarea
                value={medicalHistory}
                onChange={(e) => onChangeMedicalHistory(e.target.value)}
                placeholder="Enter your medical history"
                rows={4}
                className="ml-3 flex-1 text-gray-800 outline-none bg-transparent resize-none min-h-25"
              />
            </div>
          </div>

          {/* PDFs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-700 font-medium text-base">
                Medical History PDFs
                {isPdfsChanged && <span className="text-red-500 ml-1">*</span>}
              </div>

              <button
                type="button"
                onClick={onDocumentPick}
                disabled={uploadingPdf}
                className="flex items-center  cursor-pointer text-blue-600 hover:text-gray-400 duration-300 px-3 py-1.5 rounded-lg disabled:opacity-60 text-base"
              >
                <FaPlus size={14} />
                <span className="font-medium ml-2">
                  {uploadingPdf ? "Uploading..." : "Add PDF"}
                </span>
              </button>
            </div>

            <div className="max-h-50 overflow-auto">
              {(medicalHistoryPdfs ?? []).map((pdf, index) => (
                <div
                  key={index}
                  className={[
                    "flex items-center justify-between border rounded-xl px-4 py-3 mb-2 bg-white shadow-sm",
                    isPdfsChanged ? "border-red-400" : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <FaRegFilePdf
                      size={20}
                      className={
                        isPdfsChanged ? "text-red-400" : "text-indigo-500"
                      }
                    />
                    <span className="ml-3 text-gray-800 flex-1 truncate">
                      PDF {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => openPdfExternally(pdf)}
                      className="mr-2 p-2 hover:bg-gray-50 rounded-lg"
                      aria-label="View PDF"
                    >
                      <FaEye
                        size={18}
                        className="text-indigo-500 cursor-pointer hover:text-indigo-400 duration-500"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDocumentDelete(index)}
                      className="p-2 hover:bg-gray-50 rounded-lg"
                      aria-label="Remove PDF"
                    >
                      <FaTimesCircle
                        size={18}
                        className="text-red-400 cursor-pointer hover:text-red-300 duration-300"
                      />
                    </button>
                  </div>
                </div>
              ))}

              {(medicalHistoryPdfs ?? []).length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500">
                  No PDFs uploaded yet.
                </div>
              )}
            </div>

            {uploadingPdf && (
              <div className="mt-2 flex items-center">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-gray-500 ml-2">Uploading PDF...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileForm;
