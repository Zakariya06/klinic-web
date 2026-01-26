import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import {
  FaTimes,
  FaUserMd,
  FaFlask,
  FaFileAlt,
  FaFilePdf,
  FaStickyNote,
  FaExternalLinkAlt,
  FaFileMedicalAlt,
} from "react-icons/fa";

interface Appointment {
  _id: string;
  providerName: string;
  serviceName: string;
  timeSlot: string;
  timeSlotDisplay: string;
  prescription?: string;
  reportResult?: string;
  packageCoverImage?: string;
  testReportPdfs?: string[];
  notes?: string;
}

interface UserDashboardModalsProps {
  // Modal visibility states
  showPrescriptionModal: boolean;
  showReportModal: boolean;
  showPdfsModal: boolean;
  showNotesModal: boolean;
  showLabReportsListModal: boolean;

  // Modal data
  prescriptionData: any;
  reportData: any;
  pdfsData: any;
  notesData: any;
  allLabReports: Appointment[];

  // Modal handlers
  onClosePrescriptionModal: () => void;
  onCloseReportModal: () => void;
  onClosePdfsModal: () => void;
  onCloseNotesModal: () => void;
  onCloseLabReportsListModal: () => void;

  // Action handlers
  onViewLabReport: (testId: string) => void;
  onViewLabPdfs: (testId: string) => void;
  onViewLabNotes: (testId: string) => void;

  // Utility functions
  formatAppointmentTime: (timeSlot: string, timeSlotDisplay: string) => string;
}

