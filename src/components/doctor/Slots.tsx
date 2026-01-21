// src/components/laboratory/Slots.tsx
import React, { useMemo, useState } from "react";

interface SlotsProps {
  availableSlots?: string[];
  availableDays?: string[];
  onSelectSlot?: (time: string) => void;
}

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export default function Slots({ availableSlots = [], availableDays = [], onSelectSlot }: SlotsProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const currentDay = useMemo(() => now.toLocaleDateString("en-US", { weekday: "long" }), [now]);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filteredDays = useMemo(() => {
    const currentDayIndex = now.getDay();
    return (availableDays || []).filter((day) => {
      const idx = DAY_INDEX[day];
      return idx !== undefined && idx >= currentDayIndex;
    });
  }, [availableDays, now]);

  const filteredSlots = useMemo(() => {
    const includeDayTimeFilter = (availableDays || []).includes(currentDay);

    return (availableSlots || []).filter((slot) => {
      const timeMatch = slot.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (!timeMatch) return true;

      let slotHour = parseInt(timeMatch[1], 10);
      const slotMinute = parseInt(timeMatch[2], 10);
      const period = timeMatch[3];

      if (period === "PM" && slotHour < 12) slotHour += 12;
      if (period === "AM" && slotHour === 12) slotHour = 0;

      if (includeDayTimeFilter) {
        if (slotHour < currentHour) return false;
        if (slotHour === currentHour && slotMinute <= currentMinute) return false;
      }

      return true;
    });
  }, [availableDays, availableSlots, currentDay, currentHour, currentMinute]);

  if (filteredSlots.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-center text-gray-600">No available slots for today</p>
      </div>
    );
  }

  return (
    <div>
      {/* Available Days */}
      {filteredDays.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-gray-600">Available on:</div>
          <div className="flex flex-wrap">
            {filteredDays.map((day, index) => {
              const isToday = day === currentDay;
              return (
                <div
                  key={`${day}-${index}`}
                  className={[
                    "mr-2 mb-2 rounded-full px-3 py-1",
                    isToday ? "bg-primary/20" : "bg-gray-100",
                  ].join(" ")}
                >
                  <span className={isToday ? "font-medium text-primary" : "text-gray-700"}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Slots */}
      <div className="flex flex-wrap">
        {filteredSlots.map((slot, index) => {
          const active = selectedSlot === slot;
          return (
            <button
              key={`${slot}-${index}`}
              type="button"
              onClick={() => {
                setSelectedSlot(slot);
                onSelectSlot?.(slot);
              }}
              className={[
                "mb-2 mr-2 rounded-lg px-4 py-2",
                active ? "bg-primary" : "bg-gray-100",
              ].join(" ")}
            >
              <span className={active ? "text-white" : "text-gray-700"}>{slot}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
