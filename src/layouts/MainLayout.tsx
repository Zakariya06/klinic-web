import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import apiClient from "@/api/client";
import { useUserStore } from "@/store/userStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const { setUser } = useUserStore();

  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [isShowSidebar, setIsShowSidebar] = useState(false);

  const location = useLocation();

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null as any);
          return;
        }

        const response = await apiClient.get("/api/v1/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (err) {
        console.error("Failed to load user:", err);
        setUser(null as any);
      } finally {
        setLoadingComplete(true);
      }
    }

    if (!isLoadingComplete) {
      loadUser();
    }
  }, [isLoadingComplete, setUser]);

  const openCloseSidebar = () => {
    setIsShowSidebar((prev) => !prev);
  };

  useEffect(() => {
    setIsShowSidebar(false);
  }, [location.pathname]);

  if (!isLoadingComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex">
      <Sidebar isShow={isShowSidebar} onHide={openCloseSidebar} />
      {/* Main Content */}
      <main className="lg:w-[calc(100%-288px)] w-full lg:ml-auto  ml-0 relative bg-[#f4f5fa]">
        <Header onToggle={openCloseSidebar} />
        <div className="lg:p-6 p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
