'use client';

import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [autoQuery, setAutoQuery] = useState(null);

  const openChat = (query = null) => {
    setIsChatOpen(true);
    if (query) {
      setAutoQuery(query);
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const resetAutoQuery = () => {
    setAutoQuery(null);
  };

  const value = {
    isChatOpen,
    openChat,
    closeChat,
    autoQuery,
    resetAutoQuery
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
