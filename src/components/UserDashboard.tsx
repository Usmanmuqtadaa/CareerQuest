import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { Briefcase, Calendar, ChevronRight, GraduationCap, ArrowRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, cn } from '../lib/utils';

export function UserDashboard() {
  const { profile, user } = useAuth();
  const [recentResponses, setRecentResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'quizResponses'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        setRecentResponses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'quizResponses');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Personnel: {profile?.displayName}</p>
        </div>
        <Link 
          to="/quiz"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
        >
          Begin New Assessment
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="col-span-1 bg-[#161B22] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Readiness Status</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {recentResponses.length > 0 ? 'Verified' : 'Deployment Pending'}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Next Recommended sync</p>
            <p className="text-xs text-indigo-400 mt-1">90 Earth Days</p>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="col-span-1 md:col-span-3 bg-[#161B22] border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-tighter">AI Alignment Synthesis</h3>
              <h2 className="text-lg font-bold text-white mt-1">Primary Interest Fields</h2>
            </div>
            <div className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          </div>

          {recentResponses[0] ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recentResponses[0].analysis.map((res: any, idx: number) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-xl group hover:border-indigo-500/30 transition-colors">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mb-2",
                    res.prospects.toLowerCase() === 'high' ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {res.prospects} Growth
                  </p>
                  <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{res.field}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <p className="text-slate-500 text-sm italic">Assessment required for profile completion</p>
            </div>
          )}
        </div>

        {/* Recent Activity Table (Large Card) */}
        <div className="col-span-1 md:col-span-4 bg-[#161B22] border border-slate-800 rounded-2xl flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-tighter flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Mission Logs & Archives
            </h3>
            <Link to="/results" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
              Full Inventory
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentResponses.map((res) => (
              <Link 
                key={res.id} 
                to={`/results/${res.id}`} 
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                    <Calendar className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100 uppercase tracking-tight">Orientation Assessment</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(res.timestamp?.toDate?.())}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex gap-1">
                      {res.analysis?.slice(0, 2).map((a: any, i: number) => (
                        <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                          {a.field}
                        </span>
                      ))}
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transform transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
            {recentResponses.length === 0 && !loading && (
              <div className="p-12 text-center">
                <p className="text-slate-500 text-sm italic">No records found in local database.</p>
              </div>
            )}
            {loading && (
              <div className="p-12 space-y-4">
                <div className="h-12 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse"></div>
                <div className="h-12 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
