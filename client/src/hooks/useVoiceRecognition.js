// src/hooks/useVoiceRecognition.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook that provides voice recognition functionality
 * @param {Object} options - Configuration options
 * @param {boolean} options.continuous - Whether recognition should continue after results are returned
 * @param {boolean} options.autoStart - Whether to start listening immediately
 * @param {function} options.onResult - Callback when results are returned
 * @param {function} options.onError - Callback when an error occurs
 * @returns {Object} Voice recognition controls and state
 */
const useVoiceRecognition = ({ 
  continuous = false, 
  autoStart = false,
  onResult = () => {},
  onError = () => {},
  language = 'en-US'
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      setError(new Error('Speech recognition is not supported in this browser.'));
      return;
    }
    
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language;
    
    // Set up event handlers
    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
      onResult(result);
    };
    
    recognitionRef.current.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
      onError(event.error);
    };
    
    recognitionRef.current.onend = () => {
      if (continuous && isListening) {
        recognitionRef.current.start();
      } else {
        setIsListening(false);
      }
    };
    
    if (autoStart) {
      startListening();
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        stopListening();
      }
    };
  }, [continuous, autoStart, language, onResult, onError]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (!supported) return;
    
    setTranscript('');
    setError(null);
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      // Handle case when recognition is already running
      if (err.name === 'InvalidStateError') {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      } else {
        setError(err);
        setIsListening(false);
        onError(err);
      }
    }
  }, [supported, onError]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      setError(err);
      onError(err);
    }
  }, [supported, onError]);
  
  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);
  
  return {
    isListening,
    transcript,
    error,
    supported,
    startListening,
    stopListening,
    toggleListening,
  };
};

export default useVoiceRecognition;