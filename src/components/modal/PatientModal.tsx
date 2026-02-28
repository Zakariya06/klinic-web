import React from "react";
import {
  FaUser,
  FaUserCircle,
  FaHeartbeat,
  FaFilePdf,
  FaCalendar,
  FaHospital,
  FaStethoscope,
  FaTimes,
} from "react-icons/fa"; 
import { useCustomAlert } from "@/components/CustomAlert";
import { DoctorAppointment } from "../DoctorDashboard";

interface PatientModalProps {
  appointment: DoctorAppointment;
  onClose: () => void;
  onRefresh?: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({
  appointment,
  onClose,
  onRefresh,
}) => {
  const { showAlert } = useCustomAlert();
  const patient = appointment.patient;

  const formatAppointmentTime = (timeSlot: string, timeSlotDisplay: string) => {
    try {
      const appointmentDateUTC = new Date(timeSlot);
      const appointmentDateIST = new Date(
        appointmentDateUTC.getTime() + 5.5 * 60 * 60 * 1000,
      );
      const todayUTC = new Date();
      const todayIST = new Date(todayUTC.getTime() + 5.5 * 60 * 60 * 1000);
      const todayStartIST = new Date(
        todayIST.getFullYear(),
        todayIST.getMonth(),
        todayIST.getDate(),
      );
      const appointmentStartIST = new Date(
        appointmentDateIST.getFullYear(),
        appointmentDateIST.getMonth(),
        appointmentDateIST.getDate(),
      );
      const daysDiff = Math.floor(
        (appointmentStartIST.getTime() - todayStartIST.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysDiff === 0) {
        const timePart = timeSlotDisplay.split(" ").slice(1).join(" ");
        return `Today, ${timePart}`;
      } else if (daysDiff === 1) {
        const timePart = timeSlotDisplay.split(" ").slice(1).join(" ");
        return `Tomorrow, ${timePart}`;
      } else {
        return timeSlotDisplay;
      }
    } catch {
      return timeSlotDisplay;
    }
  };

  const handleViewDocument = (pdfUrl: string, documentName: string) => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Patient Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Patient Header */}
          <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            {patient.profilePicture ? (
              <img
                src={patient.profilePicture}
                alt={patient.name}
                className="w-20 h-20 rounded-full mr-4 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <FaUser size={32} className="text-indigo-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {patient.name}
              </h3>
              <p className="text-gray-600 mb-1">{patient.email}</p>
              <p className="text-gray-500 text-sm">{patient.phone}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUserCircle size={18} className="text-indigo-500 mr-2" />
              Personal Information
            </h4>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Age</span>
                <span className="text-gray-900">
                  {patient.age ? `${patient.age} years` : "Not specified"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Gender
                </span>
                <span className="text-gray-900 capitalize">
                  {patient.gender || "Not specified"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">City</span>
                <span className="text-gray-900">
                  {patient.city || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Address
                </span>
                {patient.address?.address ? (
                  <div>
                    <p className="text-gray-900 text-sm">
                      {patient.address.address}
                    </p>
                    {patient.address.pinCode && (
                      <p className="text-gray-500 text-sm">
                        PIN: {patient.address.pinCode}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Not specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical History */}
          {(patient.medicalHistory || patient.medicalHistoryPdfs?.length) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaHeartbeat size={18} className="text-red-500 mr-2" />
                Medical History
              </h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                {patient.medicalHistory && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Medical Notes
                    </span>
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {patient.medicalHistory}
                    </p>
                  </div>
                )}

                {patient.medicalHistoryPdfs &&
                  patient.medicalHistoryPdfs.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 mb-2 block">
                        Medical Documents
                      </span>
                      <div className="space-y-2">
                        {patient.medicalHistoryPdfs.map((pdf, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-50 rounded-lg p-3"
                          >
                            <FaFilePdf
                              size={16}
                              className="text-red-500 mr-2"
                            />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 font-medium block">
                                Medical Document {index + 1}
                              </span>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {pdf.length > 50
                                  ? pdf.substring(0, 50) + "..."
                                  : pdf}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewDocument(
                                  pdf,
                                  `Medical Document ${index + 1}`,
                                )
                              }
                              className="bg-blue-500 px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <span className="text-white text-xs font-medium">
                                View
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendar size={18} className="text-green-500 mr-2" />
              Appointment Details
            </h4>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Appointment Time
                </span>
                <span className="text-gray-900">
                  {formatAppointmentTime(
                    appointment.timeSlot,
                    appointment.timeSlotDisplay,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Consultation Type
                </span>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      appointment.consultationType === "online"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="text-gray-900 capitalize">
                    {appointment.consultationType}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
                <div
                  className={`px-3 py-1 rounded-full ${
                    appointment.status === "upcoming"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      appointment.status === "upcoming"
                        ? "text-yellow-800"
                        : "text-green-800"
                    }`}
                  >
                    {appointment.status === "upcoming"
                      ? "Upcoming"
                      : "Completed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinic Information (for in-person) */}
          {appointment.consultationType === "in-person" &&
            appointment.clinic && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaHospital size={18} className="text-purple-500 mr-2" />
                  Clinic Information
                </h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">
                    {appointment.clinic.clinicName}
                  </h5>
                  <p className="text-gray-600 text-sm">
                    {appointment.clinic.clinicAddress.address}
                  </p>
                  <p className="text-gray-500 text-sm">
                    PIN: {appointment.clinic.clinicAddress.pinCode}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PatientModal;
