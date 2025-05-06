// src/components/voice/ChatInterface.jsx
import React from 'react';
import { MessageCircle, Bot } from 'lucide-react';

const ChatInterface = ({ messages = [] }) => {
  // Helper function to format message timestamps
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render different message types
  const renderMessage = (message) => {
    switch (message.type) {
      case 'user':
        return (
          <div className="flex justify-end mb-4" key={message.id}>
            <div className="max-w-3/4">
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <p className="text-sm">{message.text}</p>
              </div>
              <span className="text-xs text-gray-500 leading-none mt-1 float-right">
                {formatTimestamp()}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2">
              <MessageCircle className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        );
      
      case 'assistant':
        return (
          <div className="flex mb-4" key={message.id}>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
              <Bot className="h-4 w-4 text-purple-600" />
            </div>
            <div className="max-w-3/4">
              <div className="bg-gray-200 p-3 rounded-lg">
                <p className="text-sm text-gray-800">{message.text}</p>
              </div>
              <span className="text-xs text-gray-500 leading-none mt-1">
                {formatTimestamp()}
              </span>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div className="flex justify-center mb-4" key={message.id}>
            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              {message.text}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Bot className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p>No messages yet. Start a conversation!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(renderMessage)}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;