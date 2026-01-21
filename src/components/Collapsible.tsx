import React, { useState, PropsWithChildren } from 'react';
import { HiChevronRight } from 'react-icons/hi2';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
}

export function Collapsible({ children, title }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex flex-row items-center gap-[6px] outline-none group"
        aria-expanded={isOpen}
      >
        <HiChevronRight
          size={18}
          className={`text-gray-500 transition-transform duration-200 ease-in-out ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
        />

        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </span>
      </button>

      {/* Content Area */}
      {isOpen && (
        <div className="mt-[6px] ml-6 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}

export default Collapsible;