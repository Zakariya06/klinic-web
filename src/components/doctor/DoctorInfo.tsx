import React, { useMemo } from "react";
import {
  FaFemale,
  FaGraduationCap,
  FaHandshake,
  FaHospital,
  FaLanguage,
  FaMale,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStethoscope,
  FaUserMd,
  FaVideo,
} from "react-icons/fa";

import RatingDisplay from "@/components/RatingDisplay";
import type { Doctor } from "@/services/doctorService";

interface DoctorInfoProps {
  doctor: Doctor;
  handleBookAppointment: () => void;
  isBookingEnabled: boolean;
}

export default function DoctorInfo({
  doctor,
  handleBookAppointment,
  isBookingEnabled,
}: DoctorInfoProps) {
  const consultationTypeBadge = useMemo(() => {
    if (doctor.consultationType === "both") {
      return (
        <div className="flex flex-wrap">
          <div className="mr-1 mb-1 inline-flex items-center rounded-full bg-green-100 px-2 py-1">
            <FaHospital className="h-3 w-3 text-emerald-600" />
            <span className="ml-1 text-xs font-medium text-green-700">
              In-Person
            </span>
          </div>
          <div className="mb-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-1">
            <FaVideo className="h-3 w-3 text-blue-600" />
            <span className="ml-1 text-xs font-medium text-blue-700">
              Online
            </span>
          </div>
        </div>
      );
    }

    const isInPerson = doctor.consultationType === "in-person";
    return (
      <div
        className={[
          "inline-flex items-center self-start rounded-full px-2 py-1",
          isInPerson ? "bg-green-100" : "bg-blue-100",
        ].join(" ")}
      >
        {isInPerson ? (
          <FaHospital className="h-3 w-3 text-emerald-600" />
        ) : (
          <FaVideo className="h-3 w-3 text-blue-600" />
        )}
        <span
          className={[
            "ml-1 text-xs font-medium",
            isInPerson ? "text-green-700" : "text-blue-700",
          ].join(" ")}
        >
          {isInPerson ? "In-Person" : "Online"}
        </span>
      </div>
    );
  }, [doctor.consultationType]);

  return (
    <div>
      <div className="flex lg:flex-row flex-col lg:items-center justify-between mb-3 gap-2">
        <div className="flex items-center">
          {doctor.user?.profilePicture ? (
            <img
              src={doctor.user.profilePicture}
              alt={`Dr. ${doctor.user?.name ?? ""}`}
              className="h-24 w-24 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="  flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-100">
              <FaUserMd className="h-10 w-10 text-gray-400" />
            </div>
          )}

          <div className="ml-3 flex-1">
            <div className="lg:text-xl text-base font-medium text-[#45464E]">
              Dr. {doctor.user?.name}
            </div>
            <div className="text-base text-[#6E7079]">
              {doctor.specializations?.join(", ")}
            </div>

            <div className="mt-1 flex items-center">
              <RatingDisplay
                providerId={doctor._id}
                providerType="doctor"
                size="medium"
              />

              {doctor.gender && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  {doctor.gender === "female" ? (
                    <FaFemale className="h-3.5 w-3.5 text-gray-500" />
                  ) : (
                    <FaMale className="h-3.5 w-3.5 text-gray-500" />
                  )}
                  <span className="ml-1 text-sm capitalize text-blue-700">
                    ({doctor.gender})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Floating CTA */}
        <button
          type="button"
          onClick={handleBookAppointment}
          disabled={!isBookingEnabled}
          className={[
            "rounded-lg cursor-pointer w-fit z-10 px-4 py-2 text-base text-white hover:bg-[#5570f1]/85 duration-300 ml-auto disabled:bg-[#5570f1]/50 disabled:cursor-not-allowed",
            isBookingEnabled ? "bg-[#5570f1]" : "bg-[#5570f1]/50 ",
          ].join(" ")}
        >
          {isBookingEnabled ? "Book Appointment" : "Complete All Selections"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 my-4">
        {/* About Section */}
        {doctor.description && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="lg:text-lg text-base font-medium text-[#45464E]">
              About Doctor
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-2 text-base flex-1">
              {doctor.description}
            </div>
          </div>
        )}

        {/* Qualifications Section */}
        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div>
            <h2 className="lg:text-lg text-base font-medium text-[#45464E]">
              Qualifications
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {doctor.qualifications.map(
                (qualification: string, index: number) => (
                  <div key={index} className="mb-2 flex items-center last:mb-0">
                    <FaGraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                    <div className="ml-3 flex-1 text-gray-700">
                      {qualification}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div>
        <div className="lg:text-lg text-base font-medium text-[#45464E]">
          Additional Information
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-2">
          <div className="flex flex-wrap">
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="mr-6 mb-3 flex items-center">
                <FaLanguage className="h-4 w-4 text-indigo-500" />
                <span className="ml-2 font-medium text-gray-700">
                  Languages:
                </span>
                <span className="ml-1 text-gray-600">
                  {doctor.languages.join(", ")}
                </span>
              </div>
            )}

            {doctor.city && (
              <div className="mb-3 flex items-center">
                <FaMapMarkerAlt className="h-4 w-4 text-indigo-500" />
                <span className="ml-2 font-medium text-gray-700">
                  Location:
                </span>
                <span className="ml-1 text-gray-600">{doctor.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Info Cards */}
      <div className="mt-6 flex justify-between gap-3 lg:overflow-visible overflow-x-auto">
        {/* Experience Card */}
        <div className="flex-1 rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-blue-100 p-4">
          <div className="mb-2 flex items-center">
            <FaStethoscope className="h-4 w-4 text-blue-600" />
            <span className="ml-2 font-medium text-blue-800">Experience</span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {doctor.experience} Years
          </div>
        </div>

        {/* Consultation Fee Card */}
        <div className="flex-1 rounded-xl border border-green-200 bg-linear-to-br from-green-50 to-green-100 p-4">
          <div className="mb-2 flex items-center">
            <FaMoneyBillWave className="h-4 w-4 text-emerald-600" />
            <span className="ml-2 font-medium text-green-800">
              Consultation
            </span>
          </div>
          <div className="text-lg font-bold text-green-900">
            ₹{doctor.consultationFee}
          </div>
        </div>

        {/* Consultation Type Card */}
        <div className="flex-1 rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 to-purple-100 p-4">
          <div className="mb-2 flex items-center">
            <FaHandshake className="h-4 w-4 text-purple-600" />
            <span className="ml-2 font-medium text-purple-800">Available</span>
          </div>
          <div className="mt-1">{consultationTypeBadge}</div>
        </div>
      </div>
    </div>
  );
}
