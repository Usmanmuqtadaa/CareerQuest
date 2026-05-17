import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Search,
  LayoutGrid,
  History,
  Settings,
  Bell,
  Cpu,
  Database
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AllResponses } from './AllResponses';
import { ActivityLogs } from './ActivityLogs';

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, responses: 0, logs: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'logs'>('overview');

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersSnap, responsesSnap, logsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'quizResponses')),
          getDocs(collection(db, 'logs'))
        ]);
        
        setStats({
          users: usersSnap.size,
          responses: responsesSnap.size,
          logs: logsSnap.size
        });

        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(15));
        const recentUsersSnap = await getDocs(usersQuery);
        setRecentUsers(recentUsersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'admin_stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Entities', value: stats.users, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'Neural Links', value: stats.responses, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Subsystem Logs', value: stats.logs, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { name: 'Sync Accuracy', value: '99.8%', icon: cpuIcon(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  function cpuIcon() { return Cpu; };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-2 border-b border-slate-800/50">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tighter uppercase italic">Architect Domain</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-mono">System Integrity: Nominal // Buffer: Protected</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === 'overview' ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Overview
          </button>
          <button 
             onClick={() => setActiveTab('responses')}
             className={cn(
               "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               activeTab === 'responses' ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20" : "text-slate-500 hover:text-slate-300"
             )}
          >
            Personnel
          </button>
          <button 
             onClick={() => setActiveTab('logs')}
             className={cn(
               "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               activeTab === 'logs' ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20" : "text-slate-500 hover:text-slate-300"
             )}
          >
            Audit
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <div
                  key={stat.name}
                  className="bg-[#161B22] border border-slate-800 p-4 sm:p-6 rounded-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-5">
                    <stat.icon className="w-16 h-16" />
                  </div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-slate-800", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personnel Table */}
              <div className="lg:col-span-2 bg-[#161B22] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-tighter">Authorized Personnel Registry</h3>
                  </div>
                  <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-6 py-4">Linked Identity</th>
                        <th className="px-6 py-4">Auth Level</th>
                        <th className="px-6 py-4 text-right">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-indigo-500/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img src={u.photoURL} className="w-8 h-8 rounded-lg border border-slate-700 shadow-lg group-hover:border-indigo-500/50 transition-colors" alt="" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#161B22] rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-100 group-hover:text-white">{u.displayName}</p>
                                <p className="text-[10px] text-slate-500 font-mono tracking-tight">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-tight",
                              u.role === 'admin' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            )}>
                              {u.role === 'admin' ? 'Architect' : 'Candidate'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-mono text-slate-400 text-right group-hover:text-slate-100 transition-colors">
                            {u.lastLogin ? formatDate(u.lastLogin?.toDate?.()) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions / System Status */}
              <div className="space-y-6">
                <div className="bg-rose-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-40 h-40" />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] font-bold uppercase">
                        Active
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic">Threat Vector: ZERO</h3>
                      <p className="text-xs text-rose-100/70 mt-2 font-medium">Quantum-encrypted personnel data streams are secure and isolated.</p>
                    </div>
                    <div className="space-y-3">
                      <button className="w-full py-3 bg-black/20 hover:bg-black/30 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all backdrop-blur-sm">
                        Purge Session Cache
                      </button>
                      <button className="w-full py-3 bg-white text-rose-600 hover:bg-white/90 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all font-black">
                        System Wide Alert
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#161B22] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-3 h-3 text-indigo-400" /> Subsystem Configuration
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Neural Matching', status: 'Enabled', color: 'text-emerald-400' },
                      { label: 'Auto-Sync', status: 'Active', color: 'text-emerald-400' },
                      { label: 'Edge Detection', status: 'Optimal', color: 'text-emerald-400' },
                      { label: 'Audit Trail', status: 'Immutable', color: 'text-rose-400' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{item.label}</span>
                        <span className={cn("text-[9px] font-black uppercase tracking-tighter font-mono", item.color)}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'responses' && (
          <motion.div
            key="responses"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AllResponses />
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ActivityLogs />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
