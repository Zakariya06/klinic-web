import React, { useMemo } from "react";
import { FaCheckCircle, FaFlask } from "react-icons/fa";

import RatingDisplay from "@/components/RatingDisplay";
import { MdOutlineScience } from "react-icons/md";

interface ServiceInfoProps {
  service: {
    _id?: string;
    name: string;
    category: string;
    price: number;
    collectionType: string;
    rating: number;
    description: string;
    tests?: Array<{
      name: string;
      description: string;
    }>;
  };
  laboratoryName: string;
  laboratoryId: string;
  canBook?: boolean;
  handleBookTest: () => void;
  hasIndividualTestPricing: boolean;
  getSelectedTestsCount: number;
  calculateTotalPrice: number;
  isBookingEnabled?: boolean;
  selectedService: {
    name: string;
  };
}

export default function ServiceInfo({
  service,
  laboratoryName,
  laboratoryId,
  canBook,
  handleBookTest,
  hasIndividualTestPricing,
  getSelectedTestsCount,
  calculateTotalPrice,
  isBookingEnabled,
  selectedService,
}: ServiceInfoProps) {
  // Keep same intent: prefer service id; fallback to lab id
  const ratingProviderId = useMemo(
    () => service._id || laboratoryId,
    [service._id, laboratoryId],
  );

  return (
    <div>
      {/* Service Header */}
      <div className="flex lg:flex-row flex-col lg:items-center justify-between mb-3 gap-2">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-20 h-20 bg-[#5570F11F] text-[#5570F1] rounded-full text-4xl">
            <MdOutlineScience />
          </div>
          <div>
            <h2 className="lg:text-xl text-base font-medium text-[#45464E]">
              {service.name}
            </h2>
            <p className="text-base text-[#6E7079]">at {laboratoryName}</p>

            <div className="mt-1 flex items-center">
              <RatingDisplay
                providerId={service._id || ""}
                providerType="laboratoryService"
                size="medium"
              />
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">{service.category}</span>
            </div>
          </div>
        </div>

        {/* Floating CTA */}
        <button
          type="button"
          onClick={handleBookTest}
          disabled={!canBook}
          className={[
            "rounded-lg cursor-pointer w-fit z-10 px-4 py-2 text-base  text-white hover:bg-[#5570f1]/85 duration-300 ml-auto disabled:bg-[#5570f1]/50 disabled:cursor-not-allowed",
            !canBook ? "bg-[#5570f1]/50" : "bg-[#5570f1]",
          ].join(" ")}
        >
          {hasIndividualTestPricing && getSelectedTestsCount === 0
            ? "Select at least one test"
            : isBookingEnabled
              ? `Book ${selectedService.name} - ₹${calculateTotalPrice}`
              : "Complete All Selections"}
        </button>
      </div>

      <div className="my-6 grid lg:grid-cols-2 grid-cols-1 gap-4">
        {/* Service Details */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="lg:text-lg text-base font-medium text-[#45464E] mb-1">
                Service Details
              </div>
              <div className="mb-2 text-blue-800">{service.description}</div>

              <div className="flex items-center">
                <FaFlask className="h-3.5 w-3.5 text-blue-500" />
                <span className="ml-2 text-blue-800">
                  Collection: {service.collectionType}
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-2xl font-bold text-primary">
                ₹{service.price}
              </div>
              <div className="text-sm text-gray-600">per package</div>
            </div>
          </div>
        </div>

        {/* Tests Included */}
        {service.tests && service.tests.length > 0 && (
          <div className="rounded-lg bg-gray-100 p-4">
            <div className="lg:text-lg text-base font-medium text-[#45464E] mb-2">
              Tests Included
            </div>

            {service.tests.map((test, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex items-center">
                  <FaCheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="ml-2 font-medium text-gray-900">
                    {test.name}
                  </span>
                </div>

                {test.description && (
                  <div className="ml-6 text-sm text-gray-600">
                    {test.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
