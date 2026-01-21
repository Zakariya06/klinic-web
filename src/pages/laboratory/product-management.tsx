import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

import { AddProductTab } from "@/components/laboratory/AddProductTab";
import OrderManagementTab from "@/components/laboratory/OrderManagementTab";
import { MyProductsTab } from "@/components/laboratory/MyProductsTab";

type TabType = "add-product" | "my-products" | "orders";

export default function ProductManagementScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("my-products");

  const TabContent = useMemo(() => {
    switch (activeTab) {
      case "add-product":
        return <AddProductTab />;
      case "my-products":
        return <MyProductsTab />;
      case "orders":
        return <OrderManagementTab />;
      default:
        return <MyProductsTab />;
    }
  }, [activeTab]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md p-1 hover:bg-gray-100 flex items-center gap-2 cursor-pointer font-medium text-lg text-blue-600 hover:text-blue-300 duration-200"
          aria-label="Back"
        >
          <FaChevronLeft /> Back
        </button>

        <h1 className="lg:text-xl text-lg font-semibold font-poppins text-gray-900">
          Product Management
        </h1>

        <div className="w-8 lg:block hidden" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200  pt-4 mb-3">
        {[
          {
            tab: "My Products",
            path: "my-products",
          },
          {
            tab: "Add Product",
            path: "add-product",
          },
          {
            tab: "Orders",
            path: "orders",
          },
        ].map((tab, index) => (
          <button
            type="button"
            onClick={() => setActiveTab(tab.path as TabType)}
            className={[
              "flex-1 border-b-2 py-3 text-center px-1 font-medium lg:text-base text-sm cursor-pointer duration-200 hover:text-[#5570F1]",
              activeTab === tab.path
                ? "border-[#5570F1] text-[#5570F1]"
                : "border-transparent",
            ].join(" ")}
          >
            {tab.tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-3">{TabContent}</div>
    </div>
  );
}
