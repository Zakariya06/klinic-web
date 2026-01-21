import React, { useMemo } from "react";

interface SlotsProps {
  availableSlots?: string[];
  availableDays?: string[];
  onSelectSlot?: (day: string, time: string) => void;
  selectedDay?: string | null;
  selectedSlot?: string | null;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export default function Slots({
  availableSlots = [],
  availableDays = [],
  onSelectSlot,
  selectedDay,
  selectedSlot,
}: SlotsProps) {
  const now = useMemo(() => new Date(), []);
  const currentDay = useMemo(
    () => now.toLocaleDateString("en-US", { weekday: "long" }),
    [now],
  );
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filteredDays = useMemo(() => {
    const currentDayIndex = now.getDay();
    return (availableDays || []).filter((day) => {
      const dayIndex = DAYS.indexOf(day as (typeof DAYS)[number]);
      return dayIndex !== -1 && dayIndex >= currentDayIndex;
    });
  }, [availableDays, now]);

  const filteredSlots = useMemo(() => {
    return (availableSlots || []).filter((slot) => {
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
        <p className="mb-2 lg:text-lg text-base font-medium text-[#45464E]">
          Select Day:
        </p>
        <div className="flex flex-wrap">
          {filteredDays.map((day, index) => {
            const active = selectedDay === day;
            return (
              <button
                key={`${day}-${index}`}
                type="button"
                onClick={() => onSelectSlot?.(day, "")}
                className={[
                  "mb-2 mr-2 rounded-full px-4 py-2 cursor-pointer duration-300 hover:bg-gray-300 hover:text-white",
                  active ? "bg-gray-300" : "bg-gray-100",
                ].join(" ")}
              >
                <span
                  className={
                    active ? "font-medium text-white" : "text-gray-700"
                  }
                >
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDay && (
        <div>
          <p className="mb-2 lg:text-lg text-base font-medium text-[#45464E]">
            Select Time:
          </p>

          {filteredSlots.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-center text-gray-600">
                No available slots for {selectedDay}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap">
              {filteredSlots.map((slot, index) => {
                const active = selectedSlot === slot;
                return (
                  <button
                    key={`${slot}-${index}`}
                    type="button"
                    onClick={() => onSelectSlot?.(selectedDay, slot)}
                    className={[
                      "mb-2 mr-2 rounded-lg px-4 py-2 cursor-pointer duration-300 hover:bg-gray-300 hover:text-white ",
                      active ? "bg-gray-300" : "bg-gray-100",
                    ].join(" ")}
                  >
                    <span className={active ? "text-white" : "text-gray-700"}>
                      {slot}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
