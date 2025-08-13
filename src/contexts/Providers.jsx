import React from 'react';
import { AuthProvider } from '@/contexts/UnifiedAuthContext.jsx';
import { AiChatProvider } from '@/contexts/AiChatContext.jsx';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AiChatProvider>
        {children}
      </AiChatProvider>
    </AuthProvider>
  );
};