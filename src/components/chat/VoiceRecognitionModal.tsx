import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaTimes, FaCog, FaCheck, FaRedo } from 'react-icons/fa';
import { voiceService } from '../../services/voiceService';

interface VoiceRecognitionModalProps {
  visible: boolean;
  onClose: () => void;
  onTextReceived: (text: string) => void;
}

const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
  visible,
  onClose,
  onTextReceived,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const micRef = useRef<HTMLButtonElement>(null);

  // Check if web speech is supported
  const isWebSpeechSupported = voiceService.isWebSpeechSupported();

  useEffect(() => {
    if (visible) {
      setError(null);
      setRecognizedText('');
      setRecordingDuration(0);
      
      if (!isWebSpeechSupported) {
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }
    }
  }, [visible, isWebSpeechSupported]);

  useEffect(() => {
    if (isListening) {
      startDurationTimer();
    } else {
      stopDurationTimer();
    }
  }, [isListening]);

  const startDurationTimer = () => {
    durationInterval.current = setInterval(() => {
      setRecordingDuration(voiceService.getRecordingDuration());
    }, 100);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startListening = async () => {
    if (!isWebSpeechSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      setError(null);
      setRecognizedText('');
      setRecordingDuration(0);
      setIsListening(true);
      setIsProcessing(false);

      const success = await voiceService.startRecording();
      if (!success) {
        throw new Error('Failed to start speech recognition');
      }

    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      setError(error.message || 'Failed to start voice recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      setIsProcessing(true);

      const result = await voiceService.stopRecording();
      
      if (result.success && result.text) {
        setRecognizedText(result.text);
        setIsProcessing(false);
        
        // Auto-close after a short delay to show the result
        setTimeout(() => {
          onTextReceived(result.text!);
          onClose();
        }, 1000);
      } else {
        setError(result.error || 'Speech recognition failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error stopping speech recognition:', error);
      setError('Failed to stop voice recognition.');
      setIsProcessing(false);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClose = () => {
    if (isListening) {
      voiceService.cancelRecording();
    }
    voiceService.cleanup();
    setRecognizedText('');
    setError(null);
    setRecordingDuration(0);
    onClose();
  };

  const handleTryAgain = () => {
    setRecognizedText('');
    setError(null);
    setRecordingDuration(0);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Voice Recognition</h2>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Status Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-center text-gray-700 mb-2 font-medium">
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready to listen'}
          </p>
          <p className="text-xs text-gray-500 text-center">
            {isListening 
              ? 'Speak clearly into your microphone' 
              : isProcessing
              ? 'Converting speech to text...'
              : 'Click the microphone to start recording'
            }
          </p>
          {isListening && recordingDuration > 0 && (
            <p className="text-xs text-blue-600 text-center mt-2 font-medium">
              Duration: {formatDuration(recordingDuration)}
            </p>
          )}
        </div>

        {/* Recognized Text Display */}
        {recognizedText && (
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">Recognized Text:</p>
            <p className="text-base text-gray-800 leading-6">
              {recognizedText}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          </div>
        )}

        {/* Microphone Button */}
        <div className="flex flex-col items-center mb-6">
          <button
            ref={micRef}
            onClick={handleMicPress}
            disabled={!isWebSpeechSupported || isProcessing}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
              ${!isWebSpeechSupported 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isListening 
                  ? 'bg-red-500 pulse-animation' 
                  : isProcessing
                    ? 'bg-yellow-500'
                    : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
              }
              ${(!isWebSpeechSupported || isProcessing) ? 'opacity-60' : 'opacity-100'}
            `}
            style={{
              boxShadow: !isWebSpeechSupported 
                ? '0 4px 6px rgba(156, 163, 175, 0.3)' 
                : isListening 
                  ? '0 4px 6px rgba(239, 68, 68, 0.3)' 
                  : isProcessing
                    ? '0 4px 6px rgba(245, 158, 11, 0.3)'
                    : '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isListening ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isProcessing ? (
              <FaCog size={32} className="text-white animate-spin" />
            ) : (
              <FaMicrophone size={32} className="text-white" />
            )}
          </button>
          
          <p className="text-sm text-gray-600 mt-3 text-center">
            {isListening ? 'Click to stop' : isProcessing ? 'Processing...' : 'Click to start'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3">
          <button
            onClick={handleTryAgain}
            disabled={!isWebSpeechSupported || isProcessing}
            className={`
              flex-1 bg-gray-100 py-4 rounded-lg flex flex-row justify-center items-center
              transition-colors ${(!isWebSpeechSupported || isProcessing) 
                ? 'cursor-not-allowed opacity-60' 
                : 'hover:bg-gray-200 active:scale-95'
              }
            `}
            type="button"
          >
            <FaRedo size={16} className="text-gray-500" />
            <span className="text-gray-700 font-semibold ml-2">
              Try Again
            </span>
          </button>

          {recognizedText && (
            <button
              onClick={() => {
                onTextReceived(recognizedText.trim());
                onClose();
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 active:scale-95 py-4 rounded-lg flex flex-row justify-center items-center transition-colors"
              type="button"
            >
              <FaCheck size={16} className="text-white" />
              <span className="text-white font-semibold ml-2">
                Use Text
              </span>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center">
            Make sure to speak clearly and at a normal pace
          </p>
          {!isWebSpeechSupported && (
            <p className="text-xs text-red-500 text-center mt-2">
              Speech recognition requires Chrome, Edge, or Safari
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecognitionModal;