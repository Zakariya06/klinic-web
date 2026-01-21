import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaShoppingBag,
  FaCalendar,
  FaEye,
  FaPlus,
  FaShoppingCart,
  FaChevronDown,
  FaCube,
  FaCalculator,
  FaFile,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  orderService,
  Order,
  OrderFilters,
  OrderResponse,
} from "@/services/orderService";
import { Colors } from "@/constants/Colors";
import { AnimatedModal } from "../modal/AnimatedModal";
import { IoIosClose } from "react-icons/io";

interface OrdersTabProps {
  onRefresh?: () => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Memoized status configurations for better performance
  const statusConfig = useMemo(
    () => ({
      pending: {
        text: "Pending",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: FaClock,
      },
      pending_assignment: {
        text: "Pending Assignment",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: FaClock,
      },
      confirmed: {
        text: "Confirmed",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: FaCheckCircle,
      },
      out_for_delivery: {
        text: "Out for Delivery",
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
        icon: FaTruck,
      },
      delivered: {
        text: "Delivered",
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: FaCheckCircle,
      },
      cancelled: {
        text: "Cancelled",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        icon: FaTimesCircle,
      },
    }),
    [],
  );

  const fetchOrders = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const filters: OrderFilters = {
          page,
          limit: 8,
        };

        const response: OrderResponse = await orderService.getMyOrders(filters);

