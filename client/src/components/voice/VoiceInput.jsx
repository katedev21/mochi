// src/components/voice/VoiceInput.jsx
import React, { useState, useEffect } from 'react';
import { Mic, Square, AlertCircle, AudioLines } from 'lucide-react';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';

const VoiceInput = ({ onResult, onStart, onEnd }) => {
  const [visualizerData, setVisualizerData] = useState(Array(20).fill(5));
  const [animationFrame, setAnimationFrame] = useState(null);
  
  const { 
    isListening, 
    supported, 
    error, 
    toggleListening,
    startListening,
    stopListening
  } = useVoiceRecognition({
    onResult: (result) => {
      if (onResult) onResult(result);
      handleStopListening();
    },
    onError: (error) => console.error('Voice recognition error:', error)
  });

  // Start visualization when listening
  const handleStartListening = () => {
    if (onStart) onStart();
    startListening();
    
    // Start visualization animation
    const animate = () => {
      const newData = visualizerData.map(() => Math.floor(Math.random() * 30) + 5);
      setVisualizerData(newData);
      
      const frame = requestAnimationFrame(animate);
      setAnimationFrame(frame);
    };
    
    animate();
  };

  // Stop visualization when not listening
  const handleStopListening = () => {
    if (onEnd) onEnd();
    stopListening();
    
    // Stop visualization animation
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    // Reset visualizer to flat line
    setVisualizerData(Array(20).fill(5));
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animationFrame]);

  // Not supported message
  if (!supported) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Voice recognition not supported</p>
          <p className="text-sm">Your browser doesn't support voice recognition. Please try using a different browser, like Chrome.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Error message */}
      {error && (
        <div className="w-full bg-red-50 text-red-800 p-2 rounded-lg mb-3 text-sm">
          Error: {error.message || error}
        </div>
      )}
      
      {/* Visualizer */}
      <div className="h-16 w-full flex items-center justify-center mb-3">
        <div className="flex items-end space-x-1 h-full">
          {visualizerData.map((height, index) => (
            <div
              key={index}
              className={`w-1.5 rounded-t ${isListening ? 'bg-blue-500' : 'bg-gray-300'}`}
              style={{ 
                height: `${height}px`,
                transition: 'height 0.1s ease-in-out'
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Microphone controls */}
      <div className="flex space-x-3">
        {!isListening ? (
          <button
            onClick={handleStartListening}
            className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition-colors shadow-md"
            title="Start listening"
          >
            <Mic className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={handleStopListening}
            className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors shadow-md"
            title="Stop listening"
          >
            <Square className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {/* Status text */}
      <p className="mt-3 text-sm text-gray-600">
        {isListening ? (
          <span className="flex items-center">
            <AudioLines className="h-4 w-4 mr-1 text-blue-500 animate-pulse" />
            Listening...
          </span>
        ) : (
          "Tap the microphone to speak a command"
        )}
      </p>
    </div>
  );
};

export default VoiceInput;