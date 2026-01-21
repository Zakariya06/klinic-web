import React, { useEffect, useState } from "react";
import { CartItem } from "@/components/medicines/CartItem";
import { PrescriptionUpload } from "@/components/medicines/PrescriptionUpload";
import ProductPaymentModal from "@/components/payment/ProductPaymentModal";
import { useCartStore } from "@/store/cartStore";
import { useUserProfileStore } from "@/store/profileStore";
import { CartItem as CartItemType } from "@/types/medicineTypes";

import {
  HiXMark,
  HiShoppingCart,
  HiPlus,
  HiMapPin,
  HiPencilSquare,
  HiDocumentText,
  HiCheckCircle,
  HiExclamationTriangle,
} from "react-icons/hi2";
import { AnimatedModal } from "../modal/AnimatedModal";

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  onBrowseItems?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  onBrowseItems,
}) => {
  const { items: cart, getCartTotal, clearCart } = useCartStore();
  const { address, pinCode, setAddress, setPinCode } = useUserProfileStore();

  const [prescription, setPrescription] = useState<string | null>(null);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState(address || "");
  const [tempPinCode, setTempPinCode] = useState(pinCode || "");

  useEffect(() => {
    // keep temp in sync if store updates while modal is closed
    if (!showAddressModal) {
      setTempAddress(address || "");
      setTempPinCode(pinCode || "");
    }
  }, [address, pinCode, showAddressModal]);

  const openAddressModal = () => {
    setTempAddress(address || "");
    setTempPinCode(pinCode || "");
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!tempAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    setAddress(tempAddress.trim());
    setPinCode(tempPinCode.trim());
    setShowAddressModal(false);
  };

  const handlePlaceOrder = () => {
    if (!cart.length)
      return alert("Add items to your cart before placing an order.");
    if (!prescription) return alert("Please upload a prescription.");
    if (!address) return alert("Please add your delivery address.");

    setOrderData({
      products: cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      prescription,
      totalPrice: getCartTotal(),
      needAssignment: false,
      deliveryAddress: { address, pinCode },
    });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setPrescription(null);
    setOrderData(null);
    setShowPaymentModal(false);
    onClose();
  };

  const canPlaceOrder = cart.length > 0 && prescription && address;

  if (!visible) return null;

  return (
    <>
      <AnimatedModal
        open={visible}
        onClose={() => onClose()}
        maxWidth="max-w-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2
            id="prescription-modal-title"
            className="lg:text-2xl text-xl font-semibold font-poppins"
          >
            Shopping Cart
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 p-2 transition hover:bg-gray-200 cursor-pointer"
            aria-label="Close"
          >
            <HiXMark className="h-6 w-6 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto max-h-[75vh] py-3 space-y-4 px-2">
          {/* Cart Items */}
          <div className="bg-white rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Cart Items</h3>
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                {cart.length} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <HiShoppingCart className="w-16 h-16 text-gray-300" />
                <h4 className="mt-4 text-xl font-bold">Your cart is empty</h4>
                <p className="text-gray-500 mb-8">
                  Add some medicines to get started
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onBrowseItems?.();
                  }}
                  className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg"
                >
                  <HiPlus className="w-5 h-5" />
                  Browse Items
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <CartItem key={item.product._id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <HiMapPin className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold">Delivery Address</h4>
              </div>
              <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded">
                Required
              </span>
            </div>

            {address ? (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium">{address}</p>
                  {pinCode && (
                    <p className="text-sm text-gray-500">{pinCode}</p>
                  )}
                </div>
                <button onClick={openAddressModal} aria-label="Edit address">
                  <HiPencilSquare className="w-5 h-5 text-blue-500 cursor-pointer hover:text-red-600 duration-300" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAddressModal}
                className="flex items-center justify-center gap-2 border-2 cursor-pointer w-full py-4 border-dashed border-blue-500 text-blue-500 p-3 rounded-lg hover:bg-gray-200 duration-300 transition-all"
              >
                <HiPlus className="w-4 h-4" />
                Add Delivery Address
              </button>
            )}

            {!address && (
              <div className="flex items-center gap-2 bg-yellow-100 p-2 rounded mt-2">
                <HiExclamationTriangle className="w-4 h-4 text-yellow-700" />
                <p className="text-sm text-yellow-800">
                  Please add your delivery address
                </p>
              </div>
            )}
          </div>

          {/* Prescription */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HiDocumentText className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold">Prescription</h4>
            </div>
            <PrescriptionUpload
              onUploadComplete={setPrescription}
              isUploading={uploadingPrescription}
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span className="text-blue-500">
                ₹{getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {canPlaceOrder && (
          <div className="bg-white p-4 border-t border-gray-100">
            <button
              onClick={handlePlaceOrder}
              className="flex items-center justify-center px-2 py-3.5 rounded-xl duration-300 transition-all text-base flex-1 gap-2 bg-[#5570F1] hover:bg-[#5570F1]/85 text-white cursor-pointer w-full"
            >
              <HiCheckCircle className="w-5 h-5" />
              Pay Now – ₹{getCartTotal().toFixed(2)}
            </button>
          </div>
        )}
      </AnimatedModal>

      {/* Address Modal */}
      <AnimatedModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        maxWidth="max-w-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-xl font-semibold font-poppins">
            Add Delivery Address
          </h2>

          <button
            type="button"
            onClick={() => setShowAddressModal(false)}
            className="rounded-lg bg-gray-100 p-2 transition hover:bg-gray-200 cursor-pointer"
            aria-label="Close"
          >
            <HiXMark className="h-6 w-6 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="Enter your full address"
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code
            </label>
            <input
              value={tempPinCode}
              onChange={(e) =>
                setTempPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter PIN code"
              className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-xs text-gray-500 mt-1">Max 6 digits</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => setShowAddressModal(false)}
            className="flex items-center justify-center px-4 py-3.5 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base flex-1"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAddress}
            className="flex items-center justify-center px-2 py-3.5 rounded-xl  duration-300 transition-all text-base flex-1 gap-2 bg-[#5570F1] hover:bg-[#5570F1]/85 text-white cursor-pointer"
          >
            Save Address
          </button>
        </div>
      </AnimatedModal>

      {/* Payment Modal */}
      <AnimatedModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        maxWidth="max-w-md"
      >
        <ProductPaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </AnimatedModal>
    </>
  );
};

export default CartModal;
