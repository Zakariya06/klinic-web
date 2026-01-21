import { cn } from "@/utils/utils";
import React, { useState } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";

interface VoiceButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isRecording?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onPress,
  disabled = false,
  isRecording = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!disabled) setIsPressed(false);
  };

  const handleMouseLeave = () => {
    if (!disabled) setIsPressed(false);
  };

  const baseColor = disabled
    ? "bg-gray-300"
    : isRecording
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={cn(
        "flex items-center justify-center bg-[#5570f1] text-white rounded-full w-10 h-10 hover:bg-[#5570f1]/50 disabled:bg-[#5570f1]/50 transition-colors duration-300 cursor-pointer",
        isPressed ? "scale-95" : "scale-100",
        isRecording ? "bg-[#5570f1]/50" : "bg-[#5570f1]",
      )}
      style={{
        boxShadow: disabled
          ? "0 4px 8px rgba(156,163,175,0.3)"
          : isRecording
            ? "0 4px 10px rgba(239,68,68,0.4)"
            : "0 4px 10px rgba(59,130,246,0.4)",
      }}
    >
      {isRecording ? (
        <FaStop className="text-white text-lg" />
      ) : (
        <FaMicrophone className="text-white text-lg" />
      )}
    </button>
  );
};
