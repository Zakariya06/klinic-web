// src/components/PaymentModal.tsx
import React, { useCallback, useMemo, useState } from "react";
import { FaClock, FaCreditCard, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import apiClient from "@/api/client";
import { useUserStore } from "@/store/userStore";
import { useCustomAlert } from "@/components/CustomAlert";

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay script")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  appointmentData: {
    appointmentId: string;
    appointmentType: "doctor" | "lab";
    amount: number;
    consultationType?: string;
    collectionType?: string;
    serviceName?: string;
    doctorName?: string;
    laboratoryName?: string;
  };
  isOnlineRequired: boolean;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  appointmentData,
  isOnlineRequired,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const user = useUserStore((s) => s.user);
  const { showAlert, AlertComponent } = useCustomAlert();
  const navigate = useNavigate();

  const description = useMemo(() => {
    return appointmentData.appointmentType === "doctor"
      ? `Consultation with ${appointmentData.doctorName ?? ""}`
      : `${appointmentData.serviceName ?? ""} at ${appointmentData.laboratoryName ?? ""}`;
  }, [appointmentData]);

  const handlePaymentSuccess = useCallback(
    async (response: any) => {
      try {
        setLoading(true);

        await apiClient.post("/api/v1/verify-payment", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          appointmentId: appointmentData.appointmentId,
          appointmentType: appointmentData.appointmentType,
        });

        showAlert({
          title: "Payment Successful!",
          message: "Your payment has been processed successfully.",
          type: "success",
          buttons: [
            {
              text: "OK",
              style: "primary",
              onPress: () => {
                onClose();
                onPaymentSuccess();
                navigate("/");
              },
            },
          ],
        });
      } catch (error) {
        console.error("Payment verification failed:", error);
        showAlert({
          title: "Payment Verification Failed",
          message: "Please contact support.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      appointmentData.appointmentId,
      appointmentData.appointmentType,
      navigate,
      onClose,
      onPaymentSuccess,
      showAlert,
    ],
  );

  const handlePayNow = useCallback(async () => {
    try {
      setLoading(true);

      const key = import.meta.env.VITE_RAZORPAY_API_KEY as string | undefined;
      if (!key) {
        showAlert({
          title: "Missing Razorpay Key",
          message: "VITE_RAZORPAY_API_KEY is not set in your Vite .env file.",
          type: "error",
        });
        return;
      }

      const orderResponse = await apiClient.post(
        "/api/v1/create-payment-order",
        {
          appointmentId: appointmentData.appointmentId,
          appointmentType: appointmentData.appointmentType,
          amount: appointmentData.amount,
        },
      );

      const { orderId, amount, currency } = orderResponse.data as {
        orderId: string;
        amount: number;
        currency: string;
      };

      await loadRazorpayScript();

      if (!window.Razorpay)
        throw new Error("Razorpay script loaded but Razorpay not available");

      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: "Klinic",
        description,
        image: "https://i.imgur.com/3g7nmJC.png",
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3B82F6" },
        handler: async (response: any) => {
          await handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      showAlert({
        title: "Payment Failed",
        message: "Failed to initiate payment. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    appointmentData.amount,
    appointmentData.appointmentId,
    appointmentData.appointmentType,
    description,
    handlePaymentSuccess,
    showAlert,
    user,
  ]);

  const handlePayLater = useCallback(() => {
    showAlert({
      title: "Appointment Confirmed",
      message:
        "Your appointment has been booked. You can pay during the consultation.",
      type: "success",
      buttons: [
        {
          text: "OK",
          style: "primary",
          onPress: () => {
            onClose();
            onPaymentSuccess();
            navigate("/");
          },
        },
      ],
    });
  }, [navigate, onClose, onPaymentSuccess, showAlert]);

  if (!visible) {
    return (
      <>
        <AlertComponent />
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900">
              Payment Options
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
              disabled={loading}
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Appointment Details */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 text-lg font-semibold text-gray-900">
              {appointmentData.appointmentType === "doctor"
                ? `Dr. ${appointmentData.doctorName ?? ""}`
                : (appointmentData.serviceName ?? "")}
            </div>

            <div className="mb-1 text-sm text-gray-600">
              {appointmentData.appointmentType === "doctor"
                ? `Type: ${appointmentData.consultationType ?? ""}`
                : `Collection: ${appointmentData.collectionType === "lab" ? "Lab Visit" : "Home Collection"}`}
            </div>

            <div className="text-lg font-bold text-sky-600">
              Amount: ₹{appointmentData.amount}
            </div>
          </div>

          {/* Payment Options */}
          {isOnlineRequired ? (
            <div>
              <div className="mb-4 text-center text-sm text-gray-600">
                Payment is required for online consultations
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={loading}
                className={[
                  "mb-3 flex w-full items-center justify-center rounded-lg py-4 font-bold",
                  "bg-sky-600 text-white transition hover:bg-sky-700",
                  loading ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                ) : (
                  <>
                    <FaCreditCard className="h-5 w-5" />
                    <span className="ml-2 text-lg">
                      Pay Now ₹{appointmentData.amount}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-center text-sm text-gray-600">
                Choose your preferred payment option
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={loading}
                className={[
                  "mb-3 flex w-full items-center justify-center rounded-lg py-4 font-bold",
                  "bg-sky-600 text-white transition hover:bg-sky-700",
                  loading ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                ) : (
                  <>
                    <FaCreditCard className="h-5 w-5" />
                    <span className="ml-2 text-lg">Pay Online Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePayLater}
                disabled={loading}
                className={[
                  "flex w-full items-center justify-center rounded-lg bg-gray-100 py-4 font-bold text-gray-700",
                  "transition hover:bg-gray-200",
                  loading ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
              >
                <FaClock className="h-5 w-5 text-gray-600" />
                <span className="ml-2 text-lg">
                  Pay During{" "}
                  {appointmentData.appointmentType === "doctor"
                    ? "Consultation"
                    : "Visit"}
                </span>
              </button>

              <div className="mt-3 text-center text-xs text-gray-500">
                You can pay online now for convenience or pay during your
                appointment
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertComponent />
    </>
  );
};

export default PaymentModal;
