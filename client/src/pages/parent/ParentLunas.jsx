import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Award, Clock, RefreshCw } from 'lucide-react';

import fullMarkLunaImg from '../../assets/lunas/FullMarkLuna.webp';
import attendanceLunaImg from '../../assets/lunas/AttendanceLuna.webp';
import twoLineLunaImg from '../../assets/lunas/2LineLuna.webp';
import fourLineLunaImg from '../../assets/lunas/4LineLuna.webp';
import trophyImg from '../../assets/trophy/trophy1.png';

const ParentLunas = () => {
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLunasLedger = async () => {
      if (!user?.studentId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/luna-awards/student/${user.studentId}`);
        setData(data);
      } catch (err) {
        console.warn('API error, could not load Lunas', err);
        setData({ totalCount: 0, breakdown: {}, awards: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchLunasLedger();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
        <span className="font-bold">Syncing reward ledger files...</span>
      </div>
    );
  }

  const { totalCount = 0, breakdown = {}, awards = [] } = data || {};

  const lunaConfig = {
    green: {
      id: 'green',
      name: 'Green Luna',
      desc: 'Awarded for Full Marks',
      img: fullMarkLunaImg,
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/10',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]',
      borderHover: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500/50',
      dot: '🟢'
    },
    purple: {
      id: 'purple',
      name: 'Purple Luna',
      desc: 'Awarded for Perfect Attendance',
      img: attendanceLunaImg,
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/10',
      border: 'border-purple-200 dark:border-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]',
      borderHover: 'group-hover:border-purple-400 dark:group-hover:border-purple-500/50',
      dot: '🟣'
    },
    orange: {
      id: 'orange',
      name: 'Orange Luna',
      desc: 'Awarded for 2-Line Writing',
      img: twoLineLunaImg,
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/40 dark:to-orange-900/10',
      border: 'border-orange-200 dark:border-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]',
      borderHover: 'group-hover:border-orange-400 dark:group-hover:border-orange-500/50',
      dot: '🟠'
    },
    blue: {
      id: 'blue',
      name: 'Blue Luna',
      desc: 'Awarded for 4-Line Writing',
      img: fourLineLunaImg,
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]',
      borderHover: 'group-hover:border-blue-400 dark:group-hover:border-blue-500/50',
      dot: '🔵'
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-6 rounded-[24px] shadow-sm">
        <h1 className="text-3xl font-black text-luna-blue">Luna Rewards Wallet</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
          Track every Luna you've earned throughout your learning journey.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Lunas Earned</span>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white">{totalCount} Lunas</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {['green', 'purple', 'orange', 'blue'].map(key => {
            const cfg = lunaConfig[key];
            const bd = breakdown[key] || { count: 0 };
            return (
              <div key={key} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-white/5">
                <span className="text-sm">{cfg.dot}</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{cfg.name.split(' ')[0]}: <span className="text-slate-900 dark:text-white font-black">{bd.count}</span></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Luna Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['green', 'purple', 'orange', 'blue'].map(key => {
          const cfg = lunaConfig[key];
          const bd = breakdown[key] || { count: 0 };
          const count = bd.count;
          
          return (
            <div 
              key={key} 
              className={`group relative p-6 rounded-[24px] border transition-all duration-300 transform hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${cfg.bg} ${cfg.border} ${cfg.borderHover} flex flex-col h-full`}
            >
              {/* Top: Image & Name */}
              <div className="flex flex-col items-center mb-6">
                <div className={`w-20 h-20 mb-3 transition-shadow duration-300 rounded-full ${cfg.glow}`}>
                  <img src={cfg.img} alt={cfg.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <h3 className={`text-base font-black ${cfg.text}`}>{cfg.name}</h3>
              </div>
              
              {/* Middle: Count */}
              <div className="text-center flex-grow flex items-center justify-center mb-4">
                <span className={`text-4xl font-black ${cfg.text}`}>
                  {count} {count === 1 ? 'Luna' : 'Lunas'}
                </span>
              </div>
              
              {/* Bottom: Description */}
              <div className="text-center mt-auto">
                <p className={`text-[11px] font-bold uppercase tracking-wider opacity-80 ${cfg.text}`}>
                  {cfg.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State OR Transaction Timeline */}
      {totalCount === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-[24px] p-12 shadow-sm text-center flex flex-col items-center">
          <img src={trophyImg} alt="Trophy" className="w-32 h-32 object-contain mb-6 opacity-80" />
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">No Lunas earned yet.</h3>
          <p className="text-slate-500 dark:text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed text-sm">
            Attend classes, score full marks, and complete handwriting to unlock your first Luna.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-[24px] p-8 shadow-sm">
          <h3 className="font-black text-slate-800 dark:text-white text-lg mb-8 flex items-center gap-2">
            <Award className="w-5 h-5 text-luna-blue" />
            Reward Timeline
          </h3>

          <div className="relative border-l-2 border-slate-100 dark:border-white/5 ml-4 space-y-8">
            {awards.map((tx) => {
              const cfg = lunaConfig[tx.lunaType] || lunaConfig.blue;
              
              return (
                <div key={tx._id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#1e293b] ${cfg.bg} flex items-center justify-center`}>
                    <span className="text-[8px]">{cfg.dot}</span>
                  </div>
                  
                  {/* Content Box */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-slate-200 dark:hover:border-white/10">
                    <div className="flex items-start gap-4">
                      <img src={cfg.img} alt={cfg.name} className="w-12 h-12 object-cover rounded-full" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.text}`}>{cfg.name}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-base mb-1">{tx.reason}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            Awarded by Luna Teacher
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(tx.awardedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className={`text-xl font-black ${cfg.text}`}>+{tx.count}</span>
                      <img src={cfg.img} alt="Luna" className="w-6 h-6 object-cover rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLunas;
