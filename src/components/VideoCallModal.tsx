import React, { useState, useEffect } from 'react';
import { FaVideo, FaUserMd, FaUser, FaSpinner } from 'react-icons/fa';
import apiClient from '@/api/client';
import VideoCall from './VideoCall';

interface VideoCallModalProps {
  visible: boolean;
  onClose: () => void;
  appointmentId: string;
  userRole: 'doctor' | 'patient';
  appointmentData?: {
    doctorName?: string;
    patientName?: string;
    appointmentTime?: string;
  };
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  visible,
  onClose,
  appointmentId,
  userRole,
  appointmentData
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callData, setCallData] = useState<{
    channelName: string;
    token: string;
    uid: number;
  } | null>(null);

  useEffect(() => {
    if (visible && appointmentId) {
      initializeCall();
    } else {
      // Reset state when modal closes
      setError(null);
      setCallData(null);
      setIsLoading(true);
    }
  }, [visible, appointmentId]);

  const initializeCall = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get Agora token from backend
      const response = await apiClient.post('/api/v1/video-call/generate-token', {
        appointmentId,
        userRole
      });

      if (response.data.success) {
        setCallData({
          channelName: response.data.channelName,
          token: response.data.token,
          uid: response.data.uid
        });
      } else {
        throw new Error(response.data.message || 'Failed to generate video call token');
      }
    } catch (error: any) {
      console.error('Error initializing video call:', error);
      const errorMessage = error.response?.data?.message || 'Failed to connect to video call. Please try again.';
      setError(errorMessage);
      
      // Auto-close after showing error for a moment
      setTimeout(() => {
        onClose();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      // Notify backend that call has ended
      await apiClient.post('/api/v1/video-call/end-call', {
        appointmentId,
        userRole
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
    
    onClose();
  };

  const renderLoadingScreen = () => (
    <div className="fixed inset-0 bg-black flex flex-col justify-center items-center p-8 z-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex p-4 bg-blue-500/20 rounded-full">
            <FaVideo className="text-blue-400 text-4xl animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-4">
          {userRole === 'doctor' 
            ? `Starting consultation with ${appointmentData?.patientName || 'patient'}`
            : `Joining consultation with Dr. ${appointmentData?.doctorName || 'doctor'}`
          }
        </h2>
        
        <p className="text-gray-300 mb-6">
          Please wait while we connect you to the video call...
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <FaSpinner className="animate-spin text-blue-400" />
          <span className="text-blue-300">Establishing secure connection</span>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FaUserMd className="text-green-400 mr-2" />
              <span className="text-white text-sm">Doctor</span>
            </div>
            <p className="text-gray-300 text-sm">
              {appointmentData?.doctorName || 'Doctor'}
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FaUser className="text-blue-400 mr-2" />
              <span className="text-white text-sm">Patient</span>
            </div>
            <p className="text-gray-300 text-sm">
              {appointmentData?.patientName || 'Patient'}
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="fixed inset-0 bg-black flex flex-col justify-center items-center p-8 z-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex p-4 bg-red-500/20 rounded-full">
            <FaVideo className="text-red-400 text-4xl" />
          </div>
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-4">
          Connection Failed
        </h2>
        
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 mb-6">
          <p className="text-red-200">
            {error}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={initializeCall}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (!visible) return null;

  if (error) {
    return renderErrorScreen();
  }

  if (isLoading) {
    return renderLoadingScreen();
  }

  if (callData) {
    return (
      <VideoCall
        channelName={callData.channelName}
        token={callData.token}
        uid={callData.uid}
        onEndCall={handleEndCall}
        userRole={userRole}
        appointmentData={appointmentData}
      />
    );
  }

  // Fallback error screen
  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center p-8 z-50">
      <div className="text-center">
        <p className="text-red-400 text-lg mb-4">Failed to connect to video call</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;