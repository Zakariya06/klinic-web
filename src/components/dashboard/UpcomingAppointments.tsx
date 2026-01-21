import React, { useState } from "react";
import {
  FaStethoscope,
  FaFlask,
  FaVideo,
  FaMapMarkerAlt,
  FaCalendar,
  FaTimes,
  FaUserMd,
  FaHome,
  FaCalendarPlus,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Appointment, DashboardData } from "./types";
import client from "../../api/client";
import TimeSlotPicker from "../TimeSlotPicker";
import { AnimatedModal } from "../modal/AnimatedModal";

interface UpcomingAppointmentsProps {
  dashboardData: DashboardData | null;
  onJoinOnlineConsultation: (appointment: Appointment) => void;
  onGetDirections: (appointment: Appointment) => void;
  formatAppointmentTime: (timeSlot: string, timeSlotDisplay: string) => string;
  getAppointmentStatusColor: (appointment: Appointment) => string;
  canJoinNow: (timeSlot: string) => boolean;
  onAppointmentCancelled: () => void;
  cardMode?: boolean;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  dashboardData,
  onJoinOnlineConsultation,
  onGetDirections,
  formatAppointmentTime,
  getAppointmentStatusColor,
  canJoinNow,
  onAppointmentCancelled,
  cardMode = false,
}) => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToSection = (section: "doctors" | "laboratories") => {
    try {
      if (section === "doctors") {
        navigate("/doctors");
      } else {
        navigate("/laboratories");
      }
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const appointmentType =
          appointment.type === "doctor" ? "doctor" : "laboratory";
        await client.delete(`/api/v1/${appointmentType}/${appointment._id}`);
        onAppointmentCancelled();
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment. Please try again.");
      }
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = async (newTimeSlot: string) => {
    if (!selectedAppointment) return;

    setLoading(true);
    try {
      const appointmentType =
        selectedAppointment.type === "doctor" ? "doctor" : "laboratory";
      await client.put(
        `/api/v1/${appointmentType}/${selectedAppointment._id}/reschedule`,
        {
          timeSlot: newTimeSlot,
        },
      );
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      onAppointmentCancelled();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      alert("Failed to reschedule appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  if (cardMode) {
    return (
      <div>
        {upcomingAppointments.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4"
          >
            {/* Cover Image Section */}
            <div className="relative">
              {item.type === "doctor" && item.doctor ? (
                item.doctor.coverImage ? (
                  <img
                    src={item.doctor.coverImage}
                    alt={`Dr. ${item.providerName}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <FaUserMd className="text-indigo-500 text-3xl" />
                  </div>
                )
              ) : item.type === "laboratory" && item.packageCoverImage ? (
                <img
                  src={item.packageCoverImage}
                  alt={item.providerName}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                  <FaFlask className="text-gray-500 text-3xl" />
                </div>
              )}

              {/* Status Badge */}
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-sm"
                style={{
                  backgroundColor: `${getAppointmentStatusColor(item)}40`,
                  color: getAppointmentStatusColor(item),
                }}
              >
                <span className="text-xs font-medium">
                  {item.type === "doctor"
                    ? item.consultationType === "online"
                      ? "Online"
                      : "In-Person"
                    : item.collectionType === "home"
                      ? "Home Collection"
                      : "Lab Visit"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {item.type === "doctor"
                      ? `Dr. ${item.providerName}`
                      : item.providerName}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.serviceName}</p>
                  <div className="flex items-center text-gray-500">
                    <FaCalendar className="mr-2 text-sm" />
                    <span className="text-sm">
                      {formatAppointmentTime(
                        item.timeSlot,
                        item.timeSlotDisplay,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {item.type === "doctor" &&
                  item.consultationType === "online" && (
                    <button
                      onClick={() => onJoinOnlineConsultation(item)}
                      disabled={!canJoinNow(item.timeSlot)}
                      className={`w-full py-3 px-4 rounded-xl flex items-center justify-center transition-colors ${
                        canJoinNow(item.timeSlot)
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <FaVideo className="mr-2" />
                      {canJoinNow(item.timeSlot) ? "Join Now" : "Join Later"}
                    </button>
                  )}

                {item.type === "doctor" &&
                  item.consultationType === "in-person" &&
                  item.clinic && (
                    <button
                      onClick={() => onGetDirections(item)}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      Get Directions
                    </button>
                  )}

                {item.type === "laboratory" &&
                  item.collectionType === "lab" && (
                    <button
                      onClick={() => onGetDirections(item)}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      Get Directions to Lab
                    </button>
                  )}

                {item.type === "laboratory" &&
                  item.collectionType === "home" && (
                    <div className="w-full py-3 px-4 rounded-xl bg-orange-100 flex items-center justify-center">
                      <FaHome className="mr-2 text-orange-600" />
                      <span className="text-orange-700 font-medium">
                        Home Collection Scheduled
                      </span>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRescheduleAppointment(item)}
                    className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                  >
                    <FaCalendar className="mr-2" />
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(item)}
                    className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {upcomingAppointments.length > 0 ? (
        <div className="overflow-y-auto max-h-125">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
            {upcomingAppointments.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl cursor-pointer shadow-xs border border-gray-100 overflow-hidden"
              >
                {/* Cover Image Section */}
                <div className="relative">
                  {item.type === "doctor" && item.doctor ? (
                    item.doctor.coverImage ? (
                      <img
                        src={item.doctor.coverImage}
                        alt={`Dr. ${item.providerName}`}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-linear-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                        <FaUserMd className="text-indigo-500 text-3xl" />
                      </div>
                    )
                  ) : item.type === "laboratory" && item.packageCoverImage ? (
                    <img
                      src={item.packageCoverImage}
                      alt={item.providerName}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      <FaFlask className="text-gray-500 text-3xl" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: `${getAppointmentStatusColor(item)}40`,
                      color: getAppointmentStatusColor(item),
                    }}
                  >
                    <span className="text-xs font-medium">
                      {item.type === "doctor"
                        ? item.consultationType === "online"
                          ? "Online"
                          : "In-Person"
                        : item.collectionType === "home"
                          ? "Home Collection"
                          : "Lab Visit"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold capitalize text-gray-900 mb-1">
                        {item.type === "doctor"
                          ? `Dr. ${item.providerName}`
                          : item.providerName}
                      </h3>
                      <p className="text-gray-600 mb-2 first-letter:uppercase">
                        {item.serviceName}
                      </p>
                      <div className="flex items-center text-gray-500">
                        <FaCalendar className="mr-2 text-sm" />
                        <span className="text-sm">
                          {formatAppointmentTime(
                            item.timeSlot,
                            item.timeSlotDisplay,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {item.type === "doctor" &&
                      item.consultationType === "online" && (
                        <button
                          onClick={() => onJoinOnlineConsultation(item)}
                          disabled={!canJoinNow(item.timeSlot)}
                          className={`w-full py-3 px-4 rounded-xl cursor-pointer flex items-center justify-center transition-colors ${
                            canJoinNow(item.timeSlot)
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaVideo className="mr-2" />
                          {canJoinNow(item.timeSlot)
                            ? "Join Now"
                            : "Join Later"}
                        </button>
                      )}

                    {item.type === "doctor" &&
                      item.consultationType === "in-person" &&
                      item.clinic && (
                        <button
                          onClick={() => onGetDirections(item)}
                          className="w-full py-3 px-4 rounded-xl cursor-pointer flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                          <FaMapMarkerAlt className="mr-2" />
                          Get Directions
                        </button>
                      )}

                    {item.type === "laboratory" &&
                      item.collectionType === "lab" && (
                        <button
                          onClick={() => onGetDirections(item)}
                          className="w-full py-3 px-4 rounded-xl flex items-center justify-center cursor-pointer bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                        >
                          <FaMapMarkerAlt className="mr-2" />
                          Get Directions to Lab
                        </button>
                      )}

                    {item.type === "laboratory" &&
                      item.collectionType === "home" && (
                        <div className="w-full py-3 px-4 rounded-xl bg-orange-100 flex items-center justify-center">
                          <FaHome className="mr-2 text-orange-600" />
                          <span className="text-orange-700 font-medium">
                            Home Collection Scheduled
                          </span>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRescheduleAppointment(item)}
                        className="flex-1 py-3 px-4 cursor-pointer rounded-xl flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                      >
                        <FaCalendar className="mr-2" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(item)}
                        className="flex-1 py-3 px-4 cursor-pointer rounded-xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-sm border border-blue-100 text-center">
          <div className="bg-blue-100 rounded-full p-4 mb-4 inline-flex">
            <FaCalendarPlus className="text-indigo-500 text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">
            Ready for your next consultation?
          </h3>
          <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
            Book appointments with top doctors and laboratories near you. Your
            health journey starts here!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleNavigateToSection("doctors")}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base"
            >
              <FaStethoscope />
              Find Doctors
            </button>
            <button
              onClick={() => handleNavigateToSection("laboratories")}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base"
            >
              <FaFlask />
              Book Lab Tests
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <AnimatedModal
          open={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
        >
          <TimeSlotPicker
            visible={showRescheduleModal}
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedAppointment(null);
            }}
            onSelectTimeSlot={handleRescheduleConfirm}
            providerId={
              selectedAppointment.type === "doctor"
                ? selectedAppointment.doctor?._id
                : selectedAppointment.lab?._id
            }
            providerType={selectedAppointment.type}
            loading={loading}
          />
        </AnimatedModal>
      )}
    </div>
  );
};

export default UpcomingAppointments;
