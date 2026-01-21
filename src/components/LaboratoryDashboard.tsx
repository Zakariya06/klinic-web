import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaFlask,
  FaCheckCircle,
  FaUser,
  FaUpload,
  FaTimes,
  FaFilePdf,
  FaHeartbeat,
  FaMedkit,
  FaCalendar,
  FaEdit,
  FaTrash,
  FaSave,
  FaInfoCircle,
  FaPlus,
  FaSpinner,
  FaFileMedical,
  FaFileDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/client";
import { useCustomAlert } from "@/components/CustomAlert";
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
  prescriptionUrl?: string;
  prescriptionPdfs?: string[];
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

interface LabTest {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface LaboratoryService {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  tests: LabTest[];
  price: number;
  category: string;
}

interface LabAppointment {
  _id: string;
  patient: Patient;
  laboratoryService: LaboratoryService;
  timeSlot: string;
  timeSlotDisplay: string;
  collectionType: "lab" | "home";
  status:
    | "pending"
    | "processing"
    | "completed"
    | "upcoming"
    | "collected"
    | "marked-as-read";
  selectedTests: number[];
  reportResult?: string;
  notes?: string;
  testReportPdfs?: string[];
  reportsUploaded?: boolean;
  isPaid: boolean;
  feedbackRequested?: boolean;
  createdAt: string;
}

interface DashboardData {
  pendingAppointments: LabAppointment[];
  processingAppointments: LabAppointment[];
  completedAppointments: LabAppointment[];
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalAppointments: number;
}

const LaboratoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<LabAppointment | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [notesText, setNotesText] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [testReportPdfs, setTestReportPdfs] = useState<string[]>([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<string>("");
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching laboratory dashboard data...");
      const response = await apiClient.get("/api/v1/laboratory/dashboard");
      console.log("Laboratory dashboard response:", response.data);
      setDashboardData(response.data);
    } catch (error: any) {
      console.error("Error fetching laboratory dashboard data:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      showAlert({
        title: "Error",
        message: `Failed to load dashboard data: ${
          error.response?.data?.message || error.message
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      console.log("Refreshing laboratory dashboard data...");
      const response = await apiClient.get("/api/v1/laboratory/dashboard");
      console.log("Laboratory dashboard refresh response:", response.data);

      setDashboardData(response.data);
    } catch (error: any) {
      console.error("Error refreshing laboratory dashboard data:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      showAlert({
        title: "Error",
        message: `Failed to refresh dashboard data: ${
          error.response?.data?.message || error.message
        }`,
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSampleCollected = async (appointment: LabAppointment) => {
    showAlert({
      title: "Sample Collected",
      message: `Mark sample as collected for ${appointment.patient.name}? This will move the appointment to processing.`,
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Collected",
          style: "primary",
          onPress: async () => {
            try {
              await apiClient.patch(
                `/api/v1/laboratory/appointments/${appointment._id}/sample-collected`,
              );

              showAlert({
                title: "Success",
                message:
                  "Sample marked as collected. Appointment moved to processing.",
                type: "success",
              });

              await fetchDashboardData();
            } catch (error: any) {
              showAlert({
                title: "Error",
                message: `Failed to mark sample as collected: ${
                  error.response?.data?.message || error.message
                }`,
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleViewPatient = (appointment: LabAppointment) => {
    console.log("Viewing patient data:", appointment.patient);
    setSelectedAppointment(appointment);
    setShowPatientModal(true);
  };

  const handleAddReport = (appointment: LabAppointment) => {
    setSelectedAppointment(appointment);
    setReportText(appointment.reportResult || "");
    setNotesText(appointment.notes || "");
    setTestReportPdfs(appointment.testReportPdfs || []);
    setShowReportModal(true);
  };

  const handleDocumentPick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";

    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        console.log("Document selected:", file.name);

        const formData = new FormData();
        formData.append("pdf", file);

        const response = await apiClient.post("/api/v1/upload-pdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.url) {
          setTestReportPdfs([...testReportPdfs, response.data.url]);
          showAlert({
            title: "Success",
            message: "Test report PDF uploaded successfully",
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        showAlert({
          title: "Error",
          message: "Failed to upload document",
          type: "error",
        });
      }
    };

    input.click();
  };

  const handleRemovePdf = (index: number) => {
    showAlert({
      title: "Remove PDF",
      message: "Are you sure you want to remove this PDF from the upload list?",
      type: "warning",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedPdfs = testReportPdfs.filter((_, i) => i !== index);
            setTestReportPdfs(updatedPdfs);
            showAlert({
              title: "Success",
              message: "PDF removed from upload list",
              type: "success",
            });
          },
        },
      ],
    });
  };

  const handleViewDocument = (pdfUrl: string, documentName: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleViewPrescription = (prescriptionUrl: string) => {
    window.open(prescriptionUrl, "_blank");
  };

  const handleDownloadPrescription = (prescriptionUrl: string) => {
    const link = document.createElement("a");
    link.href = prescriptionUrl;
    link.download = prescriptionUrl.split("/").pop() || "prescription.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPrescriptionModal = (prescriptionUrl: string) => {
    setSelectedPrescription(prescriptionUrl);
    setShowPrescriptionModal(true);
  };

  const handleSaveReport = async () => {
    if (
      !selectedAppointment ||
      (!reportText.trim() && testReportPdfs.length === 0)
    ) {
      showAlert({
        title: "Error",
        message: "Please enter report details or upload test PDFs",
        type: "error",
      });
      return;
    }

    try {
      await apiClient.post(
        `/api/v1/laboratory/appointments/${selectedAppointment._id}/report`,
        {
          reportResult: reportText,
          notes: notesText,
          testReportPdfs: testReportPdfs,
        },
      );

      showAlert({
        title: "Success",
        message: "Lab report and test PDFs saved successfully",
        type: "success",
      });

      setShowReportModal(false);
      setReportText("");
      setNotesText("");
      setTestReportPdfs([]);
      setSelectedAppointment(null);

      await fetchDashboardData();
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to save lab report and test PDFs",
        type: "error",
      });
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedAppointment) {
      showAlert({
        title: "Error",
        message: "No appointment selected",
        type: "error",
      });
      return;
    }

    showAlert({
      title: "Delete Report",
      message:
        "Are you sure you want to delete this report? This will move the appointment back to processing and remove all uploaded reports.",
      type: "warning",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(
                `/api/v1/laboratory/appointments/${selectedAppointment._id}/report`,
              );

              showAlert({
                title: "Success",
                message:
                  "Report deleted successfully. Appointment moved back to processing.",
                type: "success",
              });

              setShowReportModal(false);
              setReportText("");
              setNotesText("");
              setTestReportPdfs([]);
              setSelectedAppointment(null);

              await fetchDashboardData();
            } catch (error: any) {
              showAlert({
                title: "Error",
                message: `Failed to delete report: ${
                  error.response?.data?.message || error.message
                }`,
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleMarkAsRead = async (appointment: LabAppointment) => {
    const hasReportDetails =
      appointment.reportResult && appointment.reportResult.trim() !== "";
    const hasPdfs =
      appointment.testReportPdfs && appointment.testReportPdfs.length > 0;

    if (!hasReportDetails || !hasPdfs) {
      showAlert({
        title: "Error",
        message:
          "Both report details and test PDFs must be uploaded before marking as read",
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
                `/api/v1/laboratory/appointments/${appointment._id}/mark-as-read`,
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
              console.error("Error response:", error.response?.data);
              console.error("Error status:", error.response?.status);
              showAlert({
                title: "Error",
                message: `Failed to mark appointment as completed: ${
                  error.response?.data?.message || error.message
                }`,
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
      const appointmentDate = new Date(timeSlot);
      const today = new Date();

      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const appointmentStart = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
      );

      const daysDiff = Math.floor(
        (appointmentStart.getTime() - todayStart.getTime()) /
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

  const getSelectedTestsNames = (appointment: LabAppointment) => {
    if (
      !appointment.laboratoryService?.tests ||
      appointment.laboratoryService.tests.length === 0
    ) {
      return "No tests available";
    }

    if (!appointment.selectedTests || appointment.selectedTests.length === 0) {
      return appointment.laboratoryService.tests
        .map((test) => test.name)
        .join(", ");
    }

    return appointment.selectedTests
      .map((index) => appointment.laboratoryService.tests[index]?.name)
      .filter(Boolean)
      .join(", ");
  };

  const filterAppointments = (appointments: LabAppointment[] = []) =>
    appointments.filter(
      (apt) => apt.collectionType !== "home" || apt.isPaid === true,
    );

  const renderPendingAppointment = (item: LabAppointment) => (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mb-4">
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
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <FaUser size={24} className="text-purple-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {item.patient.name}
            </h3>
            <p className="text-gray-600 text-xs">{item.patient.email}</p>
            <p className="text-gray-500 text-xs">{item.patient.phone}</p>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <p className="text-xs text-gray-500">
              {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
            </p>

            <div
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor:
                  item.collectionType === "home" ? "#F59E0B20" : "#8B5CF620",
              }}
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: item.collectionType === "home" ? "#F59E0B" : "#8B5CF6",
                }}
              >
                {item.collectionType === "home" ? "Home" : "Lab Visit"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Test Package
          </p>
          <p className="text-sm text-gray-600">
            {item.laboratoryService?.name || "Service not available"}
          </p>
          <p className="text-sm text-gray-500">{getSelectedTestsNames(item)}</p>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => handleViewPatient(item)}
            className="flex-1 py-2.5 cursor-pointer px-3 rounded-lg bg-purple-50 border border-purple-200 flex flex-col items-center hover:bg-purple-100 transition-colors"
          >
            <FaUser size={14} className="text-purple-500 mb-1" />
            <span className="text-purple-700 font-medium text-xs">
              View Patient
            </span>
          </button>

          <button
            onClick={() => handleSampleCollected(item)}
            className="flex-1 py-2.5 px-3 cursor-pointer rounded-lg bg-orange-500 flex flex-col items-center shadow-sm hover:bg-orange-600 transition-colors"
          >
            <FaFlask size={14} className="text-white mb-1" />
            <span className="text-white font-medium text-xs">
              Sample Collected
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
                  ? item.collectionType === "home"
                    ? "Paid Online"
                    : "Payment Collected"
                  : item.collectionType === "home"
                    ? "Payment Pending"
                    : "Payment Not Collected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessingAppointment = (item: LabAppointment) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
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
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <FaUser size={24} className="text-orange-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {item.patient.name}
            </h3>
            <p className="text-gray-600 text-xs">{item.patient.email}</p>
            <p className="text-gray-500 text-xs">{item.patient.phone}</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <p className="text-xs text-gray-500">
              {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
            </p>
            <div
              className={`px-3 py-1 rounded-full ${
                item.status === "completed" ? "bg-green-100" : "bg-orange-100"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  item.status === "completed"
                    ? "text-green-700"
                    : "text-orange-700"
                }`}
              >
                {item.status === "completed" ? "Completed" : "Processing"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Test Package
          </p>
          <p className="text-sm text-gray-600">
            {item.laboratoryService?.name || "Service not available"}
          </p>
          <p className="text-sm text-gray-500">{getSelectedTestsNames(item)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleViewPatient(item)}
            className="flex-1 py-2.5 px-3 cursor-pointer rounded-lg bg-orange-50 border border-orange-200 flex flex-col items-center hover:bg-orange-100 transition-colors"
          >
            <FaUser size={14} className="text-orange-500 mb-1" />
            <span className="text-orange-700 font-medium text-xs">
              View Patient
            </span>
          </button>

          {(() => {
            const hasReportDetails =
              item.reportResult && item.reportResult.trim() !== "";
            const hasPdfs =
              item.testReportPdfs && item.testReportPdfs.length > 0;
            const reportsComplete = hasReportDetails && hasPdfs;

            if (item.status === "completed") {
              return (
                <button
                  onClick={() => handleMarkAsRead(item)}
                  className="flex-1 py-2.5 px-3 cursor-pointer rounded-lg bg-green-500 flex flex-col items-center shadow-sm hover:bg-green-600 transition-colors"
                >
                  <FaCheckCircle size={14} className="text-white mb-1" />
                  <span className="text-white font-medium text-xs">
                    Mark as Read
                  </span>
                </button>
              );
            } else {
              return (
                <button
                  onClick={() => handleAddReport(item)}
                  className="flex-1 py-2.5 px-3  cursor-pointer rounded-lg bg-blue-500 flex flex-col items-center shadow-sm hover:bg-blue-600 transition-colors"
                >
                  <FaUpload size={14} className="text-white mb-1" />
                  <span className="text-white font-medium text-xs">
                    {!hasReportDetails && !hasPdfs
                      ? "Upload Reports"
                      : !hasReportDetails
                        ? "Add Details"
                        : "Add PDFs"}
                  </span>
                </button>
              );
            }
          })()}
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
                  ? item.collectionType === "home"
                    ? "Paid Online"
                    : "Payment Collected"
                  : item.collectionType === "home"
                    ? "Payment Pending"
                    : "Payment Not Collected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletedAppointment = (item: LabAppointment) => (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className="mr-3">
          {item.patient.profilePicture ? (
            <img
              src={item.patient.profilePicture}
              alt={item.patient.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FaUser size={20} className="text-green-500" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {item.patient.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {item.laboratoryService?.name || "Service not available"}
          </p>
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
                  ? item.collectionType === "home"
                    ? "Paid Online"
                    : "Payment Collected"
                  : item.collectionType === "home"
                    ? "Payment Pending"
                    : "Payment Not Collected"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 ml-3">
          <button
            onClick={() => handleViewPatient(item)}
            className="bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 flex flex-col items-center hover:bg-green-100 transition-colors"
          >
            <FaUser size={10} className="text-green-500 mb-1" />
            <span className="text-green-700 text-xs font-medium">Patient</span>
          </button>

          <button
            onClick={() => handleAddReport(item)}
            className="bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 flex flex-col items-center hover:bg-blue-100 transition-colors"
          >
            <FaUpload size={10} className="text-blue-500 mb-1" />
            <span className="text-blue-700 text-xs font-medium">
              {item.reportResult ? "Edit Report" : "Add Report"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="w-full flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h1 className="dashboard-heading">Laboratory Dashboard</h1>
          <p className="dashboard-subText">
            Manage your lab tests and patient reports
          </p>
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
        </div>
      </div>

      <div className="flex lg:flex-row flex-col gap-3 mb-8">
        <div className="flex-1 cursor-pointer bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex items-center justify-between gap-1 flex-wrap ">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 rounded-full p-2">
              <FaClock size={20} className="text-purple-500" />
            </div>
            <p className="text-base text-gray-600 font-semibold">Pending</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboardData?.totalPending || 0}
          </p>
        </div>

        <div className="flex-1 cursor-pointer bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex items-center justify-between gap-1 flex-wrap ">
          <div className="flex gap-2 items-center">
            <div className="bg-orange-100 rounded-full p-2">
              <FaFlask size={20} className="text-orange-500" />
            </div>
            <p className="text-base text-gray-600 font-semibold">Processing</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboardData?.totalProcessing || 0}
          </p>
        </div>

        <div className="flex-1 cursor-pointer bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex items-center justify-between gap-1 flex-wrap ">
          <div className="flex gap-2 items-center">
            <div className="bg-green-100 rounded-full p-2">
              <FaCheckCircle size={20} className="text-green-500" />
            </div>
            <p className="text-base text-gray-600 font-semibold">Completed</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboardData?.totalCompleted || 0}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
        <div className="flex justify-between gap-2 flex-col bg-white lg:p-4 p-2 rounded-xl">
          <h2 className="text-[#45464E] font-medium text-lg ">
            Upcoming Tests (
            {filterAppointments(dashboardData?.pendingAppointments).length || 0}
            )
          </h2>

          {filterAppointments(dashboardData?.pendingAppointments).length > 0 ? (
            <div className="max-h-125 overflow-y-auto">
              {filterAppointments(dashboardData?.pendingAppointments).map(
                (item) => (
                  <div key={item._id}>{renderPendingAppointment(item)}</div>
                ),
              )}
            </div>
          ) : (
            <div className="flex-1 bg-linear-to-br from-purple-50 to-violet-50 rounded-3xl p-8 shadow-sm border border-purple-100 flex flex-col items-center justify-center">
              <div className="bg-purple-100 rounded-full p-4 mb-4">
                <FaFlask size={40} className="text-purple-500" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                No upcoming tests
              </p>
              <p className="text-gray-600 text-center leading-relaxed text-sm max-w-sm">
                Your upcoming lab tests will appear here. Patients can book test
                packages with you.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-col bg-white lg:p-4 p-2 rounded-xl">
          <h2 className="text-[#45464E] font-medium text-lg ">
            Processing & Completed Tests (
            {filterAppointments(dashboardData?.processingAppointments).length ||
              0}
            )
          </h2>

          {filterAppointments(dashboardData?.processingAppointments).length >
          0 ? (
            <div className="max-h-125 overflow-y-auto">
              {filterAppointments(dashboardData?.processingAppointments).map(
                (item) => (
                  <div key={item._id}>{renderProcessingAppointment(item)}</div>
                ),
              )}
            </div>
          ) : (
            <div className="flex-1  justify-center bg-linear-to-br from-orange-50 to-amber-50 rounded-3xl p-8 shadow-sm border border-orange-100 flex flex-col items-center">
              <div className="bg-orange-100 rounded-full p-4 mb-4">
                <FaFlask size={40} className="text-orange-500" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                No processing or completed tests
              </p>
              <p className="text-gray-600 text-center leading-relaxed text-sm max-w-sm">
                Processing and completed tests will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-2 flex-col bg-white lg:p-4 p-2 rounded-xl">
        <h2 className="text-[#45464E] font-medium text-lg ">Recent Tests</h2>

        {filterAppointments(dashboardData?.completedAppointments).length > 0 ? (
          <div className="max-h-125 overflow-y-auto">
            {filterAppointments(dashboardData?.completedAppointments).map(
              (item) => (
                <div key={item._id}>{renderCompletedAppointment(item)}</div>
              ),
            )}
          </div>
        ) : (
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100 flex flex-col items-center">
            <div className="bg-green-100 rounded-full p-3 mb-3">
              <FaFileMedical size={28} className="text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              No completed tests
            </p>
            <p className="text-gray-600 text-center text-sm">
              Completed tests and reports will appear here
            </p>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Patient Profile
              </h2>
              <button
                onClick={() => setShowPatientModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] p-6">
              <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl">
                {selectedAppointment.patient.profilePicture ? (
                  <img
                    src={selectedAppointment.patient.profilePicture}
                    alt={selectedAppointment.patient.name}
                    className="w-20 h-20 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <FaUser size={32} className="text-purple-500" />
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

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="text-purple-500 mr-2" />
                  Personal Information
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Age
                    </span>
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
                      <>
                        <p className="text-gray-900 text-sm">
                          {selectedAppointment.patient.address.address}
                        </p>
                        {selectedAppointment.patient.address.pinCode && (
                          <p className="text-gray-500 text-sm">
                            PIN: {selectedAppointment.patient.address.pinCode}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">Not specified</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedAppointment.patient.medicalHistory && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaHeartbeat className="text-red-500 mr-2" />
                    Medical History
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {selectedAppointment.patient.medicalHistory}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaFlask className="text-purple-500 mr-2" />
                  Test Details
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Test Package
                    </span>
                    <span className="text-gray-900">
                      {selectedAppointment.laboratoryService?.name ||
                        "Service not available"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Selected Tests
                    </span>
                    <span className="text-gray-900">
                      {getSelectedTestsNames(selectedAppointment)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Collection Type
                    </span>
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            selectedAppointment.collectionType === "home"
                              ? "#F59E0B"
                              : "#8B5CF6",
                        }}
                      />
                      <span className="text-gray-900 capitalize">
                        {selectedAppointment.collectionType}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <div
                      className="px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          selectedAppointment.status === "pending" ||
                          selectedAppointment.status === "upcoming"
                            ? "#FEF3C7"
                            : selectedAppointment.status === "processing" ||
                                selectedAppointment.status === "collected"
                              ? "#FED7AA"
                              : "#D1FAE5",
                      }}
                    >
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            selectedAppointment.status === "pending" ||
                            selectedAppointment.status === "upcoming"
                              ? "#D97706"
                              : selectedAppointment.status === "processing" ||
                                  selectedAppointment.status === "collected"
                                ? "#EA580C"
                                : "#059669",
                        }}
                      >
                        {selectedAppointment.status === "pending" ||
                        selectedAppointment.status === "upcoming"
                          ? "Pending"
                          : selectedAppointment.status === "processing" ||
                              selectedAppointment.status === "collected"
                            ? "Processing"
                            : "Completed"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    handleAddReport(selectedAppointment);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                >
                  Upload Test Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Report Modal */}
      {showReportModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Upload Test Reports
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] p-6">
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Patient: {selectedAppointment.patient.name}
                </p>
                <p className="text-gray-600 text-sm">
                  Date:{" "}
                  {formatAppointmentTime(
                    selectedAppointment.timeSlot,
                    selectedAppointment.timeSlotDisplay,
                  )}
                </p>
                <p className="text-gray-500 text-sm">
                  Test:{" "}
                  {selectedAppointment.laboratoryService?.name ||
                    "Service not available"}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaFileMedical className="text-green-500 mr-2" />
                  Report Details
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Enter detailed test report including results, observations, and recommendations..."
                    rows={6}
                    className="w-full text-gray-900 text-sm leading-relaxed p-2 border rounded"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This report will be sent to the patient and saved in their
                  medical records.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaEdit className="text-purple-500 mr-2" />
                  Laboratory Notes
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter private notes, observations, or any additional information for your records..."
                    rows={4}
                    className="w-full text-gray-900 text-sm leading-relaxed p-2 border rounded"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  These notes are private and will not be shared with the
                  patient.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUpload className="text-yellow-500 mr-2" />
                  Test Report PDFs
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <button
                    onClick={handleDocumentPick}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center hover:bg-gray-50 transition-colors"
                  >
                    <FaUpload size={24} className="text-gray-500 mb-2" />
                    <span className="text-gray-700 font-medium">
                      Upload Test Report PDF
                    </span>
                    <span className="text-gray-500 text-sm mt-1">
                      Click to select PDF file
                    </span>
                  </button>

                  {testReportPdfs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded PDFs:
                      </p>
                      {testReportPdfs.map((pdf, index) => (
                        <div
                          key={`uploaded-test-report-${index}`}
                          className="flex items-center bg-gray-50 rounded-lg p-3"
                        >
                          <FaFilePdf size={16} className="text-red-500 mr-2" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 font-medium">
                              Test Report {index + 1}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {pdf}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleViewDocument(
                                  pdf,
                                  `Test Report ${index + 1}`,
                                )
                              }
                              className="bg-blue-500 px-3 py-2 rounded-lg text-white text-xs font-medium hover:bg-blue-600"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRemovePdf(index)}
                              className="bg-red-500 px-3 py-2 rounded-lg text-white text-xs font-medium hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Upload PDF reports for each test. These will be shared with
                  the patient.
                </p>
              </div>

              <div className="mt-8 mb-4">
                <div className="flex gap-2">
                  {(selectedAppointment?.reportResult ||
                    selectedAppointment?.testReportPdfs?.length ||
                    reportText.trim() ||
                    testReportPdfs.length > 0) && (
                    <button
                      onClick={handleDeleteReport}
                      className="flex-1 py-4 px-6 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                    >
                      Delete Report
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportText("");
                      setNotesText("");
                      setTestReportPdfs([]);
                      setSelectedAppointment(null);
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveReport}
                    className="flex-1 py-4 px-6 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                  >
                    Save & Send
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start">
                    <FaInfoCircle
                      size={14}
                      className="text-blue-500 mt-0.5 mr-2"
                    />
                    <div className="flex-1">
                      <p className="text-blue-800 text-xs font-medium mb-1">
                        Important
                      </p>
                      <p className="text-blue-700 text-xs leading-relaxed">
                        The test reports will be sent to the patient
                        immediately. Notes are private and for your records
                        only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Prescription</h2>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <button
                  onClick={() => handleViewPrescription(selectedPrescription)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center hover:bg-gray-50 transition-colors mb-4"
                >
                  <FaFileMedical size={24} className="text-gray-500 mb-2" />
                  <span className="text-gray-700 font-medium">
                    View Prescription
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    Click to view prescription
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleDownloadPrescription(selectedPrescription)
                  }
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center hover:bg-gray-50 transition-colors"
                >
                  <FaFileDownload size={24} className="text-gray-500 mb-2" />
                  <span className="text-gray-700 font-medium">
                    Download Prescription
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    Click to download
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertComponent />

      <button
        onClick={() => navigate("/laboratory/product-management")}
        className="fixed bottom-3 right-6 w-16 h-16 bg-[#5570f1] rounded-full flex items-center justify-center shadow-lg hover:bg-[#5570f1]/85 transition-colors z-40 cursor-pointer duration-200"
        aria-label="products management"
      >
        <FaPlus size={28} className="text-white" />
      </button>
      <span className="fixed bottom-2 right-6 text-xs text-blue-700 font-medium z-40">
        Manage Products
      </span>
    </div>
  );
};

export default LaboratoryDashboard;
