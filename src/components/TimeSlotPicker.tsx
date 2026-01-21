import React, { useEffect, useState } from "react";
import { FaTimes, FaClock, FaCalendar, FaSpinner } from "react-icons/fa";
import client from "../api/client";

interface TimeSlotPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTimeSlot: (timeSlot: string) => void;
  providerId: string;
  providerType: "doctor" | "laboratory";
  loading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  visible,
  onClose,
  onSelectTimeSlot,
  providerId,
  providerType,
  loading: externalLoading = false,
}) => {
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = externalLoading || internalLoading;

  useEffect(() => {
    if (visible && providerId) {
      fetchAvailability();
    } else {
      // Reset state when modal closes
      setSelectedDay(null);
      setSelectedSlot(null);
      setError(null);
    }
  }, [visible, providerId]);

  const fetchAvailability = async () => {
    try {
      setInternalLoading(true);
      setError(null);
      const endpoint =
        providerType === "doctor"
          ? `/api/v1/doctor/${providerId}/availability`
          : `/api/v1/laboratory/${providerId}/availability`;

      const response = await client.get(endpoint);
      setAvailableDays(response.data.availableDays || []);
      setAvailableSlots(response.data.availableSlots || []);

      // Auto-select first available day if none selected
      if (
        response.data.availableDays &&
        response.data.availableDays.length > 0
      ) {
        setSelectedDay(response.data.availableDays[0]);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setError("Failed to load available time slots. Please try again.");
    } finally {
      setInternalLoading(false);
    }
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    const timeSlot = `${selectedDay} ${slot}`;
    onSelectTimeSlot(timeSlot);
    onClose();
  };

  const handleConfirm = () => {
    if (selectedDay && selectedSlot) {
      const timeSlot = `${selectedDay} ${selectedSlot}`;
      onSelectTimeSlot(timeSlot);
    }
  };

  // Get current date and time
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Filter available days to only show current day and future days
  const getFilteredDays = () => {
    const dayOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return availableDays.filter((day) => {
      const dayIndex = dayOrder.indexOf(day);
      const currentDayIndex = now.getDay();
      return dayIndex !== -1 && dayIndex >= currentDayIndex;
    });
  };

  // Filter available slots based on selected day
  const getFilteredSlots = () => {
    if (!selectedDay) return [];

    if (selectedDay === currentDay) {
      return availableSlots.filter((slot) => {
        const timeMatch = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) return true;

        let slotHour = parseInt(timeMatch[1]);
        const slotMinute = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();

        // Convert to 24-hour format
        if (period === "PM" && slotHour < 12) slotHour += 12;
        if (period === "AM" && slotHour === 12) slotHour = 0;

        // Check if slot is in the future
        if (slotHour < currentHour) return false;
        if (slotHour === currentHour && slotMinute <= currentMinute)
          return false;
        return true;
      });
    }

    return availableSlots;
  };

  const filteredDays = getFilteredDays();
  const filteredSlots = getFilteredSlots();

  if (!visible) return null;

  return (
    <div className="max-h-[90vh]">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FaCalendar className="mr-2" />
            Select New Time
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {providerType === "doctor" ? "Doctor" : "Laboratory"} Availability
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          disabled={loading}
        >
          <FaTimes className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-3">
              <FaTimes className="text-3xl mx-auto" />
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={fetchAvailability}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="py-8 text-center">
            <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-3" />
            <p className="text-gray-600">Loading available slots...</p>
          </div>
        ) : (
          <>
            {/* Available Days */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <FaCalendar className="text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Select Day</h3>
              </div>

              {filteredDays.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No upcoming days available</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredDays.map((day, index) => {
                    const isSelected = day === selectedDay;
                    const isToday = day === currentDay;

                    return (
                      <button
                        key={index}
                        onClick={() => handleDaySelect(day)}
                        className={`px-4 py-3 rounded-lg border hover:bg-gray-300 hover:text-indigo-500  transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-gray-200 text-indigo-500"
                            : "border-gray-300 hover:border-primary hover:bg-primary/5"
                        } ${isToday ? "font-semibold" : ""}`}
                        style={{ minWidth: "100px" }}
                      >
                        <div className="text-sm">{day}</div>
                        {isToday && (
                          <div className="text-xs opacity-80">Today</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time Slots */}
            {selectedDay && (
              <div>
                <div className="flex items-center mb-3">
                  <FaClock className="text-gray-500 mr-2" />
                  <h3 className="font-medium text-gray-900">
                    Select Time for {selectedDay}
                    {selectedDay === currentDay && " (Today)"}
                  </h3>
                </div>

                {filteredSlots.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">
                      No available slots for {selectedDay}
                    </p>
                    <p className="text-sm text-gray-500">
                      Please select a different day
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredSlots.map((slot, index) => {
                      const isSelected = slot === selectedSlot;

                      // Determine if slot is in the morning, afternoon, or evening
                      const timeMatch = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
                      let timeCategory = "";
                      if (timeMatch) {
                        const hour = parseInt(timeMatch[1]);
                        const period = timeMatch[3].toUpperCase();
                        if (period === "AM") {
                          timeCategory = "Morning";
                        } else if (
                          hour < 6 ||
                          (hour === 12 && period === "PM")
                        ) {
                          timeCategory = "Afternoon";
                        } else {
                          timeCategory = "Evening";
                        }
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-4 cursor-pointer rounded-lg border hover:bg-gray-300 hover:text-indigo-500 transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? "border-primary bg-gray-300 text-indigo-500"
                              : "border-gray-300 hover:border-primary hover:bg-primary/5"
                          }`}
                        >
                          <div className="text-lg font-semibold">{slot}</div>
                          {timeCategory && (
                            <div className="text-xs opacity-70 mt-1">
                              {timeCategory}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - Only show if we have a selection */}
      {selectedDay && selectedSlot && !error && !loading && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">Selected time:</p>
              <p className="font-semibold text-gray-900">
                {selectedDay}, {selectedSlot}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
            >
              <FaClock className="mr-2" />
              Confirm Selection
            </button>
          </div>
        </div>
      )}

      {/* Info message when no day selected */}
      {!selectedDay && !error && !loading && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <p className="text-sm text-blue-700 text-center">
            Please select a day to see available time slots
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
