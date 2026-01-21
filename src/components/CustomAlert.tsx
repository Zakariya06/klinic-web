import React from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive" | "primary";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: CustomAlertButton[];
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK", style: "primary" }],
  type = "info",
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return { icon: FaCheckCircle, color: "#10B981" };
      case "error":
        return { icon: FaTimesCircle, color: "#EF4444" };
      case "warning":
        return { icon: FaExclamationTriangle, color: "#F59E0B" };
      default:
        return { icon: FaInfoCircle, color: "#3B82F6" };
    }
  };

  const getButtonStyle = (style: string) => {
    switch (style) {
      case "primary":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "destructive":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "cancel":
        return "bg-gray-200 hover:bg-gray-300 text-gray-700";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-600";
    }
  };

  const icon = getIcon();
  const IconComponent = icon.icon;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-6 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header with Icon */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: icon.color + "20" }}
          >
            <IconComponent size={32} style={{ color: icon.color }} />
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-center leading-6 text-base">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6">
          {buttons.length === 1 ? (
            // Single button
            <button
              onClick={() => {
                buttons[0].onPress?.();
                onClose?.();
              }}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${getButtonStyle(
                buttons[0].style || "default"
              )}`}
            >
              {buttons[0].text}
            </button>
          ) : buttons.length === 2 ? (
            // Two buttons side by side
            <div className="flex flex-row gap-3">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    button.onPress?.();
                    onClose?.();
                  }}
                  className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${getButtonStyle(
                    button.style || "default"
                  )}`}
                >
                  {button.text}
                </button>
              ))}
            </div>
          ) : (
            // Multiple buttons stacked
            <div className="space-y-2">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    button.onPress?.();
                    onClose?.();
                  }}
                  className={`w-full py-4 rounded-xl font-semibold transition-colors ${getButtonStyle(
                    button.style || "default"
                  )}`}
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for easier usage
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: CustomAlertButton[];
    type?: "success" | "error" | "warning" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const showAlert = (config: Omit<typeof alertConfig, "visible">) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert {...alertConfig} onClose={hideAlert} />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};

export default CustomAlert;
