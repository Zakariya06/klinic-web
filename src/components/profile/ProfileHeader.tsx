import React from "react";
import {
  MdLogout,
  MdAccountCircle,
  MdCameraAlt,
  MdPhone,
} from "react-icons/md";
import { UserRole } from "@/types/userTypes";
import { HiOutlineMail } from "react-icons/hi";
import { BiEdit } from "react-icons/bi";

interface ProfileHeaderProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    profilePicture?: string;
  } | null;
  onProfilePicturePress: () => void;
  setIsEditingBasicInfo: (val: boolean) => void;
}

const roleLabel = (role: UserRole) => {
  if (role === UserRole.USER) return "Patient";
  if (role === UserRole.DOCTOR) return "Doctor";
  if (role === UserRole.LABORATORY) return "Laboratory";
  if (role === UserRole.DELIVERY_BOY) return "Delivery Personnel";
  return "Admin";
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  onProfilePicturePress,
  setIsEditingBasicInfo,
}) => {
  const displayName = userData?.name || "User";
  const displayEmail = userData?.email || "email@example.com";
  const displayPhone = userData?.phone || "Not provided";
  const displayRole = userData?.role ?? UserRole.USER;
  const profilePicture = userData?.profilePicture;

  // Add 'Dr.' prefix for doctors
  const formattedName =
    displayRole === UserRole.DOCTOR ? `Dr. ${displayName}` : displayName;

  return (
    <div className="lg:mb-8 mb-0">
      <div className="flex items-center justify-between mt-2 mb-8">
        <h1 className="lg:text-3xl text-2xl font-semibold font-poppins">
          My Profile
        </h1>
      </div>

      <div className="flex lg:items-center md:flex-row flex-col justify-between gap-2 lg:px-0 px-4">
        <div className="flex sm:items-center sm:flex-row flex-col gap-4">
          {/* Profile image with upload button */}
          <button
            type="button"
            onClick={onProfilePicturePress}
            className="relative w-28 h-28 rounded-full"
            aria-label="Change profile picture"
          >
            <div className=" w-full h-full rounded-full bg-gray-200 overflow-hidden">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdAccountCircle size={60} className="text-indigo-500" />
                </div>
              )}
            </div>

            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2  text-blue-800 bg-white cursor-pointer hover:text-gray-700">
              <MdCameraAlt size={20} />
            </div>
          </button>
          <div>
            <h1 className="lg:text-xl text-lg font-medium font-poppins text-[#45464E]">
              {formattedName}
            </h1>

            <p className="text-base text-[#5E6366] flex items-center gap-2">
              <HiOutlineMail size={16} />
              {displayEmail}
            </p>

            <p className="flex items-center gap-2 text-base text-[#5E6366]">
              <MdPhone size={16} />
              {displayPhone}
            </p>

            <div className="text-black text-base rounded-full">
              Role:
              <span className="font-medium text-blue-700 ml-1">
                {roleLabel(displayRole)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditingBasicInfo(true)}
          className="mb-8 cursor-pointer text-blue-700 flex items-center gap-2 rounded-xl py-3 duration-300 hover:text-gray-500"
        >
          <BiEdit size={24} />
          Edit Basic Info
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
