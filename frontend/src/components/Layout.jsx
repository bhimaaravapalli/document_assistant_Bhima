import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User,
  Shield,
  RefreshCw,
  Phone
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NavItem = ({ label, to, active }) => (
  <Link 
    to={to} 
    className={`relative px-4 py-2 text-sm font-black uppercase tracking-widest transition-all ${
      active ? 'text-[var(--accent-color)]' : 'text-zinc-500 hover:text-[var(--text-primary)]'
    }`}
  >
    {label}
    {active && (
      <motion.div 
        layoutId="nav-underline"
        className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--accent-color)] rounded-full"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Guest', avatar: null, role: 'User' });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (storedUser) {
      setUser({
        name: storedUser.name || 'Alex Chen',
        avatar: storedUser.avatar || null,
        role: storedProfile?.jobTitle || 'Compliance Lead'
      });
    }
  }, [location.pathname]);

  const handleFullRefresh = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-2xl sticky top-0 z-50 flex items-center justify-between px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-[var(--bg-primary)]" />
          </div>
          <span className="text-xl font-black tracking-tight hidden md:block">DocAssist <span className="text-[var(--accent-color)]">AI</span></span>
        </Link>

        {/* Centered Navigation */}
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <NavItem label="About" to="/about" active={location.pathname === '/about'} />
          <NavItem label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
          <NavItem label="Chat" to="/chat" active={location.pathname === '/chat'} />
          <NavItem label="History" to="/documents" active={location.pathname === '/documents'} />
          <NavItem label="Admin" to="/admin" active={location.pathname === '/admin'} />
          <NavItem label="Contact" to="/contact" active={location.pathname === '/contact'} />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-black/20 border border-[var(--border-color)] rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/30 transition-all w-40 focus:w-60"
            />
          </div>

          <button 
            onClick={handleFullRefresh}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-indigo-400 transition-colors"
            title="System Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <ThemeToggle />

          <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full border border-[var(--bg-primary)]"></span>
          </button>

          <div className="h-6 w-[1px] bg-[var(--border-color)] mx-1"></div>

            <Link to="/profile" className="flex items-center gap-3 pl-2 hover:bg-white/5 p-2 rounded-2xl transition-all group">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold group-hover:text-[var(--accent-color)] transition-colors">{user.name}</div>
                <div className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-widest">{user.role}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-800 rounded-xl border border-[var(--border-color)] flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-300" />
                )}
              </div>
            </Link>
          
          <Link to="/login" className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        <Outlet />
      </main>

      {/* Subtle Footer */}
      <footer className="py-8 border-t border-[var(--border-color)] bg-black/5">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-[var(--accent-color)]" />
            DocAssist AI © 2026
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
