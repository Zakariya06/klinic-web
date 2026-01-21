// src/components/ui/CustomModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

export interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayPress?: boolean;
  animationType?: "fade" | "slide" | "scale";
  size?: "small" | "medium" | "large" | "full";
  zIndex?: number;
  scrollable?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayPress = true,
  animationType = "fade",
  size = "medium",
  zIndex = 1000,
  scrollable = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);

  // lock body scroll while open
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  // handle mount/unmount with exit animation
  useEffect(() => {
    if (visible) {
      setRender(true);
      requestAnimationFrame(() => setMounted(true));
      return;
    }
    // start exit animation
    setMounted(false);
    const t = window.setTimeout(() => setRender(false), 220);
    return () => window.clearTimeout(t);
  }, [visible]);

  // close on ESC
  useEffect(() => {
    if (!render) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [render, onClose]);

  const [vw, vh] = useViewport();

  const sizeStyle = useMemo<React.CSSProperties>(() => {
    const w = vw;
    const h = vh;

    switch (size) {
      case "small":
        return {
          width: Math.min(w * 0.9, 400),
          maxHeight: h * 0.6,
        };
      case "medium":
        return {
          width: Math.min(w * 0.95, 600),
          maxHeight: h * 0.8,
        };
      case "large":
        return {
          width: Math.min(w * 0.98, 800),
          maxHeight: h * 0.9,
        };
      case "full":
        return {
          width: w * 0.98,
          height: h * 0.95,
        };
      default:
        return {
          width: Math.min(w * 0.95, 600),
          maxHeight: h * 0.8,
        };
    }
  }, [size, vw, vh]);

  const modalMotionStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      transition: "opacity 200ms ease, transform 200ms ease",
      opacity: mounted ? 1 : 0,
    };

    if (animationType === "fade") return base;

    if (animationType === "slide") {
      return {
        ...base,
        transform: mounted ? "translateY(0px)" : "translateY(50px)",
      };
    }

    // scale
    return {
      ...base,
      transform: mounted ? "scale(1)" : "scale(0.8)",
    };
  }, [animationType, mounted]);

  const overlayMotionStyle = useMemo<React.CSSProperties>(() => {
    return {
      transition: "opacity 200ms ease",
      opacity: mounted ? 1 : 0,
    };
  }, [mounted]);

  if (!render) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      style={{ zIndex, ...overlayMotionStyle }}
      onMouseDown={(e) => {
        if (!closeOnOverlayPress) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full p-4 flex items-center justify-center">
        <div
          className="bg-white rounded-2xl overflow-hidden shadow-xl"
          style={{ ...sizeStyle, ...modalMotionStyle }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
              {title ? (
                <div className="text-lg font-bold text-gray-900 truncate pr-4">{title}</div>
              ) : (
                <div />
              )}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-gray-900" size={16} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={scrollable ? "flex-1 overflow-auto" : "flex-1"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

function useViewport(): [number, number] {
  const get = () => [window.innerWidth, window.innerHeight] as [number, number];
  const [vp, setVp] = useState<[number, number]>(() => (typeof window === "undefined" ? [1200, 800] : get()));

  useEffect(() => {
    const onResize = () => setVp(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return vp;
}

export default CustomModal;
