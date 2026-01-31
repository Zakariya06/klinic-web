import React, { useEffect, useState } from "react";
import { FaSpinner, FaCogs, FaUserCircle } from "react-icons/fa";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/types/userTypes";
import UserDashboard from "@/components/UserDashboard";
import DoctorDashboard from "@/components/DoctorDashboard";
import LaboratoryDashboard from "@/components/LaboratoryDashboard";
import DeliveryDashboard from "@/components/delivery/DeliveryDashboard";
import { HiMiniUser } from "react-icons/hi2";
import { Link } from "react-router-dom";

export default function HomeScreen() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading check for user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-gray-500" size={24} />
          <div className="text-gray-600 mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  // Show appropriate dashboard based on user role
  if (user?.role === UserRole.USER) {
    return <UserDashboard />;
  }

  if (user?.role === UserRole.DOCTOR) {
    return <DoctorDashboard />;
  }

  if (user?.role === UserRole.LABORATORY) {
    return <LaboratoryDashboard />;
  }

  if (user?.role === UserRole.DELIVERY_BOY) {
    return <DeliveryDashboard />;
  }

  // Show different content for other roles (admin, etc.)
  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return (
          <div className="p-6">
            <div
              className="text-3xl font-bold text-primary mb-4"
              style={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 700,
              }}
            >
              Admin Dashboard
            </div>
            <div
              className="text-lg text-text-primary mb-6"
              style={{
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              Monitor and manage the platform.
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
              <FaCogs size={48} color="#059669" />
              <div
                className="text-gray-600 mt-4 text-center"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                Admin features coming soon!
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div>
              <h2 className="lg:text-3xl text-2xl font-semibold font-poppins">
                Welcome to Klinic
              </h2>
              <p className="text-base font-normal text-[#8B8D97]">
                Please complete your profile setup to get started.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 py-16 flex flex-col items-center mt-6 flex-1 ">
              <HiMiniUser className="lg:text-9xl text-4xl text-[#5570F1]" />
              <p className=" mt-2 text-center text-lg font-semibold text-[#8B8D97]">
                Setup your profile to continue
              </p>

              <Link
                to={"/profile"}
                className="py-2.5 px-5 mt-5 bg-[#5570F1] rounded-xl text-white hover:bg-[#5570F1]/85"
              >
                View Profile
              </Link>
            </div>
          </div>
        );
    }
  };

  return <div className="min-h-screen h-full">{getRoleSpecificContent()}</div>;
}
