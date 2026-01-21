import React from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
}

const Logo = ({ size = "medium", showTagline = false }: LogoProps) => {
  // Size mappings
  const sizeMap = {
    small: {
      iconSize: 40,
      titleSize: "text-xl",
      taglineSize: "text-xs",
      marginBottom: "mb-2",
    },
    medium: {
      iconSize: 60,
      titleSize: "text-2xl",
      taglineSize: "text-sm",
      marginBottom: "mb-4",
    },
    large: {
      iconSize: 80,
      titleSize: "text-3xl",
      taglineSize: "text-base",
      marginBottom: "mb-6",
    },
  };

  const { iconSize, titleSize, taglineSize, marginBottom } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center ${marginBottom}`}>
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Using Material Icons for web */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="white"
          className="text-white"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
        </svg>
      </div>

      <span
        className={`${titleSize} text-primary mt-3 font-bold`}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }}
      >
        Klinic
      </span>

      {showTagline && (
        <span
          className={`${taglineSize} text-text-secondary mt-1`}
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          }}
        >
          Healthcare at your fingertips
        </span>
      )}
    </div>
  );
};

export default Logo;
