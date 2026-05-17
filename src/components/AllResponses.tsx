import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { formatDate } from '../lib/utils';
import { FileText, User as UserIcon, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AllResponses() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResponses() {
      try {
        const q = query(collection(db, 'quizResponses'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        setResponses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'all_responses');
      } finally {
        setLoading(false);
      }
    }
    fetchResponses();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight uppercase italic">Personnel Assessments</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 italic">Cross-User Interest Synthesis</p>
      </header>

      <div className="bg-[#161B22] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Mobile List View */}
        <div className="block sm:hidden divide-y divide-slate-800">
          {responses.map((res) => (
            <Link 
              key={res.id} 
              to={`/results/${res.id}`} 
              className="p-4 flex flex-col gap-3 hover:bg-slate-800/20 active:bg-slate-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-100 text-sm tracking-tight">{res.userName}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{res.userEmail}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-700" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {res.analysis?.slice(0, 3).map((item: any, idx: number) => (
                  <span key={idx} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                    {item.field}
                  </span>
                ))}
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                {res.timestamp ? formatDate(res.timestamp?.toDate?.()) : 'Pending'}
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Sectors Implicated</th>
                <th className="px-6 py-4">Sync Date</th>
                <th className="px-6 py-4 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {responses.map((res) => (
                <tr key={res.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-xs text-slate-100">{res.userName}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{res.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {res.analysis?.slice(0, 2).map((item: any, idx: number) => (
                        <span key={idx} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight">
                          {item.field}
                        </span>
                      ))}
                      {res.analysis?.length > 2 && <span className="text-[9px] text-slate-600 font-bold">+{res.analysis.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-mono text-slate-500">
                    {res.timestamp ? formatDate(res.timestamp?.toDate?.()) : 'Pending'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/results/${res.id}`} className="p-2 inline-block text-slate-600 hover:text-indigo-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {responses.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-600 text-xs font-mono italic">NO RECORDS DETECTED IN SECTOR LOGS</div>
        )}
      </div>
    </div>
  );
}
