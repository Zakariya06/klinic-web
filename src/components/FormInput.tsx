import React from "react";
import * as MdIcons from "react-icons/md";
import { HiOutlineMail } from "react-icons/hi";
import { SlLockOpen } from "react-icons/sl";
import { IconType } from "react-icons";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconName?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  togglePassword?: () => void;
  type?: "text" | "email" | "tel" | "password" | "number";
  error?: string;
  multiline?: boolean;
  rows?: number;
  editable?: boolean;
  containerStyle?: string;
  onPress?: () => void;
  rightText?: string;
  rightIcon?: React.ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: string;
}

/* ---------------- ICON MAP (multi-pack support) ---------------- */

const iconMap: Record<string, IconType> = {
  "account-outline": MdIcons.MdAccountCircle,
  "email-outline": HiOutlineMail,
  "phone-outline": MdIcons.MdPhone,
  "lock-outline": SlLockOpen,
  "lock-check-outline": MdIcons.MdLockClock,
  "hospital-building": MdIcons.MdLocalHospital,
  "medical-bag": MdIcons.MdMedicalServices,
  pill: MdIcons.MdLocalPharmacy,
  "heart-pulse": MdIcons.MdMonitorHeart,
  stethoscope: MdIcons.MdHealing,
  bandage: MdIcons.MdLocalHospital,
  doctor: MdIcons.MdMedicalServices,
  microscope: MdIcons.MdBiotech,
  bike: MdIcons.MdDirectionsBike,
  "alert-circle": MdIcons.MdError,
};

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  iconName,
  icon,
  secureTextEntry = false,
  showPassword = false,
  togglePassword,
  type = "text",
  error,
  multiline = false,
  rows = 3,
  editable = true,
  containerStyle = "",
  onPress,
  rightText,
  rightIcon,
  autoCapitalize = "none",
  autoComplete,
}: FormInputProps) => {
  /* ---------------- ICON RENDERING ---------------- */

  let IconComponent: React.ReactNode = null;

  if (icon) {
    IconComponent = icon;
  } else if (iconName && iconMap[iconName]) {
    const Icon = iconMap[iconName];
    IconComponent = <Icon size={22} />;
  }

  /* ---------------- INPUT TYPE ---------------- */

  const getInputType = () => {
    if (secureTextEntry && !showPassword) return "password";
    if (type === "number") return "number";
    if (type === "email") return "email";
    if (type === "tel") return "tel";
    return "text";
  };

  /* ---------------- INPUT CONTAINER ---------------- */

  const inputContainer = (
    <div
      className={`
        flex items-center rounded-md px-3.5 bg-[#EFF1F999] transition-all relative
        ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : "border-gray-200 focus-within:border-[#5570F1] focus-within:ring-1 focus-within:ring-[#5570F1]"
        }
        ${!editable ? "bg-gray-50 opacity-75 cursor-not-allowed" : ""}
        ${multiline ? "py-2" : "py-3"}
      `}
    >
      <span
        className={`mr-2 shrink-0 text-lg ${error ? "text-red-500" : "text-[#6E7079]"}`}
      >
        {IconComponent}
      </span>

      {multiline ? (
        <textarea
          className="flex-1 bg-transparent outline-none resize-none text-gray-800 placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={!editable}
          rows={rows}
        />
      ) : (
        <input
          type={getInputType()}
          className="flex-1 bg-transparent outline-none text-black placeholder:text-[#ABAFB1] font-inter text-base"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={!editable}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          inputMode={type === "tel" ? "tel" : undefined}
        />
      )}

      {rightText && (
        <span className="text-gray-500 text-sm mr-2 whitespace-nowrap">
          {rightText}
        </span>
      )}

      {rightIcon && <div className="ml-2 text-gray-400">{rightIcon}</div>}

      {secureTextEntry && togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="ml-1 p-1 rounded-full cursor-pointer transition absolute top-1/2 right-3 -translate-y-1/2"
          tabIndex={-1}
        >
          {showPassword ? (
            <FiEye
              size={18}
              className={
                error ? "text-red-500" : "text-black hover:text-[#5570F1]"
              }
            />
          ) : (
            <FiEyeOff
              size={18}
              className={
                error ? "text-red-500" : "text-black hover:text-[#5570F1]"
              }
            />
          )}
        </button>
      )}
    </div>
  );

  /* ---------------- RENDER ---------------- */

  return (
    <div className={`mb-4 w-full text-left ${containerStyle}`}>
      <label className="block mb-2 font-medium text-gray-800">{label}</label>

      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          className="w-full text-left focus:outline-none"
        >
          {inputContainer}
        </button>
      ) : (
        inputContainer
      )}

      {error && (
        <p className="mt-1 ml-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
