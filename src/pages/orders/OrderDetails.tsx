import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaTimes,
  FaCreditCard,
  FaShoppingBasket,
  FaFileAlt,
  FaSyncAlt,
  FaPlus,
} from "react-icons/fa";
import { orderService, type Order } from "@/services/orderService";

// If you rely on Colors.light.* in multiple places, you can keep using it.
// Otherwise you can delete this import and use Tailwind colors only.
import { Colors } from "@/constants/Colors";

type StatusKey =
  | "pending"
  | "pending_assignment"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export default function OrderDetailsScreen() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order details:", error);
      window.alert("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleGoBack = () => navigate(-1);
  const handleAddMoreProducts = () => navigate("/medicines");

  const getStatusConfig = (status: string) => {
    const configs: Record<
      StatusKey,
      { text: string; color: string; bgColor: string; icon: React.ReactNode }
    > = {
      pending: {
        text: "Pending",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: <FaClock size={14} />,
      },
      pending_assignment: {
        text: "Pending Assignment",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: <FaClock size={14} />,
      },
      confirmed: {
        text: "Confirmed",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: <FaCheckCircle size={14} />,
      },
      out_for_delivery: {
        text: "Out for Delivery",
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
        icon: <FaTruck size={14} />,
      },
      delivered: {
        text: "Delivered",
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: <FaCheckCircle size={14} />,
      },
      cancelled: {
        text: "Cancelled",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        icon: <FaTimesCircle size={14} />,
      },
    };

    return configs[(status as StatusKey) || "pending"] ?? configs.pending;
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

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const handleCancelOrder = async () => {
    if (!order) return;

    const ok = window.confirm("Are you sure you want to cancel this order?");
    if (!ok) return;

    try {
      await orderService.updateOrderStatus(order._id, { status: "cancelled" });
      await fetchOrderDetails();
      window.alert("Order has been cancelled.");
    } catch (error) {
      console.error("Error cancelling order:", error);
      window.alert("Failed to cancel the order.");
    }
  };

  const renderActionButtons = useMemo(() => {
    if (!order) return null;

    // unpaid + not COD + pending/confirmed
    if (
      !order.isPaid &&
      !order.status &&
      ["pending", "confirmed"].includes(order.status)
    ) {
      return (
        <button
          type="button"
          // onClick={() => navigate(`/payment/${order._id}`)} // TODO: implement payment page
          className="flex w-full items-center justify-center rounded-xl bg-green-600 py-4"
        >
          <FaCreditCard className="text-white" size={16} />
          <span className="ml-3 text-lg font-bold text-white">
            Pay Now {formatPrice(order.totalPrice)}
          </span>
        </button>
      );
    }



    if (["pending", "confirmed"].includes(order.status)) {
      return (
        <button
          type="button"
          onClick={handleCancelOrder}
          className="flex w-full items-center justify-center rounded-xl bg-red-600 py-4"
        >
          <FaTimes className="text-white" size={16} />
          <span className="ml-3 text-lg font-bold text-white">
            Cancel Order
          </span>
        </button>
      );
    }

    if (order.status === "delivered") {
      return (
        <button
          type="button"
          onClick={handleAddMoreProducts}
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-4"
        >
          <FaSyncAlt className="text-white" size={16} />
          <span className="ml-3 text-lg font-bold text-white">Reorder</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleAddMoreProducts}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-4"
      >
        <FaPlus className="text-white" size={16} />
        <span className="ml-3 text-lg font-bold text-white">
          Add More Products
        </span>
      </button>
    );
  }, [order, handleAddMoreProducts]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <div className="mt-4 text-gray-600">Loading order details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <FaExclamationTriangle size={48} className="text-red-500" />
          <div className="mt-4 text-xl font-bold text-gray-900">
            Order Not Found
          </div>
          <div className="mt-2 mb-6 text-center text-gray-600">
            The order you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </div>
          <button
            type="button"
            onClick={handleGoBack}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(order.status);
  const orderId = order._id.slice(-8).toUpperCase();

  const paidBg = order.isPaid ? "#D1FAE5" : "#FEF3C7";
  const paidFg = order.isPaid ? "#10B981" : "#F59E0B";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="rounded-md p-2"
          aria-label="Back"
        >
          <FaArrowLeft size={24} className="text-gray-800" />
        </button>
        <div className="text-xl font-bold text-gray-900">Order #{orderId}</div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-4">
          {/* Status Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">Status</div>

              <div className="flex items-center">
                <div
                  className="flex items-center rounded-full px-3 py-1"
                  style={{
                    backgroundColor: status.bgColor,
                    color: status.color,
                  }}
                >
                  <span style={{ color: status.color }}>{status.icon}</span>
                  <span
                    className="ml-2 text-sm font-bold"
                    style={{ color: status.color }}
                  >
                    {status.text}
                  </span>
                </div>

                <div
                  className="ml-2 flex items-center rounded-full px-3 py-1"
                  style={{ backgroundColor: paidBg }}
                >
                  {order.isPaid ? (
                    <FaCheckCircle size={14} style={{ color: paidFg }} />
                  ) : (
                    <FaCreditCard size={14} style={{ color: paidFg }} />
                  )}
                  <span
                    className="ml-2 text-sm font-bold"
                    style={{ color: paidFg }}
                  >
                    {order.isPaid
                      ? "Paid"
                      : order?.status
                      ? "COD"
                      : "Payment Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-gray-600">Order Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-gray-600">Last Updated</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(order.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Products Card */}
          {order.products && order.products.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <FaShoppingBasket size={18} className="text-blue-600" />
                <div className="ml-3 text-lg font-bold text-gray-900">
                  Products
                </div>
              </div>

              <div className="space-y-4">
                {order.products.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 text-lg font-semibold text-gray-900">
                        {item.product.name}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        ₹{item.product.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescription Card */}
          {order.prescription && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <FaFileAlt size={18} className="text-blue-600" />
                <div className="ml-3 text-lg font-bold text-gray-900">
                  Prescription
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="font-medium text-blue-700">
                  Prescription has been uploaded and is being processed
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 text-lg font-bold text-gray-900">
              Order Summary
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Subtotal</div>
                <div className="font-semibold text-gray-900">
                  {formatPrice(order.totalPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-gray-600">Delivery Fee</div>
                <div className="font-semibold text-gray-900">₹0.00</div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">Total</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatPrice(order.totalPrice)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {renderActionButtons}

            <button
              type="button"
              onClick={handleGoBack}
              className="flex w-full items-center justify-center rounded-xl bg-gray-100 py-4"
            >
              <FaArrowLeft size={16} className="text-gray-500" />
              <span className="ml-3 text-lg font-semibold text-gray-700">
                Back to Orders
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
