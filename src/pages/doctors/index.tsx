// src/pages/DoctorDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaHospital,
  FaRegCircle,
  FaVideo,
} from "react-icons/fa";

import { useDoctorStore } from "@/store/doctorStore";
import DoctorInfo from "@/components/doctor/DoctorInfo";
import Addresses from "@/components/doctor/Addresses";
import PaymentModal from "@/components/PaymentModal";
import { useCustomAlert } from "@/components/CustomAlert";
import RatingDisplay from "@/components/RatingDisplay";
import apiClient from "@/api/client";
import { IoIosArrowRoundBack } from "react-icons/io";

interface SlotsProps {
  availableSlots?: string[];
  availableDays?: string[];
  onSelectSlot?: (day: string, time: string) => void;
  selectedDay?: string | null;
  selectedSlot?: string | null;
}

function Slots({
  availableSlots = [],
  availableDays = [],
  onSelectSlot,
  selectedDay,
  selectedSlot,
}: SlotsProps) {
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filteredDays = useMemo(() => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayIndex = now.getDay();

    return availableDays.filter((day) => {
      const dayIndex = dayNames.indexOf(day);
      return dayIndex !== -1 && dayIndex >= currentDayIndex;
    });
  }, [availableDays, now]);

  const filteredSlots = useMemo(() => {
    return availableSlots.filter((slot) => {
      if (selectedDay === currentDay) {
        const timeMatch = slot.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (!timeMatch) return true;

        let slotHour = parseInt(timeMatch[1], 10);
        const slotMinute = parseInt(timeMatch[2], 10);
        const period = timeMatch[3];

        if (period === "PM" && slotHour < 12) slotHour += 12;
        if (period === "AM" && slotHour === 12) slotHour = 0;

        if (slotHour < currentHour) return false;
        if (slotHour === currentHour && slotMinute <= currentMinute)
          return false;
      }
      return true;
    });
  }, [availableSlots, currentDay, currentHour, currentMinute, selectedDay]);

  if (filteredDays.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-center text-gray-600">No available days</p>
      </div>
    );
  }

  return (
    <div>
      {/* Available Days */}
      <div className="mb-4">
        <p className="mb-2 font-medium text-gray-600">Select Day:</p>
        <div className="flex flex-wrap gap-5">
          {filteredDays.map((day, idx) => (
            <button
              key={`${day}-${idx}`}
              type="button"
              onClick={() => onSelectSlot?.(day, "")}
              className={[
                " rounded-full py-2 cursor-pointer  duration-300 hover:bg-blue-600 px-4 text-white",
                selectedDay === day ? "bg-blue-600 " : "bg-gray-400",
              ].join(" ")}
            >
              <span className={selectedDay === day ? "font-medium" : ""}>
                {day}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDay && (
        <div>
          <p className="mb-2 font-medium text-gray-600">Select Time:</p>
          {filteredSlots.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-center text-gray-600">
                No available slots for {selectedDay}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-8">
              {filteredSlots.map((slot, idx) => (
                <button
                  key={`${slot}-${idx}`}
                  type="button"
                  onClick={() => onSelectSlot?.(selectedDay, slot)}
                  className={[
                    " rounded-full py-2 cursor-pointer  duration-300 hover:bg-blue-600 px-4 text-white",
                    selectedSlot === slot ? "bg-blue-600 " : "bg-gray-400",
                  ].join(" ")}
                >
                  <span className="text-center">{slot}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ConsultationTypeSelectorProps {
  consultationType: "in-person" | "online" | "both";
  selectedType?: "in-person" | "online" | null;
  onSelectType: (type: "in-person" | "online") => void;
}

function ConsultationTypeSelector({
  consultationType,
  selectedType,
  onSelectType,
}: ConsultationTypeSelectorProps) {
  const options =
    consultationType === "both"
      ? (["in-person", "online"] as const)
      : ([consultationType] as const);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((type) => {
          const active = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className={[
                " mb-2 rounded-lg border px-4 flex items-center gap-3 cursor-pointer hover:bg-[#5570f1] transition-all duration-300 py-3 hover:text-white ",
                active
                  ? " bg-[#5570f1]  text-white"
                  : " text-black border-gray-400",
              ].join(" ")}
            >
              {type === "in-person" ? (
                <FaHospital size={16} />
              ) : (
                <FaVideo size={16} />
              )}
              {type === "in-person" ? "In-Person" : "Online"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [selectedConsultationType, setSelectedConsultationType] = useState<
    "in-person" | "online" | null
  >(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string | null>(
    null,
  );

  const { showAlert, AlertComponent } = useCustomAlert();
  const { doctors } = useDoctorStore();

  const doctor = useMemo(() => {
    if (!id) return null;
    return doctors.find((doc: any) => doc?._id === id) || null;
  }, [doctors, id]);

  useEffect(() => {
    if (doctors.length > 0) {
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(() => setLoading(false), 1000);
    return () => window.clearTimeout(timer);
  }, [doctors, id]);

  useEffect(() => {
    if (
      doctor &&
      doctor.consultationType !== "both" &&
      !selectedConsultationType
    ) {
      setSelectedConsultationType(doctor.consultationType);
    }
  }, [doctor, selectedConsultationType]);

  const handleSelectSlot = (day: string, time: string) => {
    if (time === "") {
      if (selectedDay !== day) setSelectedSlot(null);
      setSelectedDay(day);
      return;
    }
    setSelectedDay(day);
    setSelectedSlot(time);
  };

  const handleSelectClinic = (clinic: any) => setSelectedClinic(clinic);

  const handleSelectConsultationType = (type: "in-person" | "online") => {
    setSelectedConsultationType(type);
    if (type === "online") setSelectedClinic(null);
  };

  const handleBookAppointment = async () => {
    const isInPerson = selectedConsultationType === "in-person";
    const clinicRequired = isInPerson && !selectedClinic;

    if (
      selectedSlot &&
      selectedDay &&
      selectedConsultationType &&
      !clinicRequired
    ) {
      try {
        setLoading(true);

        const formattedTimeSlot = `${selectedDay} ${selectedSlot}`;

        const bookingData: any = {
          doctorId: doctor?._id,
          timeSlot: formattedTimeSlot,
          consultationType: selectedConsultationType,
          ...(isInPerson && selectedClinic
            ? { clinicId: selectedClinic._id }
            : {}),
        };

        const response = await apiClient.post(
          "/api/v1/book-appointment-doctor",
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
    if (!selectedConsultationType) missing.push("consultation type");
    if (!selectedDay) missing.push("day");
    if (!selectedSlot) missing.push("time slot");
    if (clinicRequired)
      missing.push("clinic (required for in-person consultation)");

    showAlert({
      title: "Missing Information",
      message: `Please select: ${missing.join(", ")}`,
      type: "warning",
    });
  };

  const handleGoBack = () => navigate("/doctors");

  const handlePaymentSuccess = () => {
    showAlert({
      title: "Appointment Confirmed!",
      message: `Your appointment with Dr. ${
        doctor?.user?.name
      } has been booked and paid successfully.\n\nDate: ${selectedDay}\nTime: ${selectedSlot}\nType: ${
        selectedConsultationType === "in-person" ? "In-Person" : "Online"
      }${
        selectedConsultationType === "in-person" && selectedClinic
          ? `\nClinic: ${selectedClinic.clinicName}`
          : ""
      }\n\nYou will receive reminders 24 hours and 1 hour before your appointment.`,
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

  const isInPersonConsultation = selectedConsultationType === "in-person";
  const clinicRequiredAndSelected =
    !isInPersonConsultation || Boolean(selectedClinic);
  const isBookingEnabled = Boolean(
    selectedSlot &&
    selectedDay &&
    selectedConsultationType &&
    clinicRequiredAndSelected,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
        <AlertComponent />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Doctor not found</p>
        <AlertComponent />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex lg:items-center lg:flex-row flex-col justify-between">
        <div>
          <h2 className="lg:text-[28px] text-2xl font-semibold font-poppins">
            Dr.{doctor.user.name} details
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

      <div className="mt-4 bg-white rounded-xl p-4">
        {/* Content */}
        <div>
          <DoctorInfo
            doctor={doctor}
            handleBookAppointment={handleBookAppointment}
            isBookingEnabled={isBookingEnabled}
          />

          <div className="mt-6">
            <p className="lg:text-lg text-base font-medium text-[#45464E]">
              Choose Consultation Type
            </p>
            <p className="mb-3 text-gray-600">
              {doctor.consultationType === "both"
                ? "This doctor offers both consultation types. Please select your preference:"
                : `This doctor offers ${
                    doctor.consultationType === "in-person"
                      ? "in-person"
                      : "online"
                  } consultation only.`}
            </p>

            <ConsultationTypeSelector
              consultationType={doctor.consultationType}
              selectedType={selectedConsultationType}
              onSelectType={handleSelectConsultationType}
            />
          </div>

          <div className="mt-6">
            <p className="lg:text-lg text-base font-medium text-[#45464E] mb-2">
              Available Slots
            </p>
            <Slots
              availableSlots={doctor?.availableSlots || []}
              availableDays={doctor?.availableDays || []}
              onSelectSlot={handleSelectSlot}
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
            />
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
            <div className=" ">
              <p className="lg:text-lg text-base font-medium text-[#45464E]">
                Clinic Information
              </p>
              <p className="mb-4 text-sm text-gray-600">
                {selectedConsultationType === "online"
                  ? "Clinic selection not required for online consultations"
                  : selectedConsultationType === "in-person"
                    ? "Choose a clinic for your in-person appointment:"
                    : "Available clinic locations:"}
              </p>

              <div
                className={
                  selectedConsultationType === "online" ? "opacity-50" : ""
                }
              >
                <Addresses
                  clinics={doctor.clinics || []}
                  onSelectClinic={
                    selectedConsultationType === "online"
                      ? undefined
                      : handleSelectClinic
                  }
                  disabled={selectedConsultationType === "online"}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="mb-3 text-lg font-bold text-blue-900">
                Booking Summary
              </p>

              <div className="space-y-2">
                <div className="flex items-center">
                  {selectedConsultationType ? (
                    <FaCheckCircle size={16} color="#059669" />
                  ) : (
                    <FaRegCircle size={16} color="#9CA3AF" />
                  )}
                  <p
                    className={[
                      "ml-2",
                      selectedConsultationType
                        ? "text-green-700"
                        : "text-gray-500",
                    ].join(" ")}
                  >
                    Consultation Type:{" "}
                    {selectedConsultationType
                      ? selectedConsultationType === "in-person"
                        ? "In-Person"
                        : "Online"
                      : "Not selected"}
                  </p>
                </div>

                <div className="flex items-center">
                  {selectedDay ? (
                    <FaCheckCircle size={16} color="#059669" />
                  ) : (
                    <FaRegCircle size={16} color="#9CA3AF" />
                  )}
                  <p
                    className={[
                      "ml-2",
                      selectedDay ? "text-green-700" : "text-gray-500",
                    ].join(" ")}
                  >
                    Day: {selectedDay || "Not selected"}
                  </p>
                </div>

                <div className="flex items-center">
                  {selectedSlot ? (
                    <FaCheckCircle size={16} color="#059669" />
                  ) : (
                    <FaRegCircle size={16} color="#9CA3AF" />
                  )}
                  <p
                    className={[
                      "ml-2",
                      selectedSlot ? "text-green-700" : "text-gray-500",
                    ].join(" ")}
                  >
                    Time: {selectedSlot || "Not selected"}
                  </p>
                </div>

                {selectedConsultationType === "in-person" && (
                  <div className="flex items-center">
                    {selectedClinic ? (
                      <FaCheckCircle size={16} color="#059669" />
                    ) : (
                      <FaRegCircle size={16} color="#9CA3AF" />
                    )}
                    <p
                      className={[
                        "ml-2",
                        selectedClinic ? "text-green-700" : "text-gray-500",
                      ].join(" ")}
                    >
                      Clinic: {selectedClinic?.clinicName || "Not selected"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow mt-10">
          {doctor.coverImage ? (
            <img
              src={doctor.coverImage}
              className="h-100 w-full object-cover"
              alt="Doctor cover"
            />
          ) : (
            <div className="flex   w-full items-center justify-center bg-gray-100">
              <FaHospital size={64} color="#9CA3AF" />
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && bookedAppointmentId && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          appointmentData={{
            appointmentId: bookedAppointmentId,
            appointmentType: "doctor",
            amount: doctor?.consultationFee || 500,
            consultationType: selectedConsultationType || "",
            doctorName: doctor?.user?.name || "Doctor",
          }}
          isOnlineRequired={selectedConsultationType === "online"}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <AlertComponent />
    </div>
  );
}
