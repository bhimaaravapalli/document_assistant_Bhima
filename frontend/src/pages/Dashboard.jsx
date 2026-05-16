import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[24px] hover:bg-white/[0.07] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--accent-color)]" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold mb-1 tracking-tight">{value}</div>
    <div className="text-sm text-zinc-500 font-medium tracking-wide">{label}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_documents: 0,
    total_queries: 0,
    active_users: 0,
    compliance_score: 98,
    recent_activity: []
  });
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = (storedUser.name || 'there').split(' ')[0];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {firstName}</h1>
          <p className="text-zinc-500 font-medium">Here's what's happening with your company's intelligence today.</p>
        </div>
        <button className="bg-[var(--accent-color)] hover:opacity-90 text-[var(--bg-primary)] px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-black/20 flex items-center gap-2 group">
          New Analysis
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Total Documents" value={stats.total_documents.toLocaleString()} trend="+12%" />
        <StatCard icon={MessageSquare} label="AI Queries" value={stats.total_queries.toLocaleString()} trend="+24%" />
        <StatCard icon={Users} label="Active Users" value={stats.active_users.toLocaleString()} trend="+5%" />
        <StatCard icon={ShieldCheck} label="Compliance Score" value={`${stats.compliance_score}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold">Recent Intelligence Activity</h3>
            <button className="text-sm text-[var(--accent-color)] font-bold hover:opacity-80">View All</button>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'query' ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 
                      activity.type === 'upload' ? 'bg-zinc-500/10 text-zinc-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {activity.type === 'query' ? <MessageSquare className="w-5 h-5" /> : 
                       activity.type === 'upload' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold group-hover:text-[var(--accent-color)] transition-colors">{activity.user} <span className="text-zinc-500 font-medium">interacted with</span> {activity.target}</div>
                      <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2 uppercase tracking-widest font-bold">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-zinc-400 border border-white/5">
                    {activity.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Charts Placeholder */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-[var(--accent-color)]">Usage Analysis</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">System performance is optimal. AI accuracy is up 4% compared to last week.</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                <span>Vector Capacity</span>
                <span className="text-white">68%</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  className="h-full bg-[var(--accent-color)]"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                <span>Processing Speed</span>
                <span className="text-white">12.4ms avg</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92%' }}
                  className="h-full bg-zinc-600"
                />
              </div>
            </div>
          </div>

          <button className="w-full bg-[var(--accent-color)] text-[var(--bg-primary)] font-bold py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
            View Analytics
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
