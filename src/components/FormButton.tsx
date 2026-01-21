import { cn } from "@/utils/utils";
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface FormButtonProps {
  title: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string; // Changed 'style' to 'className' to match web standards
}

const FormButton = ({
  title,
  onClick,
  loading = false,
  disabled = false,
  className = "",
}: FormButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        `rounded-xl py-2.5 px-9 flex items-center justify-center mb-6 
        shadow-md transition-all cursor-pointer duration-200 active:scale-[0.98] lg:text-lg text-base text-white`,
        className,
        disabled || loading
          ? "bg-indigo-400 cursor-not-allowed opacity-70"
          : "bg-[#5570F1] hover:bg-[#5570F1]/85 active:bg-[#5570F1]/85"
      )}
    >
      {loading ? (
        <AiOutlineLoading3Quarters
          className="animate-spin text-white"
          size={24}
        />
      ) : (
        title
      )}
    </button>
  );
};

export default FormButton;
