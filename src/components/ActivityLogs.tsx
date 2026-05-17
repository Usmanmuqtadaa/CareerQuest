import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDate } from '../lib/utils';
import { Shield, Clock, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(50));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'REGISTER': return <Info className="w-4 h-4 text-blue-500" />;
      case 'LOGIN': return <Clock className="w-4 h-4 text-emerald-500" />;
      case 'LOGOUT': return <Clock className="w-4 h-4 text-slate-400" />;
      default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight uppercase italic">Security & Activity Logs</h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest italic">Encrypted Audit trail of significant interactions.</p>
      </div>
  
      <div className="bg-[#161B22] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            <Shield className="w-3 h-3 text-indigo-400" />
            System Audit Trail: Operational
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors flex items-start gap-4">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mt-1 flex-shrink-0 animate-pulse">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-100 text-sm uppercase tracking-tight">{log.action}</span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {log.timestamp ? formatDate(log.timestamp?.toDate?.()) : 'Pending...'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{log.details}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter self-center">Identity:</span>
                  <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded truncate max-w-[150px]">{log.userEmail}</span>
                  <span className="text-[9px] text-slate-700 font-mono hidden sm:inline">{log.userId}</span>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-600 text-[10px] font-mono italic uppercase tracking-widest">No spectral trace logs identified.</div>
          )}
        </div>
      </div>
    </div>
  );
}
