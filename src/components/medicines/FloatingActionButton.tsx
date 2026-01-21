import React, { useMemo, useState } from "react";
import { FiFileText, FiShoppingCart } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

interface FloatingActionButtonProps {
  onCartPress: () => void;
  onPrescriptionPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCartPress,
  onPrescriptionPress,
}) => {
  const { getCartItemCount, toggleFAB } = useCartStore();
  const [localExpanded, setLocalExpanded] = useState(false);

  const cartItemCount = getCartItemCount();

  const toggleExpanded = () => {
    const next = !localExpanded;
    setLocalExpanded(next);
    toggleFAB(next);
  };

  const handleBackdropPress = () => {
    if (localExpanded) toggleExpanded();
  };

  const handleCartPress = () => {
    if (localExpanded) toggleExpanded();
    onCartPress();
  };

  const handlePrescriptionPress = () => {
    if (localExpanded) toggleExpanded();
    onPrescriptionPress();
  };

  const cartBadgeText = useMemo(() => {
    if (cartItemCount <= 0) return null;
    return cartItemCount > 99 ? "99+" : String(cartItemCount);
  }, [cartItemCount]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-999 bg-black/30 transition-opacity duration-300",
          localExpanded ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onMouseDown={handleBackdropPress}
        aria-hidden="true"
      />

      {/* Container */}
      <div className="fixed bottom-5 right-5 cursor-pointer z-1000 flex items-end justify-end">
        {/* Cart button */}
        <div
          className={[
            "absolute bottom-0 right-0 h-12 w-12 transition-all duration-200",
            localExpanded ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          style={{
            transform: localExpanded
              ? "translateY(-80px) scale(1)"
              : "translateY(0) scale(0.8)",
            transitionDelay: localExpanded ? "50ms" : "0ms",
          }}
        >
          <button
            type="button"
            onClick={handleCartPress}
            className={[
              "relative flex h-12 w-12 items-center justify-center rounded-full",
              "border-2 border-white/30 bg-blue-500 shadow-lg shadow-black/20",
              "transition active:scale-[0.98]",
            ].join(" ")}
            aria-label="Cart"
          >
            <FiShoppingCart className="h-5 w-5 text-white" />
            {cartBadgeText && (
              <span
                className={[
                  "absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center",
                  "rounded-full border-2 border-white bg-red-500 px-1.5",
                  "text-[10px] font-extrabold tracking-[0.5px] text-white shadow shadow-red-500/30",
                ].join(" ")}
              >
                {cartBadgeText}
              </span>
            )}
          </button>
        </div>

        {/* Prescription button */}
        <div
          className={[
            "absolute bottom-0 right-0 h-12 w-12 transition-all duration-200",
            localExpanded ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          style={{
            transform: localExpanded
              ? "translateY(-160px) scale(1)"
              : "translateY(0) scale(0.8)",
            transitionDelay: localExpanded ? "100ms" : "0ms",
          }}
        >
          <button
            type="button"
            onClick={handlePrescriptionPress}
            className={[
              "flex h-12 w-12 items-center justify-center rounded-full",
              "border-2 border-white/30 bg-red-500 shadow-lg shadow-black/20",
              "transition active:scale-[0.98]",
            ].join(" ")}
            aria-label="Prescription"
          >
            <FiFileText className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Main FAB */}
        <div
          className="transition-transform duration-300"
          style={{
            transform: localExpanded ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <button
            type="button"
            onClick={toggleExpanded}
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full",
              "border-2 border-white/30 bg-emerald-500 shadow-xl shadow-emerald-500/30",
              "transition active:scale-[0.98] cursor-pointer",
            ].join(" ")}
            aria-expanded={localExpanded}
            aria-label="Floating action button"
          >
            <FiShoppingCart className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

FloatingActionButton.displayName = "FloatingActionButton";
