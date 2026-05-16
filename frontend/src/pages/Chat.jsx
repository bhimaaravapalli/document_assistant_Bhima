import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  User,
  Shield,
  Plus,
  FileText,
  X,
  Sparkles,
  Mic,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import ProfileModal from '../components/ProfileModal';

const ChatMessage = ({ msg }) => {
  const isAI = msg.role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
        isAI ? 'bg-[var(--accent-color)] shadow-black/20' : 'bg-zinc-800 shadow-black/50'
      }`}>
        {isAI ? <Shield className="w-5 h-5 text-[var(--bg-primary)]" /> : <User className="w-5 h-5 text-white" />}
      </div>

      <div className={`max-w-[80%] space-y-3 ${!isAI && 'flex flex-col items-end'}`}>
        {!isAI && msg.attachment && (
          <div className="inline-flex items-center gap-2.5 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 px-3 py-2 rounded-2xl max-w-full">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[var(--accent-color)]" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-bold text-[var(--accent-color)] truncate max-w-[260px]">
                {msg.attachment.filename}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]/80">
                PDF · {msg.attachment.pageCount ?? '—'} pages · {msg.attachment.chunkCount ?? '—'} chunks
              </div>
            </div>
          </div>
        )}

        {msg.content && (
          <div className={`
            p-5 rounded-[24px] text-sm leading-relaxed shadow-sm whitespace-pre-wrap
            ${isAI ? 'bg-zinc-900 border border-white/5 rounded-tl-none text-zinc-300' : 'bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-tr-none'}
          `}>
            {msg.content}
          </div>
        )}

        {isAI && msg.sources && msg.sources.length > 0 && (
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
              <Sparkles className="w-3 h-3 text-[var(--accent-color)]" />
              Sources ({msg.sources.length})
            </div>
            <div className="flex flex-col gap-2">
              {msg.sources.map((source, i) => (
                <div
                  key={`${source.filename}-${source.page ?? 'na'}-${i}`}
                  className="bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-color)]/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[var(--accent-color)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Source {i + 1}
                    </div>
                    <div className="text-sm font-bold text-[var(--accent-color)] truncate">
                      {source.filename}
                    </div>
                  </div>
                  {source.page != null && (
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 px-2.5 py-1 rounded-full">
                      Page {source.page}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "Hello! I'm DocAssist. Upload a document or ask me anything about your organization's policies.",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [completion, setCompletion] = useState(0);
  
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Speech Recognition Setup
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied.");
      } else {
        toast.error("Speech recognition failed.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const fields = ['bio', 'jobTitle', 'department', 'avatar', 'phone'];
    const filledFields = fields.filter(key => profile[key] && profile[key].trim() !== '').length;
    const percentage = (filledFields / fields.length) * 100;
    setCompletion(percentage);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isIndexing]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error("File size exceeds 25MB limit.");
        return;
      }
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error("Only PDF files are supported.");
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const uploadAndProcess = async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setIsIndexing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/documents/upload', formData);
      setSelectedFile(null);
      toast.success(`${res.data.filename} added to History.`);
      return res.data;
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to upload document.';
      toast.error(detail);
      return null;
    } finally {
      setIsUploading(false);
      setIsIndexing(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    let currentInput = input;
    let fileMeta = null;

    if (selectedFile) {
      fileMeta = await uploadAndProcess();
      if (!fileMeta) return;
      currentInput = input || `I just uploaded ${fileMeta.filename}. Can you summarize it?`;
    }

    const userMsg = {
      role: 'user',
      content: currentInput,
      attachment: fileMeta
        ? {
            filename: fileMeta.filename,
            pageCount: fileMeta.page_count,
            chunkCount: fileMeta.chunk_count,
          }
        : null,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/chat/query', { query: currentInput });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: response.data.answer,
        sources: response.data.sources,
      }]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error';
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Error: ${errorMsg}`,
        sources: [],
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col relative">
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        completion={completion}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-color)]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} />
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center animate-pulse">
              <Shield className="w-5 h-5 text-[var(--bg-primary)]" />
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-[24px] rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {isIndexing && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--bg-primary)] animate-spin" />
            </div>
            <div className="bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 p-4 rounded-[24px] rounded-tl-none">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--accent-color)]">DocAssist is Indexing your document...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="pt-6 border-t border-white/5 bg-[var(--bg-primary)]/50 backdrop-blur-xl">
        {selectedFile && (
          <div className="max-w-4xl mx-auto mb-4 flex items-center gap-3 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 p-3 rounded-2xl">
            <FileText className="w-5 h-5 text-[var(--accent-color)]" />
            <span className="text-sm font-bold text-[var(--accent-color)] flex-1 truncate">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".pdf"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-[var(--accent-color)] transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFile ? "Add a message or press enter to process..." : "Ask a question about company policies..."}
            className="w-full bg-white/5 border border-white/10 rounded-[28px] py-5 pl-14 pr-32 text-lg focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-8 focus:ring-[var(--accent-color)]/5 transition-all placeholder:text-zinc-600"
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              type="button"
              onClick={toggleListening}
              className={`p-2 transition-all rounded-full ${
                isListening 
                  ? 'text-rose-500 bg-rose-500/10 animate-pulse' 
                  : 'text-zinc-400 hover:text-[var(--accent-color)] hover:bg-white/5'
              }`}
              title={isListening ? "Listening..." : "Voice Input"}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'scale-110' : ''}`} />
            </button>
            <button 
              type="submit"
              disabled={( !input.trim() && !selectedFile ) || isTyping || isUploading}
              className="bg-[var(--accent-color)] hover:opacity-90 disabled:opacity-50 text-[var(--bg-primary)] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/20 active:scale-90"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
        <div className="text-center py-4 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
          Accurate RAG Analysis Powered by DocAssist Core.
        </div>
      </div>
    </div>
  );
};

export default Chat;
