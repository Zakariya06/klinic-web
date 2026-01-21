import React, { useMemo, useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { IoMedicalOutline } from "react-icons/io5";

import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/services/productService";

interface ProductCardProps {
  product: Product;
}

type BouncePhase = "idle" | "down" | "up" | "settle";

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, getCartItem } = useCartStore();

  const [isAdding, setIsAdding] = useState(false);
  const [phase, setPhase] = useState<BouncePhase>("idle");

  const cartItem = getCartItem(product._id);
  const isInCart = Boolean(cartItem);

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);

    setPhase("down");
    window.setTimeout(() => setPhase("up"), 100);
    window.setTimeout(() => setPhase("settle"), 200);
    window.setTimeout(() => setPhase("idle"), 300);

    addToCart(product, 1);

    window.setTimeout(() => setIsAdding(false), 300);
  };

  const scale = useMemo(() => {
    if (phase === "down") return 0.8;
    if (phase === "up") return 1.2;
    return 1;
  }, [phase]);

  const buttonBg = useMemo(() => {
    if (isInCart)
      return "bg-[#5570F11F] text-[#5570F1] hover:bg-[#5570F1] hover:text-white";
    if (isAdding) return "bg-[#97A5EB] text-[#5570F1]";
    return "bg-[#5570F1] text-white hover:bg-[#97A5EB]";
  }, [isAdding, isInCart]);

  const buttonLabel = useMemo(() => {
    if (isInCart) return "Added";
    if (isAdding) return "Adding...";
    return "Add Cart";
  }, [isAdding, isInCart]);

  return (
    <div className="w-full rounded-xl bg-white p-3 cursor-pointer duration-200 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative mb-3 overflow-hidden rounded-xl">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-35 w-full rounded-xl bg-gray-50 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-35 w-full items-center justify-center rounded-xl bg-gray-50">
              <IoMedicalOutline className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <div className="absolute left-2 top-2 rounded-full bg-[#5570F11F] px-2 h-5 flex items-center justify-center  backdrop-blur">
            <span className="text-[10px] font-bold tracking-[0.5px] text-[#5570F1]">
              {product.availableQuantity} left
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-1 line-clamp-2 text-[15px] font-bold leading-5 tracking-[-0.2px] text-gray-900">
            {product.name}
          </div>

          <div className="mb-3 line-clamp-2 text-[13px] leading-[18px] text-gray-500">
            {product.description}
          </div>

          <div className="flex items-baseline gap-1">
            <div className="text-lg font-extrabold tracking-[-0.3px] text-sky-600">
              ₹{product.price}
            </div>
            <div className="text-[11px] font-medium text-gray-400">
              per unit
            </div>
          </div>

          {isInCart && (
            <div className="mt-2 inline-flex w-fit rounded-lg bg-emerald-100 px-2 py-1">
              <span className="text-[11px] font-semibold text-emerald-800">
                In Cart ({cartItem?.quantity})
              </span>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className={[
          "relative inline-flex  py-2 px-3 items-center justify-center rounded-full",
          "active:scale-[0.98] border border-white/30 mt-2 font-medium font-inter duration-300 transition-all ease-in-out cursor-pointer",
          buttonBg,
          isAdding ? "cursor-not-allowed opacity-90" : "",
        ].join(" ")}
      >
        <span className="inline-flex items-center justify-center">
          {isInCart ? (
            <FiCheck />
          ) : isAdding ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          ) : (
            <FiPlus className="h-3.5 w-3.5" />
          )}
          <span className="ml-1">{buttonLabel}</span>
        </span>

        {isInCart && cartItem && (
          <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
            {cartItem.quantity}
          </span>
        )}
      </button>
    </div>
  );
};

ProductCard.displayName = "ProductCard";
