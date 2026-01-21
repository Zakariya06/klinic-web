import { cn } from "@/utils/utils";
import React, { useEffect, useRef } from "react";
import { FaComments } from "react-icons/fa";

interface ToctorFloatingButtonProps {
  onPress: () => void;
  className?: string;
}

const ToctorFloatingButton: React.FC<ToctorFloatingButtonProps> = ({
  onPress,
  className,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create CSS animation keyframes if they don't exist
    const styleId = "toctor-floating-button-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .pulse-animation {
          animation: pulse 2s infinite ease-in-out;
        }
        .glow-animation {
          animation: glow 4s infinite ease-in-out;
        }
        .toctor-button-inner {
          transition: transform 0.2s ease;
        }
        .toctor-button-inner:active {
          transform: scale(0.95);
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Don't remove the style tag as it might be used by multiple instances
      // The style tag will persist for the lifetime of the app
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onPress();
  };

  return (
    <div className={cn(`absolute bottom-28 right-6 z-50 w-16 h-16`, className)}>
      {/* Glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 w-16 h-16 rounded-full bg-purple-400 glow-animation pulse-animation"
        style={{
          animation:
            "glow 4s infinite ease-in-out, pulse 2s infinite ease-in-out",
        }}
      />

      {/* Main button */}
      <div className="pulse-animation">
        <button
          onClick={handleClick}
          className="toctor-button-inner relative w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-lg cursor-pointer border-none focus:outline-none focus:ring-4 focus:ring-violet-300 focus:ring-opacity-50"
          style={{
            boxShadow: "0 4px 8px rgba(139, 92, 246, 0.3)",
            minWidth: "64px",
            minHeight: "64px",
          }}
          aria-label="Open Toctor AI Chat"
          title="Talk to Toctor AI"
        >
          {/* Inner glow */}
          <div
            className="absolute top-1 left-1 right-1 bottom-1 rounded-full bg-purple-500 opacity-50"
            style={{
              top: "4px",
              left: "4px",
              right: "4px",
              bottom: "4px",
              borderRadius: "28px",
              backgroundColor: "#A855F7",
              opacity: 0.5,
            }}
          />

          {/* Main Icon - Chat/Assistant */}
          <FaComments size={28} color="#FFFFFF" />

          {/* AI Badge */}
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-md"
            style={{
              top: "-4px",
              right: "-4px",
              width: "24px",
              height: "24px",
              borderRadius: "12px",
              backgroundColor: "#10B981",
              border: "2px solid #FFFFFF",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.5)",
            }}
          >
            <span
              className="text-white text-xs font-bold"
              style={{
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: "bold",
                lineHeight: "1",
              }}
            >
              AI
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ToctorFloatingButton;
