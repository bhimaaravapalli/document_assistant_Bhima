import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Globe,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // --- REAL EMAIL NOTIFICATION (Using FormSubmit.co) ---
      const res = await fetch("https://formsubmit.co/ajax/majeti.srujana99@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `Resurgence: New Message from ${formData.name}`
        })
      });

      if (res.ok) {
        toast.success('Message sent! Check your email to activate.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send message. Try again.');
      }
    } catch (err) {
      toast.error('Could not connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight mb-4">Get In Touch</h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Have questions about DocAssist AI? Our team is here to help you secure and optimize your organizational knowledge.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[40px] p-8 md:p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[var(--accent-color)]" />
            </div>
            <h2 className="text-2xl font-bold">Send a Message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-secondary)] ml-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-secondary)] ml-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-secondary)] ml-1">Your Message</label>
              <textarea 
                name="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)] resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--accent-color)] hover:opacity-90 disabled:opacity-50 text-[var(--bg-primary)] font-bold py-5 rounded-2xl transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[40px] p-8 md:p-10 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-8">Contact Info</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Email Us</div>
                  <div className="text-lg font-bold text-wrap break-all">bhimaaravapalli@gmail.com</div>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Call Us</div>
                  <div className="text-lg font-bold">7742535080</div>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Headquarters</div>
                  <div className="text-lg font-bold">Worcester, MA, USA</div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-10 relative group cursor-pointer overflow-hidden rounded-[24px] border border-[var(--border-color)]">
              <div className="absolute inset-0 bg-[var(--accent-color)]/10 group-hover:bg-[var(--accent-color)]/20 transition-colors z-10" />
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                alt="Map"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Globe className="w-4 h-4" />
                  View Rajamahendravaram Location
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8">
            <h3 className="font-bold text-lg mb-2 text-[var(--accent-color)]">Technical Support</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Need immediate help with RAG indexing or API integration? Our engineers are available 24/7 for Enterprise customers.
            </p>
            <div className="flex gap-4">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">Documentation</span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">Status: Operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
