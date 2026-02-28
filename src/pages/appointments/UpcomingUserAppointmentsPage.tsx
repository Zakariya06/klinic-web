import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaMapMarkerAlt,
  FaCalendar,
  FaTimes,
  FaHome,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { TbRotate } from "react-icons/tb";
import apiClient from "@/api/client";
import { useCustomAlert } from "@/components/CustomAlert";
import { AnimatedModal } from "@/components/modal/AnimatedModal";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { Appointment, DashboardData } from "@/components/dashboard/types"; // adjust path
import VideoCallModal from "@/components/VideoCallModal";

const UpcomingAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useCustomAlert();

  // State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal states
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedVideoCallAppointment, setSelectedVideoCallAppointment] =
    useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRescheduleAppointment, setSelectedRescheduleAppointment] =
    useState<Appointment | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/v1/user/dashboard");
      setDashboardData(response.data);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load upcoming appointments.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Derived data for pagination
  const allAppointments = dashboardData?.upcomingAppointments || [];
  const totalItems = allAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppointments = allAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Action handlers (identical to those in UserDashboard)
  const handleJoinOnlineConsultation = (appointment: Appointment) => {
    showAlert({
      title: "Join Online Consultation",
      message: `Ready to join your consultation with ${appointment.providerName}?`,
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join Now",
          style: "primary",
          onPress: () => {
            setSelectedVideoCallAppointment(appointment);
            setShowVideoCallModal(true);
          },
        },
      ],
    });
  };

  const handleCloseVideoCall = () => {
    setShowVideoCallModal(false);
    setSelectedVideoCallAppointment(null);
  };

  const handleGetDirections = (appointment: Appointment) => {
    let addressData: any = null;
    let locationName = "";

    if (appointment.type === "doctor" && appointment.clinic) {
      addressData = appointment.clinic.clinicAddress;
      locationName = "clinic";
    } else if (appointment.type === "laboratory" && appointment.lab) {
      addressData =
        appointment.lab.laboratoryAddress || appointment.lab.address;
      locationName = "laboratory";
    }

    if (addressData) {
      const { latitude, longitude, address, googleMapsLink } = addressData;

      if (googleMapsLink) {
        window.open(googleMapsLink, "_blank");
      } else if (latitude && longitude) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, "_blank");
      } else if (address) {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(url, "_blank");
      } else {
        showAlert({
          title: "No Location Data",
          message: `Location information is not available for this ${locationName}.`,
          type: "warning",
        });
      }
    } else {
      showAlert({
        title: "No Location Data",
        message: `Location information is not available for this ${locationName}.`,
        type: "warning",
      });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const appointmentType =
          appointment.type === "doctor" ? "doctor" : "laboratory";
        await apiClient.delete(`/api/v1/${appointmentType}/${appointment._id}`);
        showAlert({
          title: "Success",
          message: "Appointment cancelled successfully.",
          type: "success",
        });
        // Refresh data
        fetchDashboardData();
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        showAlert({
          title: "Error",
          message: "Failed to cancel appointment. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedRescheduleAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = async (newTimeSlot: string) => {
    if (!selectedRescheduleAppointment) return;

    setRescheduleLoading(true);
    try {
      const appointmentType =
        selectedRescheduleAppointment.type === "doctor"
          ? "doctor"
          : "laboratory";
      await apiClient.put(
        `/api/v1/${appointmentType}/${selectedRescheduleAppointment._id}/reschedule`,
        { timeSlot: newTimeSlot },
      );
      setShowRescheduleModal(false);
      setSelectedRescheduleAppointment(null);
      showAlert({
        title: "Success",
        message: "Appointment rescheduled successfully.",
        type: "success",
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      showAlert({
        title: "Error",
        message: "Failed to reschedule appointment. Please try again.",
        type: "error",
      });
    } finally {
      setRescheduleLoading(false);
    }
  };

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
    } catch (e) {
      return timeSlotDisplay;
    }
  };

  const canJoinNow = (timeSlot: string) => {
    // Implement actual logic if needed; placeholder returns true
    return true;
  };

  const getTypeLabel = (appointment: Appointment) => {
    if (appointment.type === "doctor") {
      return appointment.consultationType === "online" ? "Online" : "In-Person";
    } else {
      return appointment.collectionType === "home"
        ? "Home Collection"
        : "Lab Visit";
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center">
          <FaSpinner className="animate-spin text-primary text-3xl mb-4" />
          <div className="text-gray-600 text-lg font-medium">
            Loading upcoming appointments...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Upcoming Appointments
          </h1>
          <p className="text-gray-600">
            {totalItems} appointment{totalItems !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-xl hover:bg-[#5570F1]/85 transition-colors disabled:opacity-50"
          >
            <TbRotate
              className={`text-xl ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No upcoming appointments found.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appointment, index) => {
                  const rowNumber =
                    (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {rowNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {appointment.type === "doctor"
                            ? `Dr. ${appointment.providerName}`
                            : appointment.providerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {appointment.serviceName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.type === "doctor"
                              ? appointment.consultationType === "online"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                              : appointment.collectionType === "home"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {getTypeLabel(appointment)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatAppointmentTime(
                          appointment.timeSlot,
                          appointment.timeSlotDisplay,
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* Join Online */}
                          {appointment.type === "doctor" &&
                            appointment.consultationType === "online" && (
                              <button
                                onClick={() =>
                                  handleJoinOnlineConsultation(appointment)
                                }
                                disabled={!canJoinNow(appointment.timeSlot)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                                  canJoinNow(appointment.timeSlot)
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                <FaVideo />
                                {canJoinNow(appointment.timeSlot)
                                  ? "Join"
                                  : "Later"}
                              </button>
                            )}

                          {/* Get Directions */}
                          {(appointment.type === "doctor" &&
                            appointment.consultationType === "in-person" &&
                            appointment.clinic) ||
                          (appointment.type === "laboratory" &&
                            appointment.collectionType === "lab") ? (
                            <button
                              onClick={() => handleGetDirections(appointment)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                            >
                              <FaMapMarkerAlt />
                              Directions
                            </button>
                          ) : null}

                          {/* Home Collection (non-action indicator) */}
                          {appointment.type === "laboratory" &&
                            appointment.collectionType === "home" && (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                                <FaHome />
                                Home
                              </span>
                            )}

                          {/* Reschedule */}
                          <button
                            onClick={() =>
                              handleRescheduleAppointment(appointment)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
                          >
                            <FaCalendar />
                            Reschedule
                          </button>

                          {/* Cancel */}
                          <button
                            onClick={() => handleCancelAppointment(appointment)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                          >
                            <FaTimes />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 rounded-lg bg-[#5570F1] text-white">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {selectedVideoCallAppointment && showVideoCallModal && (
        <VideoCallModal
          visible={showVideoCallModal}
          onClose={handleCloseVideoCall}
          appointmentId={selectedVideoCallAppointment._id}
          userRole="patient"
          appointmentData={{
            doctorName: selectedVideoCallAppointment.providerName,
            appointmentTime: selectedVideoCallAppointment.timeSlotDisplay,
          }}
        />
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedRescheduleAppointment && (
        <AnimatedModal
          open={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedRescheduleAppointment(null);
          }}
        >
          <TimeSlotPicker
            visible={showRescheduleModal}
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedRescheduleAppointment(null);
            }}
            onSelectTimeSlot={handleRescheduleConfirm}
            providerId={
              selectedRescheduleAppointment.type === "doctor"
                ? selectedRescheduleAppointment.doctor?._id
                : selectedRescheduleAppointment.lab?._id
            }
            providerType={selectedRescheduleAppointment.type}
            loading={rescheduleLoading}
          />
        </AnimatedModal>
      )}

      <AlertComponent />
    </div>
  );
};

export default UpcomingAppointmentsPage;
