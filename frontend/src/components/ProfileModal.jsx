import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose, completion }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex justify-end absolute top-6 right-6">
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <ShieldAlert className="w-10 h-10 text-amber-500" />
              </div>

              <h2 className="text-3xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                To access advanced features like AI Chat and Administration, please complete your profile to at least 60%.
              </p>

              <div className="py-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-zinc-500 uppercase tracking-widest">Current Progress</span>
                  <span className="text-[var(--accent-color)]">{Math.round(completion)}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    className="h-full bg-[var(--accent-color)]"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full bg-[var(--accent-color)] hover:opacity-90 text-[var(--bg-primary)] font-bold py-5 rounded-2xl transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 group"
                >
                  Go to Profile Settings
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onClose}
                  className="w-full text-zinc-500 hover:text-white font-semibold py-2 transition-colors text-sm"
                >
                  Continue Browsing Limited Version
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
