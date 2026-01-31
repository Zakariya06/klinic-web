import { useUserStore } from "@/store/userStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const { user } = useUserStore();
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token && !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}