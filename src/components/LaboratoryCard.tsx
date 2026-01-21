import { Laboratory } from "../services/laboratoryService";
import { useState } from "react";
import RatingDisplay from "./RatingDisplay";
import {
  FaArrowRight,
  FaCheckCircle,
  FaFlask,
  FaHome,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaRegCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface LaboratoryCardProps {
  laboratory: Laboratory;
}

export default function LaboratoryCard({ laboratory }: LaboratoryCardProps) {
  const navigate = useNavigate();

  // State to track selected tests for each service
  const [selectedTests, setSelectedTests] = useState<{
    [serviceIndex: number]: { [testIndex: number]: boolean };
  }>({});

  const handleViewDetails = (serviceIndex: number, service: any) => {
    const selectedTestsForService = selectedTests[serviceIndex] || {};
    const selectedTestIndices = Object.keys(selectedTestsForService)
      .filter((testIndex) => selectedTestsForService[parseInt(testIndex)])
      .map((testIndex) => parseInt(testIndex));

    // Use serviceId if available (new approach), otherwise fall back to serviceIndex for backward compatibility
    const navigationParams = service._id
      ? `serviceId=${service._id}`
      : `serviceIndex=${serviceIndex}`;

    navigate(
      `/laboratories/${
        laboratory._id
      }?${navigationParams}&selectedTests=${selectedTestIndices.join(",")}`,
    );
  };

  const toggleTestSelection = (serviceIndex: number, testIndex: number) => {
    setSelectedTests((prev) => ({
      ...prev,
      [serviceIndex]: {
        ...prev[serviceIndex],
        [testIndex]: !prev[serviceIndex]?.[testIndex],
      },
    }));
  };

  const calculateServicePrice = (service: any, serviceIndex: number) => {
    if (!service.tests || service.tests.length === 0) {
      return service.price || 0;
    }

    // Check if all tests have individual prices
    const hasIndividualPricing = service.tests.every(
      (test: any) => test.price && test.price > 0,
    );

    if (!hasIndividualPricing) {
      // If no individual pricing, return service price (package price)
      return service.price || 0;
    }

    const selectedTestsForService = selectedTests[serviceIndex] || {};
    const hasAnySelection = Object.values(selectedTestsForService).some(
      (selected) => selected,
    );

    if (!hasAnySelection) {
      // If no tests are selected, show full price (sum of all tests)
      return service.tests.reduce(
        (sum: number, test: any) => sum + (test.price || 0),
        0,
      );
    }

    // Calculate price based on selected tests
    return service.tests.reduce((sum: number, test: any, index: number) => {
      return selectedTestsForService[index] ? sum + (test.price || 0) : sum;
    }, 0);
  };

  const hasIndividualTestPricing = (service: any) => {
    return (
      service.tests &&
      service.tests.length > 0 &&
      service.tests.every((test: any) => test.price && test.price > 0)
    );
  };

  // Debug: Log all service IDs for this card
  if (laboratory.laboratoryServices) {
    laboratory.laboratoryServices.forEach((service) =>
      console.log(
        "🟢 LaboratoryCard: service._id for RatingDisplay:",
        service._id,
      ),
    );
  }

  // Handle case where laboratoryServices is undefined or empty
  if (
    !laboratory?.laboratoryServices ||
    laboratory.laboratoryServices.length === 0
  ) {
    return (
      <div className="bg-white rounded-xl p-6 flex items-center justify-center  border border-gray-100">
        <div className="flex flex-col items-center">
          <FaFlask size={48} className="text-blue-700" />
          <h3 className="text-lg font-bold text-gray-900 mt-4">
            {laboratory?.laboratoryName || "Laboratory"}
          </h3>
          <p className="text-gray-600 text-center mt-2">
            No services available at this time
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm text-center">
              This laboratory is currently updating their service offerings.
              Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return laboratory.laboratoryServices.map((service, index) => (
    <div
      key={index}
      onClick={() => handleViewDetails(index, service)}
      className="bg-white rounded-xl overflow-hidden duration-150 border border-gray-200 cursor-pointer transition-hover hover:shadow-md flex flex-col"
    >
      {service.coverImage ? (
        <img
          src={service.coverImage}
          alt={service.name}
          className="w-full h-60 object-cover"
        />
      ) : (
        <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
          <FaFlask size={40} className="text-gray-400" />
        </div>
      )}

      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="lg:text-2xl text-xl font-medium">
                  {laboratory.laboratoryName}
                </h3>
                <div className="flex flex-col items-start gap-y-2 mt-2">
                  <div className="flex items-center mr-4">
                    <FaPhone size={14} className="text-gray-600" />
                    <span className="text-gray-600 text-sm ml-2">
                      {laboratory.user?.phone}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt size={14} className="text-gray-600" />
                    <span className="text-gray-600 text-sm ml-2">
                      {laboratory.laboratoryAddress?.address ||
                        "Address not available"}
                      , {laboratory.laboratoryAddress?.pinCode || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                <RatingDisplay
                  providerId={service._id ? String(service._id) : ""}
                  providerType="laboratoryService"
                  size="small"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">
                {service.name}
              </h4>
              <p className="text-base text-gray-600 mt-1">{service.category}</p>
            </div>
            <div className="bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100 text-right">
              <p className="text-xs text-gray-500 mb-1 leading-none">
                {hasIndividualTestPricing(service)
                  ? "Selected Tests"
                  : "Package Fee"}
              </p>
              <p className="text-blue-600 font-bold text-lg leading-none">
                ₹{calculateServicePrice(service, index)}
              </p>
              {hasIndividualTestPricing(service) && (
                <p className="text-xs text-gray-500 mt-1 leading-none">
                  {Object.values(selectedTests[index] || {}).filter(Boolean)
                    .length ||
                    service.tests?.length ||
                    0}{" "}
                  tests
                </p>
              )}
            </div>
          </div>

          {service.description && (
            <p className="text-gray-600 mt-3 text-sm line-clamp-2">
              {service.description}
            </p>
          )}

          <div className="flex items-center mt-3">
            <div
              className={`flex items-center px-3 py-1.5 rounded-full ${
                service.collectionType === "home"
                  ? "bg-green-100"
                  : service.collectionType === "lab"
                    ? "bg-blue-100"
                    : "bg-purple-100"
              }`}
            >
              {service.collectionType === "lab" ? (
                <FaHospital size={14} className="text-blue-600" />
              ) : (
                <FaHome
                  size={14}
                  className={
                    service.collectionType === "home"
                      ? "text-green-600"
                      : "text-purple-600"
                  }
                />
              )}
              <span
                className={`ml-2 text-sm font-medium ${
                  service.collectionType === "home"
                    ? "text-green-700"
                    : service.collectionType === "lab"
                      ? "text-blue-700"
                      : "text-purple-700"
                }`}
              >
                {service.collectionType === "both"
                  ? "Home & Lab"
                  : service.collectionType === "home"
                    ? "Home Collection"
                    : "Lab Visit"}
              </span>
            </div>
          </div>

          {service.tests && service.tests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {hasIndividualTestPricing(service)
                  ? `Available Tests (${service.tests.length}):`
                  : `Included Tests (${service.tests.length}):`}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {hasIndividualTestPricing(service)
                  ? "Click tests to include/exclude from your package"
                  : "All tests included in package price"}
              </p>

              {service.tests.slice(0, 3).map((test, testIndex) => {
                const isSelected = hasIndividualTestPricing(service)
                  ? selectedTests[index]?.[testIndex] !== false
                  : true;
                const isInteractive = hasIndividualTestPricing(service);

                return (
                  <div
                    key={testIndex}
                    onClick={(e) => {
                      if (isInteractive) {
                        e.stopPropagation();
                        toggleTestSelection(index, testIndex);
                      }
                    }}
                    className={`mb-2 p-3 rounded-lg border transition-colors ${
                      isInteractive ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {isSelected ? (
                            <FaCheckCircle
                              size={16}
                              className="text-green-600"
                            />
                          ) : (
                            <FaRegCircle size={16} className="text-gray-400" />
                          )}
                          <span
                            className={`ml-2 text-sm font-medium ${
                              isSelected ? "text-gray-800" : "text-gray-500"
                            }`}
                          >
                            {test.name}
                          </span>
                        </div>
                        {test.description && (
                          <p
                            className={`text-xs mt-1 ml-6 line-clamp-2 ${
                              isSelected ? "text-gray-600" : "text-gray-400"
                            }`}
                          >
                            {test.description}
                          </p>
                        )}
                      </div>
                      {hasIndividualTestPricing(service) && (
                        <span
                          className={`text-sm font-semibold ${
                            isSelected ? "text-green-700" : "text-gray-400"
                          }`}
                        >
                          ₹{test.price || 0}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {service.tests.length > 3 && (
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  +{service.tests.length - 3} more tests (view details to see
                  all)
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(index, service);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center transition-colors shadow-sm"
          >
            <span className="font-semibold mr-2">
              Book Now - ₹{calculateServicePrice(service, index)}
            </span>
            <FaArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  ));
}
