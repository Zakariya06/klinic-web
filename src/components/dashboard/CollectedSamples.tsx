import React from "react";
import { FaVial } from "react-icons/fa";
import { Appointment, CollectedData } from "./types";

interface CollectedSamplesProps {
  collectedSamples: CollectedData | null;
  formatAppointmentTime: (timeSlot: string, timeSlotDisplay: string) => string;
}

const CollectedSamples: React.FC<CollectedSamplesProps> = ({
  collectedSamples,
  formatAppointmentTime,
}) => {
  const renderCollectedSample = (item: Appointment) => (
    <div
      key={item._id}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-orange-100"
    >
      <div className="flex items-start">
        {/* Image / Icon */}
        <div className="mr-3">
          {item.packageCoverImage ? (
            <img
              src={item.packageCoverImage}
              alt={item.serviceName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <FaVial className="text-orange-500 text-lg" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">
            {item.providerName}
          </p>

          <p className="text-sm text-gray-600">{item.serviceName}</p>

          <p className="text-xs text-gray-500">
            {formatAppointmentTime(item.timeSlot, item.timeSlotDisplay)}
          </p>

          {/* Status */}
          <div className="flex items-center mt-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
            <span className="text-xs font-medium text-orange-700">
              {item.status === "collected" ? "Sample Collected" : "Processing"}
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="bg-orange-100 px-3 py-1 rounded-lg h-fit">
          <span className="text-xs font-medium text-orange-700">
            In Progress
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#45464E] font-medium text-lg ">
          Collected Samples
        </h2>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
          {collectedSamples?.labTests?.length || 0}
        </span>
      </div>

      {collectedSamples?.labTests && collectedSamples.labTests.length > 0 ? (
        <div>{collectedSamples.labTests.map(renderCollectedSample)}</div>
      ) : (
        <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-sm border border-orange-100 flex flex-col items-center text-center">
          <div className="bg-orange-100 rounded-full p-3 mb-3">
            <FaVial className="text-orange-500 text-2xl" />
          </div>

          <p className="text-lg font-semibold text-gray-900 mb-1">
            Samples in progress
          </p>

          <p className="text-sm text-gray-600">
            Lab samples collected and being processed will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default CollectedSamples;
