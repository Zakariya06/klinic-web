import React from "react";
import { TbMessageChatbot } from "react-icons/tb";
import { IoIosArrowRoundBack } from "react-icons/io";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between lg:flex-row flex-col">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#5570F11F] text-[#5570F1] text-lg rounded-lg flex items-center justify-center">
          <TbMessageChatbot />
        </div>
        <div>
          <h1 className="lg:text-2xl text-xl font-semibold font-poppins">
            Toctor AI
          </h1>
          <div
            className="flex items-center"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
            <p className="text-sm font-normal text-[#8B8D97]">
              Online • Your Medical Assistant
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2 text-white bg-[#CC5F5F] rounded-xl cursor-pointer hover:bg-[#CC5F5F]/85 duration-300 transition-all text-base"
      >
        <IoIosArrowRoundBack className="text-2xl" />
        Back
      </button>
    </div>
  );
};
