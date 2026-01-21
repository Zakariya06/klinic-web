import React from "react";
import { FaUser, FaAndroid } from "react-icons/fa";
import { parseXMLContent } from "./XMLParser";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className="mb-6 flex flex-col items-center">
      <div
        className="flex w-full"
        style={{
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? "ml-3 bg-violet-500" : "mr-3 bg-violet-600"
          }`}
          style={{
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            minWidth: "40px",
            minHeight: "40px",
          }}
        >
          {isUser ? (
            <FaUser size={18} color="#FFFFFF" />
          ) : (
            <FaAndroid size={18} color="#FFFFFF" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={`  rounded-xl max-w-4xl ${
            isUser ? "bg-gray-500/40 px-4 py-3 " : "bg-white p-1"
          }`}
          style={{
            borderTopLeftRadius: isUser ? "20px" : "8px",
            borderTopRightRadius: isUser ? "8px" : "20px",
          }}
        >
          {isUser ? (
            <p className="text-white text-base leading-6 font-medium w-fit">
              {message.content}
              {/* Timestamp */}
              <div className="text-xs text-gray-200 text-left mt-0.5 font-medium ">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </p>
          ) : (
            <div className="p-3 w-full ">
              {parseXMLContent(message.content)}
              {/* Timestamp */}
              <div className="text-xs text-gray-200 text-right mt-0.5 font-medium ">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
