import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Lock, Search, Cpu } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-6 group">
    <div className="w-14 h-14 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-color)]/20 transition-all">
      <Icon className="w-7 h-7 text-[var(--accent-color)]" />
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-color)] transition-colors">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{desc}</p>
    </div>
  </div>
);

const About = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-xs font-black tracking-widest uppercase mb-6 inline-block">
            About Our Project
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Empowering Organizations with <span className="text-[var(--accent-color)]">Secure Intelligence</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            DocAssist is an enterprise-grade RAG (Retrieval Augmented Generation) platform designed to bridge the gap between static internal documentation and dynamic, actionable intelligence.
          </p>
        </motion.div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">The Problem We Solve</h2>
            <p className="text-zinc-500 leading-relaxed">
              In most organizations, critical knowledge is trapped in thousands of PDFs, DOCX files, and spreadsheets. Finding the right answer to a compliance question or policy detail often takes hours of manual searching.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <FeatureItem 
              icon={Brain}
              title="Semantic Understanding"
              desc="We use advanced LLMs to understand the context of your query, not just keywords, ensuring you get the right answer every time."
            />
            <FeatureItem 
              icon={Lock}
              title="Privacy-First Indexing"
              desc="Your data never leaves your secure environment. We implement department-level access controls to ensure sensitive info stays private."
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-[var(--accent-color)]/10 blur-[80px] rounded-full" />
          <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[40px] p-10 shadow-2xl backdrop-blur-xl">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                <Cpu className="w-8 h-8 text-[var(--bg-primary)]" />
              </div>
              <h3 className="text-2xl font-bold">How It Works</h3>
              <ul className="space-y-4">
                {[
                  "Securely ingest documents across various formats.",
                  "Chunk and vectorize text using high-precision embeddings.",
                  "Store vectors in a dedicated high-performance database.",
                  "Retrieve relevant context in sub-milliseconds.",
                  "Generate accurate, cited responses for your team."
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-500">
                    <span className="text-[var(--accent-color)] font-black">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/[0.08] transition-all">
          <div className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-[var(--accent-color)]" />
          </div>
          <h4 className="text-xl font-bold mb-3">Instant Answers</h4>
          <p className="text-zinc-500 text-sm leading-relaxed">Sub-second response times for complex organizational queries.</p>
        </div>
        
        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/[0.08] transition-all">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold mb-3">Full Transparency</h4>
          <p className="text-slate-500 text-sm leading-relaxed">Every answer includes direct citations and page links to the source docs.</p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/[0.08] transition-all">
          <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center mb-6">
            <Search className="w-6 h-6 text-zinc-400" />
          </div>
          <h4 className="text-xl font-bold mb-3">Hybrid Retrieval</h4>
          <p className="text-zinc-500 text-sm leading-relaxed">Combines vector search with traditional keyword matching for precision.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
