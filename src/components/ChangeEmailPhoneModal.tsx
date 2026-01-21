import React, { useState, useEffect } from 'react';
import { MdClose, MdOutlineEmail, MdOutlinePhone } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface ChangeEmailPhoneModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (email: string, phone: string) => Promise<void>;
    currentEmail: string;
    currentPhone: string;
}

const ChangeEmailPhoneModal = ({
    visible,
    onClose,
    onSubmit,
    currentEmail,
    currentPhone
}: ChangeEmailPhoneModalProps) => {
    const [email, setEmail] = useState(currentEmail);
    const [phone, setPhone] = useState(currentPhone);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update internal state if props change (e.g., when modal opens)
    useEffect(() => {
        if (visible) {
            setEmail(currentEmail);
            setPhone(currentPhone);
            setError('');
        }
    }, [visible, currentEmail, currentPhone]);

    // Close on Escape key press
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const validatePhone = (value: string): boolean => {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(value)) {
            setError('Phone number must be 10 digits');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateEmail(email) || !validatePhone(phone)) {
            return;
        }

    setLoading(true);
        try {
            await onSubmit(email, phone);
            onClose();
        } catch (err) {
            console.error('Failed to update email/phone:', err);
            setError('Failed to update email/phone. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Change Email & Phone
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MdClose size={24} className="text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg mb-4">
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative flex items-center">
                            <MdOutlineEmail className="absolute left-3 text-indigo-600" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="relative flex items-center">
                            <MdOutlinePhone className="absolute left-3 text-indigo-600" size={20} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter 10-digit phone number"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
                                required
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center"
                        >
                            {loading ? (
                                <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                            ) : (
                                'Update'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangeEmailPhoneModal;