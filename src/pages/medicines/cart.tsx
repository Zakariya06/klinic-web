import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import type { Order } from "@/services/orderService";
import { CartItem } from "@/components/medicines/CartItem";
import { PrescriptionUpload } from "@/components/medicines/PrescriptionUpload";
import ProductPaymentModal from "@/components/payment/ProductPaymentModal";
import type { CartItem as CartItemType } from "@/types/medicineTypes";

// If you don't have "bg-primary" in Tailwind, replace with your theme classes (e.g. bg-blue-600).
export default function CartScreen() {
  const navigate = useNavigate();
  const { items: cart, getCartTotal, clearCart } = useCartStore();

  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null); // kept to match original shape
  const [orderData, setOrderData] = useState<any>(null);

  const handleQuantityChange = (_productId: string, _quantity: number) => {
    // handled inside <CartItem />
  };

  const handleRemoveItem = (_productId: string) => {
    // handled inside <CartItem />
  };

  const handlePrescriptionUpload = (url: string) => {
    setPrescriptionUrl(url);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      window.alert(
        "Empty Cart\n\nPlease add items to your cart before placing an order."
      );
      return;
    }

    if (!prescriptionUrl) {
      window.alert(
        "Prescription Required\n\nPlease upload a prescription before placing your order."
      );
      return;
    }

    // Prepare order data for payment (don't create order yet)
    const payload = {
      products: cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      prescription: prescriptionUrl || undefined,
      totalPrice: getCartTotal(),
      needAssignment: false,
    };

    setOrderData(payload);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setPrescriptionUrl(null);
    setCreatedOrder(null);
    setOrderData(null);
    setShowPaymentModal(false);
    navigate(-1);
  };

  const renderEmptyCart = () => (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      {/* replace with your IconSymbol if you have a web version */}
      <div className="text-6xl text-gray-400">🛒</div>

      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        Your cart is empty
      </h2>
      <p className="mt-2 text-center text-base text-gray-500">
        Add some medicines to get started
      </p>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white"
      >
        Browse Medicines
      </button>
    </div>
  );

  return (
    <div className="flex h-full min-h-screen flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md p-1"
          aria-label="Go back"
        >
          {/* replace with IconSymbol chevron if you have it */}
          <span className="text-2xl text-gray-900">‹</span>
        </button>

        <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
        <div className="w-8" />
      </div>

      {cart.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-auto px-6 pt-4">
            <div className="space-y-4">
              {cart.map((item: CartItemType) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>
          </div>

          {/* Prescription Upload */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="mb-4 text-lg font-semibold text-gray-900">
              Prescription
            </div>
            <PrescriptionUpload
              onUploadComplete={handlePrescriptionUpload}
              isUploading={uploadingPrescription}
            />
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-base text-gray-900">Subtotal</div>
              <div className="text-base font-semibold text-gray-900">
                ₹{getCartTotal()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-base text-gray-900">Total Items</div>
              <div className="text-base font-semibold text-gray-900">
                {cart.length}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!prescriptionUrl || cart.length === 0}
              className={[
                "mt-4 w-full rounded-xl py-4 text-center text-lg font-bold text-white",
                !prescriptionUrl || cart.length === 0
                  ? "bg-gray-300"
                  : "bg-primary",
              ].join(" ")}
            >
              Place Order - ₹{getCartTotal()}
            </button>
          </div>
        </>
      )}

      {/* Product Payment Modal */}
      {orderData && (
        <ProductPaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
