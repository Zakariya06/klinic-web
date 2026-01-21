// src/pages/LaboratoryServiceDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFlask,
  FaRegCircle,
} from "react-icons/fa";

import { useLaboratoryStore } from "@/store/laboratoryStore";
import apiClient from "@/api/client";
import { useCustomAlert } from "@/components/CustomAlert";

// Separated components (already web-converted or to be converted similarly)
import ServiceInfo from "@/components/laboratory/ServiceInfo";
import CollectionTypeSelector from "@/components/laboratory/CollectionTypeSelector";
import Slots from "@/components/laboratory/Slots";
import LaboratoryAddress from "@/components/laboratory/LaboratoryAddress";
import PaymentModal from "@/components/PaymentModal";
import { IoIosArrowRoundBack } from "react-icons/io";

type CollectionType = "lab" | "home";

export default function LaboratoryServiceDetails() {
  // Expect route like: /laboratories/:id/service
  // serviceIndex/serviceId/selectedTests come from querystring on web
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceIndex = searchParams.get("serviceIndex");
  const serviceId = searchParams.get("serviceId");
  const selectedTestsParam = searchParams.get("selectedTests");

  const [loading, setLoading] = useState(true);
  const [laboratory, setLaboratory] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedCollectionType, setSelectedCollectionType] =
    useState<CollectionType | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string | null>(
    null,
  );

  const [selectedTests, setSelectedTests] = useState<Record<number, boolean>>(
    {},
  );

  const { showAlert, AlertComponent } = useCustomAlert();
  const { laboratories, searchLaboratories } = useLaboratoryStore();

  // Mock scheduling data (keep same logic)
  const availableDays = useMemo(
    () => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    [],
  );
  const availableSlots = useMemo(
    () => [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
    ],
    [],
  );

  const hasIndividualTestPricing = useMemo(() => {
    return Boolean(
      selectedService?.tests &&
      selectedService.tests.length > 0 &&
      selectedService.tests.every((test: any) => test.price && test.price > 0),
    );
  }, [selectedService]);

  // Init selected tests from URL parameter (same logic)
  useEffect(() => {
    if (!selectedService?.tests) return;

    const initialSelection: Record<number, boolean> = {};

    if (hasIndividualTestPricing) {
      if (selectedTestsParam) {
        const testIndices = selectedTestsParam
          .split(",")
          .map((x) => parseInt(x, 10))
          .filter((x) => !Number.isNaN(x));

        if (testIndices.length > 0) {
          testIndices.forEach((idx) => {
            if (idx >= 0 && idx < selectedService.tests.length)
              initialSelection[idx] = true;
          });
        } else {
          selectedService.tests.forEach(
            (_: any, idx: number) => (initialSelection[idx] = true),
          );
        }
      } else {
        selectedService.tests.forEach(
          (_: any, idx: number) => (initialSelection[idx] = true),
        );
      }
    } else {
      selectedService.tests.forEach(
        (_: any, idx: number) => (initialSelection[idx] = true),
      );
    }

    setSelectedTests(initialSelection);
  }, [selectedTestsParam, selectedService, hasIndividualTestPricing]);

  useEffect(() => {
    const loadLaboratory = async () => {
      try {
        setLoading(true);

        let foundLab = laboratories.find((lab: any) => lab._id === id);

        if (!foundLab && laboratories.length === 0) {
          await searchLaboratories();
          foundLab = laboratories.find((lab: any) => lab._id === id);
        }

        if (!foundLab) throw new Error("Laboratory not found");

        setLaboratory(foundLab);

        if (serviceId) {
          const svc = foundLab?.laboratoryServices?.find(
            (s: any) => s._id === serviceId,
          );
          setSelectedService(svc || null);
        } else if (serviceIndex != null) {
          const idx = parseInt(serviceIndex, 10);
          const svc = foundLab?.laboratoryServices?.[idx];
          setSelectedService(svc || null);
        } else {
          setSelectedService(null);
        }
      } catch (error) {
        console.error("Error loading laboratory:", error);
        showAlert({
          title: "Error",
          message: "Failed to load laboratory details. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) void loadLaboratory();
  }, [
    id,
    laboratories,
    searchLaboratories,
    showAlert,
    serviceId,
    serviceIndex,
  ]);

  const handleSelectSlot = (day: string, time: string) => {
    if (time === "") {
      if (selectedDay !== day) setSelectedSlot(null);
      setSelectedDay(day);
    } else {
      setSelectedDay(day);
      setSelectedSlot(time);
    }
  };

  const handleSelectCollectionType = (type: CollectionType) =>
    setSelectedCollectionType(type);

  const toggleTestSelection = (testIndex: number) => {
    setSelectedTests((prev) => ({ ...prev, [testIndex]: !prev[testIndex] }));
  };

  const getSelectedTestsCount = useMemo(() => {
    return Object.values(selectedTests).filter(Boolean).length;
  }, [selectedTests]);

  const calculateTotalPrice = useMemo(() => {
    if (!selectedService?.tests || selectedService.tests.length === 0)
      return selectedService?.price || 0;

    const allHaveIndividualPrices = selectedService.tests.every(
      (test: any) => test.price && test.price > 0,
    );
    if (!allHaveIndividualPrices) return selectedService?.price || 0;

    return selectedService.tests.reduce(
      (sum: number, test: any, idx: number) => {
        return selectedTests[idx] ? sum + (test.price || 0) : sum;
      },
      0,
    );
  }, [selectedService, selectedTests]);

  const handleBookTest = async () => {
    if (
      selectedSlot &&
      selectedDay &&
      selectedCollectionType &&
      selectedService
    ) {
      try {
        setLoading(true);

        const formattedTimeSlot = `${selectedDay} ${selectedSlot}`;

        const selectedTestIndices = Object.keys(selectedTests)
          .map((k) => parseInt(k, 10))
          .filter((k) => selectedTests[k]);

        const bookingData = {
          labId: laboratory.user._id,
          timeSlot: formattedTimeSlot,
          collectionType: selectedCollectionType,
          serviceId: serviceId || selectedService._id,
          selectedTests: selectedTestIndices,
        };

        const response = await apiClient.post(
          "/api/v1/book-appointment-lab",
          bookingData,
        );

        if (response.status === 201) {
          const appointmentId = response.data?._id;
          setBookedAppointmentId(appointmentId);
          setShowPaymentModal(true);
        }
      } catch (error: any) {
        console.error("Booking error:", error);
        showAlert({
          title: "Booking Failed",
          message:
            error?.response?.data?.message ||
            "Failed to book appointment. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    const missing: string[] = [];
    if (!selectedCollectionType) missing.push("collection type");
    if (!selectedDay) missing.push("day");
    if (!selectedSlot) missing.push("time slot");

    showAlert({
      title: "Missing Information",
      message: `Please select: ${missing.join(", ")}`,
      type: "warning",
    });
  };

  const handleGoBack = () => {
    // RN: '/(tabs)/laboratories' -> web equivalent
    navigate("/laboratories");
  };

  const handlePaymentSuccess = () => {
    showAlert({
      title: "Booking Confirmed!",
      message: `Your ${selectedService?.name} appointment has been booked successfully.\n\nLaboratory: ${
        laboratory?.laboratoryName
      }\nDate: ${selectedDay}\nTime: ${selectedSlot}\nCollection Type: ${
        selectedCollectionType === "lab" ? "Lab Visit" : "Home Collection"
      }\nSelected Tests: ${getSelectedTestsCount}/${selectedService?.tests?.length || 0}\nTotal Price: ₹${calculateTotalPrice}\n\nYou will receive reminders 24 hours and 1 hour before your appointment.`,
      type: "success",
      buttons: [
        {
          text: "OK",
          style: "primary",
          onPress: () => navigate("/"),
        },
      ],
    });
  };

  const isBookingEnabled = Boolean(
    selectedSlot && selectedDay && selectedCollectionType,
  );
  const disableBookForNoTests =
    hasIndividualTestPricing && getSelectedTestsCount === 0;
  const canBook = isBookingEnabled && !disableBookForNoTests;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
        <AlertComponent />
      </div>
    );
  }

  if (!laboratory || !selectedService) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <FaExclamationTriangle size={64} className="text-gray-400" />
        <div className="mt-4 text-xl font-bold">Service not found</div>
        <div className="mt-2 text-gray-600">
          The selected laboratory service could not be found.
        </div>
        <button
          type="button"
          onClick={handleGoBack}
          className="mt-4 rounded-lg bg-primary px-6 py-3 font-bold text-white"
        >
          Go Back
        </button>
        <AlertComponent />
      </div>
    );
  }

  return (
    <div className="relative space-y-7">
      <div className="flex lg:items-center lg:flex-row flex-col justify-between">
        <div>
          <h2 className="lg:text-[28px] text-2xl font-semibold font-poppins">
            Laboratories details
          </h2>
        </div>

        <button
          onClick={handleGoBack}
          className="flex items-center gap-3 px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base ml-auto"
        >
          <IoIosArrowRoundBack className="text-2xl" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className=" bg-white rounded-xl p-4">
        <div>
          <ServiceInfo
            service={selectedService}
            laboratoryName={laboratory.laboratoryName}
            laboratoryId={laboratory._id}
            handleBookTest={handleBookTest}
            calculateTotalPrice={calculateTotalPrice}
            getSelectedTestsCount={getSelectedTestsCount}
            hasIndividualTestPricing={hasIndividualTestPricing}
            isBookingEnabled={isBookingEnabled}
            selectedService={selectedService}
            canBook={canBook}
          />

          {/* Collection Type */}
          <div className="mt-6">
            <CollectionTypeSelector
              selectedType={selectedCollectionType}
              onSelectType={handleSelectCollectionType}
            />
          </div>

          {/* Test Selection */}
          {selectedService?.tests && selectedService.tests.length > 0 && (
            <div className="mt-6">
              <h2 className="lg:text-lg text-base font-medium text-[#45464E]">
                {hasIndividualTestPricing ? "Select Tests" : "Included Tests"}
              </h2>
              <div className="mb-3 text-gray-600 text-sm">
                {hasIndividualTestPricing
                  ? "Choose which tests to include in your package:"
                  : "All tests included in package price:"}
              </div>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                {(selectedService.tests || []).map(
                  (test: any, testIndex: number) => {
                    const isSelected = Boolean(selectedTests[testIndex]);
                    const clickable = hasIndividualTestPricing;

                    const Row = (
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            {isSelected ? (
                              <FaCheckCircle
                                size={18}
                                className="text-emerald-600"
                              />
                            ) : (
                              <FaRegCircle
                                size={18}
                                className="text-gray-400"
                              />
                            )}

                            <div
                              className={[
                                "ml-3 text-base font-medium",
                                isSelected ? "text-gray-800" : "text-gray-500",
                              ].join(" ")}
                            >
                              {test.name}
                            </div>
                          </div>

                          {test.description && (
                            <div
                              className={[
                                "ml-7 mt-2 text-sm",
                                isSelected ? "text-gray-600" : "text-gray-400",
                              ].join(" ")}
                            >
                              {test.description}
                            </div>
                          )}
                        </div>

                        {hasIndividualTestPricing && (
                          <div
                            className={[
                              "text-base font-bold",
                              isSelected ? "text-green-700" : "text-gray-400",
                            ].join(" ")}
                          >
                            ₹{test.price || 0}
                          </div>
                        )}
                      </div>
                    );

                    const className = [
                      "mb-3 rounded-xl border p-4",
                      isSelected
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50",
                      clickable ? "cursor-pointer hover:bg-opacity-80" : "",
                    ].join(" ");

                    return clickable ? (
                      <button
                        key={testIndex}
                        type="button"
                        onClick={() => toggleTestSelection(testIndex)}
                        className={className + " w-full text-left"}
                      >
                        {Row}
                      </button>
                    ) : (
                      <div key={testIndex} className={className}>
                        {Row}
                      </div>
                    );
                  },
                )}
              </div>

              {!hasIndividualTestPricing && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="text-center font-medium text-blue-800">
                    Package Price: ₹{selectedService?.price || 0}
                  </div>
                  <div className="mt-1 text-center text-sm text-blue-600">
                    All {selectedService.tests.length} tests included
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slots */}
          <div className="mt-6">
            <div className="lg:text-lg text-base font-medium text-[#45464E]">
              Available Slots
            </div>
            <p className="mb-4 text-gray-600 text-sm">
              Choose your preferred day and time for{" "}
              {selectedCollectionType === "home"
                ? "sample collection"
                : "lab visit"}
              :
            </p>
            <Slots
              availableSlots={availableSlots}
              availableDays={availableDays}
              onSelectSlot={handleSelectSlot}
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
            />
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 mt-3">
            {/* Address */}
            <LaboratoryAddress laboratory={laboratory} />

            {/* Summary */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="mb-3 text-lg font-semibold text-green-900">
                Booking Summary
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <FaCheckCircle size={16} className="text-emerald-600" />
                  <div className="ml-2 text-green-700">
                    Service: {selectedService.name}
                  </div>
                </div>

                {selectedService?.tests && selectedService.tests.length > 0 && (
                  <div className="flex items-center">
                    {getSelectedTestsCount > 0 ? (
                      <FaCheckCircle size={16} className="text-emerald-600" />
                    ) : (
                      <FaRegCircle size={16} className="text-gray-400" />
                    )}
                    <div
                      className={[
                        "ml-2",
                        getSelectedTestsCount > 0
                          ? "text-green-700"
                          : "text-gray-500",
                      ].join(" ")}
                    >
                      Tests Selected: {getSelectedTestsCount}/
                      {selectedService.tests.length}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  {selectedCollectionType ? (
                    <FaCheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <FaRegCircle size={16} className="text-gray-400" />
                  )}
                  <div
                    className={[
                      "ml-2",
                      selectedCollectionType
                        ? "text-green-700"
                        : "text-gray-500",
                    ].join(" ")}
                  >
                    Collection Type:{" "}
                    {selectedCollectionType
                      ? selectedCollectionType === "lab"
                        ? "Lab Visit"
                        : "Home Collection"
                      : "Not selected"}
                  </div>
                </div>

                <div className="flex items-center">
                  {selectedDay ? (
                    <FaCheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <FaRegCircle size={16} className="text-gray-400" />
                  )}
                  <div
                    className={[
                      "ml-2",
                      selectedDay ? "text-green-700" : "text-gray-500",
                    ].join(" ")}
                  >
                    Day: {selectedDay || "Not selected"}
                  </div>
                </div>

                <div className="flex items-center">
                  {selectedSlot ? (
                    <FaCheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <FaRegCircle size={16} className="text-gray-400" />
                  )}
                  <div
                    className={[
                      "ml-2",
                      selectedSlot ? "text-green-700" : "text-gray-500",
                    ].join(" ")}
                  >
                    Time: {selectedSlot || "Not selected"}
                  </div>
                </div>

                <div className="mt-3 border-t border-green-200 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-900">
                      Total Amount:
                    </div>
                    <div className="text-xl font-bold text-green-900">
                      ₹{calculateTotalPrice}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow mt-10">
          {selectedService.coverImage ? (
            <img
              src={selectedService.coverImage}
              className="h-100 w-full object-cover"
              alt="Service cover"
            />
          ) : (
            <div className="flex h-100 w-full flex-col items-center justify-center bg-linear-to-r from-blue-400 to-blue-600">
              <FaFlask size={64} className="text-white" />
              <div className="mt-2 text-lg font-medium text-white">
                Laboratory Service
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && bookedAppointmentId && selectedService && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          appointmentData={{
            appointmentId: bookedAppointmentId,
            appointmentType: "lab",
            amount: calculateTotalPrice,
            collectionType: selectedCollectionType || "",
            serviceName: selectedService.name,
            laboratoryName: laboratory?.laboratoryName || "Laboratory",
          }}
          isOnlineRequired={false}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <AlertComponent />
    </div>
  );
}
