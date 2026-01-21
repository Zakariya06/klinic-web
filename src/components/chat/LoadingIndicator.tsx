import React from "react";
import { FaAndroid } from "react-icons/fa";

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="mb-6 flex w-fit">
      <div className="flex items-start">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-violet-600 shadow-md">
          <FaAndroid className="text-white text-lg" />
        </div>

        {/* Message Bubble */}
        <div className="flex-1 bg-white rounded-2xl px-5 py-4 border border-gray-200 shadow-md">
          {/* Top Row */}
          <div className="flex items-center mb-3">
            {/* Animated Dots */}
            <div className="flex items-center mr-3">
              <span className="loading-dot delay-0" />
              <span className="loading-dot delay-200" />
              <span className="loading-dot delay-400" />
            </div>

            <p className="text-gray-600 font-semibold text-base">
              Analyzing your medical context...
            </p>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">
              🔍 Reviewing your health profile and symptoms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
