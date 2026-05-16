import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, FileText, ArrowRight, Lock, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden selection:bg-indigo-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg shadow-black group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-[var(--bg-primary)]" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">DocAssist</span>
          </Link>

          {/* Centered Links */}
          <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2 text-sm font-black uppercase tracking-widest text-zinc-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold hover:text-[var(--accent-color)] transition-colors">Login</Link>
            <Link to="/register" className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-6 py-2.5 rounded-full text-sm font-black hover:opacity-90 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent-color)]/5 blur-[120px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-[10px] font-black tracking-widest uppercase mb-4">
              <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
              The Future of Document Intelligence
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl mx-auto">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] via-white to-[var(--accent-color)]">Knowledge Base</span>
            </h1>

            <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              Experience the power of DocAssist. Securely index, search, and chat with your organization's policies using state-of-the-art RAG technology.
            </p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
            >
              <Link to="/chat" className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-10 py-5 rounded-2xl font-black text-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-black/40 active:scale-95">
                Start Secure Chat
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-[var(--bg-primary)]" />
              </Link>
              <button 
                onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-zinc-900 border border-zinc-800 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all"
              >
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Trusted By / Stats */}
          <div className="mt-32 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Security', value: 'SOC 2 Ready' },
              { label: 'Documents', value: '1M+' },
              { label: 'Accuracy', value: '98.5%' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-600 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
            {[
              { 
                icon: Lock, 
                title: "Zero-Trust Architecture", 
                desc: "Enterprise-grade encryption and department-level access controls for your most sensitive data." 
              },
              { 
                icon: Zap, 
                title: "Instant Retrieval", 
                desc: "Sub-second semantic search across millions of document chunks using high-performance pgvector." 
              },
              { 
                icon: FileText, 
                title: "Explainable AI", 
                desc: "Every response includes precise citations, page numbers, and relevance scores for total trust." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="p-10 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/[0.08] hover:border-[var(--accent-color)]/30 transition-all group"
              >
                <div className="w-14 h-14 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[var(--accent-color)]/20 transition-all">
                  <feature.icon className="w-7 h-7 text-[var(--accent-color)]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Demo Section */}
          <div id="demo-section" className="mt-40 pt-20 border-t border-white/5 scroll-mt-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">How it Works</h2>
            <div className="bg-zinc-900/30 border border-white/10 rounded-[40px] p-8 md:p-16 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 text-left">
                  {[
                    { step: "01", title: "Upload Documents", desc: "Drag and drop your PDF policies into the secure portal." },
                    { step: "02", title: "AI Indexing", desc: "Our RAG engine processes and indexes your data semantically." },
                    { step: "03", title: "Chat & Discover", desc: "Ask questions and get cited answers instantly." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="text-4xl font-black text-[var(--accent-color)]/30">{item.step}</div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold">{item.title}</h4>
                        <p className="text-zinc-500 text-lg">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative aspect-video bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-color)]/10 to-transparent" />
                  <div className="w-20 h-20 bg-[var(--accent-color)] rounded-full flex items-center justify-center shadow-2xl shadow-black/40 group-hover:scale-110 transition-transform cursor-pointer">
                    <Zap className="w-10 h-10 text-[var(--bg-primary)] fill-[var(--bg-primary)]" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[var(--accent-color)]" 
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[var(--accent-color)]" />
            <span className="font-bold uppercase italic tracking-tighter">DocAssist</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <div className="text-slate-600 text-sm italic">
            Built for Secure Enterprise Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
