'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Ensure this is installed: npm install react-markdown

// If you're using Tailwind's @tailwindcss/typography plugin, make sure it's configured in tailwind.config.js
// npm install -D @tailwindcss/typography

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    content: string;
    metadata: {
      page?: number;
      [key: string]: unknown;
    };
  }[];
}


interface ChatInterfaceProps {
  hasDocuments: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ hasDocuments }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Disable submission if no input or no documents
    if (!input.trim() || !hasDocuments) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input immediately
    setLoading(true);

    try {
      // Make sure the API URL is correctly set in .env.local
      // For Next.js, environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
      // For other React setups, ensure your build process handles process.env correctly.
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await axios.post(
        `${apiUrl}/api/query`,
        { query: userMessage.content }, // Send the user's actual query
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.answer,
          sources: response.data.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Handle cases where API returns success: false or an empty data object
        const errorMessage: Message = {
          role: 'assistant',
          content: response.data?.message || 'Sorry, I encountered an error while processing your query.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error: unknown) {
        console.error('Error querying documents:', error);

        let errorMessage = 'Sorry, there was an error communicating with the server. Please try again later.';

        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || errorMessage;
        }
      
        const assistantMessage: Message = {
          role: 'assistant',
          content: errorMessage,
        };
      
        setMessages((prev) => [...prev, assistantMessage]);
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-[#0000005e] rounded-lg border border-gray-800 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <p className="text-center">
              {hasDocuments
                ? 'Ask questions about your uploaded documents!'
                : 'Please upload a PDF document first to enable chat.'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  {/* FIX: Moved prose classes to a wrapper div around ReactMarkdown */}
                  <div className="flex-1 overflow-hidden">
                    <div className="prose prose-invert max-w-none"> {/* Apply prose here */}
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="text-xs bg-gray-700 p-2 rounded">
                              {/* Assuming source.metadata contains page info or similar for citation buttons */}
                              {source.content}
                              {source.metadata && source.metadata.page && (
                                <span className="ml-2 text-blue-300 font-medium cursor-pointer">
                                  (Page {source.metadata.page}) {/* Example of source display */}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-gray-800 text-gray-100">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasDocuments ? 'Ask a question...' : 'Upload a PDF first...'}
            disabled={!hasDocuments || loading}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            // Disable if no documents, loading, or input is empty after trimming
            disabled={!hasDocuments || loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;