const UserDashboardModals: React.FC<UserDashboardModalsProps> = ({
  showPrescriptionModal,
  showReportModal,
  showPdfsModal,
  showNotesModal,
  showLabReportsListModal,
  prescriptionData,
  reportData,
  pdfsData,
  notesData,
  allLabReports,
  onClosePrescriptionModal,
  onCloseReportModal,
  onClosePdfsModal,
  onCloseNotesModal,
  onCloseLabReportsListModal,
  onViewLabReport,
  onViewLabPdfs,
  onViewLabNotes,
  formatAppointmentTime,
}) => {
  // Handle PDF opening
  const handleOpenPdf = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Overlay click handler to close modals when clicking outside
  const handleOverlayClick = (
    e: React.MouseEvent,
    closeFunction: () => void,
  ) => {
    if (e.target === e.currentTarget) {
      closeFunction();
    }
  };

  // Modal components
  const ModalWrapper: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {" "}
            <motion.div
              className="fixed inset-0 bg-black/30 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => handleOverlayClick(e, onClose)}
            />
            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div
                className="bg-white rounded-2xl w-full max-w-2xl   flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center py-6 px-4 border-b border-gray-200">
                  <h2 className="lg:text-xl text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer "
                    aria-label="Close modal"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Prescription Modal
  const PrescriptionModal = () => (
    <ModalWrapper
      isOpen={showPrescriptionModal}
      onClose={onClosePrescriptionModal}
      title="Your Prescriptions"
    >
      {prescriptionData?.appointments ? (
        prescriptionData.appointments.map(
          (appointment: Appointment, index: number) => (
            <div
              key={appointment._id}
              className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FaUserMd size={16} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {appointment.providerName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatAppointmentTime(
                      appointment.timeSlot,
                      appointment.timeSlotDisplay,
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Prescription:
                </p>
                <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                  {appointment.prescription}
                </p>
              </div>
            </div>
          ),
        )
      ) : prescriptionData?.prescription ? (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Prescription:
          </p>
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
            {prescriptionData.prescription}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-center">
          No prescription data available
        </p>
      )}
    </ModalWrapper>
  );

  // Lab Reports List Modal
  const LabReportsListModal = () => (
    <ModalWrapper
      isOpen={showLabReportsListModal}
      onClose={onCloseLabReportsListModal}
      title="All Lab Reports"
    >
      {allLabReports.length > 0 ? (
        allLabReports.map((report: Appointment, index: number) => (
          <div
            key={report._id}
            className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
          >
            <div className="flex items-center mb-3">
              <div className="mr-3">
                {report.packageCoverImage ? (
                  <img
                    src={report.packageCoverImage}
                    alt={report.serviceName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaFlask size={20} className="text-purple-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.providerName}
                </h3>
                <p className="text-sm text-gray-600">{report.serviceName}</p>
                <p className="text-xs text-gray-500">
                  {formatAppointmentTime(
                    report.timeSlot,
                    report.timeSlotDisplay,
                  )}
                </p>
              </div>
            </div>

            {report.reportResult && (
              <div className="bg-white rounded-lg p-3 border border-gray-100 mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Report Summary:
                </p>
                <p className="text-gray-900 text-sm line-clamp-3">
                  {report.reportResult}
                </p>
              </div>
            )}

            {/* Three Action Buttons */}
            {report.reportResult && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onCloseLabReportsListModal();
                    onViewLabReport(report._id);
                  }}
                  className="flex-1 bg-purple-100 px-3 py-2 rounded-lg border border-purple-200 hover:bg-purple-200 transition-colors flex flex-col items-center"
                >
                  <FaFileAlt size={12} className="text-purple-600 mb-1" />
                  <span className="text-purple-700 text-xs font-medium">
                    Report
                  </span>
                </button>

                <button
                  onClick={() => {
                    onCloseLabReportsListModal();
                    onViewLabPdfs(report._id);
                  }}
                  className="flex-1 bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-200 transition-colors flex flex-col items-center"
                >
                  <FaFilePdf size={12} className="text-red-600 mb-1" />
                  <span className="text-red-700 text-xs font-medium">PDFs</span>
                </button>

                <button
                  onClick={() => {
                    onCloseLabReportsListModal();
                    onViewLabNotes(report._id);
                  }}
                  className="flex-1 bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors flex flex-col items-center"
                >
                  <FaStickyNote size={12} className="text-blue-600 mb-1" />
                  <span className="text-blue-700 text-xs font-medium">
                    Notes
                  </span>
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center py-8">
          <FaFlask size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-600 text-center">No lab reports available</p>
        </div>
      )}
    </ModalWrapper>
  );

  // Lab Report PDFs Modal
  const LabReportPDFsModal = () => (
    <ModalWrapper
      isOpen={showPdfsModal}
      onClose={onClosePdfsModal}
      title="Report Documents"
    >
      {pdfsData &&
      pdfsData.testReportPdfs &&
      pdfsData.testReportPdfs.length > 0 ? (
        <div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Laboratory:
            </p>
            <p className="text-gray-900 text-sm">
              {pdfsData.labTest?.providerName}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-2 mt-2">
              Service:
            </p>
            <p className="text-gray-900 text-sm">
              {pdfsData.labTest?.serviceName}
            </p>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-3">
            Available Documents ({pdfsData.testReportPdfs.length}):
          </p>
          {pdfsData.testReportPdfs.map((pdf: string, index: number) => (
            <button
              key={index}
              onClick={() => handleOpenPdf(pdf)}
              className="flex items-center bg-red-50 rounded-lg p-4 mb-3 border border-red-200 hover:bg-red-100 transition-colors w-full text-left"
            >
              <FaFilePdf size={20} className="text-red-500 mr-3" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">
                  Report Document {index + 1}
                </p>
                <p className="text-red-600 text-xs mt-1">Click to open PDF</p>
              </div>
              <FaExternalLinkAlt size={14} className="text-red-500" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8">
          <FaFilePdf size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-600 text-center">
            No PDF documents available
          </p>
        </div>
      )}
    </ModalWrapper>
  );

  // Lab Notes Modal
  const LabNotesModal = () => (
    <ModalWrapper
      isOpen={showNotesModal}
      onClose={onCloseNotesModal}
      title="Laboratory Notes"
    >
      {notesData ? (
        <div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Laboratory:
            </p>
            <p className="text-gray-900 text-sm">
              {notesData.labTest?.providerName}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-2 mt-2">
              Service:
            </p>
            <p className="text-gray-900 text-sm">
              {notesData.labTest?.serviceName}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2">
              Laboratory Notes:
            </p>
            <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-wrap">
              {notesData.notes}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No notes data available</p>
      )}
    </ModalWrapper>
  );

  // Lab Report Detail Modal
  const LabReportDetailModal = () => (
    <ModalWrapper
      isOpen={showReportModal}
      onClose={onCloseReportModal}
      title="Lab Report Details"
    >
      {reportData ? (
        <div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Lab Report:
            </p>
            <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
              {reportData.report}
            </p>
          </div>

          {reportData.labTest?.testReportPdfs &&
            reportData.labTest.testReportPdfs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Report Documents:
                </p>
                {reportData.labTest.testReportPdfs.map(
                  (pdf: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleOpenPdf(pdf)}
                      className="flex items-center bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200 hover:bg-blue-100 transition-colors w-full text-left"
                    >
                      <FaFileMedicalAlt
                        size={16}
                        className="text-red-500 mr-2"
                      />
                      <p className="text-blue-700 text-sm font-medium flex-1">
                        Report Document {index + 1}
                      </p>
                      <FaExternalLinkAlt size={12} className="text-blue-500" />
                    </button>
                  ),
                )}
              </div>
            )}
        </div>
      ) : (
        <p className="text-gray-600 text-center">No report data available</p>
      )}
    </ModalWrapper>
  );

  return (
    <>
      <PrescriptionModal />
      <LabReportsListModal />
      <LabReportPDFsModal />
      <LabNotesModal />
      <LabReportDetailModal />
    </>
  );
};

export default UserDashboardModals;
