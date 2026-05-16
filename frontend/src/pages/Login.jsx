import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (!localStorage.getItem('userProfile')) {
        localStorage.setItem('userProfile', JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          jobTitle: '',
          bio: '',
          phone: '',
          location: '',
          avatar: '',
        }));
      }
      toast.success('Welcome back to DocAssist!');
      navigate('/about');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 md:p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl h-[650px] bg-[var(--bg-secondary)] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[var(--border-color)]"
      >
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg shadow-black group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-[var(--bg-primary)]" />
              </div>
              <span className="text-2xl font-bold tracking-tight">DocAssist <span className="text-[var(--accent-color)]">AI</span></span>
            </Link>
            <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
            <p className="text-[var(--text-secondary)] font-medium">Sign in to continue your journey.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-secondary)] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-secondary)] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--accent-color)] text-[var(--bg-primary)] font-bold py-4 rounded-2xl transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-[var(--text-secondary)] mt-8 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300">
              Sign up
            </Link>
          </p>
        </div>

        <div className="hidden md:flex w-[400px] bg-gradient-to-br from-indigo-600 to-blue-700 p-12 flex-col justify-center items-center text-center text-white relative">
          <div className="absolute inset-0 bg-black/10 opacity-50" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-black">New Here?</h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Create an account and start chatting with your documents.
            </p>
            <Link
              to="/register"
              className="inline-block border-2 border-white/30 hover:border-white bg-white/10 hover:bg-white text-white hover:text-indigo-600 font-black px-10 py-4 rounded-2xl transition-all active:scale-95 mt-4"
            >
              Sign Up
            </Link>
          </div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-400/20 blur-3xl rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