        if (isRefresh || page === 1) {
          setOrders(response.orders);
        } else {
          setOrders((prev) => [...prev, ...response.orders]);
        }

        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching orders:", error);
        window.alert("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = useCallback(async () => {
    await fetchOrders(1, true);
    onRefresh?.();
  }, [fetchOrders, onRefresh]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !loading && !loadingMore) {
      fetchOrders(pagination.currentPage + 1);
    }
  }, [
    pagination.hasNextPage,
    loading,
    loadingMore,
    fetchOrders,
    pagination.currentPage,
  ]);

  const handleAddMoreProducts = useCallback(() => {
    navigate("/medicines");
  }, [navigate]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    return `₹${price.toFixed(2)}`;
  }, []);

  const getStatusConfig = useCallback(
    (status: string) => {
      return (
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.pending
      );
    },
    [statusConfig],
  );

  // --- UI/UX Improvements: Order Card ---
  const renderOrderItem = useCallback(
    (order: Order) => {
      const status = getStatusConfig(order.status);
      const orderId = order._id.slice(-6).toUpperCase();
      const IconComponent = status.icon;

      return (
        <button
          key={order._id}
          onClick={() => {
            setSelectedOrder(order);
            setShowOrderDetails(true);
          }}
          className="transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none rounded-3xl"
          style={{
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.08)",
          }}
        >
          <div className="bg-white rounded-3xl p-5 border border-gray-100">
            {/* Order Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <FaShoppingBag size={18} className="text-blue-500" />
                <span className="text-base text-gray-700 ml-2 font-semibold tracking-wider">
                  #{orderId}
                </span>
              </div>
              <div
                className="px-3 py-1.5 rounded-full flex items-center"
                style={{
                  backgroundColor: status.bgColor,
                  minWidth: "90px",
                }}
              >
                <IconComponent size={13} style={{ color: status.color }} />
                <span
                  className="text-xs font-bold ml-2"
                  style={{ color: status.color }}
                >
                  {status.text}
                </span>
              </div>
            </div>

            {/* Order Type & Date */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                {order.prescription ? "Prescription Order" : "Product Order"}
              </span>
              <div className="flex items-center">
                <FaCalendar size={13} className="text-blue-500" />
                <span className="text-xs text-gray-400 ml-1 font-medium">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>

            {/* Products Section */}
            {order.products && order.products.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 mb-2">
                <div className="flex items-center mb-1">
                  <FaShoppingBag size={13} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700 ml-2">
                    {order.products.length} product
                    {order.products.length > 1 ? "s" : ""}
                  </span>
                </div>
                {order.products.slice(0, 2).map((item, index) => (
                  <div
                    key={`${item.product._id}-${item.quantity}-${index}`}
                    className="flex justify-between items-center py-1"
                  >
                    <span className="text-sm text-gray-600 flex-1 font-medium truncate">
                      {item.product.name}
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        x{item.quantity}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                {order.products.length > 2 && (
                  <span className="text-xs text-blue-500 mt-1 font-medium">
                    +{order.products.length - 2} more item
                    {order.products.length - 2 > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Prescription Section */}
            {order.prescription && (
              <div className="bg-blue-50 rounded-xl p-3 flex items-center mb-2">
                <FaFile size={15} className="text-blue-500" />
                <span className="text-sm font-semibold text-blue-700 ml-2">
                  Prescription Uploaded
                </span>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {order.isPaid ? (
                    <FaCheckCircle size={14} className="text-green-500" />
                  ) : (
                    <FaClock size={14} className="text-yellow-500" />
                  )}
                  <span
                    className={`text-sm ml-2 font-semibold ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Payment Pending"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-base font-bold text-gray-900 mr-2">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="flex justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOrderDetails(true);
                }}
                className="flex-1 bg-[#5570f1] py-3 cursor-pointer rounded-xl  px-2 flex justify-center items-center hover:bg-[#5570f1]/85 transition-colors"
                style={{
                  boxShadow: "0 2px 6px rgba(59, 130, 246, 0.12)",
                }}
              >
                <FaEye size={15} className="text-white" />
                <span className="text-white font-semibold ml-2">
                  View Details
                </span>
              </button>

              <button
                onClick={handleAddMoreProducts}
                className="flex-1 bg-gray-100 py-3 cursor-pointer rounded-xl px-2  flex justify-center items-center hover:bg-gray-200 transition-colors"
              >
                <FaPlus size={15} className="text-blue-500" />
                <span className="text-gray-700 font-semibold ml-2">
                  Add More
                </span>
              </button>
            </div>
          </div>
        </button>
      );
    },
    [getStatusConfig, formatDate, formatPrice, handleAddMoreProducts],
  );

  // --- UI/UX Improvements: Empty State ---
  const renderEmptyState = useCallback(
    () => (
      <div className="flex flex-col justify-center items-center py-20 px-8">
        <div
          className="rounded-full mb-6"
          style={{
            backgroundColor: "#E0E7FF",
            padding: "32px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
          }}
        >
          <FaShoppingCart size={54} className="text-indigo-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          No Orders Yet
        </h2>
        <p className="text-gray-600 text-center mb-8 leading-6">
          Start your health journey by exploring our wide range of medicines and
          health products.
        </p>
        <button
          onClick={handleAddMoreProducts}
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
          style={{
            boxShadow: "0 4px 10px rgba(99, 102, 241, 0.15)",
          }}
        >
          <div className="flex items-center">
            <FaShoppingBag size={20} className="text-white" />
            <span className="text-white font-bold text-lg ml-3">
              Browse Products
            </span>
          </div>
        </button>
      </div>
    ),
    [handleAddMoreProducts],
  );

  // --- UI/UX Improvements: Load More Button ---
  const renderLoadMore = useCallback(() => {
    if (!pagination.hasNextPage) return null;

    return (
      <div className="py-6">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="bg-gray-100 py-4 rounded-2xl items-center mx-4 w-full hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loadingMore ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium ml-2">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FaChevronDown size={18} className="text-blue-500" />
              <span className="text-gray-700 font-semibold ml-2">
                Load More Orders
              </span>
            </div>
          )}
        </button>
      </div>
    );
  }, [pagination.hasNextPage, loadingMore, handleLoadMore]);

  // --- UI/UX Improvements: Loading State ---
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-white py-10">
        <div
          className="rounded-full mb-4"
          style={{
            backgroundColor: "#E0E7FF",
            padding: "28px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
          }}
        >
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="text-gray-600 font-medium">
          Loading your orders...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      {/* Refresh button for web */}
      <button
        onClick={handleRefresh}
        className="flex items-center gap-3 px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base w-fit ml-auto"
        disabled={refreshing}
      >
        <div
          className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full ${
            refreshing ? "animate-spin" : ""
          }`}
        ></div>

        <span>{refreshing ? "Refreshing.." : "Refresh"}</span>
      </button>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="py-4 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3">
              {orders.map((order) => renderOrderItem(order))}
            </div>
            {renderLoadMore()}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <AnimatedModal
          open={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          maxWidth="max-w-5xl"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div className="flex items-center">
              <FaShoppingBag size={20} className="text-blue-500" />
              <span className="lg:text-xl text-lg font-medium text-gray-900 ml-2">
                Order Details
              </span>
            </div>
            <button
              onClick={() => setShowOrderDetails(false)}
              className="  rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
            >
              <IoIosClose size={40} className="text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <OrderDetailsContent
              order={selectedOrder}
              onClose={() => setShowOrderDetails(false)}
            />
          </div>
        </AnimatedModal>
      )}
    </div>
  );
};

// --- UI/UX Improvements: Order Details Content ---
const OrderDetailsContent: React.FC<{ order: Order; onClose: () => void }> = ({
  order,
}) => {
  const navigate = useNavigate();

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        text: "Pending",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: FaClock,
      },
      pending_assignment: {
        text: "Pending Assignment",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: FaClock,
      },
      confirmed: {
        text: "Confirmed",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: FaCheckCircle,
      },
      out_for_delivery: {
        text: "Out for Delivery",
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
        icon: FaTruck,
      },
      delivered: {
        text: "Delivered",
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: FaCheckCircle,
      },
      cancelled: {
        text: "Cancelled",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        icon: FaTimesCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const handleAddMoreProducts = () => {
    navigate("/medicines");
  };

  const status = getStatusConfig(order.status);
  const IconComponent = status.icon;
  const orderId = order._id.slice(-8).toUpperCase();

  return (
    <>
      <div className="space-y-5 overflow-y-auto max-h-[65vh] pr-3">
        {/* Order Status */}
        <div
          className="rounded-xl p-2 border"
          style={{
            backgroundColor: "#F0F9FF",
            borderColor: "#DBEAFE",
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-xs text-gray-500 font-medium">
                Order ID
              </span>
              <h3 className="text-lg font-bold text-gray-900 tracking-wider">
                #{orderId}
              </h3>
            </div>
            <div
              className="px-3 py-2 rounded-full flex items-center shadow-sm"
              style={{ backgroundColor: status.bgColor }}
            >
              <IconComponent size={15} style={{ color: status.color }} />
              <span
                className="text-xs font-bold ml-2"
                style={{ color: status.color }}
              >
                {status.text}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-gray-600 font-medium">Order Type</span>
              <span className="font-semibold text-gray-900">
                {order.prescription ? "Prescription Order" : "Product Order"}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-gray-600 font-medium">Payment Status</span>
              <div className="flex items-center">
                {order.isPaid ? (
                  <FaCheckCircle size={16} className="text-green-500" />
                ) : (
                  <FaClock size={16} className="text-yellow-500" />
                )}
                <span
                  className={`ml-2 font-semibold ${
                    order.isPaid ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Payment Pending"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-gray-600 font-medium">Order Date</span>
              <span className="font-semibold text-gray-900 text-right">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        {order.products && order.products.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                <FaShoppingBag size={16} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Products</h3>
                <span className="text-sm text-gray-500">
                  {order.products.length} item
                  {order.products.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {order.products.map((item, index) => (
                <div
                  key={`${item.product._id}-${item.quantity}-${index}`}
                  className="bg-linear-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold text-gray-900 flex-1 mr-3 truncate">
                      {item.product.name}
                    </h4>
                    <div className="bg-blue-600 rounded-lg px-3 py-1">
                      <span className="text-sm font-bold text-white">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center bg-white rounded-lg px-3 py-1">
                      <FaCube size={12} className="text-gray-500" />
                      <span className="text-gray-600 ml-2">Qty:</span>
                      <span className="font-bold text-gray-900 ml-1">
                        {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      ₹{item.product.price.toFixed(2)} each
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescription */}
        {order.prescription && (
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center mb-3">
              <FaFile size={16} className="text-blue-500" />
              <h3 className="text-lg font-bold text-gray-900 ml-2">
                Prescription
              </h3>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <span className="text-blue-700 font-medium">
                Prescription has been uploaded and is being processed.
              </span>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: "#F0FDF4",
            borderColor: "#BBF7D0",
          }}
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 rounded-lg p-2 mr-3">
              <FaCalculator size={16} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(order.totalPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-gray-600 font-medium">Delivery Fee</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <button
          onClick={handleAddMoreProducts}
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base"
        >
          <FaPlus />
          Add More Products
        </button>
      </div>
    </>
  );
};

export default OrdersTab;
