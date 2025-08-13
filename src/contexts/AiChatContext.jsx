import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';

const AiChatContext = createContext();

export const useAiChat = () => useContext(AiChatContext);

export const AiChatProvider = ({ children }) => {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const { hasPermission } = usePermissions();
  
  const canUseAiChat = true; // المساعد الذكي متاح للجميع

  const value = {
    aiChatOpen,
    setAiChatOpen,
    canUseAiChat
  };

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
};