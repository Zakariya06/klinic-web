import React, { useState, useEffect, useCallback } from "react";
import {
  FaSpinner,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaVideo,
  FaFilePdf,
  FaFileAlt,
  FaNotesMedical,
  FaClipboardList,
  FaRobot,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/client";
import { useCustomAlert } from "@/components/CustomAlert";
import { useRatingSystem } from "@/hooks/useRatingSystem";

// Import modular components and types
import {
  UpcomingAppointments,
  PreviousAppointments,
  CollectedSamples,
  PreviousLabTests,
  UserDashboardModals,
  Appointment,
  DashboardData,
  PreviousData,
  CollectedData,
} from "./dashboard";

// Import your modal components
import RatingModal from "./RatingModal";
import VideoCallModal from "./VideoCallModal";
import ToctorFloatingButton from "./ToctorFloatingButton";
import ToctorAIChat from "./ToctorAIChat";
import { TbRotate } from "react-icons/tb";
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [previousAppointments, setPreviousAppointments] =
    useState<PreviousData | null>(null);
  const [previousLabTests, setPreviousLabTests] = useState<PreviousData | null>(
    null,
  );
  const [collectedSamples, setCollectedSamples] =
    useState<CollectedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPdfsModal, setShowPdfsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showLabReportsListModal, setShowLabReportsListModal] = useState(false);
  const [allLabReports, setAllLabReports] = useState<Appointment[]>([]);

  // Modal data
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [pdfsData, setPdfsData] = useState<any>(null);
  const [notesData, setNotesData] = useState<any>(null);

  // Video call states
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedVideoCallAppointment, setSelectedVideoCallAppointment] =
    useState<Appointment | null>(null);

  // AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);

  const { showAlert, AlertComponent } = useCustomAlert();

  // Rating system - Only check previous/completed appointments for ratings
  const completedAppointments = [
    ...(previousAppointments?.appointments || []),
    ...(previousLabTests?.labTests || []),
  ];

  const { showRatingModal, ratingModalData, handleRatingSubmitted } =
    useRatingSystem(completedAppointments);

  // Handle rating submission and refresh data
  const handleRatingSubmittedWithRefresh = useCallback(async () => {
    await handleRatingSubmitted();
    // Refresh dashboard data after rating submission
    await Promise.all([
      fetchDashboardData(),
      fetchPreviousAppointments(),
      fetchPreviousLabTests(),
      fetchCollectedSamples(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRatingSubmitted]);

  // useCallback to avoid stale closures
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/v1/user/dashboard");
      setDashboardData(response.data);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load dashboard data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  const fetchPreviousAppointments = useCallback(async (page: number = 1) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/appointments/previous?page=${page}&limit=5`,
      );
      setPreviousAppointments(response.data);
    } catch (error) {
      // Optionally show error toast
    }
  }, []);

  const fetchPreviousLabTests = useCallback(async (page: number = 1) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/lab-tests/previous?page=${page}&limit=5`,
      );
      setPreviousLabTests(response.data);
    } catch (error) {
      // Optionally show error toast
    }
  }, []);

  const fetchCollectedSamples = useCallback(async (page: number = 1) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/lab-tests/collected?page=${page}&limit=5`,
      );
      setCollectedSamples(response.data);
    } catch (error) {
      // Optionally show error toast
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchPreviousAppointments(),
      fetchPreviousLabTests(),
      fetchCollectedSamples(),
    ]);
    setRefreshing(false);
  }, [
    fetchDashboardData,
    fetchPreviousAppointments,
    fetchPreviousLabTests,
    fetchCollectedSamples,
  ]);

  useEffect(() => {
    // Use IIFE to call async functions in useEffect
    (async () => {
      await fetchDashboardData();
      await fetchPreviousAppointments();
      await fetchPreviousLabTests();
      await fetchCollectedSamples();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const viewPrescription = async (appointmentId: string) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/appointments/${appointmentId}/prescription`,
      );
      setPrescriptionData(response.data);
      setShowPrescriptionModal(true);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load prescription",
        type: "error",
      });
    }
  };

  const viewLabReport = async (testId: string) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/lab-tests/${testId}/report`,
      );
      setReportData(response.data);
      setShowReportModal(true);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load lab report",
        type: "error",
      });
    }
  };

  const viewLabPdfs = async (testId: string) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/lab-tests/${testId}/pdfs`,
      );
      setPdfsData(response.data);
      setShowPdfsModal(true);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load lab report PDFs",
        type: "error",
      });
    }
  };

  const viewLabNotes = async (testId: string) => {
    try {
      const response = await apiClient.get(
        `/api/v1/user/lab-tests/${testId}/notes`,
      );
      setNotesData(response.data);
      setShowNotesModal(true);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load lab notes",
        type: "error",
      });
    }
  };

  const fetchAllLabReports = async () => {
    try {
      const response = await apiClient.get(
        "/api/v1/user/lab-tests/previous?page=1&limit=50",
      );
      setAllLabReports(response.data.labTests || []);
      setShowLabReportsListModal(true);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: "Failed to load lab reports",
        type: "error",
      });
    }
  };

  const showPrescriptionsModal = () => {
    const appointmentsWithPrescriptions =
      previousAppointments?.appointments?.filter(
        (apt: any) => apt.prescription,
      ) || [];
    if (appointmentsWithPrescriptions.length > 0) {
      setPrescriptionData({ appointments: appointmentsWithPrescriptions });
      setShowPrescriptionModal(true);
    } else {
      showAlert({
        title: "No Prescriptions",
        message: "You don't have any prescriptions yet.",
        type: "info",
      });
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

  const getAppointmentStatusColor = (appointment: Appointment) => {
    if (appointment.type === "doctor") {
      // @ts-ignore
      return appointment.consultationType === "online" ? "#10B981" : "#3B82F6";
    }
    return "#8B5CF6";
  };

  const canJoinNow = (timeSlot: string) => {
    // TODO: Implement actual logic if needed
    return true;
  };

  // Add handler for AI chat
  const handleOpenAIChat = () => {
    navigate("/chat-ai");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen  flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center">
          <FaSpinner className="animate-spin text-primary text-3xl mb-4" />
          <div className="text-gray-600 text-lg font-medium">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {/* Header with refresh button */}
      <div className="w-full flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h1 className="dashboard-heading">Welcome Back</h1>
          <p className="dashboard-subText">Your Health Dashboard</p>
        </div>

        <div className="flex items-center justify-end flex-wrap space-x-4">
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

          <button
            onClick={() => navigate("/orders")}
            className="flex items-center px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base"
          >
            <FaShoppingCart className="mr-2" />
            <span className="font-semibold">Orders</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-xl lg:py-4 lg:px-5 p-3">
        <h3 className="text-[#45464E] font-medium text-lg mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/doctors")}
            className="flex flex-col items-center px-2 py-6  bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <FaVideo className="text-blue-600 text-2xl mb-2" />
            <span className="font-medium text-[#8B8D97] text-sm">
              Book Appointment
            </span>
          </button>

          <button
            onClick={() => navigate("/laboratories")}
            className="flex flex-col items-center p-4 bxg2 py-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <FaFilePdf className="text-purple-600 text-2xl mb-2" />
            <span className="font-medium text-[#8B8D97] text-sm">
              Lab Tests
            </span>
          </button>

          <button
            onClick={() => navigate("/medicines")}
            className="flex flex-col items-center p-4x 2 py-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer"
          >
            <FaNotesMedical className="text-green-600 text-2xl mb-2" />
            <span className="font-medium text-[#8B8D97] text-sm">
              Medicines
            </span>
          </button>

          <button
            onClick={handleOpenAIChat}
            className="flex flex-col items-center p-4 bxg2 py-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <FaRobot className="text-indigo-600 text-2xl mb-2" />
            <span className="font-medium text-[#8B8D97] text-sm">
              AI Assistant
            </span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:-translate-y-0.5 duration-300">
          <div className="text-3xl font-bold mb-2">
            {dashboardData?.upcomingAppointments?.length || 0}
          </div>
          <div className="text-blue-100">Upcoming</div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:-translate-y-0.5 duration-300">
          <div className="text-3xl font-bold mb-2">
            {previousAppointments?.appointments?.length || 0}
          </div>
          <div className="text-green-100">Completed</div>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:-translate-y-0.5 duration-300">
          <div className="text-3xl font-bold mb-2">
            {collectedSamples?.labTests?.length || 0}
          </div>
          <div className="text-purple-100">Samples</div>
        </div>

        <div className="bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:-translate-y-0.5 duration-300">
          <div className="text-3xl font-bold mb-2">
            {previousLabTests?.labTests?.length || 0}
          </div>
          <div className="text-indigo-100">Lab Tests</div>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments Card */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[#45464E] font-medium text-lg">
              Upcoming Appointments
            </h2>
            <span className="px-3 py-1 bg-[#FFCC9129] text-[#130F26] text-sm font-medium rounded-full">
              {dashboardData?.upcomingAppointments?.length || 0}
            </span>
          </div>

          <UpcomingAppointments
            dashboardData={dashboardData}
            onJoinOnlineConsultation={handleJoinOnlineConsultation}
            onGetDirections={handleGetDirections}
            formatAppointmentTime={formatAppointmentTime}
            getAppointmentStatusColor={getAppointmentStatusColor}
            canJoinNow={canJoinNow}
            onAppointmentCancelled={handleRefresh}
          />
        </div>

        {/* Previous Appointments Card */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#45464E] font-medium text-lg ">
              Previous Appointments
            </h2>
            <button
              onClick={showPrescriptionsModal}
              className="flex items-center px-3 py-1.5 bg-green-50 text-[#5570F1] text-sm font-medium rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
            >
              <HiOutlineDocumentArrowUp className="mr-1" />
              View All Prescriptions
            </button>
          </div>

          <PreviousAppointments
            previousAppointments={previousAppointments}
            formatAppointmentTime={formatAppointmentTime}
            onViewPrescription={viewPrescription}
            onShowPrescriptionsModal={showPrescriptionsModal}
          />
        </div>

        {/* Collected Samples Card */}
        <div className="bg-white rounded-xl p-6">
          <CollectedSamples
            collectedSamples={collectedSamples}
            formatAppointmentTime={formatAppointmentTime}
          />
        </div>

        {/* Previous Lab Tests Card */}
        <div className="bg-white rounded-xl p-6">
          <PreviousLabTests
            previousLabTests={
              previousLabTests
                ? {
                    ...previousLabTests,
                    labTests: previousLabTests.labTests || [],
                  }
                : null
            }
            formatAppointmentTime={formatAppointmentTime}
            onViewLabReport={viewLabReport}
            onViewLabPdfs={viewLabPdfs}
            onViewLabNotes={viewLabNotes}
            onShowAllReportsModal={fetchAllLabReports}
          />
        </div>
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

      {/* Rating Modal */}
      {ratingModalData && showRatingModal && (
        <RatingModal
          visible={showRatingModal}
          onClose={handleRatingSubmittedWithRefresh}
          appointmentId={ratingModalData.appointmentId}
          providerId={ratingModalData.providerId}
          providerName={ratingModalData.providerName}
          providerType={ratingModalData.providerType}
          onRatingSubmitted={handleRatingSubmittedWithRefresh}
        />
      )}

      {/* All Dashboard Modals */}
      <UserDashboardModals
        showPrescriptionModal={showPrescriptionModal}
        showReportModal={showReportModal}
        showPdfsModal={showPdfsModal}
        showNotesModal={showNotesModal}
        showLabReportsListModal={showLabReportsListModal}
        prescriptionData={prescriptionData}
        reportData={reportData}
        pdfsData={pdfsData}
        notesData={notesData}
        allLabReports={allLabReports}
        onClosePrescriptionModal={() => setShowPrescriptionModal(false)}
        onCloseReportModal={() => setShowReportModal(false)}
        onClosePdfsModal={() => setShowPdfsModal(false)}
        onCloseNotesModal={() => setShowNotesModal(false)}
        onCloseLabReportsListModal={() => setShowLabReportsListModal(false)}
        onViewLabReport={viewLabReport}
        onViewLabPdfs={viewLabPdfs}
        onViewLabNotes={viewLabNotes}
        formatAppointmentTime={formatAppointmentTime}
      />

      <AlertComponent />
    </div>
  );
};

export default UserDashboard;
