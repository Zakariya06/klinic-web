import React, { useEffect } from "react";
import { MdSaveAlt } from "react-icons/md";

interface SaveButtonProps {
  onPress: () => void;
  loading: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress, loading }) => {
  // Start the pulse animation on mount (same idea as Animated.loop)
  useEffect(() => {
    // nothing needed here because we use CSS animation
  }, []);

  return (
    <div className="animate-save-pulse fixed right-3 bottom-3">
      <button
        type="button"
        onClick={onPress}
        disabled={loading}
        className={[
          "w-full rounded-xl py-3.5 px-4 cursor-pointer",
          "flex items-center justify-center gap-2",
          "bg-[#5570F1] hover:bg-[#5570F1]/85 text-white duration-300",
          "active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {loading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
            aria-label="Loading"
            role="status"
          />
        ) : (
          <>
            <MdSaveAlt size={20} />
            <span className="font-medium text-base">Save Changes</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SaveButton;
