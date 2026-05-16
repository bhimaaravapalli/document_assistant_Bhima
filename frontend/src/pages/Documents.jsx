import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Clock,
  MessageSquare,
  ChevronRight,
  Database,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';

const InteractionRow = ({ interaction }) => {
  const date = new Date(interaction.timestamp).toLocaleString();
  const sources = interaction.sources || [];
  
  return (
    <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] p-1.5 rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-zinc-200 truncate">{interaction.query}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-1.5 text-[var(--accent-color)]">
            <Database className="w-3 h-3" />
            {sources.length > 0 ? sources[0].filename : 'General Knowledge'}
          </div>
          <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {date}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Confidence: {interaction.confidence}%
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-[var(--accent-color)] transition-colors" />
      </div>
    </div>
  );
};

const DocumentRow = ({ doc }) => {
  const date = new Date(doc.uploaded_at).toLocaleDateString();
  const size = doc.metadata_json ? JSON.parse(doc.metadata_json).size : 0;
  const sizeStr = (size / 1024 / 1024).toFixed(2) + ' MB';

  return (
    <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          doc.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
          doc.status === 'processing' ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 'bg-rose-500/10 text-rose-400'
        }`}>
          <File className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-bold group-hover:text-[var(--accent-color)] transition-colors">{doc.filename}</div>
          <div className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-3 uppercase tracking-widest font-black">
            <span>{sizeStr}</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span>{doc.file_type?.toUpperCase()}</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      
      <div>
        {doc.status === 'completed' ? (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <CheckCircle className="w-3 h-3" /> Ready
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-pulse" /> Processing
          </div>
        )}
      </div>
    </div>
  );
};

const Documents = () => {
  const [activeTab, setActiveTab] = useState('files');
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [docsRes, histRes] = await Promise.all([
        api.get('/documents/'),
        api.get('/chat/history'),
      ]);
      setDocuments(docsRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const onDrop = useCallback(async acceptedFiles => {
    setIsUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await api.post('/documents/upload', formData);
        toast.success(`${file.name} uploaded!`);
      } catch (err) {
        const detail = err.response?.data?.detail || 'Upload failed';
        toast.error(`${file.name}: ${detail}`);
      }
    }
    setIsUploading(false);
    fetchData();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const filteredItems = activeTab === 'files' 
    ? documents.filter(d => d.filename.toLowerCase().includes(searchTerm.toLowerCase()))
    : history.filter(h => h.query.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <History className="w-4 h-4" />
            Audit Trail & Knowledge
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Knowledge <span className="text-[var(--accent-color)]">History</span></h1>
          <p className="text-zinc-500 font-medium">Review and manage your organization's document queries and data.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5">
          <button 
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'files' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Database className="w-4 h-4" /> Knowledge Center
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Clock className="w-4 h-4" /> Audit Log
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'files' ? (
          <motion.div 
            key="files"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-[32px] p-16 text-center transition-all cursor-pointer ${isDragActive ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <input {...getInputProps()} />
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 bg-[var(--accent-color)]/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                  {isUploading ? <div className="w-10 h-10 border-4 border-[var(--accent-color)]/30 border-t-[var(--accent-color)] rounded-full animate-spin" /> : <Upload className="w-10 h-10 text-[var(--accent-color)]" />}
                </div>
                <h3 className="text-2xl font-black tracking-tight">{isDragActive ? "Drop files here" : "Upload PDF Documents"}</h3>
                <p className="text-zinc-500 font-medium">Drag &amp; drop PDFs or click to browse. Max 25 MB per file.</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'files' ? 'documents' : 'interactions'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-[var(--accent-color)]/50 transition-all text-white placeholder:text-zinc-600"
            />
          </div>
        </div>
        
        <div className="min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                {activeTab === 'files' ? <DocumentRow doc={item} /> : <InteractionRow interaction={item} />}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="p-40 text-center space-y-4">
              <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No records found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
