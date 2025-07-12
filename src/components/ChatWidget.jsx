'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaCode, FaLightbulb, FaFile, FaCog } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/contexts/ChatContext';
import { usePathname } from 'next/navigation';

const ChatWidget = () => {
  const { 
    isChatOpen, 
    closeChat, 
    openChat,
    autoQuery,
    resetAutoQuery
  } = useChat();

  const pathname = usePathname();
  const [currentPost, setCurrentPost] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm DevBot - your AI assistant for DevShareLite! 🤖\n\nI can help you with:\n- Explaining code\n- Debugging errors\n- Improvement suggestions\n- Programming guidance\n\nWhat can I help you with?", 
      sender: 'bot' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const skipScrollRef = useRef(false);

  // Check if we're on a post page and fetch post data
  useEffect(() => {
    const postMatch = pathname?.match(/^\/posts\/(\d+)$/);
    if (postMatch) {
      const postId = postMatch[1];
      fetchPostData(postId);
    } else {
      setCurrentPost(null);
    }
  }, [pathname]);

  const fetchPostData = async (postId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
      if (response.ok) {
        const post = await response.json();
        setCurrentPost(post);
      }
    } catch (error) {
      console.error('Error fetching post data:', error);
    }
  };

  const scrollToBottom = () => {
    if (!skipScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    skipScrollRef.current = false;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && autoQuery) {
      skipScrollRef.current = true;
      handleAutoQuery(autoQuery);
      resetAutoQuery();
    }
  }, [isChatOpen, autoQuery]);

  const handleAutoQuery = async (queryInfo) => {
    setIsLoading(true);
    console.log("Handling auto query:", queryInfo);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      let prompt = queryInfo;
      if (typeof queryInfo === 'object') {
        if (queryInfo.type === 'post') {
          prompt = `You are DevBot - an AI assistant specialized in programming. 
          Please analyze and provide feedback on this post:
          
          **Title:** ${queryInfo.title}
          **Content:** ${queryInfo.content}
          **Tags:** ${queryInfo.tags?.join(', ') || 'None'}
          
          Please provide:
          1. Overall assessment of the content
          2. Strengths/highlights
          3. Improvement suggestions (if any)
          4. Additional questions or discussion points`;
        } else if (queryInfo.type === 'code') {
          prompt = `You are DevBot - an AI assistant specialized in programming.
          Please review this code:
          
          \`\`\`${queryInfo.language || 'javascript'}
          ${queryInfo.code}
          \`\`\`
          
          Please provide:
          1. Code assessment
          2. Potential issues (if any)
          3. Optimization suggestions
          4. Best practices`;
        } else {
          prompt = `You are DevBot - an AI assistant specialized in programming. ${queryInfo.query || queryInfo}`;
        }
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "Sorry, I couldn't analyze this request right now.";
      
      const botMessage = {
        id: Date.now(),
        text: botText,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = {
        id: Date.now(),
        text: "An error occurred while processing your request. Please try again later! 😅",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are DevBot - an AI assistant specialized in programming and software development. 
              You are friendly, helpful, and always try to provide accurate answers.
              Answer the following question in a concise and easy-to-understand way:
              
              ${message}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "Sorry, I can't answer this question right now.";

      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "An error occurred. Please try again later! 😔",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text) => (
    <ReactMarkdown
      components={{
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-blue-600 dark:text-blue-400" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-2 last:mb-0" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 my-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="mb-1" {...props} />
        ),
        code: ({ node, inline, ...props }) => (
          inline ? (
            <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props} />
          ) : (
            <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
          )
        ),
        pre: ({ node, ...props }) => (
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto my-2" {...props} />
        ),
        h1: ({ node, ...props }) => (
          <h1 className="text-lg font-bold mb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-md font-bold mb-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-sm font-bold mb-1" {...props} />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );

  const quickQuestions = [
    { icon: FaCode, text: "Explain", query: "Can you explain this code for me?" },
    { icon: FaLightbulb, text: "Improve", query: "Do you have any suggestions to improve my code?" },
    { icon: FaRobot, text: "Debug", query: "I'm encountering an error, can you help me debug it?" }
  ];

  const postQuickActions = currentPost ? [
    { 
      icon: FaFile, 
      text: "Summary", 
      query: `Please summarize the main problem or question presented in this post:

**Title:** ${currentPost.title}
**Content:** ${currentPost.content}

Focus on:
1. What is the core issue the author is facing?
2. What are they trying to achieve?
3. What specific help do they need?` 
    },
    { 
      icon: FaCog, 
      text: "Solutions", 
      query: `Based on this post, please provide practical solutions and recommendations:

**Title:** ${currentPost.title}
**Content:** ${currentPost.content}
**Tags:** ${currentPost.tags?.map(tag => typeof tag === 'string' ? tag : tag.name).join(', ') || 'None'}

Please provide:
1. Step-by-step solutions to address the problem
2. Code examples (if applicable)
3. Best practices and recommendations
4. Alternative approaches they could consider` 
    },
    { 
      icon: FaLightbulb, 
      text: "Optimize", 
      query: `Please analyze this post and provide optimization suggestions:

**Title:** ${currentPost.title}
**Content:** ${currentPost.content}

Focus on:
1. Performance improvements
2. Code quality enhancements
3. Better approaches or patterns
4. Tools and resources that could help` 
    }
  ] : [];

  const currentQuickQuestions = currentPost ? postQuickActions : quickQuestions;

  const handleQuickAction = async (actionQuery) => {
    setIsLoading(true);
    await handleAutoQuery(actionQuery);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isChatOpen ? (
        <div className="w-96 h-[600px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-slideUp">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <FaRobot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">DevBot AI</h3>
                <p className="text-xs opacity-90">Programming Assistant</p>
              </div>
            </div>
            <button 
              onClick={closeChat}
              className="text-white hover:text-gray-200 focus:outline-none transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          {/* Quick Questions */}
          {(messages.length === 1 || currentPost) && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {currentPost ? "Quick actions:" : "Quick questions:"}
              </p>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {currentQuickQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(q.query)}
                    disabled={isLoading}
                    className="flex items-center min-w-max px-2 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <q.icon className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs ml-1 font-medium">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {renderMarkdown(msg.text)}
                    </div>
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FaRobot className="h-4 w-4 text-blue-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
            <div className="flex">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask DevBot anything..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className={`px-4 rounded-r-lg transition-all flex items-center justify-center ${
                  isLoading || !message.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                <FaPaperPlane className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => openChat()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open DevBot AI Assistant"
        >
          <FaRobot className="h-6 w-6" />
          <span className="sr-only">DevBot AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
