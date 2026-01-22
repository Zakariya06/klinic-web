import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaPencilAlt,
  FaMicrophone,
  FaHourglassHalf,
  FaArrowUp,
} from "react-icons/fa";
import { VoiceButton } from "./VoiceButton";
import { cn } from "@/utils/utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  onVoiceInput?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  onVoiceInput,
  onKeyDown,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ensure inputText is always a string to avoid null/undefined errors
  const safeInputText = typeof inputText === "string" ? inputText : "";

  // Adjust textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto"; // reset
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // max height
  }, [safeInputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (safeInputText.trim() && !isLoading) {
      onSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (safeInputText.trim() && !isLoading) {
        onSendMessage();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-center">
      <div
        className={cn(
          "max-w-4xl bg-white rounded-2xl border border-[#00B0AB] p-3 shadow-2xl w-full  relative ",
          isFocused
            ? "border-violet-500 ring-2 ring-violet-200"
            : "border-[#00B0AB]",
        )}
      >
        <div className="flex-1 lg:w-auto w-full relative">
          <textarea
            ref={textareaRef}
            value={safeInputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your symptoms or ask a health question..."
            maxLength={1000}
            disabled={isLoading}
            rows={2}
            className="w-full resize-none outline-none border-none text-base leading-relaxed field-sizing-content"
          />

          {/* Character count indicator */}
          <div className="absolute bottom-2 right-3">
            <div className="bg-gray-100 px-2 py-1 rounded-xl flex items-center">
              <FaPencilAlt
                size={12}
                className={
                  safeInputText.length > 800 ? "text-red-500" : "text-gray-600"
                }
              />
              <span className="text-xs ml-1 font-medium text-gray-600">
                {safeInputText.length}/1000
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* Voice Button */}
          {onVoiceInput && (
            <VoiceButton onPress={onVoiceInput} disabled={isLoading} />
          )}

          <button
            type="submit"
            onClick={onSendMessage}
            disabled={!safeInputText.trim() || isLoading}
            className="flex items-center justify-center bg-black text-white rounded-full w-10 h-10 hover:bg-black/50 disabled:bg-black/50 transition-colors duration-300 cursor-pointer"
            aria-label="Send message"
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="text-white animate-spin" />
            ) : (
              <FaArrowUp className="text-white" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
