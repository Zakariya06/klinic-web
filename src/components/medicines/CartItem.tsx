import React from 'react';
import { FaPlus, FaMinus, FaTrash, FaPills } from 'react-icons/fa';
import { useCartStore } from '@/store/cartStore';

// Define the shape of a single Product
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

// Define the shape of the Item prop
interface CartItemProps {
  item: {
    product: Product;
    quantity: number;
  };
  // Keeping these in case they are needed for parent logic, 
  // though the component currently uses store actions directly
  onQuantityChange?: (newQuantity: number) => void;
  onRemove?: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();

  const handleQuantityChange = (newQuantity: number): void => {
    if (newQuantity <= 0) {
      removeFromCart(item.product._id);
    } else {
      updateQuantity(item.product._id, newQuantity);
    }
  };

  const handleRemove = (): void => {
    removeFromCart(item.product._id);
  };

  return (
    <div className="flex items-center bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Product Image */}
      <div className="mr-4 flex-shrink-0">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="w-[70px] h-[70px] rounded-xl object-cover bg-gray-50"
          />
        ) : (
          <div className="w-[70px] h-[70px] rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200">
            <FaPills className="text-gray-400 text-xl" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 mr-4 min-w-0">
        <h4 className="text-base font-bold text-gray-900 truncate">
          {item.product.name}
        </h4>

        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
          {item.product.description}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-gray-500">
            ₹{item.product.price}
          </span>
          <span className="text-base font-bold text-blue-600">
            ₹{item.product.price * item.quantity}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0"> 
        <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-2 border border-gray-200">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <FaMinus className="text-gray-500 text-xs" />
          </button>

          <span className="font-bold text-gray-900 min-w-[20px] text-center select-none">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <FaPlus className="text-gray-500 text-xs" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors group"
          title="Remove item"
        >
          <FaTrash className="text-red-500 text-sm group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export { CartItem };