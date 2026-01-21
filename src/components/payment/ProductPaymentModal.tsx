import React, { useCallback, useMemo, useState } from "react";
import { FaTimes, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import apiClient from "@/api/client";
import { useUserStore } from "@/store/userStore";
import { useCustomAlert } from "@/components/CustomAlert";
import { orderService } from "@/services/orderService";

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}

interface ProductPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  orderData: {
    products: Array<{
      product: string;
      quantity: number;
    }>;
    prescription?: string;
    totalPrice: number;
    needAssignment: boolean;
  };
  onPaymentSuccess: () => void;
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

const ProductPaymentModal: React.FC<ProductPaymentModalProps> = ({
  visible,
  onClose,
  orderData,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const { showAlert, AlertComponent } = useCustomAlert();
  const navigate = useNavigate();

  const successMessage = useMemo(() => {
    return orderData.needAssignment
      ? "Payment successful! Your prescription order has been created and will be assigned to a laboratory by our admin team. You will be notified once the order is processed."
      : "Payment successful! Your order has been confirmed and will be processed soon.";
  }, [orderData.needAssignment]);

  const codSuccessMessage = useMemo(() => {
    return orderData.needAssignment
      ? "COD order created successfully! Your prescription order has been created and will be assigned to a laboratory by our admin team. You will be notified once the order is processed. Payment will be collected upon delivery."
      : "COD order created successfully! Your order has been confirmed and will be processed soon. Payment will be collected upon delivery.";
  }, [orderData.needAssignment]);

  const getOrderDescription = useCallback(() => {
    if (orderData.needAssignment) return "Prescription Order";

    if (orderData.products && orderData.products.length > 0) {
      const itemCount = orderData.products.length;
      const totalItems = orderData.products.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      return `${itemCount} product${itemCount > 1 ? "s" : ""} (${totalItems} item${
        totalItems > 1 ? "s" : ""
      })`;
    }

    return "Product Order";
  }, [orderData.needAssignment, orderData.products]);

  const getPaymentMessage = useCallback(() => {
    if (orderData.needAssignment) {
      return "Choose your payment method for prescription orders. After order creation, our admin team will review your prescription and assign it to a laboratory.";
    }
    return "Choose your payment method to confirm your order.";
  }, [orderData.needAssignment]);

  const handlePaymentSuccess = useCallback(
    async (response: any) => {
      try {
        setLoading(true);

        const orderResponse = await orderService.createOrder(orderData);
        if (!orderResponse?.data)
          throw new Error("Failed to create order after payment");

        const orderId = Array.isArray(orderResponse.data)
          ? orderResponse.data[0]?._id
          : orderResponse.data?._id;

        await apiClient.post("/api/v1/verify-product-payment", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId,
        });

        showAlert({
          title: "Payment Successful!",
          message: successMessage,
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
    [navigate, onClose, onPaymentSuccess, orderData, showAlert, successMessage],
  );

  const handlePaymentCancellation = useCallback(async () => {
    try {
      setLoading(true);

      showAlert({
        title: "Payment Cancelled",
        message: "Your payment has been cancelled. No order was created.",
        type: "warning",
        buttons: [
          {
            text: "OK",
            style: "primary",
            onPress: () => {
              onClose();
              navigate("/");
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error handling payment cancellation:", error);
      showAlert({
        title: "Error",
        message:
          "Failed to handle payment cancellation. Please contact support.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, onClose, showAlert]);

  const handleCODSuccess = useCallback(async () => {
    try {
      setLoading(true);

      showAlert({
        title: "COD Order Created!",
        message: codSuccessMessage,
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
      console.error("Error handling COD success:", error);
      showAlert({
        title: "Error",
        message: "Failed to create COD order. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [codSuccessMessage, navigate, onClose, onPaymentSuccess, showAlert]);

  const handleCODOrder = useCallback(async () => {
    try {
      setLoading(true);

      if (!orderData) {
        showAlert({
          title: "Invalid Order",
          message:
            "Please ensure your order is valid before proceeding with COD.",
          type: "error",
        });
        return;
      }

      if (!user || !user.email) {
        showAlert({
          title: "User Not Found",
          message: "Please log in to proceed with COD order.",
          type: "error",
        });
        return;
      }

      const codResponse = await apiClient.post("/api/v1/create-cod-order", {
        orderData,
      });

      if (!codResponse.data?.success)
        throw new Error("Failed to create COD order");

      await handleCODSuccess();
    } catch (error) {
      console.error("COD order creation failed:", error);
      showAlert({
        title: "COD Order Failed",
        message: "Failed to create COD order. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [handleCODSuccess, orderData, showAlert, user]);

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

      const paymentOrderRes = await apiClient.post(
        "/api/v1/create-product-payment-order",
        {
          amount: orderData.totalPrice * 100,
          currency: "INR",
        },
      );

      const { orderId, amount, currency } = paymentOrderRes.data as {
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
        description: orderData.needAssignment
          ? "Prescription Order Payment"
          : "Product Order Payment",
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
    handlePaymentSuccess,
    orderData.needAssignment,
    orderData.totalPrice,
    showAlert,
    user,
  ]);

  if (!visible) {
    return (
      <>
        <AlertComponent />
      </>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">Payment Options</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
            aria-label="Close"
            disabled={loading}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Order Details */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="mb-2 text-lg font-semibold text-gray-900">
            {getOrderDescription()}
          </div>
          <div className="mb-1 text-sm text-gray-600">
            {orderData.needAssignment ? "Prescription Upload" : "Cart Items"}
          </div>
          <div className="text-lg font-bold text-sky-600">
            Amount: ₹{orderData.totalPrice}
          </div>
        </div>

        {/* Payment Options */}
        <div>
          <div className="mb-4 text-center text-sm text-gray-600">
            {getPaymentMessage()}
          </div>

          {/* Pay Now */}
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
                  Pay Now ₹{orderData.totalPrice}
                </span>
              </>
            )}
          </button>

          {/* COD */}
          <button
            type="button"
            onClick={handleCODOrder}
            disabled={loading}
            className={[
              "mb-3 flex w-full items-center justify-center rounded-lg py-4 font-bold",
              "bg-green-600 text-white transition hover:bg-green-700",
              loading ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : (
              <>
                <FaMoneyBillWave className="h-5 w-5" />
                <span className="ml-2 text-lg">Cash on Delivery</span>
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={handlePaymentCancellation}
            disabled={loading}
            className={[
              "mb-3 flex w-full items-center justify-center rounded-lg py-4 font-bold",
              "bg-gray-100 text-gray-700 transition hover:bg-gray-200",
              loading ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400/60 border-t-gray-600" />
            ) : (
              <>
                <FaTimes className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-lg">Cancel Order</span>
              </>
            )}
          </button>

          <div className="mt-3 text-center text-xs text-gray-500">
            {orderData.needAssignment
              ? "After order creation, your prescription will be reviewed and assigned to a laboratory"
              : "Secure payment powered by Razorpay or Cash on Delivery"}
          </div>
        </div>
      </div>

      <AlertComponent />
    </>
  );
};

export default ProductPaymentModal;
