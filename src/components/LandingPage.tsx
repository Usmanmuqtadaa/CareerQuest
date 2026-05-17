import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, GraduationCap, ShieldCheck, TrendingUp, User, ShieldAlert, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function LandingPage() {
  const { login, user, profile, selectedRole, verifyAdminKey, selectRole } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAdminAuth = () => {
    if (verifyAdminKey(password)) {
      selectRole('admin');
      navigate('/admin');
    } else {
      setError('INVALID CLEARANCE KEY');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUserAuth = () => {
    selectRole('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-6 text-slate-300 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-3xl text-center space-y-10 relative z-10"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-900/50">
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Neural Career Engine</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white leading-[1.1]">
                Map Your <span className="text-indigo-500">Future</span> With Precision AI
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto font-medium">
                Analyze your cognitive interests and align them with the highest-growth employment sectors for 2026 and beyond.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="p-6 bg-[#161B22] rounded-2xl border border-slate-800 flex items-start gap-4 group hover:border-indigo-500/30 transition-colors">
                <div className="mt-1 p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-tight">Enterprise Security</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">AES-256 encrypted data storage with strict RBAC policy enforcement.</p>
                </div>
              </div>
              <div className="p-6 bg-[#161B22] rounded-2xl border border-slate-800 flex items-start gap-4 group hover:border-emerald-500/30 transition-colors">
                <div className="mt-1 p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-tight">Market Analytics</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Proprietary AI matching engine synced with global employment indexes.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={login}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-extrabold text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                Authenticate with Google
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 relative z-10"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-white uppercase italic tracking-tight">Identity Confirmed</h2>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{user.email}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleUserAuth}
                className="w-full group p-6 bg-[#161B22] border border-slate-800 rounded-2xl flex items-center gap-5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left relative overflow-hidden"
              >
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white uppercase italic">Candidate Portal</h3>
                  <p className="text-xs text-slate-500">Access personal career analysis arrays.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
              </button>

              {profile?.role === 'admin' && (
                <div className="space-y-4">
                  {!showPassword ? (
                    <button
                      onClick={() => setShowPassword(true)}
                      className="w-full group p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-5 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all text-left"
                    >
                      <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white uppercase italic text-rose-100">Architect Domain</h3>
                        <p className="text-xs text-slate-500">Encrypted system command center.</p>
                      </div>
                      <Lock className="w-5 h-5 text-slate-700 group-hover:text-rose-400 transition-colors" />
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="p-6 bg-slate-900 border border-rose-500/30 rounded-2xl space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Master Clearance Key</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoFocus
                          className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-800"
                        />
                      </div>
                      {error && (
                        <p className="text-[10px] font-bold text-rose-500 animate-pulse">{error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPassword(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAdminAuth}
                          className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 active:scale-95"
                        >
                          Unlock Terminal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-8 text-[10px] text-slate-600 font-mono tracking-[0.2em] uppercase text-center w-full px-6">
        System Protected by AuraGuard Security V.2.4 — Cluster: AI-PRIMARY-01
      </footer>
    </div>
  );
}
