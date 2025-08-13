import React, { createContext, useContext, useState } from 'react';

const AiChatContext = createContext({});

export const useAiChat = () => {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error('useAiChat must be used within an AiChatProvider');
  }
  return context;
};

export const AiChatProvider = ({ children }) => {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const value = {
    aiChatOpen,
    setAiChatOpen
  };

  return (
    <AiChatContext.Provider value={value}>
      {children}
    </AiChatContext.Provider>
  );
};