import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, Building, Info, Camera, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: JSON.parse(localStorage.getItem('user'))?.name || '',
    bio: '',
    jobTitle: '',
    department: '',
    avatar: '',
    phone: ''
  });
  const [completion, setCompletion] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let score = 0;
    if (profile.name) score += 10;
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (user.email) score += 10;
    if (profile.jobTitle) score += 15;
    if (profile.bio && profile.bio !== 'Passionate about building impactful products...') score += 25;
    if (profile.phone) score += 15;
    if (profile.avatar) score += 25;
    setCompletion(score);
  }, [profile]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (completion < 60) {
      toast.error('Please complete at least 60% of your profile to continue.');
      return;
    }
    
    // Save to localStorage for demo purposes
    localStorage.setItem('userProfile', JSON.stringify(profile));
    // Update the main user object too
    const user = JSON.parse(localStorage.getItem('user')) || {};
    localStorage.setItem('user', JSON.stringify({ ...user, name: profile.name, avatar: profile.avatar }));
    localStorage.setItem('profileComplete', 'true');
    
    toast.success('Profile updated successfully!');
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 md:p-12 relative overflow-hidden flex items-center justify-center transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--accent-color)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-zinc-600/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[40px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Complete Your Profile</h1>
              <p className="text-[var(--text-secondary)]">Tell us a bit more about yourself to access the platform.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-bold text-[var(--accent-color)] uppercase tracking-widest">Completion</span>
              <div className="w-32 h-3 bg-[var(--bg-accent)] rounded-full overflow-hidden border border-[var(--border-color)]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  className={`h-full ${completion >= 60 ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'} transition-all`}
                />
              </div>
              <span className="text-xl font-black">{Math.round(completion)}%</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center mb-8">
              <label className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <div className="w-28 h-28 bg-[var(--accent-color)]/10 rounded-3xl border-2 border-dashed border-[var(--accent-color)]/30 flex items-center justify-center group-hover:border-[var(--accent-color)] transition-all overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-[var(--accent-color)]" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-[var(--bg-primary)]" />
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input 
                  type="text" 
                  name="name"
                  required
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                  placeholder="Alex Chen"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                  <input 
                    type="text" 
                    name="jobTitle"
                    value={profile.jobTitle}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                    placeholder="Senior Analyst"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Department</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                  <input 
                    type="text" 
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                    placeholder="Legal & Compliance"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Short Bio</label>
              <div className="relative">
                <Info className="absolute left-4 top-4 w-5 h-5 text-[var(--text-secondary)]" />
                <textarea 
                  name="bio"
                  rows="4"
                  value={profile.bio}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all resize-none text-[var(--text-primary)]"
                  placeholder="Tell us about your role and expertise..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Phone Number</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input 
                  type="tel" 
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent-color)] transition-all text-[var(--text-primary)]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                  completion >= 60 
                    ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] hover:opacity-90 shadow-black/25' 
                    : 'bg-[var(--bg-accent)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-color)]'
                }`}
              >
                {completion >= 60 ? 'Access Dashboard' : 'Complete 60% to Continue'}
                <ArrowRight className="w-5 h-5" />
              </button>
              {completion < 60 && (
                <p className="text-center text-[var(--text-secondary)] text-sm mt-4 italic">
                  Tip: Fill in more fields to unlock the full platform.
                </p>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
