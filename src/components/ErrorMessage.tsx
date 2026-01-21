import React from 'react';
import { MdErrorOutline } from 'react-icons/md'; // Using React Icons

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 p-3 rounded-lg mb-4 flex items-center">
      <MdErrorOutline size={20} color="#EF4444" />
      <p className="text-accent ml-2 flex-1" style={{ fontFamily: 'System' }}>
        {message}
      </p>
    </div>
  );
};

export default ErrorMessage;
