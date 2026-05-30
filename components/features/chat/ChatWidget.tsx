'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget({ tripId }: { tripId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const token = localStorage.getItem('wandr_token');
    if (!token) return;

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    // Use the same base URL logic as the rest of the app
    const apiBase = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

    try {
      const response = await fetch(`${apiBase}/api/chat/${tripId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      // Check if response is SSE stream or plain JSON
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        // SSE streaming path
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedContent = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'delta') {
                    receivedContent = true;
                    setMessages((prev) => 
                      prev.map(m => m.id === assistantMsgId ? { ...m, content: m.content + data.text } : m)
                    );
                  } else if (data.type === 'done' || data.type === 'error') {
                    if (data.type === 'error' && !receivedContent) {
                      setMessages((prev) =>
                        prev.map(m => m.id === assistantMsgId ? { ...m, content: data.text || 'Sorry, something went wrong.' } : m)
                      );
                    }
                    setIsTyping(false);
                  }
                } catch (e) {
                  // Ignore parse errors on incomplete chunks
                }
              }
            }
          }
        } finally {
          setIsTyping(false);
        }
      } else {
        // Non-streaming JSON fallback (e.g. if Vercel buffers the SSE response)
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || data.reply || data.text || 'Sorry, I could not generate a response.';
        setMessages((prev) =>
          prev.map(m => m.id === assistantMsgId ? { ...m, content: reply } : m)
        );
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Show a user-friendly error in the chat bubble
      setMessages((prev) =>
        prev.map(m => m.id === assistantMsgId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m)
      );
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "What should I pack?",
    "Safety tips?",
    "Best local food?",
    "Hidden gems?"
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        } bg-gradient-to-r from-primary to-violet text-void`}
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-full max-w-[360px] h-[500px] max-h-[80vh] bg-card/95 backdrop-blur-xl border border-subtle rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-subtle bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-bold text-bright font-display">Wandr Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-bright transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.length === 0 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-muted mb-4">I'm your AI travel assistant. Ask me anything about your trip!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 text-xs bg-subtle/50 hover:bg-subtle text-bright rounded-full transition-colors border border-subtle"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Sparkles size={12} />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-primary to-violet text-void rounded-br-sm' 
                        : 'bg-subtle/50 text-bright rounded-bl-sm border border-subtle/50'
                    }`}
                  >
                    {msg.content || (msg.role === 'assistant' && isTyping ? <span className="animate-pulse">...</span> : '')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-subtle bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-void border border-subtle rounded-full px-4 py-2 text-sm text-bright placeholder:text-dim focus:outline-none focus:border-primary/50"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-void shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
