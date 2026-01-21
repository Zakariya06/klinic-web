import React, { useState } from "react";
import ProductList from "@/components/ProductList";
import { FloatingActionButton } from "@/components/medicines/FloatingActionButton";
import { PrescriptionUploadModal } from "@/components/medicines/PrescriptionUploadModal";
import CartModal from "@/components/medicines/CartModal";

export default function MedicinesScreen() {
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] =
    useState(false);

  const handleCartPress = () => {
    setCartModalVisible(true);
  };

  const handlePrescriptionPress = () => {
    setPrescriptionModalVisible(true);
  };

  const handleOrderSuccess = () => {
    // Refresh the product list or show success message
    console.log("Order created successfully");
  };

  return (
    <>
      <ProductList />

      <FloatingActionButton
        onCartPress={handleCartPress}
        onPrescriptionPress={handlePrescriptionPress}
      />

      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        onBrowseItems={() => {
          setCartModalVisible(false);
        }}
      />

      <PrescriptionUploadModal
        visible={prescriptionModalVisible}
        onClose={() => setPrescriptionModalVisible(false)}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}
