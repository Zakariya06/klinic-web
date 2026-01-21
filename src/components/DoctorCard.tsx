import React from "react";
import {
  FaUserMd,
  FaHospital,
  FaVideo,
  FaMoneyBill,
  FaStethoscope,
  FaMapMarkerAlt,
  FaMale,
  FaFemale,
} from "react-icons/fa";
import RatingDisplay from "./RatingDisplay";
import { useNavigate } from "react-router-dom"; // React Router DOM

interface Doctor {
  _id: string;
  user?: { name?: string };
  coverImage?: string;
  specializations?: string[];
  description?: string;
  consultationFee?: number;
  experience?: number;
  city?: string;
  gender?: "male" | "female";
  consultationType?: "in-person" | "online" | "both";
  clinics?: { clinicName: string }[];
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/doctors/${doctor._id}`);
  };

  const renderConsultationType = () => {
    if (doctor.consultationType === "both") {
      return (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
            <FaHospital size={12} color="#059669" />
            <span className="text-green-700 text-xs ml-1">In-person</span>
          </div>
          <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
            <FaVideo size={12} color="#2563EB" />
            <span className="text-blue-700 text-xs ml-1">Online</span>
          </div>
        </div>
      );
    }

    const isInPerson = doctor.consultationType === "in-person";
    const Icon = isInPerson ? FaHospital : FaVideo;
    const bgColor = isInPerson ? "bg-green-100" : "bg-blue-100";
    const textColor = isInPerson ? "text-green-700" : "text-blue-700";

    return (
      <div className={`flex items-center ${bgColor} px-2 py-1 rounded-full`}>
        <Icon size={12} color={isInPerson ? "#059669" : "#2563EB"} />
        <span className={`${textColor} text-xs ml-1 capitalize`}>
          {doctor.consultationType}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={handleViewDetails}
      className="bg-white mb-4 rounded-xl shadow cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      {doctor.coverImage ? (
        <img
          src={doctor.coverImage}
          alt="Doctor"
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
          <FaUserMd size={48} color="#9CA3AF" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Dr. {doctor.user?.name || "Unknown"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {doctor.specializations?.join(", ")}
            </p>
          </div>
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
            <RatingDisplay
              providerId={doctor._id}
              providerType="doctor"
              size="medium"
            />
          </div>
        </div>

        {/* Description */}
        {doctor.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {doctor.description}
          </p>
        )}

        {/* Professional Info */}
        <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
          {/* Fee */}
          <div className="bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
            <p className="text-xs text-gray-500 mb-1">Consultation Fee</p>
            <div className="flex items-center">
              <FaMoneyBill size={14} color="#16a34a" />
              <span className="text-primary font-bold text-base ml-2">
                ₹{doctor.consultationFee}
              </span>
            </div>
          </div>

          {/* Other Info */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <FaStethoscope size={14} color="#4B5563" />
              <span className="text-gray-600 text-sm">
                {doctor.experience} years exp.
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={14} color="#4B5563" />
              <span className="text-gray-600 text-sm">{doctor.city}</span>
            </div>
            <div className="flex items-center gap-1">
              {doctor.gender === "female" ? (
                <FaFemale size={14} color="#4B5563" />
              ) : (
                <FaMale size={14} color="#4B5563" />
              )}
              <span className="text-gray-600 text-sm capitalize">
                {doctor.gender || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Consultation Type */}
        <div className="mt-3">{renderConsultationType()}</div>

        {/* Primary Clinic */}
        {doctor.clinics && doctor.clinics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Primary Clinic</p>
            <p className="text-sm text-gray-700">
              {doctor.clinics[0].clinicName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
