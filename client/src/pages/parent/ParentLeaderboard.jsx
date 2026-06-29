import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { Moon, RefreshCw, Filter, Users, BookOpen, Sparkles } from 'lucide-react';

import trophy1Img from '../../assets/trophy/trophy1.png';
import trophy2Img from '../../assets/trophy/trophy2.png';
import trophy3Img from '../../assets/trophy/trophy3.png';

const TROPHIES = { 1: trophy1Img, 2: trophy2Img, 3: trophy3Img };

const RankCell = ({ rank }) => {
  if (rank <= 3) {
    const colors = {
      1: 'text-[#FBBF24] bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/20',
      2: 'text-slate-500 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40',
      3: 'text-amber-700 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/20',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-black ${colors[rank]}`}>
        <Moon className="w-3 h-3 fill-current" /> #{rank}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-500 dark:text-slate-300">
      <Moon className="w-3 h-3" /> #{rank}
    </span>
  );
};

const ParentLeaderboard = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState('all');

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const endpoint = selectedStandard === 'all'
        ? '/leaderboard/overall'
        : `/leaderboard/class/${selectedStandard}`;
      const { data } = await api.get(endpoint);
      setRankings(data);
    } catch (err) {
      console.warn('Leaderboard API error', err);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRankings(); }, [selectedStandard]);

  const top3 = rankings.slice(0, 3);
  const totalLunas = rankings.reduce((sum, s) => sum + s.totalLunas, 0);

  const podiumSlots = [
    {
      rank: 2, index: 1, delay: 0.2,
      trophySize: 'w-28 sm:w-36',
      podiumH: 'h-16 sm:h-20',
      cardBg: 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-[#1e293b]',
      border: 'border-slate-300 dark:border-slate-600/50',
      podiumBg: 'bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700',
      lunaColor: 'text-slate-500 dark:text-slate-300',
      glow: '',
      label: '2nd Place',
    },
    {
      rank: 1, index: 0, delay: 0,
      trophySize: 'w-36 sm:w-44',
      podiumH: 'h-24 sm:h-28',
      cardBg: 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-[#1e293b]',
      border: 'border-[#FBBF24]/60 dark:border-[#FBBF24]/40',
      podiumBg: 'bg-gradient-to-b from-[#FBBF24] to-[#f59e0b]',
      lunaColor: 'text-[#FBBF24]',
      glow: 'shadow-[0_0_40px_6px_rgba(251,191,36,0.22)]',
      label: '1st Place',
    },
    {
      rank: 3, index: 2, delay: 0.3,
      trophySize: 'w-24 sm:w-32',
      podiumH: 'h-12 sm:h-16',
      cardBg: 'bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-[#1e293b]',
      border: 'border-amber-500/40 dark:border-amber-700/40',
      podiumBg: 'bg-gradient-to-b from-amber-600 to-amber-700',
      lunaColor: 'text-amber-600 dark:text-amber-500',
      glow: '',
      label: '3rd Place',
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full text-left">

      {/* Filter */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300">
          <Filter className="w-4 h-4 text-luna-blue dark:text-blue-400" />
          Filter by Class
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="flex-1 sm:w-auto bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-white/15 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Overall Board</option>
            {[1,2,3,4,5,6,7,8,9].map(s => (
              <option key={s} value={s}>Grade {s}</option>
            ))}
          </select>
          <button
            onClick={fetchRankings}
            className="p-2 bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-white/15 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-sm font-semibold">Loading leaderboard…</span>
        </div>
      ) : rankings.length === 0 ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 font-semibold text-sm">
          No students found on the leaderboard.
        </div>
      ) : (
        <>
          {/* Trophy Podium */}
          {top3.length >= 1 && (
            <div className="space-y-2">
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">
                🌙 Top 3 This Month
              </p>
              <div className="flex flex-col sm:flex-row items-end justify-center gap-3 sm:gap-4">
                {podiumSlots.map((slot) => {
                  const student = rankings[slot.index];
                  if (!student) return null;
                  const isFirst = slot.rank === 1;
                  const isMe = String(student.studentId) === String(user?.studentId) || String(student._id) === String(user?.studentId);
                  return (
                    <motion.div
                      key={slot.rank}
                      initial={{ opacity: 0, scale: 0.8, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: slot.delay, type: 'spring', stiffness: 200, damping: 18 }}
                      className={`flex flex-col items-center w-full sm:flex-1 sm:max-w-[180px] ${
                        slot.rank === 1 ? 'order-first sm:order-none' :
                        slot.rank === 2 ? 'order-2 sm:order-none' :
                        'order-3 sm:order-none'
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.08, y: -6 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        className={`${slot.trophySize} cursor-pointer drop-shadow-lg ${isFirst ? 'drop-shadow-[0_8px_24px_rgba(251,191,36,0.35)]' : ''}`}
                      >
                        <img src={TROPHIES[slot.rank]} alt={`Rank ${slot.rank}`} className="w-full h-full object-contain" />
                      </motion.div>

                      <div className={`w-full rounded-t-2xl border-2 ${slot.border} ${slot.cardBg} ${slot.glow} px-3 py-2.5 text-center space-y-1 shadow-sm relative`}>
                        {isMe && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-luna-blue text-white text-[8px] font-black rounded-full uppercase tracking-wider whitespace-nowrap">You</span>
                        )}
                        <p className={`font-black truncate text-slate-900 dark:text-white ${isFirst ? 'text-sm' : 'text-xs'}`}>{student.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold">Grade {student.standard}</p>
                        <p className={`text-xs font-black flex items-center justify-center gap-1 ${slot.lunaColor}`}>
                          <Moon className="w-3 h-3 fill-current" />
                          {student.totalLunas} Lunas
                        </p>
                      </div>
                      <div className={`w-full ${slot.podiumH} ${slot.podiumBg} rounded-b-xl flex items-center justify-center shadow-inner`}>
                        <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">{slot.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Moon,     label: 'Total Lunas Earned', value: `${totalLunas} Lunas`,         color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/25' },
              { icon: Sparkles, label: 'Top Student',        value: rankings[0]?.name ?? '—',      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/25' },
              { icon: BookOpen, label: 'Active Classes',     value: 'Grades 1 – 9',                color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/25' },
              { icon: Users,    label: 'Total Students',     value: `${rankings.length} Students`, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 leading-none">{stat.label}</p>
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rankings Table */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">All Rankings</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">
                    <th className="px-5 py-3 text-left">Rank</th>
                    <th className="px-5 py-3 text-left">Student Name</th>
                    <th className="px-5 py-3 text-left">Class</th>
                    <th className="px-5 py-3 text-right">Total Lunas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((student, idx) => {
                    const isTop3 = student.rank <= 3;
                    const isMe = String(student.studentId) === String(user?.studentId) || String(student._id) === String(user?.studentId);
                    return (
                      <tr
                        key={student.studentId || idx}
                        className={`border-t border-slate-100 dark:border-white/5 transition-colors ${
                          isMe
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-l-[#FBBF24]'
                            : idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/50 dark:bg-white/[0.02]'
                        } hover:bg-amber-50/30 dark:hover:bg-amber-950/10`}
                      >
                        <td className="px-5 py-3"><RankCell rank={student.rank} /></td>
                        <td className={`px-5 py-3 font-bold ${isTop3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {student.name}
                          {isMe && (
                            <span className="ml-2 px-2 py-0.5 bg-[#FBBF24]/20 text-luna-blue text-[9px] font-extrabold rounded-md uppercase tracking-wider">Your Child</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold">
                            Grade {student.standard}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-flex items-center justify-end gap-1 font-black text-sm ${isTop3 ? 'text-[#FBBF24]' : 'text-slate-600 dark:text-slate-300'}`}>
                            <Moon className={`w-3.5 h-3.5 ${isTop3 ? 'fill-current text-[#FBBF24]' : ''}`} />
                            {student.totalLunas} Lunas
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-white/5">
              {rankings.map((student, idx) => {
                const isTop3 = student.rank <= 3;
                const isMe = String(student.studentId) === String(user?.studentId) || String(student._id) === String(user?.studentId);
                return (
                  <div
                    key={student.studentId || idx}
                    className={`p-4 flex items-center justify-between gap-3 ${isMe ? 'bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-l-[#FBBF24]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0"><RankCell rank={student.rank} /></div>
                      <div>
                        <div className={`font-bold text-sm ${isTop3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {student.name}
                          {isMe && <span className="ml-1.5 px-1.5 py-0.5 bg-[#FBBF24]/20 text-luna-blue text-[8px] font-extrabold rounded uppercase">You</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">Grade {student.standard}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 font-black text-sm shrink-0 ${isTop3 ? 'text-[#FBBF24]' : 'text-slate-600 dark:text-slate-300'}`}>
                      <Moon className={`w-3.5 h-3.5 ${isTop3 ? 'fill-current' : ''}`} />
                      {student.totalLunas}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentLeaderboard;
