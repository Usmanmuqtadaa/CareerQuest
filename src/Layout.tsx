import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Loader2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0A0C10]">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-[#0A0C10] text-slate-300 relative overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#161B22]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/40">C</div>
          <span className="text-white font-bold tracking-tight">CareerQuest</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-[60]"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-6 right-[-3rem] p-2 bg-[#161B22] border border-slate-800 rounded-r-xl text-white lg:hidden"
                >
                  <X className="w-6 h-6" />
                </button>
                <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, selectedRole, isAdminVerified } = useAuth();

  if (loading) return null;
  if (profile?.role !== 'admin' || selectedRole !== 'admin' || !isAdminVerified) return <Navigate to="/" />;

  return <>{children}</>;
}
