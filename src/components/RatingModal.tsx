import React, { useState } from 'react';
import { FaStar, FaRegStar, FaTimes, FaCheck } from 'react-icons/fa';
import { useCustomAlert } from './CustomAlert';
import apiClient from '@/api/client';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  appointmentId: string;
  providerId: string;
  providerName: string;
  providerType: 'doctor' | 'laboratoryService';
  onRatingSubmitted: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  appointmentId,
  providerId,
  providerName,
  providerType,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleStarPress = (starNumber: number) => {
    setRating(starNumber);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showAlert({
        title: 'Rating Required',
        message: 'Please select a rating before submitting.',
        type: 'warning'
      });
      return;
    }

    setSubmitting(true);
    try {
      const ratingData = {
        appointmentId,
        providerId,
        providerType,
        rating,
        comment: comment.trim() || undefined
      };
      
      console.log('📤 Submitting rating:', ratingData);
      const response = await apiClient.post('/api/v1/ratings', ratingData);
      console.log('✅ Rating submitted successfully:', response.data);
      
      showAlert({
        title: 'Thank You!',
        message: 'Your rating has been submitted successfully.',
        type: 'success'
      });
      
      setRating(0);
      setComment('');
      onClose();
      onRatingSubmitted();
    } catch (error: any) {
      console.error('❌ Rating submission failed:', error.response?.data || error.message);
      showAlert({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to submit rating. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (rating > 0) {
      if (window.confirm('You have selected a rating. Are you sure you want to close without submitting?')) {
        setRating(0);
        setComment('');
        onClose();
      }
    } else {
      onClose();
    }
  };

  const renderStars = () => {
    return (
      <div className="flex flex-row justify-center space-x-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarPress(star)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-transform hover:scale-110"
            type="button"
          >
            {rating >= star ? (
              <FaStar size={32} className="text-yellow-400" />
            ) : (
              <FaRegStar size={32} className="text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    if (rating === 0) return 'Click to rate';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return '';
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-6 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slideIn">
          {/* Header */}
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
            <button 
              onClick={handleClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <FaTimes size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Provider Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {providerType === 'doctor' ? `Dr. ${providerName}` : providerName}
            </h3>
            <p className="text-gray-600 text-sm">
              {providerType === 'doctor' ? 'Doctor Consultation' : 
               providerType === 'laboratoryService' ? 'Laboratory Service' : 'Laboratory'}
            </p>
          </div>

          {/* Stars */}
          {renderStars()}

          {/* Rating Text */}
          <p className="text-center text-lg font-medium text-gray-900 mb-6">
            {getRatingText()}
          </p>

          {/* Comment Input */}
          <div className="mb-6">
            <label className="text-gray-700 font-medium mb-2 block">Share your experience (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              maxLength={500}
              className="w-full border border-gray-300 rounded-xl p-4 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <div className="text-gray-500 text-xs mt-1 text-right">
              {comment.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className={`w-full py-4 px-6 rounded-xl flex flex-row items-center justify-center transition-colors ${
              submitting || rating === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            type="button"
          >
            {submitting ? (
              <span className="text-white font-semibold">Submitting...</span>
            ) : (
              <>
                <span className="text-white font-semibold mr-2">Submit Rating</span>
                <FaCheck size={16} className="text-white" />
              </>
            )}
          </button>
        </div>
      </div>
      <AlertComponent />
    </>
  );
};

export default RatingModal;