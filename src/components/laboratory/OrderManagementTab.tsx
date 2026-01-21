import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaList,
  FaMoneyBill,
  FaShoppingBag,
  FaTimesCircle,
  FaTruck,
  FaUserPlus,
} from "react-icons/fa";

import apiClient from "@/api/client";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import DeliveryAssignmentModal from "@/components/orders/DeliveryAssignmentModal";

interface LabOrder {
  _id: string;
  orderedBy: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  laboratoryUser?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  deliveryPartner?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profile?: {
      address?: {
        address?: string;
        pinCode?: string;
      };
      city?: string;
    };
  };
  products?: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      imageUrl?: string;
    };
    quantity: number;
  }>;
  prescription?: string;
  totalPrice: number;
  isPaid: boolean;
  cod: boolean;
  needAssignment: boolean;
  status:
    | "pending"
    | "confirmed"
    | "assigned_to_delivery"
    | "delivery_accepted"
    | "out_for_delivery"
    | "delivered"
    | "delivery_rejected"
    | "cancelled";
  customerAddress?: string;
  customerPinCode?: string;
  createdAt: string;
  updatedAt: string;

  acceptedAt?: string | null;
  assignedAt?: string | null;
  deliveredAt?: string | null;
  outForDeliveryAt?: string | null;
  rejectionReason?: string | null;
  __v?: number;
}

interface OrderManagementTabProps {
  onRefresh?: () => void;
}

type FilterType = "all" | "new" | "assigned" | "delivered";

const statusColorClass = (status: LabOrder["status"]) => {
  switch (status) {
    case "pending":
      return "bg-amber-500";
    case "confirmed":
      return "bg-blue-500";
    case "assigned_to_delivery":
      return "bg-violet-500";
    case "delivery_accepted":
      return "bg-emerald-500";
    case "out_for_delivery":
      return "bg-orange-500";
    case "delivered":
      return "bg-emerald-600";
    case "delivery_rejected":
      return "bg-red-500";
    case "cancelled":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const StatusIcon: React.FC<{ status: LabOrder["status"]; className?: string }> = ({
  status,
  className,
}) => {
  switch (status) {
    case "pending":
      return <FaClock className={className} />;
    case "confirmed":
      return <FaCheckCircle className={className} />;
    case "assigned_to_delivery":
      return <FaUserPlus className={className} />;
    case "delivery_accepted":
      return <FaCheckCircle className={className} />;
    case "out_for_delivery":
      return <FaTruck className={className} />;
    case "delivered":
      return <FaCheckCircle className={className} />;
    case "delivery_rejected":
      return <FaTimesCircle className={className} />;
    case "cancelled":
      return <FaTimesCircle className={className} />;
    default:
      return <FaClock className={className} />;
  }
};

const statusText = (status: LabOrder["status"]) => {
  switch (status) {
    case "pending":
      return "PENDING";
    case "confirmed":
      return "CONFIRMED";
    case "assigned_to_delivery":
      return "ASSIGNED";
    case "delivery_accepted":
      return "ACCEPTED";
    case "out_for_delivery":
      return "OUT FOR DELIVERY";
    case "delivered":
      return "DELIVERED";
    case "delivery_rejected":
      return "REJECTED";
    case "cancelled":
      return "CANCELLED";
    default:
      return (status as string).toUpperCase();
  }
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrderManagementTab: React.FC<OrderManagementTabProps> = ({ onRefresh }) => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showAssignDelivery, setShowAssignDelivery] = useState(false);

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const fetchLabOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/v1/orders/lab-orders-with-addresses");

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to fetch orders");
      }

      const list: LabOrder[] = response.data?.data?.orders || [];
      setOrders(list);
    } catch (error) {
      console.error("Error fetching lab orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabOrders();
  }, [fetchLabOrders]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLabOrders();
    setRefreshing(false);
    onRefresh?.();
  }, [fetchLabOrders, onRefresh]);

  const handleConfirmOrder = useCallback(
    async (orderId: string) => {
      try {
        const response = await apiClient.put(`/api/v1/orders/${orderId}/status`, {
          status: "confirmed",
        });

        if (response.data?.success) {
          window.alert("Order confirmed successfully!");
          await fetchLabOrders();
        } else {
          window.alert("Failed to confirm order. Please try again.");
        }
      } catch (error) {
        console.error("Error confirming order:", error);
        window.alert("Failed to confirm order. Please try again.");
      }
    },
    [fetchLabOrders]
  );

  const assignedOrders = useMemo(
    () => orders.filter((o) => !!o.laboratoryUser),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    switch (activeFilter) {
      case "new":
        return assignedOrders.filter((o) => o.status === "pending" || o.status === "confirmed");
      case "assigned":
        return assignedOrders.filter(
          (o) =>
            o.status === "assigned_to_delivery" ||
            o.status === "delivery_accepted" ||
            o.status === "out_for_delivery"
        );
      case "delivered":
        return assignedOrders.filter((o) => o.status === "delivered");
      case "all":
      default:
        return assignedOrders;
    }
  }, [assignedOrders, activeFilter]);

  const filterCount = useCallback(
    (filterType: FilterType) => {
      switch (filterType) {
        case "new":
          return assignedOrders.filter((o) => o.status === "pending" || o.status === "confirmed")
            .length;
        case "assigned":
          return assignedOrders.filter(
            (o) =>
              o.status === "assigned_to_delivery" ||
              o.status === "delivery_accepted" ||
              o.status === "out_for_delivery"
          ).length;
        case "delivered":
          return assignedOrders.filter((o) => o.status === "delivered").length;
        case "all":
        default:
          return assignedOrders.length;
      }
    },
    [assignedOrders]
  );

  const filters = useMemo(
    () =>
      [
        { id: "all" as const, label: "Total", icon: FaList },
        { id: "new" as const, label: "New", icon: FaClock },
        { id: "assigned" as const, label: "Assigned", icon: FaUserPlus },
        { id: "delivered" as const, label: "Delivered", icon: FaCheckCircle },
      ] as const,
    []
  );

  const EmptyState = useCallback(() => {
    const getEmptyMessage = () => {
      switch (activeFilter) {
        case "new":
          return "No new orders waiting for confirmation.";
        case "assigned":
          return "No orders currently assigned to delivery partners.";
        case "delivered":
          return "No delivered orders found.";
        default:
          return "No assigned orders at the moment. Orders will appear here when admin assigns them to your laboratory.";
      }
    };

    const Icon =
      activeFilter === "new"
        ? FaClock
        : activeFilter === "assigned"
        ? FaUserPlus
        : activeFilter === "delivered"
        ? FaCheckCircle
        : FaShoppingBag;

    return (
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <Icon className="text-gray-300" size={48} />
        <div className="mt-4 text-lg font-bold text-gray-900">No Orders Found</div>
        <div className="mt-2 text-sm text-gray-500">{getEmptyMessage()}</div>
      </div>
    );
  }, [activeFilter]);

  if (isLoading && !refreshing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        <div className="mt-4 text-gray-700">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Filters */}
      {orders.length > 0 && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white py-3">
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => {
                const count = filterCount(f.id);
                const active = activeFilter === f.id;
                const Icon = f.icon;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={[
                      "flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                      active ? "bg-primary text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    ].join(" ")}
                    aria-label={`${f.label} filter with ${count} orders`}
                    aria-pressed={active}
                  >
                    <Icon size={14} className={active ? "text-white" : "text-gray-500"} />
                    <span>
                      {f.label} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((item) => {
              const isProductOrder = !!(item.products && item.products.length > 0);
              const orderType = isProductOrder ? "Product Order" : "Prescription Order";

              const canAssignDelivery =
                !!item.laboratoryUser &&
                (item.status === "confirmed" || item.status === "pending") &&
                !item.deliveryPartner;

              const canConfirmOrder = !!item.laboratoryUser && item.status === "pending";
              const needsAssignment = item.needAssignment && !item.laboratoryUser;

              return (
                <button
                  key={item._id}
                  type="button"
                  className="w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 hover:shadow"
                  onClick={() => {
                    setSelectedOrder(item);
                    setShowOrderDetails(true);
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-bold text-gray-900">
                        Order #{item._id.slice(-8)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{formatDate(item.createdAt)}</div>
                      <div
                        className={[
                          "mt-1 text-xs font-medium",
                          isProductOrder ? "text-emerald-600" : "text-amber-600",
                        ].join(" ")}
                      >
                        {orderType}
                      </div>
                    </div>

                    <div
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold text-white",
                        statusColorClass(item.status),
                      ].join(" ")}
                    >
                      <StatusIcon status={item.status} className="text-white" />
                      <span>{statusText(item.status)}</span>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="mt-3">
                    <div className="text-sm font-semibold text-gray-900">{item.orderedBy.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {item.orderedBy.phone} • {item.orderedBy.email}
                    </div>

                    {item.customerAddress && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 line-clamp-2">📍 {item.customerAddress}</div>
                        {item.customerPinCode && (
                          <div className="mt-1 text-[11px] font-medium text-gray-400">
                            PIN: {item.customerPinCode}
                          </div>
                        )}
                      </div>
                    )}

                    {item.products && item.products.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {item.products.length} product{item.products.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-bold text-gray-900">
                        ₹{Number(item.totalPrice || 0).toFixed(2)}
                      </div>
                      {item.cod && (
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                          <FaMoneyBill size={12} />
                          COD
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {needsAssignment && (
                        <span className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white">
                          <FaExclamationTriangle size={14} />
                          Needs Admin Assignment
                        </span>
                      )}

                      {canAssignDelivery && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(item);
                            setShowAssignDelivery(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                        >
                          <FaTruck size={14} />
                          Assign Delivery
                        </button>
                      )}

                      {canConfirmOrder && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleConfirmOrder(item._id);
                          }}
                          className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                        >
                          <FaCheck size={14} />
                          Confirm Order
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderDetailsModal
        visible={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        order={selectedOrder}
        onAssignDelivery={() => {
          setShowOrderDetails(false);
          setShowAssignDelivery(true);
        }}
      />

      <DeliveryAssignmentModal
        visible={showAssignDelivery}
        onClose={() => setShowAssignDelivery(false)}
        orderId={selectedOrder?._id || ""}
        onAssignmentSuccess={() => {
          void fetchLabOrders();
        }}
      />
    </div>
  );
};

export default OrderManagementTab;
