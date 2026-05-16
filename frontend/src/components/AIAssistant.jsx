import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Shield,
  Minus,
} from 'lucide-react';
import api from '../lib/api';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "Hello! I'm DocAssist. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    const question = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chat/query', { query: question });
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to reach the server.';
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${detail}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="mb-6 w-[400px] bg-[var(--bg-primary)] border border-white/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="bg-[var(--accent-color)] p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-[var(--bg-primary)]/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Shield className="w-6 h-6 text-[var(--bg-primary)]" />
                </div>
                <div>
                  <h3 className="text-[var(--bg-primary)] font-black tracking-tight">DocAssist AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[var(--bg-primary)]/70 text-[10px] font-bold uppercase tracking-widest">Online - Always here to help</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
                  <Minus className="w-5 h-5 text-[var(--bg-primary)]/70" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-[var(--bg-primary)]" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="h-[450px] overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--bg-primary)]/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.role === 'ai' 
                      ? 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none' 
                      : 'bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 bg-[var(--bg-primary)] border-t border-white/5 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-color)] transition-all text-white placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 bg-[var(--accent-color)] hover:opacity-90 disabled:opacity-50 text-[var(--bg-primary)] rounded-xl flex items-center justify-center transition-all shadow-lg shadow-black/20 active:scale-90"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-rose-500 rotate-90 shadow-rose-500/25' : 'bg-[var(--accent-color)] shadow-black/40'
        }`}
      >
        {isOpen ? <X className="w-8 h-8 text-[var(--bg-primary)]" /> : <MessageCircle className="w-8 h-8 text-[var(--bg-primary)]" />}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
