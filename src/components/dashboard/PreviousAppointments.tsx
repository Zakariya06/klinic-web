import React from "react";
import { FaUserMd, FaFlask, FaStethoscope, FaClock } from "react-icons/fa";
import { Appointment, PreviousData } from "./types";

interface PreviousAppointmentsProps {
  previousAppointments: PreviousData | null;
  formatAppointmentTime: (timeSlot: string, timeSlotDisplay: string) => string;
  onViewPrescription: (appointmentId: string) => void;
  onShowPrescriptionsModal: () => void;
}

const PreviousAppointments: React.FC<PreviousAppointmentsProps> = ({
  previousAppointments,
  formatAppointmentTime,
  onViewPrescription,
  onShowPrescriptionsModal,
}) => {
  const renderPreviousAppointment = (item: Appointment) => (
    <div
      key={item._id}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <div className="flex items-start gap-3">
        {/* Cover image / icon */}
        <div>
          {item.type === "doctor" && item.doctor?.coverImage ? (
            <img
              src={item.doctor.coverImage}
              alt="Doctor"
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : item.type === "doctor" ? (
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaUserMd className="text-indigo-500 text-lg" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaFlask className="text-purple-500 text-lg" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {item.type === "doctor"
              ? `Dr. ${item.providerName}`
              : item.providerName}
          </h3>
          <p className="text-gray-600 text-sm">{item.serviceName}</p>
          <p className="text-gray-500 text-xs">
            {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
          </p>
        </div>

        {/* Action */}
        {item.type === "doctor" && item.prescription && (
          <button
            onClick={() => onViewPrescription(item._id)}
            className="bg-blue-100 px-3 py-1 rounded-lg text-blue-700 text-xs font-medium hover:bg-blue-200 transition"
          >
            View Prescription
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      {/* List / Empty State */}
      {previousAppointments?.appointments &&
      previousAppointments.appointments.length > 0 ? (
        <div>
          {previousAppointments.appointments.map(renderPreviousAppointment)}
        </div>
      ) : (
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl px-4 py-8 shadow-sm border border-green-100 flex flex-col items-center text-center">
          <div className="bg-green-100 rounded-full p-3 mb-3">
            <FaClock className="text-emerald-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-1">
            Your consultation history
          </h3>
          <p className="text-gray-600 text-sm">
            Previous appointments and prescriptions will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviousAppointments;
