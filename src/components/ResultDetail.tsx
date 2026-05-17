import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ChevronLeft, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

export function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'quizResponses', id));
        if (snap.exists()) {
          setResult(snap.data());
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `quizResponses/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-slate-400">Loading result...</div>;
  if (!result) return <div className="p-20 text-center text-rose-500">Result not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12 sm:pb-20 font-sans p-2 sm:p-0">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-bold text-[10px] uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-3 h-3" /> Mission Overview
      </Link>

      <div className="bg-[#161B22] p-5 sm:p-10 rounded-3xl border border-slate-800 shadow-xl shadow-black/50">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tighter uppercase italic leading-none">Assessment Analysis</h1>
            <p className="text-slate-500 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em]">Generated on {formatDate(result.timestamp?.toDate?.())}</p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 p-4 rounded-2xl hidden sm:block">
            <Briefcase className="w-8 h-8" />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {result.analysis.map((item: any, i: number) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-800 group hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase italic">{item.field}</h3>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border",
                  item.prospects.toLowerCase() === 'high' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}>
                  {item.prospects} Global Demand
                </span>
              </div>
              <div className="space-y-6">
                <div>
                   <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Alignment Synthesis
                   </p>
                   <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">{item.matchReason}</p>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3" /> Sector Forecast 2026-2030
                  </p>
                  <p className="text-slate-500 leading-relaxed text-xs sm:text-sm italic font-medium">"{item.prospectsReason}"</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
