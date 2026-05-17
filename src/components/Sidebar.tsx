import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  Activity, 
  LogOut, 
  User as UserIcon,
  ShieldAlert,
  GraduationCap,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ onItemClick }: { onItemClick?: () => void }) {
  const { profile, logout, selectedRole } = useAuth();
  const location = useLocation();

  const handleLinkClick = () => {
    if (onItemClick) onItemClick();
  };

  const userLinks = [
    { name: 'Mission Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Initiate Assessment', path: '/quiz', icon: GraduationCap },
  ];

  const adminLinks = [
    { name: 'Control Center', path: '/admin', icon: ShieldAlert },
    { name: 'Personnel Logs', path: '/admin/logs', icon: Activity },
    { name: 'Neural Responses', path: '/admin/responses', icon: History },
  ];

  return (
    <div className="w-64 bg-[#161B22] border-r border-slate-800 text-slate-300 min-h-screen flex flex-col p-6 font-sans">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-900/40">C</div>
        <div>
          <h1 className="text-xl font-bold text-white leading-none">CareerQuest</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 italic">Neural Operations</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {selectedRole === 'user' ? (
          <>
            <div className="text-[10px] font-bold text-slate-500 mb-4 px-2 uppercase tracking-[0.2em]">
              Candidate Console
            </div>
            <div className="space-y-1">
              {userLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                    location.pathname === link.path 
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <link.icon className={cn("w-4 h-4 transition-colors", location.pathname === link.path ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                  {link.name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-[10px] font-bold text-rose-500 mb-4 px-2 uppercase tracking-[0.2em]">
              Architect Subsystem
            </div>
            <div className="space-y-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                    location.pathname === link.path 
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <link.icon className={cn("w-4 h-4 transition-colors", location.pathname === link.path ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                  {link.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 overflow-hidden">
            <img 
              src={profile?.photoURL || ''} 
              className="w-full h-full object-cover"
              alt="profile"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{profile?.displayName}</p>
            <p className={cn(
              "text-[9px] uppercase tracking-tighter opacity-70 font-bold",
              selectedRole === 'admin' ? "text-rose-400" : "text-indigo-400"
            )}>
              {selectedRole === 'admin' ? 'SYSTEM ARCHITECT' : 'CANDIDATE'}
            </p>
          </div>
        </div>
        
        {profile?.role === 'admin' && (
          <button 
            onClick={() => {
              sessionStorage.removeItem('selected_role');
              sessionStorage.removeItem('admin_verified');
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-indigo-400 bg-slate-800/20 hover:bg-indigo-500/5 transition-all w-full text-[9px] font-bold uppercase tracking-[0.2em] rounded-xl border border-slate-800/50"
          >
            <History className="w-3 h-3 opacity-50" />
            Switch Protocol
          </button>
        )}

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-100 hover:text-white bg-slate-800/50 hover:bg-rose-600 transition-all w-full text-[10px] font-bold uppercase tracking-widest rounded-xl"
        >
          <LogOut className="w-4 h-4 opacity-50" />
          End Session
        </button>
      </div>
    </div>
  );
}
