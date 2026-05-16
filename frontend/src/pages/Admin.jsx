import { useState, useEffect } from 'react';
import ProfileModal from '../components/ProfileModal';

const Admin = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const fields = ['bio', 'jobTitle', 'department', 'avatar', 'phone'];
    const filledFields = fields.filter(key => profile[key] && profile[key].trim() !== '').length;
    const percentage = (filledFields / fields.length) * 100;
    setCompletion(percentage);
    
    if (percentage < 60) {
      setShowProfileModal(true);
    }
  }, []);

  return (
    <div className="space-y-8">
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        completion={completion}
      />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Admin Control Center</h1>
        <p className="text-slate-400 font-medium">Manage organizations, departments, and system security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <h3 className="text-xl font-bold mb-6">Organization Settings</h3>
          <div className="space-y-4">
            <div className="p-4 bg-black/20 border border-white/5 rounded-2xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Company Name</div>
              <div className="font-bold">Acme Corp Global</div>
            </div>
            <div className="p-4 bg-black/20 border border-white/5 rounded-2xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Domain</div>
              <div className="font-bold">acme-corp.com</div>
            </div>
            <div className="p-4 bg-black/20 border border-white/5 rounded-2xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Departments</div>
              <div className="flex gap-2 mt-2">
                {['HR', 'Engineering', 'Legal', 'Finance'].map(dept => (
                  <span key={dept} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-wider">{dept}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <h3 className="text-xl font-bold mb-6">Security & Compliance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div>
                <div className="font-bold text-emerald-400">SOC 2 Compliance</div>
                <div className="text-xs text-emerald-400/60 mt-1">Status: Active & Audited</div>
              </div>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xs">OK</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
              <div>
                <div className="font-bold text-indigo-400">Vector Encryption</div>
                <div className="text-xs text-indigo-400/60 mt-1">Algorithm: AES-256-GCM</div>
              </div>
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xs">EN</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
