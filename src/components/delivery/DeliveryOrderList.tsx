import React, { useState, useCallback, useEffect } from "react";
import {
  FaInbox,
  FaList,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaCheck,
  FaTimesCircle,
} from "react-icons/fa";
import { Colors } from "@/constants/Colors";
import { useDeliveryStore, DeliveryOrder } from "@/store/deliveryStore";
import DeliveryOrderCard from "./DeliveryOrderCard";

const DeliveryOrderList: React.FC = () => {
  const {
    orders,
    pagination,
    isLoading,
    error,
    fetchDeliveryOrders,
    setFilters,
  } = useDeliveryStore();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Debug logging
  console.log("DeliveryOrderList render:", {
    ordersCount: orders.length,
    isLoading,
    error,
    selectedStatus,
    pagination,
  });

  const handleStatusFilter = useCallback(
    (status: string | null) => {
      setSelectedStatus(status);
      setFilters({ status: status || undefined, page: 1 });
      fetchDeliveryOrders({ status: status || undefined, page: 1 }, true);
    },
    [setFilters, fetchDeliveryOrders],
  );

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoading) {
      const nextPage = pagination.currentPage + 1;
      setFilters({ page: nextPage });
      fetchDeliveryOrders({ page: nextPage });
    }
  }, [pagination, isLoading, setFilters, fetchDeliveryOrders]);

  const getStatusCount = (status: string) => {
    return orders.filter((order) => order.status === status).length;
  };

  const renderStatusFilter = (
    status: string,
    label: string,
    icon: React.ReactNode,
    color: string,
    count: number,
  ) => (
    <button
      onClick={() =>
        handleStatusFilter(selectedStatus === status ? null : status)
      }
      className={`
        flex items-center px-4 py-2 mx-1 rounded-full transition-all whitespace-nowrap cursor-pointer hover:bg-gray-100
        ${
          selectedStatus === status
            ? "text-white"
            : "text-gray-800 hover:bg-gray-200"
        }
      `}
      style={{
        backgroundColor: selectedStatus === status ? color : "#F3F4F6",
        minWidth: "fit-content",
      }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span
          className={`text-sm font-medium ${selectedStatus === status ? "text-white" : "text-gray-800"}`}
        >
          {label}
        </span>
        {count > 0 && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center"
            style={{
              backgroundColor: selectedStatus === status ? "white" : color,
              color: selectedStatus === status ? color : "white",
            }}
          >
            {count}
          </span>
        )}
      </div>
    </button>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <FaInbox size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        {error
          ? "Error loading orders"
          : selectedStatus
            ? `No ${selectedStatus} orders found`
            : "No orders assigned yet"}
      </h3>
      <p className="text-gray-600 text-center mb-6">
        {isLoading
          ? "Loading orders..."
          : error
            ? error
            : "Orders will appear here when assigned"}
      </p>
      {error && (
        <button
          onClick={() => fetchDeliveryOrders()}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );

  const renderFooter = () => {
    if (!pagination?.hasNextPage) return null;

    return (
      <div className="flex justify-center py-6">
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="flex gap-3 px-4 py-3 bg-white rounded-lg shadow-sm mb-3">
      <button
        onClick={() => handleStatusFilter(null)}
        className="flex items-center px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FaList size={16} className="text-blue-500 mr-2" />
        <span className="text-sm font-medium">All ({orders.length})</span>
      </button>

      <button
        onClick={() => handleStatusFilter("assigned_to_delivery")}
        className="flex items-center px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FaClock size={16} className="text-yellow-500 mr-2" />
        <span className="text-sm font-medium">
          New ({getStatusCount("assigned_to_delivery")})
        </span>
      </button>

      <button
        onClick={() => handleStatusFilter("out_for_delivery")}
        className="flex items-center px-4 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FaTruck size={16} className="text-blue-500 mr-2" />
        <span className="text-sm font-medium">
          In Transit ({getStatusCount("out_for_delivery")})
        </span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      {orders.length > 0 && renderQuickActions()}

      {/* Status Filters */}
      <div className="sticky top-0 z-10 bg-white  py-3 shadow-sm">
        <div className="flex overflow-x-auto pb-2">
          <div className="flex gap-1">
            {renderStatusFilter(
              "assigned_to_delivery",
              "Assigned",
              <FaClock size={14} />,
              "#F59E0B",
              getStatusCount("assigned_to_delivery"),
            )}
            {renderStatusFilter(
              "delivery_accepted",
              "Accepted",
              <FaCheckCircle size={14} />,
              "#10B981",
              getStatusCount("delivery_accepted"),
            )}
            {renderStatusFilter(
              "out_for_delivery",
              "In Transit",
              <FaTruck size={14} />,
              "#3B82F6",
              getStatusCount("out_for_delivery"),
            )}
            {renderStatusFilter(
              "delivered",
              "Delivered",
              <FaCheck size={14} />,
              "#059669",
              getStatusCount("delivered"),
            )}
            {renderStatusFilter(
              "delivery_rejected",
              "Rejected",
              <FaTimesCircle size={14} />,
              "#EF4444",
              getStatusCount("delivery_rejected"),
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="space-y-4 py-4">
              {orders.map((item) => (
                <DeliveryOrderCard key={item._id.toString()} order={item} />
              ))}
            </div>
            {renderFooter()}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderList;
