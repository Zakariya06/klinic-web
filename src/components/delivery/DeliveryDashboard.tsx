import React, { useState, useEffect, useCallback } from "react";
import {
  FaCalendar,
  FaFilter,
  FaTimes,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaBars,
} from "react-icons/fa";
import { Colors } from "@/constants/Colors";
import { useDeliveryStore } from "@/store/deliveryStore";
import DeliveryOrderList from "./DeliveryOrderList";
import DeliveryStats from "./DeliveryStats";
import { MdRefresh } from "react-icons/md";
import { TbRotate } from "react-icons/tb";

export const DeliveryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "stats">("orders");
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    fetchDeliveryOrders,
    fetchDeliveryStats,
    isLoading,
    stats,
    orders,
    setFilters,
  } = useDeliveryStore();

  // Data fetching on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchDeliveryOrders();
      } catch (err) {
        window.alert("Failed to fetch delivery orders.");
      }
      try {
        await fetchDeliveryStats();
      } catch (err) {
        window.alert("Failed to fetch delivery stats.");
      }
    };
    fetchData();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    let statsImproved = false;
    try {
      await Promise.all([
        fetchDeliveryOrders(undefined, true).catch(() => {
          window.alert("Failed to refresh orders.");
        }),
        fetchDeliveryStats()
          .then((result) => {
            statsImproved = !!result;
          })
          .catch(() => {
            window.alert("Failed to refresh stats.");
          }),
      ]);
      if (statsImproved) {
        alert(
          "Stats Updated! 📈\nYour delivery statistics have been updated with new data.",
        );
      }
    } catch (error) {
      window.alert("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, [fetchDeliveryOrders, fetchDeliveryStats]);

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setShowDatePicker(false);
      setSelectedTimeFilter("all"); // Clear time filter when selecting specific date

      // Format date for API
      const formattedDate = date.toISOString().split("T")[0];
      console.log("Selected date:", formattedDate);

      // Update filters with selected date
      setFilters({ date: formattedDate, startDate: undefined, page: 1 });
      fetchDeliveryOrders(
        { date: formattedDate, startDate: undefined, page: 1 },
        true,
      );
    },
    [setFilters, fetchDeliveryOrders],
  );

  // Handle time filter selection
  const handleTimeFilterSelect = useCallback(
    (filter: string) => {
      setSelectedTimeFilter(filter);
      setSelectedDate(null);

      let startDate: string | undefined;
      const today = new Date();

      switch (filter) {
        case "1month":
          startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            today.getDate(),
          )
            .toISOString()
            .split("T")[0];
          break;
        case "3months":
          startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 3,
            today.getDate(),
          )
            .toISOString()
            .split("T")[0];
          break;
        case "6months":
          startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 6,
            today.getDate(),
          )
            .toISOString()
            .split("T")[0];
          break;
        case "1year":
          startDate = new Date(
            today.getFullYear() - 1,
            today.getMonth(),
            today.getDate(),
          )
            .toISOString()
            .split("T")[0];
          break;
        default:
          startDate = undefined;
      }

      console.log("Selected time filter:", filter, "start date:", startDate);

      // Update filters
      setFilters({ startDate, date: undefined, page: 1 });
      fetchDeliveryOrders({ startDate, date: undefined, page: 1 }, true);
    },
    [setFilters, fetchDeliveryOrders],
  );

  // Clear date filter
  const handleClearDateFilter = useCallback(() => {
    setSelectedDate(null);
    setSelectedTimeFilter("all");
    setFilters({ date: undefined, startDate: undefined, page: 1 });
    fetchDeliveryOrders({ page: 1 }, true);
  }, [setFilters, fetchDeliveryOrders]);

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const isToday = (day: number) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      return date.toDateString() === today.toDateString();
    };
    const isSelected = (day: number) => {
      if (!selectedDate) return false;
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      return date.toDateString() === selectedDate.toDateString();
    };
    const isFuture = (day: number) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 0);
      return date >= tomorrow;
    };

    const calendarDays = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add day headers
    dayNames.forEach((day) => {
      calendarDays.push(
        <div key={`header-${day}`} className="w-1/7 text-center mb-2">
          <div className="text-xs text-gray-700">{day}</div>
        </div>,
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="w-1/7 h-10" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const isFutureDate = isFuture(day);

      calendarDays.push(
        <button
          key={`day-${day}`}
          onClick={() => !isFutureDate && handleDateSelect(date)}
          disabled={isFutureDate}
          className={`
            w-1/7 h-10 flex items-center justify-center rounded-lg mb-2 transition-all
            ${isToday(day) ? "bg-blue-500 text-white" : ""}
            ${isSelected(day) ? "bg-blue-600 text-white" : ""}
            ${
              isFutureDate
                ? "bg-blue-100 text-gray-500 cursor-not-allowed"
                : "hover:bg-gray-100"
            }
            ${
              !isToday(day) && !isSelected(day) && !isFutureDate
                ? "text-gray-800"
                : ""
            }
          `}
        >
          <span
            className={`
            text-sm font-medium
            ${isFutureDate ? "text-gray-400" : ""}
          `}
          >
            {day}
          </span>
        </button>,
      );
    }

    return calendarDays;
  };

  // Custom date picker modal
  const renderDatePickerModal = () => (
    <div
      className={`fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center px-4 z-50 ${
        showDatePicker ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">
          Select Date
        </h2>

        {/* Time period filters */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Quick Filters:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeFilterSelect("1month")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedTimeFilter === "1month"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              1 Month
            </button>

            <button
              onClick={() => handleTimeFilterSelect("3months")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedTimeFilter === "3months"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              3 Months
            </button>

            <button
              onClick={() => handleTimeFilterSelect("6months")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedTimeFilter === "6months"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              6 Months
            </button>

            <button
              onClick={() => handleTimeFilterSelect("1year")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedTimeFilter === "1year"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              1 Year
            </button>
          </div>
        </div>

        {/* Custom Calendar */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-800 mb-3 text-center">
            Or select specific date:
          </h3>

          {/* Date restriction info */}
          <div className="flex items-center bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
            <FaInfoCircle size={14} className="text-gray-500" />
            <span className="text-sm text-gray-600 ml-2">
              Select the dates only (from past)
            </span>
          </div>

          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaChevronLeft size={16} className="text-blue-500" />
            </button>

            <div className="text-lg font-bold text-gray-800">
              {getMonthName(currentMonth)}
            </div>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaChevronRight size={16} className="text-blue-500" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="flex flex-wrap justify-between">
            {renderCalendar()}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClearDateFilter}
            className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-semibold border border-red-200 hover:bg-red-100 transition-colors"
          >
            Clear Filter
          </button>

          <button
            onClick={() => setShowDatePicker(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabButton = (
    tab: "orders" | "stats",
    title: string,
    icon: React.ReactNode,
    badge?: number,
  ) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        flex items-center px-5 py-3 rounded-2xl transition-all relative cursor-pointer
        ${
          activeTab === tab
            ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }
        shadow-md
      `}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-2 font-semibold">{title}</span>
        {badge && badge > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {badge}
          </div>
        )}
      </div>
    </button>
  );

  if (isLoading && !refreshing) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="w-full flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h1 className="dashboard-heading">Delivery Dashboard</h1>
        </div>

        <div className="flex items-center justify-end flex-wrap space-x-4">
          {/* Calendar Button */}
          <button
            onClick={() => setShowDatePicker(true)}
            className={`
              py-2 px-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2
              ${
                selectedDate || selectedTimeFilter !== "all"
                  ? "bg-[#5570F1] text-white"
                  : "bg-[#5570F11F] text-[#5570F1] hover:bg-gray-200"
              }
              shadow-sm
            `}
          >
            <FaCalendar size={20} /> Select Date
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base"
          >
            <TbRotate
              className={`text-2xl transition-transform duration-500 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Date Filter Display */}
      {(selectedDate || selectedTimeFilter !== "all") && (
        <div className="flex items-center px-4 py-2 bg-blue-50 border-b border-blue-100 gap-2 mb-3">
          <FaFilter size={14} className="text-blue-500" />
          <span className="flex-1 text-sm text-blue-600 font-medium">
            {selectedDate
              ? `Showing orders for ${selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              : selectedTimeFilter === "1month"
                ? "Last 1 Month"
                : selectedTimeFilter === "3months"
                  ? "Last 3 Months"
                  : selectedTimeFilter === "6months"
                    ? "Last 6 Months"
                    : selectedTimeFilter === "1year"
                      ? "Last 1 Year"
                      : "All Orders"}
          </span>
          <button
            onClick={handleClearDateFilter}
            className="hover:bg-red-100 p-1 rounded cursor-pointer"
          >
            <FaTimes size={17} className="text-red-500" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl p-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 py-3 border-b border-gray-200 ">
          {renderTabButton(
            "orders",
            "Orders",
            <FaList size={18} />,
            orders?.filter((o: any) => o.status === "assigned_to_delivery")
              ?.length || 0,
          )}
          {renderTabButton("stats", "Statistics", <FaBars size={18} />)}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "orders" ? (
            <DeliveryOrderList />
          ) : (
            <div className="h-full overflow-y-auto py-4 ">
              <DeliveryStats stats={stats} />
            </div>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      {renderDatePickerModal()}
    </div>
  );
};

export default DeliveryDashboard;
