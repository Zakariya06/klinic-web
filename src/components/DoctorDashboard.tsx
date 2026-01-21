import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaUser,
  FaCalendar,
  FaClock,
  FaCheckCircle,
  FaVideo,
  FaTimes,
  FaStethoscope,
  FaHeartbeat,
  FaHospital,
  FaInfoCircle,
  FaTrash,
  FaSave,
  FaFilePdf,
  FaUserCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import apiClient from "@/api/client";
import { useCustomAlert } from "@/components/CustomAlert";
import VideoCallModal from "@/components/VideoCallModal";
import { TbRotate } from "react-icons/tb";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  age?: number;
  gender?: string;
  medicalHistory?: string;
  medicalHistoryPdfs?: string[];
  address?: {
    address?: string;
    pinCode?: string;
    latitude?: number;
    longitude?: number;
  };
  city?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DoctorAppointment {
  _id: string;
  patient: Patient;
  timeSlot: string;
  timeSlotDisplay: string;
  consultationType: "in-person" | "online";
  status: "upcoming" | "completed";
  prescription?: string;
  prescriptionSent?: boolean;
  clinic?: {
    clinicName: string;
    clinicAddress: {
      address: string;
      pinCode: string;
    };
  };
  notes?: string;
  isPaid: boolean;
  feedbackRequested?: boolean;
  createdAt: string;
}

interface DashboardData {
  pendingAppointments: DoctorAppointment[];
  completedAppointments: DoctorAppointment[];
  totalPending: number;
  totalCompleted: number;
  totalAppointments: number;
}

const DoctorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DoctorAppointment | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedVideoCallAppointment, setSelectedVideoCallAppointment] =
    useState<DoctorAppointment | null>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching doctor dashboard data...");
      const response = await apiClient.get("/api/v1/doctor/dashboard");
      console.log("Doctor dashboard response:", response.data);

      if (
        response.data.upcomingAppointments &&
        response.data.upcomingAppointments.length > 0
      ) {
        console.log(
          "Sample upcoming appointment patient data:",
          response.data.upcomingAppointments[0].patient,
        );
      }
      if (
        response.data.completedAppointments &&
        response.data.completedAppointments.length > 0
      ) {
        console.log(
          "Sample completed appointment patient data:",
          response.data.completedAppointments[0].patient,
        );
      }

      setDashboardData(response.data);
    } catch (error: any) {
      console.error("Error fetching doctor dashboard data:", error);
      showAlert({
        title: "Error",
        message: `Failed to load dashboard data: ${error.response?.data?.message || error.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      console.log("Refreshing doctor dashboard data...");
      const response = await apiClient.get("/api/v1/doctor/dashboard");
      console.log("Doctor dashboard refresh response:", response.data);

      setDashboardData(response.data);
    } catch (error: any) {
      console.error("Error refreshing doctor dashboard data:", error);
      showAlert({
        title: "Error",
        message: `Failed to refresh dashboard data: ${error.response?.data?.message || error.message}`,
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewPatient = (appointment: DoctorAppointment) => {
    console.log("Viewing patient data:", appointment.patient);
    setSelectedAppointment(appointment);
    setShowPatientModal(true);
  };

  const handleAddPrescription = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionText(appointment.prescription || "");
    setNotesText(appointment.notes || "");
    setShowPrescriptionModal(true);
  };

  const handleViewDocument = async (pdfUrl: string, documentName: string) => {
    try {
      console.log("Opening document:", pdfUrl);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening document:", error);
      showAlert({
        title: "Error",
        message: "Failed to open document. Please try again.",
        type: "error",
      });
    }
  };

  const handleSavePrescription = async () => {
    if (
      !selectedAppointment ||
      (!prescriptionText.trim() && !notesText.trim())
    ) {
      showAlert({
        title: "Error",
        message: "Please enter prescription details or notes",
        type: "error",
      });
      return;
    }

    try {
      await apiClient.post(
        `/api/v1/doctor/appointments/${selectedAppointment._id}/prescription`,
        {
          prescription: prescriptionText,
          notes: notesText,
        },
      );

      showAlert({
        title: "Success",
        message: "Prescription and notes saved successfully",
        type: "success",
      });

      setShowPrescriptionModal(false);
      setPrescriptionText("");
      setNotesText("");
      setSelectedAppointment(null);

      await fetchDashboardData();
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to save prescription and notes",
        type: "error",
      });
    }
  };

  const handleDeletePrescription = async () => {
    if (!selectedAppointment) {
      showAlert({
        title: "Error",
        message: "No appointment selected",
        type: "error",
      });
      return;
    }

    showAlert({
      title: "Delete Prescription",
      message:
        "Are you sure you want to delete this prescription? This action cannot be undone.",
      type: "warning",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(
                `/api/v1/doctor/appointments/${selectedAppointment._id}/prescription`,
              );

              showAlert({
                title: "Success",
                message:
                  "Prescription deleted successfully. Appointment moved back to pending.",
                type: "success",
              });

              setShowPrescriptionModal(false);
              setPrescriptionText("");
              setNotesText("");
              setSelectedAppointment(null);

              await fetchDashboardData();
            } catch (error: any) {
              showAlert({
                title: "Error",
                message: `Failed to delete prescription: ${error.response?.data?.message || error.message}`,
                type: "error",
              });
            }
          },
        },
      ],
    });
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

  const handleMarkAsRead = async (appointment: DoctorAppointment) => {
    if (!appointment.prescriptionSent) {
      showAlert({
        title: "Error",
        message: "Prescription must be sent to patient before marking as read",
        type: "error",
      });
      return;
    }

    showAlert({
      title: "Mark as Read",
      message: `Mark appointment with ${appointment.patient.name} as completed? This will move it to completed appointments and request feedback from the patient.`,
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark as Read",
          style: "primary",
          onPress: async () => {
            try {
              console.log("Marking appointment as completed:", appointment._id);
              const response = await apiClient.patch(
                `/api/v1/doctor/appointments/${appointment._id}/status`,
                {
                  status: "completed",
                },
              );
              console.log("Mark as read response:", response.data);

              showAlert({
                title: "Success",
                message:
                  "Appointment marked as completed and feedback requested from patient",
                type: "success",
              });

              await fetchDashboardData();
            } catch (error: any) {
              console.error("Mark as read error:", error);
              showAlert({
                title: "Error",
                message: `Failed to mark appointment as completed: ${error.response?.data?.message || error.message}`,
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleRequestFeedback = async (appointment: DoctorAppointment) => {
    try {
      const response = await apiClient.post(
        `/api/v1/ratings/appointments/${appointment._id}/request-feedback`,
      );
      console.log("Request feedback response:", response.data);

      showAlert({
        title: "Success",
        message: "Feedback request sent to patient successfully",
        type: "success",
      });

      await fetchDashboardData();
    } catch (error: any) {
      console.error("Request feedback error:", error);
      showAlert({
        title: "Error",
        message: `Failed to request feedback: ${error.response?.data?.message || error.message}`,
        type: "error",
      });
    }
  };

  const handleCancelFeedbackRequest = async (
    appointment: DoctorAppointment,
  ) => {
    try {
      const response = await apiClient.delete(
        `/api/v1/ratings/appointments/${appointment._id}/cancel-feedback`,
      );
      console.log("Cancel feedback response:", response.data);

      showAlert({
        title: "Success",
        message: "Feedback request cancelled successfully",
        type: "success",
      });

      await fetchDashboardData();
    } catch (error: any) {
      console.error("Cancel feedback error:", error);
      showAlert({
        title: "Error",
        message: `Failed to cancel feedback request: ${error.response?.data?.message || error.message}`,
        type: "error",
      });
    }
  };

  const handleJoinNow = (appointment: DoctorAppointment) => {
    console.log("Join Now clicked for appointment:", appointment._id);
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
          message: "Appointment cancelled successfully",
          type: "success",
        });

        await fetchDashboardData();
      } catch (error: any) {
        console.error("Error cancelling appointment:", error);
        showAlert({
          title: "Error",
          message: `Failed to cancel appointment: ${error.response?.data?.message || error.message}`,
          type: "error",
        });
      }
    }
  };

  const filterAppointments = (appointments: DoctorAppointment[] = []) =>
    appointments.filter(
      (apt) => apt.consultationType !== "online" || apt.isPaid === true,
    );

  const renderUpcomingAppointment = (item: DoctorAppointment) => (
    <div
      key={item._id}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-4"
    >
      <div className="p-5">
        <div className="flex items-start mb-4">
          <div className="mr-4">
            {item.patient.profilePicture ? (
              <img
                src={item.patient.profilePicture}
                alt={item.patient.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUser size={24} className="text-indigo-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {item.patient.name}
            </h3>
            <p className="text-gray-600 mb-1">{item.patient.email}</p>
            <p className="text-gray-500 text-sm mb-2">{item.patient.phone}</p>
            <p className="text-sm text-gray-500">
              {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full ${
              item.consultationType === "online"
                ? "bg-green-100"
                : "bg-blue-100"
            }`}
          >
            <span
              className={`text-xs font-medium ${
                item.consultationType === "online"
                  ? "text-green-800"
                  : "text-blue-800"
              }`}
            >
              {item.consultationType === "online" ? "Online" : "In-Person"}
            </span>
          </div>
        </div>

        {item.clinic && item.consultationType === "in-person" && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Clinic Location
            </p>
            <p className="text-sm text-gray-600">{item.clinic.clinicName}</p>
            <p className="text-sm text-gray-500">
              {item.clinic.clinicAddress.address}
            </p>
          </div>
        )}

        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => handleViewPatient(item)}
            className="flex-1 py-2.5 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex flex-col items-center"
          >
            <FaUser size={14} className="text-blue-600 mb-1" />
            <span className="text-blue-700 font-medium text-xs">
              View Patient
            </span>
          </button>

          {item.consultationType === "online" && (
            <button
              onClick={() => handleJoinNow(item)}
              className="flex-1 py-2.5 px-3 rounded-lg bg-green-500 hover:bg-green-600 transition-colors shadow-sm flex flex-col items-center"
            >
              <FaVideo size={14} className="text-white mb-1" />
              <span className="text-white font-medium text-xs">Join Now</span>
            </button>
          )}

          <button
            onClick={() => handleMarkAsRead(item)}
            disabled={!item.prescriptionSent}
            className={`flex-1 py-2.5 px-3 rounded-lg flex flex-col items-center transition-colors ${
              item.prescriptionSent
                ? "bg-blue-500 hover:bg-blue-600 shadow-sm"
                : "bg-gray-100 border border-gray-200 cursor-not-allowed"
            }`}
          >
            <FaCheckCircle
              size={14}
              className={`mb-1 ${item.prescriptionSent ? "text-white" : "text-gray-400"}`}
            />
            <span
              className={`font-medium text-xs ${
                item.prescriptionSent ? "text-white" : "text-gray-500"
              }`}
            >
              {item.prescriptionSent ? "Mark as Read" : "No Prescription"}
            </span>
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleCancelAppointment(item)}
            className="flex-1 py-2.5 px-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors shadow-sm flex flex-col items-center"
          >
            <FaTimes size={14} className="text-white mb-1" />
            <span className="text-white font-medium text-xs">
              Cancel Appointment
            </span>
          </button>
        </div>

        <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">
              Payment Status
            </span>
            <div className="flex items-center">
              <div
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  item.isPaid ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  item.isPaid ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.isPaid
                  ? item.consultationType === "online"
                    ? "Paid Online"
                    : "Payment Collected"
                  : item.consultationType === "online"
                    ? "Payment Pending"
                    : "Payment Not Collected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletedAppointment = (item: DoctorAppointment) => (
    <div
      key={item._id}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <div className="flex items-center">
        <div className="mr-3">
          {item.patient.profilePicture ? (
            <img
              src={item.patient.profilePicture}
              alt={item.patient.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FaUser size={20} className="text-indigo-500" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900">
            {item.patient.name}
          </h4>
          <p className="text-gray-600 text-sm">{item.patient.email}</p>
          <p className="text-gray-500 text-xs">
            {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
          </p>

          <div className="mt-2 flex items-center">
            <div
              className={`px-2 py-1 rounded-full ${
                item.feedbackRequested
                  ? "bg-yellow-100 border border-yellow-200"
                  : "bg-gray-100 border border-gray-200"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  item.feedbackRequested ? "text-yellow-700" : "text-gray-600"
                }`}
              >
                {item.feedbackRequested
                  ? "Feedback Requested"
                  : "No Feedback Requested"}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center">
            <div
              className={`px-2 py-1 rounded-full ${
                item.isPaid
                  ? "bg-green-100 border border-green-200"
                  : "bg-red-100 border border-red-200"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  item.isPaid ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.isPaid
                  ? item.consultationType === "online"
                    ? "Paid Online"
                    : "Payment Collected"
                  : item.consultationType === "online"
                    ? "Payment Pending"
                    : "Payment Not Collected"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5 ml-3">
          <button
            onClick={() => handleViewPatient(item)}
            className="bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex flex-col items-center"
          >
            <FaUser size={10} className="text-blue-600 mb-1" />
            <span className="text-blue-700 text-xs font-medium">Patient</span>
          </button>

          <button
            onClick={() => handleAddPrescription(item)}
            className="bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex flex-col items-center"
          >
            <FaStethoscope size={10} className="text-green-600 mb-1" />
            <span className="text-green-700 text-xs font-medium">
              {item.prescription ? "Edit" : "Add Prescription"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  // Modal Components
  const ModalWrapper: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleOverlayClick}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-gray-600 mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="dashboard-heading">Doctor Dashboard</h1>
            <p className="dashboard-subText">
              Manage your appointments and patients
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base"
          >
            <TbRotate
              className={`text-2xl transition-transform duration-500 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FaCalendarAlt size={15} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {dashboardData?.totalAppointments || 0}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <FaClock size={17} className="text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.totalPending || 0}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FaCheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.totalCompleted || 0}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
          {/* Pending Appointments */}
          <div className="flex flex-col justify-between bg-white lg:p-4 p-2.5 rounded-xl shadow-xs">
            <h2 className="text-[#45464E] font-medium text-lg mb-2">
              Pending Appointments ({dashboardData?.totalPending || 0})
            </h2>

            {filterAppointments(dashboardData?.pendingAppointments).length >
            0 ? (
              <div>
                {filterAppointments(dashboardData?.pendingAppointments)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map(renderUpcomingAppointment)}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col bg-linear-to-br from-orange-50 to-amber-50 rounded-3xl p-8 shadow-sm border border-orange-100 text-center">
                <div className="bg-orange-100 rounded-full p-4 mb-4 inline-block">
                  <FaClock size={40} className="text-orange-500" />
                </div>
                <h3 className="text-[#45464E] font-semibold text-lg mb-1">
                  No pending appointments
                </h3>
                <p className="text-gray-600 text-sm max-w-sm">
                  Your pending appointments will appear here. Patients can book
                  consultations with you.
                </p>
              </div>
            )}
          </div>
          {/* Completed Appointments */}
          <div className="flex flex-col justify-between bg-white lg:p-4 p-2.5 rounded-xl shadow-xs">
            <h2 className="text-[#45464E] font-medium text-lg mb-2">
              Recent Consultations
            </h2>

            {filterAppointments(dashboardData?.completedAppointments).length >
            0 ? (
              <div>
                {filterAppointments(dashboardData?.completedAppointments)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map(renderCompletedAppointment)}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100 text-center">
                <div className="bg-green-100 rounded-full p-3 mb-3 inline-block">
                  <FaCheckCircle size={28} className="text-green-600" />
                </div>
                <h3 className="text-[#45464E] font-semibold text-lg mb-1">
                  No completed consultations
                </h3>
                <p className="text-gray-600 text-sm max-w-sm">
                  Completed consultations and prescriptions will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      <ModalWrapper
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Patient Profile"
      >
        {selectedAppointment && (
          <div>
            {/* Patient Header */}
            <div className="flex items-center mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl">
              {selectedAppointment.patient.profilePicture ? (
                <img
                  src={selectedAppointment.patient.profilePicture}
                  alt={selectedAppointment.patient.name}
                  className="w-20 h-20 rounded-full mr-4 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FaUser size={32} className="text-indigo-500" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedAppointment.patient.name}
                </h3>
                <p className="text-gray-600 mb-1">
                  {selectedAppointment.patient.email}
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedAppointment.patient.phone}
                </p>
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
                    {selectedAppointment.patient.age
                      ? `${selectedAppointment.patient.age} years`
                      : "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Gender
                  </span>
                  <span className="text-gray-900 capitalize">
                    {selectedAppointment.patient.gender || "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    City
                  </span>
                  <span className="text-gray-900">
                    {selectedAppointment.patient.city || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 mb-1 block">
                    Address
                  </span>
                  {selectedAppointment.patient.address?.address ? (
                    <div>
                      <p className="text-gray-900 text-sm">
                        {selectedAppointment.patient.address.address}
                      </p>
                      {selectedAppointment.patient.address.pinCode && (
                        <p className="text-gray-500 text-sm">
                          PIN: {selectedAppointment.patient.address.pinCode}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Not specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            {(selectedAppointment.patient.medicalHistory ||
              selectedAppointment.patient.medicalHistoryPdfs?.length) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaHeartbeat size={18} className="text-red-500 mr-2" />
                  Medical History
                </h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                  {selectedAppointment.patient.medicalHistory && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 mb-2 block">
                        Medical Notes
                      </span>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        {selectedAppointment.patient.medicalHistory}
                      </p>
                    </div>
                  )}

                  {selectedAppointment.patient.medicalHistoryPdfs &&
                    selectedAppointment.patient.medicalHistoryPdfs.length >
                      0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 mb-2 block">
                          Medical Documents
                        </span>
                        <div className="space-y-2">
                          {selectedAppointment.patient.medicalHistoryPdfs.map(
                            (pdf, index) => (
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
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Appointment Information */}
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
                      selectedAppointment.timeSlot,
                      selectedAppointment.timeSlotDisplay,
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
                        selectedAppointment.consultationType === "online"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <span className="text-gray-900 capitalize">
                      {selectedAppointment.consultationType}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <div
                    className={`px-3 py-1 rounded-full ${
                      selectedAppointment.status === "upcoming"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        selectedAppointment.status === "upcoming"
                          ? "text-yellow-800"
                          : "text-green-800"
                      }`}
                    >
                      {selectedAppointment.status === "upcoming"
                        ? "Upcoming"
                        : "Completed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Information for In-Person */}
            {selectedAppointment.consultationType === "in-person" &&
              selectedAppointment.clinic && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaHospital size={18} className="text-purple-500 mr-2" />
                    Clinic Information
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedAppointment.clinic.clinicName}
                    </h5>
                    <p className="text-gray-600 text-sm">
                      {selectedAppointment.clinic.clinicAddress.address}
                    </p>
                    <p className="text-gray-500 text-sm">
                      PIN: {selectedAppointment.clinic.clinicAddress.pinCode}
                    </p>
                  </div>
                </div>
              )}

            {/* Quick Actions */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    handleAddPrescription(selectedAppointment);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 transition-colors text-white font-medium text-sm flex flex-col items-center"
                >
                  <FaStethoscope size={16} className="mb-1" />
                  Add Prescription
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Prescription Modal */}
      <ModalWrapper
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Prescription & Notes"
      >
        {selectedAppointment && (
          <div>
            {/* Patient Info */}
            <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Patient: {selectedAppointment.patient.name}
              </h3>
              <p className="text-gray-600 text-sm">
                Date:{" "}
                {formatAppointmentTime(
                  selectedAppointment.timeSlot,
                  selectedAppointment.timeSlotDisplay,
                )}
              </p>
              <p className="text-gray-500 text-sm">
                Type:{" "}
                {selectedAppointment.consultationType === "online"
                  ? "Online Consultation"
                  : "In-Person Consultation"}
              </p>
            </div>

            {/* Prescription Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaStethoscope size={18} className="text-green-500 mr-2" />
                Prescription Details
              </h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <textarea
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Enter detailed prescription including medications, dosage, instructions, and follow-up recommendations..."
                  className="w-full text-gray-900 text-sm leading-relaxed min-h-[120px] p-2 border border-gray-300 rounded resize-y"
                  rows={8}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This prescription will be sent to the patient immediately. Notes
                are private and for your records only.
              </p>
            </div>

            {/* Notes Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Doctor's Notes
              </h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Enter private notes, observations, diagnosis details, or any additional information for your records..."
                  className="w-full text-gray-900 text-sm leading-relaxed min-h-[100px] p-2 border border-gray-300 rounded resize-y"
                  rows={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These notes are private and will not be shared with the patient.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 mb-4">
              <div className="flex space-x-2">
                {(selectedAppointment?.prescription ||
                  prescriptionText.trim()) && (
                  <button
                    onClick={handleDeletePrescription}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-medium text-xs flex flex-col items-center"
                  >
                    <FaTrash size={14} className="mb-1" />
                    Delete
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setPrescriptionText("");
                    setNotesText("");
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200 text-gray-700 font-medium text-xs flex flex-col items-center"
                >
                  <FaTimes size={14} className="mb-1" />
                  Cancel
                </button>

                <button
                  onClick={handleSavePrescription}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-green-500 hover:bg-green-600 transition-colors shadow-sm text-white font-medium text-xs flex flex-col items-center"
                >
                  <FaSave size={14} className="mb-1" />
                  Save & Send
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <FaInfoCircle size={14} className="text-blue-500 mt-1 mr-2" />
                  <div className="flex-1">
                    <p className="text-blue-800 text-xs font-medium mb-1">
                      Important
                    </p>
                    <p className="text-blue-700 text-xs leading-relaxed">
                      The prescription will be sent to the patient immediately.
                      Notes are private and for your records only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Video Call Modal */}
      {selectedVideoCallAppointment && (
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

export default DoctorDashboard;
