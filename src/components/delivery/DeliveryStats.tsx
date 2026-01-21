import React from "react";
import {
  FaList,
  FaCheck,
  FaClock,
  FaTimesCircle,
  FaTrophy,
  FaCheckCircle,
  FaStar,
  FaLightbulb,
} from "react-icons/fa";
import { Colors } from "@/constants/Colors";
import { DeliveryStats as DeliveryStatsType } from "@/store/deliveryStore";

interface DeliveryStatsProps {
  stats: DeliveryStatsType | null;
}

const DeliveryStats: React.FC<DeliveryStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 text-center">No statistics available</p>
      </div>
    );
  }

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string,
    subtitle?: string,
    trend?: string,
  ) => (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:-translate-y-1.5 duration-200 cursor-pointer"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center mb-2 relative">
        <div style={{ color }}>{icon}</div>
        <p className="text-xs font-semibold text-gray-800 ml-2">{title}</p>
        {trend && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: trend === "up" ? "#10B981" : "#EF4444" }}
          >
            <div
              className={`text-white text-xs ${trend === "up" ? "transform -rotate-45" : "transform rotate-45"}`}
            >
              {trend === "up" ? "↑" : "↓"}
            </div>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="flex-1">
      {/* Performance Overview */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Performance Overview
        </h2>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          {renderStatCard(
            "Total Orders",
            stats.totalOrders,
            <FaList size={20} />,
            "#3B82F6",
            "All time",
          )}
          {renderStatCard(
            "Completed",
            stats.completedOrders,
            <FaCheck size={20} />,
            "#10B981",
            "Successfully delivered",
          )}
          {renderStatCard(
            "Pending",
            stats.pendingOrders,
            <FaClock size={20} />,
            "#F59E0B",
            "In progress",
          )}
          {renderStatCard(
            "Rejected",
            stats.rejectedOrders,
            <FaTimesCircle size={20} />,
            "#EF4444",
            "Declined orders",
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Performance Metrics
        </h2>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center mb-2">
              <FaTrophy size={18} className="text-yellow-500" />
              <p className="text-sm font-semibold text-gray-800 ml-2">
                Completion Rate
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-500 mb-1">
              {stats.completionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              Successfully completed deliveries
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md relative">
            <div className="flex items-center mb-2">
              <FaClock size={18} className="text-blue-500" />
              <p className="text-sm font-semibold text-gray-800 ml-2">
                Avg. Delivery Time
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-500 mb-1">
              {stats.averageDeliveryTimeHours.toFixed(1)}h
            </p>
            <p className="text-xs text-gray-500">
              Average time to complete delivery
            </p>
            {stats.averageDeliveryTimeHours < 2 && (
              <div className="absolute top-2 right-2 flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                <FaStar size={12} className="text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-800 ml-1">
                  Fast Delivery
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center mb-3">
            <FaCheckCircle size={16} className="text-green-500" />
            <p className="text-sm text-gray-800 ml-3 flex-1">
              {stats.completedOrders} orders delivered this period
            </p>
          </div>
          <div className="flex items-center mb-3">
            <FaClock size={16} className="text-yellow-500" />
            <p className="text-sm text-gray-800 ml-3 flex-1">
              {stats.pendingOrders} orders currently in progress
            </p>
          </div>
          <div className="flex items-center">
            <FaStar size={16} className="text-yellow-500" />
            <p className="text-sm text-gray-800 ml-3 flex-1">
              {stats.completionRate >= 90
                ? "Excellent"
                : stats.completionRate >= 75
                  ? "Good"
                  : "Needs Improvement"}{" "}
              performance rating
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Tips for Better Performance
        </h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 shadow-sm flex items-start">
            <FaLightbulb size={16} className="text-yellow-500 mt-0.5" />
            <p className="text-sm text-gray-800 ml-2 flex-1 leading-relaxed">
              Accept orders promptly to maintain good response time
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm flex items-start">
            <FaLightbulb size={16} className="text-yellow-500 mt-0.5" />
            <p className="text-sm text-gray-800 ml-2 flex-1 leading-relaxed">
              Update delivery status regularly for better tracking
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm flex items-start">
            <FaLightbulb size={16} className="text-yellow-500 mt-0.5" />
            <p className="text-sm text-gray-800 ml-2 flex-1 leading-relaxed">
              Communicate with customers for smooth deliveries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;
