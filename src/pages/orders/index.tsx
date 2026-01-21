// src/screens/OrdersIndexScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import OrdersTab from "@/components/dashboard/OrdersTab";

export default function OrdersIndexScreen() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddProducts = () => {
    navigate("/medicines");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white rounded-xl">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleGoBack}
              className="-ml-2 mr-4 rounded-md p-2 cursor-pointer hover:bg-gray-200 hover:text-blue-600 duration-300 text-gray-900"
              aria-label="Go back"
            >
              <FaArrowLeft size={20} />
            </button>

            <div>
              <div className="lg:text-2xl text-xl font-semibold text-gray-900">
                My Orders
              </div>
              <div className="text-sm text-gray-500">
                Track your health orders
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProducts}
            className="flex items-center gap-2 px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base"
          >
            <FaPlus size={16} />
            <span className="ml-2">Shop</span>
          </button>
        </div>
      </div>

      {/* Orders Content */}
      <div className="flex-1">
        <OrdersTab />
      </div>
    </div>
  );
}
