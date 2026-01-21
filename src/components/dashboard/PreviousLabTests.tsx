import React from "react";
import {
  FaFlask,
  FaFileAlt,
  FaFilePdf,
  FaStickyNote,
  FaList,
  FaHeartbeat,
  FaClipboardCheck,
} from "react-icons/fa";
import { Appointment, PreviousData } from "./types";

interface PreviousLabTestsProps {
  previousLabTests: PreviousData | null;
  formatAppointmentTime: (timeSlot: string, timeSlotDisplay: string) => string;
  onViewLabReport: (testId: string) => void;
  onViewLabPdfs: (testId: string) => void;
  onViewLabNotes: (testId: string) => void;
  onShowAllReportsModal: () => void;
  cardMode?: boolean;
}

const PreviousLabTests: React.FC<PreviousLabTestsProps> = ({
  previousLabTests,
  formatAppointmentTime,
  onViewLabReport,
  onViewLabPdfs,
  onViewLabNotes,
  onShowAllReportsModal,
  cardMode = false,
}) => {
  const labTests = previousLabTests?.labTests || [];

  if (cardMode) {
    return (
      <div>
        {labTests.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start mb-3">
              {/* Lab icon or package cover image */}
              <div className="mr-3 shrink-0">
                {item.packageCoverImage ? (
                  <img
                    src={item.packageCoverImage}
                    alt={item.serviceName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaFlask className="text-purple-600" size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.providerName}
                </h3>
                <p className="text-gray-600 text-sm mb-1 truncate">
                  {item.serviceName}
                </p>
                <div className="flex items-center text-gray-500 text-xs">
                  <FaClipboardCheck className="mr-1 text-xs" />
                  <span>
                    {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
                  </span>
                </div>
              </div>
            </div>

            {/* Three Action Buttons - only show if report is available */}
            {item.reportResult && (
              <div className="flex gap-2">
                <button
                  onClick={() => onViewLabReport(item._id)}
                  className="flex-1 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors flex flex-col items-center justify-center"
                >
                  <FaFileAlt className="text-purple-600 mb-1" size={14} />
                  <span className="text-purple-700 text-xs font-medium">
                    Report
                  </span>
                </button>

                <button
                  onClick={() => onViewLabPdfs(item._id)}
                  className="flex-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex flex-col items-center justify-center"
                >
                  <FaFilePdf className="text-red-600 mb-1" size={14} />
                  <span className="text-red-700 text-xs font-medium">PDFs</span>
                </button>

                <button
                  onClick={() => onViewLabNotes(item._id)}
                  className="flex-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center"
                >
                  <FaStickyNote className="text-blue-600 mb-1" size={14} />
                  <span className="text-blue-700 text-xs font-medium">
                    Notes
                  </span>
                </button>
              </div>
            )}

            {/* Status indicator if no report yet */}
            {!item.reportResult && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-xs text-center">
                  Report pending completion
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          {labTests.length > 0 && (
            <button
              onClick={onShowAllReportsModal}
              className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
            >
              <FaList className="text-white mr-2" size={12} />
              <span className="text-white text-sm font-medium">
                All Reports
              </span>
            </button>
          )}
        </div>
      </div>

      {labTests.length > 0 ? (
        <div className="space-y-3">
          {labTests.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start mb-3">
                {/* Lab icon or package cover image */}
                <div className="mr-3 flex-shrink-0">
                  {item.packageCoverImage ? (
                    <img
                      src={item.packageCoverImage}
                      alt={item.serviceName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FaFlask className="text-purple-600" size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.providerName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1 truncate">
                        {item.serviceName}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className="flex items-center text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded">
                        <FaClipboardCheck className="mr-1" size={10} />
                        <span>
                          {formatAppointmentTime(
                            item.timeSlot,
                            item.timeSlotDisplay,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Test details if available */}
                  {item.testDetails && (
                    <div className="mt-2">
                      <p className="text-gray-700 text-sm">
                        {item.testDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - only show if report is available */}
              {item.reportResult && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewLabReport(item._id)}
                    className="flex-1 bg-purple-50 px-3 py-3 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center"
                  >
                    <FaFileAlt className="text-purple-600 mr-2" size={14} />
                    <span className="text-purple-700 text-sm font-medium">
                      View Report
                    </span>
                  </button>

                  <button
                    onClick={() => onViewLabPdfs(item._id)}
                    className="flex-1 bg-red-50 px-3 py-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <FaFilePdf className="text-red-600 mr-2" size={14} />
                    <span className="text-red-700 text-sm font-medium">
                      Download PDFs
                    </span>
                  </button>

                  <button
                    onClick={() => onViewLabNotes(item._id)}
                    className="flex-1 bg-blue-50 px-3 py-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center"
                  >
                    <FaStickyNote className="text-blue-600 mr-2" size={14} />
                    <span className="text-blue-700 text-sm font-medium">
                      Doctor Notes
                    </span>
                  </button>
                </div>
              )}

              {/* Status indicator if no report yet */}
              {!item.reportResult && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                  <FaHeartbeat className="text-yellow-600 mr-2" />
                  <div>
                    <p className="text-yellow-700 text-sm font-medium">
                      Report Pending
                    </p>
                    <p className="text-yellow-600 text-xs">
                      Your lab results are being processed
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 shadow-sm border border-purple-100 text-center">
          <div className="bg-purple-100 rounded-full p-4 mb-4 inline-flex">
            <FaHeartbeat className="text-purple-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your health reports
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Lab test results and health reports will be available here once you
            complete your first test.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <FaFlask className="text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Book Lab Test</h4>
              <p className="text-gray-600 text-sm">
                Schedule tests from certified laboratories
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <FaFileAlt className="text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Get Results</h4>
              <p className="text-gray-600 text-sm">
                Receive digital reports within hours
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <FaStickyNote className="text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Doctor Notes</h4>
              <p className="text-gray-600 text-sm">
                Get expert insights on your results
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary if there are tests */}
      {labTests.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-700 mb-1">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900">
              {labTests.length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-700 mb-1">Reports Ready</p>
            <p className="text-2xl font-bold text-gray-900">
              {labTests.filter((test) => test.reportResult).length}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700 mb-1">With PDFs</p>
            <p className="text-2xl font-bold text-gray-900">
              {labTests.filter((test) => test.hasPdfs).length}
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              {labTests.filter((test) => !test.reportResult).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousLabTests;
