import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaUser,
  FaTimes,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaClock,
} from "react-icons/fa";
import { TbRotate } from "react-icons/tb";
import apiClient from "@/api/client";
import { useCustomAlert } from "@/components/CustomAlert";
import VideoCallModal from "@/components/VideoCallModal";
import { DoctorAppointment } from "@/components/DoctorDashboard";
import PatientModal from "@/components/modal/PatientModal";

interface DoctorDashboardResponse {
  pendingAppointments: DoctorAppointment[];
  completedAppointments: DoctorAppointment[];
  totalPending: number;
  totalCompleted: number;
  totalAppointments: number;
}

const DoctorUpcomingAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useCustomAlert();

  // State
  const [dashboardData, setDashboardData] =
    useState<DoctorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatientAppointment, setSelectedPatientAppointment] =
    useState<DoctorAppointment | null>(null);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedVideoCallAppointment, setSelectedVideoCallAppointment] =
    useState<DoctorAppointment | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/v1/doctor/dashboard");
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
  const allAppointments = dashboardData?.pendingAppointments || [];
  const filteredAppointments = allAppointments.filter(
    (apt) => apt.consultationType !== "online" || apt.isPaid === true,
  );
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Action handlers (reused from DoctorDashboard)
  const handleViewPatient = (appointment: DoctorAppointment) => {
    setSelectedPatientAppointment(appointment);
    setShowPatientModal(true);
  };

  const handleJoinNow = (appointment: DoctorAppointment) => {
    setSelectedVideoCallAppointment(appointment);
    setShowVideoCallModal(true);
  };

  const handleCloseVideoCall = () => {
    setShowVideoCallModal(false);
    setSelectedVideoCallAppointment(null);
  };

  const handleCancelAppointment = async (appointment: DoctorAppointment) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this appointment? This action cannot be undone.",
      )
    ) {
      try {
        await apiClient.delete(
          `/api/v1/doctor/appointments/${appointment._id}`,
        );
        showAlert({
          title: "Success",
          message: "Appointment cancelled successfully.",
          type: "success",
        });
        fetchDashboardData();
      } catch (error: any) {
        showAlert({
          title: "Error",
          message: `Failed to cancel appointment: ${
            error.response?.data?.message || error.message
          }`,
          type: "error",
        });
      }
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
    } catch {
      return timeSlotDisplay;
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
            {totalItems} appointment{totalItems !== 1 ? "s" : ""} pending
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
            onClick={() => navigate("/doctor-dashboard")}
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
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Contact</th>
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
                        <div className="flex items-center">
                          {appointment.patient.profilePicture ? (
                            <img
                              src={appointment.patient.profilePicture}
                              alt={appointment.patient.name}
                              className="w-8 h-8 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <FaUser size={12} className="text-blue-600" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {appointment.patient.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">
                          {appointment.patient.phone}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {appointment.patient.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.consultationType === "online"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {appointment.consultationType === "online"
                            ? "Online"
                            : "In-Person"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-center">
                          <FaCalendar
                            className="mr-2 text-gray-400"
                            size={12}
                          />
                          {formatAppointmentTime(
                            appointment.timeSlot,
                            appointment.timeSlotDisplay,
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewPatient(appointment)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"
                          >
                            <FaUser size={10} />
                            View
                          </button>

                          {appointment.consultationType === "online" && (
                            <button
                              onClick={() => handleJoinNow(appointment)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                            >
                              <FaVideo size={10} />
                              Join
                            </button>
                          )}

                          <button
                            onClick={() => handleCancelAppointment(appointment)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                          >
                            <FaTimes size={10} />
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

      {/* Patient Modal */}
      {showPatientModal && selectedPatientAppointment && (
        <PatientModal
          appointment={selectedPatientAppointment}
          onClose={() => {
            setShowPatientModal(false);
            setSelectedPatientAppointment(null);
          }}
          onRefresh={fetchDashboardData}
        />
      )}

      {/* Video Call Modal */}
      {selectedVideoCallAppointment && showVideoCallModal && (
        <VideoCallModal
          visible={showVideoCallModal}
          onClose={handleCloseVideoCall}
          appointmentId={selectedVideoCallAppointment._id}
          userRole="doctor"
          appointmentData={{
            patientName: selectedVideoCallAppointment.patient.name,
            appointmentTime: selectedVideoCallAppointment.timeSlotDisplay,
          }}
        />
      )}

      <AlertComponent />
    </div>
  );
};

export default DoctorUpcomingAppointmentsPage;
