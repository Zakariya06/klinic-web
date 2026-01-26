// src/components/PreviousLabTests.
import React from "react";
import {
  FaFlask,
  FaFileAlt,
  FaFilePdf,
  FaStickyNote,
  FaList,
  FaHeartbeat,
} from "react-icons/fa";

export type Appointment = {
  _id: string;
  providerName: string;
  serviceName: string;
  timeSlot: string;
  timeSlotDisplay: string;
  packageCoverImage?: string | null;
  reportResult?: unknown; // keeps same "truthy" gating behavior
};

export type PreviousData = {
  labTests: Appointment[];
};

type PreviousLabTestsProps = {
  previousLabTests: PreviousData | null;
  formatAppointmentTime: (timeSlot: string, timeSlotDisplay: string) => string;
  onViewLabReport: (testId: string) => void;
  onViewLabPdfs: (testId: string) => void;
  onViewLabNotes: (testId: string) => void;
  onShowAllReportsModal: () => void;
};

const PreviousLabTests: React.FC<PreviousLabTestsProps> = ({
  previousLabTests,
  formatAppointmentTime,
  onViewLabReport,
  onViewLabPdfs,
  onViewLabNotes,
  onShowAllReportsModal,
}) => {
  const labTests = previousLabTests?.labTests ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[#45464E] font-medium text-lg">Previous Lab Tests</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowAllReportsModal}
            className="flex items-center rounded-lg bg-purple-500 px-3 py-2 text-xs font-medium text-white cursor-pointer"
          >
            <FaList className="mr-1.5 h-3 w-3" />
            All Reports
          </button>
        </div>
      </div>

      {labTests.length > 0 ? (
        <div className="space-y-3">
          {labTests.map((item) => (
            <div
              key={item._id}
              className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start">
                <div className="mr-3">
                  {item.packageCoverImage ? (
                    <img
                      src={item.packageCoverImage}
                      alt={`${item.serviceName} cover`}
                      className="h-12 w-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <FaFlask className="h-5 w-5 text-purple-500" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-semibold text-gray-900">
                    {item.providerName}
                  </div>
                  <div className="truncate text-sm text-gray-600">
                    {item.serviceName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
                  </div>
                </div>
              </div>

              {!!item.reportResult && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onViewLabReport(item._id)}
                    className="flex flex-1 flex-col items-center rounded-lg border border-purple-200 bg-purple-100 px-3 py-2"
                  >
                    <FaFileAlt className="mb-0.5 h-3 w-3 text-purple-500" />
                    <span className="text-xs font-medium text-purple-700">
                      Report
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewLabPdfs(item._id)}
                    className="flex flex-1 flex-col items-center rounded-lg border border-red-200 bg-red-100 px-3 py-2"
                  >
                    <FaFilePdf className="mb-0.5 h-3 w-3 text-red-500" />
                    <span className="text-xs font-medium text-red-700">
                      PDFs
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewLabNotes(item._id)}
                    className="flex flex-1 flex-col items-center rounded-lg border border-blue-200 bg-blue-100 px-3 py-2"
                  >
                    <FaStickyNote className="mb-0.5 h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium text-blue-700">
                      Notes
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-purple-100 bg-linear-to-br from-purple-50 to-violet-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 inline-flex rounded-full bg-purple-100 p-3">
            <FaHeartbeat className="h-7 w-7 text-purple-500" />
          </div>
          <div className="mb-1 text-lg font-semibold text-gray-900">
            Your health reports
          </div>
          <div className="text-sm text-gray-600">
            Lab test results and health reports will be available here
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousLabTests;
