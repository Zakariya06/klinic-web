import React, { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaCheckCircle,
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaUserPlus,
} from "react-icons/fa";
import apiClient from "@/api/client";
import CustomModal from "@/components/ui/CustomModal";

interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface DeliveryAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  onAssignmentSuccess: () => void;
}

const DeliveryAssignmentModal: React.FC<DeliveryAssignmentModalProps> = ({
  visible,
  onClose,
  orderId,
  onAssignmentSuccess,
}) => {
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(
    []
  );
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!visible) return;
    void fetchDeliveryPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/api/v1/orders/available-delivery-partners"
      );

      if (response.data?.success) {
        setDeliveryPartners(response.data.data || []);
      } else {
        throw new Error(
          response.data?.error || "Failed to fetch delivery partners"
        );
      }
    } catch (error: any) {
      console.error("Error fetching delivery partners:", error);
      window.alert("Failed to fetch delivery partners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPartnerName = useMemo(() => {
    return (
      deliveryPartners.find((p) => p._id === selectedPartner)?.name ||
      "Delivery Partner"
    );
  }, [deliveryPartners, selectedPartner]);

  const handleAssignDelivery = async () => {
    if (!selectedPartner) {
      window.alert("Please select a delivery partner.");
      return;
    }

    try {
      setAssigning(true);
      const response = await apiClient.post(
        `/api/v1/orders/${orderId}/assign-delivery`,
        {
          deliveryPartnerId: selectedPartner,
        }
      );

      if (response.data?.success) {
        window.alert(
          `${selectedPartnerName} has been assigned to this order successfully!`
        );
        onAssignmentSuccess();
        onClose();
      } else {
        throw new Error(
          response.data?.error || "Failed to assign delivery partner"
        );
      }
    } catch (error: any) {
      console.error("Error assigning delivery partner:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to assign delivery partner. Please try again.";
      window.alert(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  const PartnerCard = ({ partner }: { partner: DeliveryPartner }) => {
    const isSelected = selectedPartner === partner._id;

    return (
      <button
        type="button"
        onClick={() => setSelectedPartner(partner._id)}
        className={[
          "w-full rounded-xl border-2 p-4 text-left",
          isSelected
            ? "border-primary bg-blue-50"
            : "border-transparent bg-gray-50",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <FaUser className="text-primary" />
          <div className="flex-1 text-base font-bold text-gray-900">
            {partner.name}
          </div>
          {isSelected && <FaCheckCircle className="text-primary" />}
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaPhone className="text-gray-500" />
            <span>{partner.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaEnvelope className="text-gray-500" />
            <span>{partner.email}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Assign Delivery Partner"
      size="full"
      animationType="slide"
      zIndex={1001}
      scrollable
    >
      <div className="flex h-full flex-col p-5">
        <p className="mb-5 text-sm leading-5 text-gray-500">
          Select a delivery partner to assign to this order. The partner will be
          notified and can accept or reject the assignment.
        </p>

        <div className="min-h-0 flex-1">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
              <p className="mt-3 text-sm text-gray-500">
                Loading delivery partners...
              </p>
            </div>
          ) : deliveryPartners.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <FaUsers size={48} className="text-gray-300" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No Delivery Partners Available
              </h3>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                There are no delivery partners available at the moment. Please
                try again later.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <h3 className="mb-4 text-base font-bold text-gray-900">
                Available Partners
              </h3>

              <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
                {deliveryPartners.map((partner) => (
                  <PartnerCard key={partner._id} partner={partner} />
                ))}
              </div>
            </div>
          )}
        </div>

        {!loading && deliveryPartners.length > 0 && (
          <div className="mt-5 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleAssignDelivery}
              disabled={!selectedPartner || assigning}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white",
                !selectedPartner || assigning
                  ? "bg-gray-300"
                  : "bg-primary hover:opacity-95",
              ].join(" ")}
            >
              {assigning ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <FaUserPlus />
                  <span>Assign Delivery Partner</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default DeliveryAssignmentModal;
