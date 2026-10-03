import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader } from 'lucide-react';
import { sendMessageToOllama } from '../services/ollamaService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Ayurvedic assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToOllama(input);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to Ollama:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 hover:from-ayurvedic-600 hover:to-ayurvedic-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
        aria-label="Toggle chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-ayurvedic-200 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-semibold">Ayurvedic Assistant</h3>
            <button 
              onClick={toggleChat}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-2xl max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white' 
                      : 'bg-gradient-to-r from-ayurvedic-50 to-ayurvedic-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-2xl bg-gradient-to-r from-ayurvedic-50 to-ayurvedic-100 text-gray-800">
                  <Loader className="animate-spin" size={16} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-ayurvedic-200 bg-white/50">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border-2 border-ayurvedic-200 rounded-l-xl focus:ring-2 focus:ring-ayurvedic-500/20 focus:border-ayurvedic-500 outline-none transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 hover:from-ayurvedic-600 hover:to-ayurvedic-700 text-white px-4 py-2 rounded-r-xl disabled:opacity-50"
                disabled={isLoading || input.trim() === ''}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;