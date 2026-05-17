import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  TrendingUp, 
  Briefcase 
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Question {
  question: string;
  options: { text: string; category: string }[];
}

interface AnalysisResult {
  field: string;
  matchReason: string;
  prospects: string;
  prospectsReason: string;
}

export function Quiz() {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<boolean>(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reach neural servers');
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error('Failed to load quiz', e);
      setError('Neural alignment failed. Check your connection to the grid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswer = (category: string, text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = { question: questions[currentStep].question, answer: text, category };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const submitQuiz = async () => {
    setAnalyzing(true);
    setAnalysisError(false);
    try {
      const res = await fetch('/api/quiz/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error('Neural analysis synthesis aborted');
      const analysis = await res.json();
      setResults(analysis);

      // Save to Firebase
      await addDoc(collection(db, 'quizResponses'), {
        userId: user?.uid,
        userName: profile?.displayName,
        userEmail: profile?.email,
        answers,
        analysis,
        timestamp: serverTimestamp()
      });

    } catch (e) {
      console.error('Analysis error:', e);
      setAnalysisError(true);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Generating your personalized assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
          <Loader2 className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Sync Error</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">{error}</p>
        </div>
        <button 
          onClick={fetchQuestions}
          className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
        >
          Retry Neural Link
        </button>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase italic">Synthesis Complete</h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm font-medium">Neural alignment successful. High-compatibility sectors identified below.</p>
        </div>

        <div className="grid gap-4">
          {results.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-[#161B22] p-5 sm:p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all relative overflow-hidden"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 flex-shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{item.field}</h3>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border self-start sm:self-auto",
                    item.prospects.toLowerCase() === 'high' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {item.prospects} Global Demand
                  </div>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Alignment Logic
                  </p>
                  <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">{item.matchReason}</p>
                </div>
                <div className="bg-slate-900/50 -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 p-5 sm:p-8 mt-6 border-t border-slate-800">
                  <p className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Sector Forecast
                  </p>
                  <p className="text-slate-500 leading-relaxed text-xs sm:text-sm italic font-medium">"{item.prospectsReason}"</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center pt-8">
           <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all shadow-xl active:scale-95"
           >
            Re-Initialize Scan
           </button>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <Loader2 className="w-20 h-20 text-indigo-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white uppercase tracking-widest italic">Core Analysis Active</h3>
          <p className="text-slate-500 text-sm font-mono tracking-tighter uppercase">Cross-Referencing global employment databanks...</p>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
          <Loader2 className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Synthesis Aborted</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Neural uplink lost during analysis. Signal strength low.</p>
        </div>
        <button 
          onClick={submitQuiz}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all active:scale-95"
        >
          Resume Data Stream
        </button>
      </div>
    );
  }

  const currentQ = questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col min-h-[80vh]">
      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Module {currentStep + 1}</span>
             <h3 className="text-xs font-bold text-slate-500 uppercase">Input Buffer: Secure</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-600">{Math.round(((currentStep + 1) / questions.length) * 100)}% LOADED</span>
        </div>
        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            className="h-full bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 space-y-10"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {currentQ.question}
          </h2>

          <div className="grid gap-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.category, opt.text)}
                className={cn(
                  "p-6 text-left rounded-2xl border transition-all flex items-center justify-between group relative overflow-hidden",
                  answers[currentStep]?.answer === opt.text
                    ? "border-indigo-500 bg-indigo-600/10"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40"
                )}
              >
                <span className={cn(
                   "font-bold text-sm tracking-tight transition-colors z-10 uppercase",
                   answers[currentStep]?.answer === opt.text ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}>{opt.text}</span>
                <div className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300 z-10",
                  answers[currentStep]?.answer === opt.text ? "bg-indigo-400 scale-150 shadow-[0_0_8px_#818cf8]" : "bg-slate-800"
                )} />
                {answers[currentStep]?.answer === opt.text && (
                   <motion.div layoutId="active-bg" className="absolute inset-0 bg-indigo-600/5" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 flex justify-between items-center">
        <button
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-400 font-bold text-[10px] uppercase tracking-widest disabled:opacity-0 transition-opacity"
        >
          <ChevronLeft className="w-3 h-3" /> Previous Step
        </button>
        {currentStep === questions.length - 1 && answers[currentStep] && (
          <button
            onClick={submitQuiz}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40 active:scale-95"
          >
            Saturate Results
          </button>
        )}
      </div>
    </div>
  );
}
