// AppRouter.tsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
 
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import LandingPage from "@/pages/landing"; 

import DoctorDetails from "@/pages/doctors";
import LaboratoryServiceDetails from "@/pages/laboratories";

import ProductManagementScreen from "@/pages/laboratory/product-management";
import CartScreen from "@/pages/medicines/cart";

import OrdersIndexScreen from "@/pages/orders";
import OrderDetailsScreen from "@/pages/orders/OrderDetails";
import PublicRoute from "@/hoc/PublicRoute";
import ProtectedRoute from "@/hoc/ProtectedRoute";
import ToctorAIChat from "@/components/ToctorAIChat";
import RoleMainLayout from "@/layouts/MainLayout";
import Login from "@/pages/auth/login";
import RegisterScreen from "@/pages/auth/register";
import Verify from "@/pages/auth/verify";
import HomeScreen from "@/pages/tabs";
import DoctorsScreen from "@/pages/tabs/doctors";
import LaboratoriesScreen from "@/pages/tabs/laboratories";
import MedicinesScreen from "@/pages/tabs/medicines";
import Profile from "@/pages/tabs/profile";

// Import route guards

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - only accessible when NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/verify" element={<Verify />} />
        </Route>
        {/* Protected main app routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleMainLayout />}>
            {/* Tabs */}
            <Route path="/dashboard" element={<HomeScreen />} />
            <Route path="/doctors" element={<DoctorsScreen />} />
            <Route path="/laboratories" element={<LaboratoriesScreen />} />
            <Route path="/medicines" element={<MedicinesScreen />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat-ai" element={<ToctorAIChat />} />

            {/* Info / Details pages */}
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route
              path="/laboratories/:id"
              element={<LaboratoryServiceDetails />}
            />

            <Route
              path="/laboratory/product-management"
              element={<ProductManagementScreen />}
            />

            <Route path="/medicines/cart" element={<CartScreen />} />
            <Route path="/orders" element={<OrderDetailsScreen />} />
            <Route path="/orders/:id" element={<OrderDetailsScreen />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;