import React from "react";
import {
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaUserPlus,
  FaTruck,
  FaTimesCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEye,
  FaDownload,
  FaMoneyBillWave,
} from "react-icons/fa";
import CustomModal from "@/components/ui/CustomModal";

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
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string | null;
  assignedAt?: string | null;
  deliveredAt?: string | null;
  outForDeliveryAt?: string | null;
  rejectionReason?: string | null;
  __v?: number;
}

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  order: LabOrder | null;
  onAssignDelivery?: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColorClass = (status: LabOrder["status"]) => {
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
      return "bg-amber-500";
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

const StatusIcon = ({ status }: { status: LabOrder["status"] }) => {
  switch (status) {
    case "pending":
      return <FaClock className="text-white" size={13} />;
    case "confirmed":
      return <FaCheckCircle className="text-white" size={13} />;
    case "assigned_to_delivery":
      return <FaUserPlus className="text-white" size={13} />;
    case "delivery_accepted":
      return <FaCheckCircle className="text-white" size={13} />;
    case "out_for_delivery":
      return <FaTruck className="text-white" size={13} />;
    case "delivered":
      return <FaCheckCircle className="text-white" size={13} />;
    case "delivery_rejected":
      return <FaTimesCircle className="text-white" size={13} />;
    case "cancelled":
      return <FaTimesCircle className="text-white" size={13} />;
    default:
      return <FaClock className="text-white" size={13} />;
  }
};

const getStatusText = (status: LabOrder["status"]) => {
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

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  visible,
  onClose,
  order,
  onAssignDelivery,
}) => {
  if (!order) return null;

  const openUrl = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Order Details"
      size="full"
      animationType="slide"
      zIndex={1000}
      scrollable
    >
      <div className="flex h-full flex-col bg-gray-100 p-5 pb-10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <FaShoppingBag size={22} className="text-primary" />
            <div className="text-lg font-bold tracking-wide text-gray-900">
              #{order._id.slice(-8)}
            </div>
          </div>

          <div
            className={[
              "flex items-center gap-2 rounded-2xl px-3 py-1.5",
              getStatusColorClass(order.status),
            ].join(" ")}
          >
            <StatusIcon status={order.status} />
            <span className="text-[13px] font-semibold tracking-wide text-white">
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Order Info */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-bold tracking-wide text-gray-900">Order Info</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-gray-500">Order ID</div>
              <div className="text-sm font-semibold text-gray-900">#{order._id.slice(-8)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(order.createdAt)}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-900">
                  ₹{order.totalPrice.toFixed(2)}
                </div>
                {order.cod && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    <FaMoneyBillWave size={12} />
                    COD
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Payment</div>
              <div
                className={[
                  "text-sm font-semibold",
                  order.isPaid ? "text-emerald-500" : "text-amber-500",
                ].join(" ")}
              >
                {order.cod ? "Cash on Delivery" : order.isPaid ? "Paid" : "Pending"}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-bold tracking-wide text-gray-900">Customer</h3>

          <div className="mb-2 flex items-center gap-2">
            <FaUser className="text-primary" size={16} />
            <div className="text-[15px] font-bold text-gray-900">{order.orderedBy.name}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <FaEnvelope size={13} className="mt-0.5" />
              <span className="break-all">{order.orderedBy.email}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <FaPhone size={13} className="mt-0.5" />
              <span>{order.orderedBy.phone}</span>
            </div>
            {order.customerAddress && (
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <FaMapMarkerAlt size={13} className="mt-0.5" />
                <span className="whitespace-pre-wrap">{order.customerAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Prescription */}
        {order.prescription && (
          <div className="mb-4 rounded-2xl bg-amber-100 p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-bold tracking-wide text-gray-900">Prescription</h3>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openUrl(order.prescription)}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-200 px-4 py-2 text-sm font-bold text-amber-900 hover:opacity-95"
              >
                <FaEye size={15} />
                View Prescription
              </button>

              <button
                type="button"
                onClick={() => openUrl(order.prescription)}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-200 px-4 py-2 text-sm font-bold text-blue-900 hover:opacity-95"
              >
                <FaDownload size={15} />
                Download Prescription
              </button>
            </div>
          </div>
        )}

        {/* Delivery Partner */}
        {order.deliveryPartner && (
          <div className="mb-4 rounded-2xl bg-sky-50 p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-bold tracking-wide text-gray-900">Delivery Partner</h3>

            <div className="mb-2 flex items-center gap-2">
              <FaTruck className="text-primary" size={16} />
              <div className="text-[15px] font-bold text-gray-900">{order.deliveryPartner.name}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <FaPhone size={13} className="mt-0.5" />
                <span>{order.deliveryPartner.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <FaEnvelope size={13} className="mt-0.5" />
                <span className="break-all">{order.deliveryPartner.email}</span>
              </div>

              {(order.deliveryPartner.profile?.address?.address || order.deliveryPartner.profile?.city) && (
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <FaMapMarkerAlt size={13} className="mt-0.5" />
                  <span>
                    {order.deliveryPartner.profile?.address?.address ||
                      order.deliveryPartner.profile?.city ||
                      "Address not available"}
                  </span>
                </div>
              )}

              {order.cod && (
                <div className="flex items-start gap-2 text-sm font-semibold text-red-500">
                  <FaMoneyBillWave size={13} className="mt-0.5" />
                  <span>Collect ₹{order.totalPrice.toFixed(2)} as Cash on Delivery</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {order.products && order.products.length > 0 && (
          <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-bold tracking-wide text-gray-900">Products</h3>

            <div className="space-y-2">
              {order.products.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{item.product.name}</div>
                    <div className="mt-0.5 text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="ml-3 text-sm font-semibold text-primary">
                    ₹{item.product.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-2 flex items-center justify-center pb-5">
          {onAssignDelivery && (
            <button
              type="button"
              onClick={onAssignDelivery}
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-[15px] font-semibold tracking-wide text-white hover:opacity-95"
            >
              <FaTruck size={16} />
              Assign Delivery Partner
            </button>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default OrderDetailsModal;
