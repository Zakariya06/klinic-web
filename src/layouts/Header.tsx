import { useUserStore } from "@/store/userStore";
import React from "react";
import { FiMenu } from "react-icons/fi";

const Header = ({ onToggle }: { onToggle?: () => void }) => {
  const { user } = useUserStore();

  const firstLetter = user?.name?.charAt(0).toUpperCase();

  return (
    <header className="w-full h-16 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      {/* Left: Menu Toggle (Mobile Only) */}
      <div className="flex items-center">
        <button
          onClick={onToggle}
          className="text-2xl text-gray-700 cursor-pointer lg:hidden"
        >
          <FiMenu />
        </button>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#5570F1] text-white flex items-center justify-center font-semibold">
            {firstLetter || "U"}
          </div>
        )}

        {/* Name & Role */}
        <div>
          <p className="text-base font-poppins font-semibold text-black capitalize">
            {user?.name || "Don john"}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            {user?.role || "User "}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
