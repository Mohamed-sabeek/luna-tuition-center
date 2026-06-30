import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, RefreshCw, Filter, Users, BookOpen, Sparkles } from 'lucide-react';
import trophy1Img from '../../assets/trophy/trophy1.png';
import trophy2Img from '../../assets/trophy/trophy2.png';
import trophy3Img from '../../assets/trophy/trophy3.png';
import api from '../../utils/api';

const PHONE_NUMBER = '8220153507';

/* Trophy images — imported from src/assets/trophy/ */
const TROPHIES = {
  1: trophy1Img,
  2: trophy2Img,
  3: trophy3Img,
};

/* ─── Rank Cell for table rows ─── */
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

/* ═══════════════════════════════════════════ */
const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedStandard, setSelectedStandard] = useState('all');

  const mockRankings = [
    { name: 'Aditya Sharma', standard: 5, totalLunas: 28, rank: 1, studentId: 'mock1' },
    { name: 'Diya Patel',    standard: 6, totalLunas: 24, rank: 2, studentId: 'mock2' },
    { name: 'Rohan Verma',   standard: 8, totalLunas: 21, rank: 3, studentId: 'mock3' },
    { name: 'Ananya Rao',    standard: 4, totalLunas: 19, rank: 4, studentId: 'mock4' },
    { name: 'Kabir Mehta',   standard: 5, totalLunas: 18, rank: 5, studentId: 'mock5' },
    { name: 'Neha Gupta',    standard: 7, totalLunas: 16, rank: 6, studentId: 'mock6' },
  ];

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const endpoint = selectedStandard === 'all'
        ? '/leaderboard/overall'
        : `/leaderboard/class/${selectedStandard}`;
      const { data } = await api.get(endpoint);
      setRankings(data);
    } catch {
      if (selectedStandard === 'all') {
        setRankings(mockRankings);
      } else {
        const filtered = mockRankings
          .filter(s => String(s.standard) === String(selectedStandard))
          .sort((a, b) => b.totalLunas - a.totalLunas)
          .map((s, i) => ({ ...s, rank: i + 1 }));
        setRankings(filtered);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRankings(); }, [selectedStandard]);

  const top3      = rankings.slice(0, 3);
  const totalLunas = rankings.reduce((sum, s) => sum + s.totalLunas, 0);

  /* Podium display order: 2nd (left) | 1st (center) | 3rd (right) */
  const podiumSlots = [
    {
      rank: 2, index: 1, delay: 0.2,
      trophySize: 'w-36 sm:w-44',
      podiumH: 'h-20 sm:h-24',
      cardBg: 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-[#1e293b]',
      border: 'border-slate-300 dark:border-slate-600/50',
      podiumBg: 'bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700',
      lunaColor: 'text-slate-500 dark:text-slate-300',
      glow: '',
      label: '2nd Place',
    },
    {
      rank: 1, index: 0, delay: 0,
      trophySize: 'w-44 sm:w-56',
      podiumH: 'h-28 sm:h-36',
      cardBg: 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-[#1e293b]',
      border: 'border-[#FBBF24]/60 dark:border-[#FBBF24]/40',
      podiumBg: 'bg-gradient-to-b from-[#FBBF24] to-[#f59e0b]',
      lunaColor: 'text-[#FBBF24]',
      glow: 'shadow-[0_0_40px_6px_rgba(251,191,36,0.22)]',
      label: '1st Place',
    },
    {
      rank: 3, index: 2, delay: 0.3,
      trophySize: 'w-32 sm:w-40',
      podiumH: 'h-14 sm:h-16',
      cardBg: 'bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-[#1e293b]',
      border: 'border-amber-500/40 dark:border-amber-700/40',
      podiumBg: 'bg-gradient-to-b from-amber-600 to-amber-700',
      lunaColor: 'text-amber-600 dark:text-amber-500',
      glow: '',
      label: '3rd Place',
    },
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-[#0f172a] dark:text-[#f8fafc] relative overflow-hidden transition-colors duration-200">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[110px] pointer-events-none -z-10" />

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-10 relative">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-xs font-black text-amber-600 dark:text-amber-400">
            <Moon className="w-3.5 h-3.5 fill-current" />
            Luna Leaderboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            Top Luna Earners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-semibold max-w-xl mx-auto leading-relaxed">
            Students earn Lunas through tests, attendance and handwriting practice. The students with the most Lunas reach the top.
          </p>
        </motion.div>

        {/* ── FILTER ── */}
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300">
            <Filter className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
            Filter by Class
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-white/15 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Overall Board</option>
              {[1,2,3,4,5,6,7,8,9].map(s => (
                <option key={s} value={s}>Grade {s}</option>
              ))}
            </select>
            <button
              onClick={fetchRankings}
              className="p-2 bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-white/15 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
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
          <div className="py-20 text-center text-slate-500 font-semibold text-sm">
            No students found on the leaderboard.
          </div>
        ) : (
          <>
            {/* ── TROPHY PODIUM ── */}
            {top3.length >= 1 && (
              <div className="space-y-2">
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">
                  🌙 Top 3 This Month
                </p>

                {/* Desktop: 2nd | 1st | 3rd  |  Mobile: 1st then 2nd then 3rd */}
                <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6">
                  {podiumSlots.map((slot) => {
                    const student = rankings[slot.index];
                    if (!student) return null;
                    const isFirst = slot.rank === 1;

                    return (
                      /* On mobile stack vertically in rank order (1→2→3) using order- classes */
                      <motion.div
                        key={slot.rank}
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: slot.delay, type: 'spring', stiffness: 200, damping: 18 }}
                        className={`flex flex-col items-center w-full sm:flex-1 sm:max-w-[220px] ${
                          slot.rank === 1 ? 'order-first sm:order-none' :
                          slot.rank === 2 ? 'order-2 sm:order-none' :
                          'order-3 sm:order-none'
                        }`}
                      >
                        {/* Trophy image */}
                        <motion.div
                          whileHover={{ scale: 1.08, y: -6 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                          className={`${slot.trophySize} cursor-pointer drop-shadow-lg ${isFirst ? 'drop-shadow-[0_8px_24px_rgba(251,191,36,0.35)]' : ''}`}
                        >
                          <img
                            src={TROPHIES[slot.rank]}
                            alt={`${slot.rank === 1 ? 'First' : slot.rank === 2 ? 'Second' : 'Third'} Place Trophy`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              /* Fallback while images aren't yet added */
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback moon badge shown if image missing */}
                          <div
                            style={{ display: 'none' }}
                            className={`w-full aspect-square rounded-full items-center justify-center text-4xl font-black
                              ${slot.rank === 1 ? 'bg-amber-100 text-amber-700' : slot.rank === 2 ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-700'}`}
                          >
                            #{slot.rank}
                          </div>
                        </motion.div>

                        {/* Info card */}
                        <div
                          className={`w-full rounded-t-2xl border-2 ${slot.border} ${slot.cardBg} ${slot.glow} px-4 py-3 text-center space-y-1 shadow-sm`}
                        >
                          <p className={`font-black truncate text-slate-900 dark:text-white ${isFirst ? 'text-base' : 'text-sm'}`}>
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold">
                            Grade {student.standard}
                          </p>
                          <p className={`text-xs font-black flex items-center justify-center gap-1 ${slot.lunaColor}`}>
                            <Moon className="w-3 h-3 fill-current" />
                            {student.totalLunas} Lunas
                          </p>
                        </div>

                        {/* Podium base block */}
                        <div className={`w-full ${slot.podiumH} ${slot.podiumBg} rounded-b-xl flex items-center justify-center shadow-inner`}>
                          <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">
                            {slot.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STATS STRIP ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Moon,     label: 'Total Lunas Earned', value: `${totalLunas} Lunas`,         color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/25' },
                { icon: Sparkles, label: 'Top Student',        value: rankings[0]?.name ?? '—',      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/25' },
                { icon: BookOpen, label: 'Active Classes',     value: 'Grades 1 – 9',                color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/25' },
                { icon: Users,    label: 'Total Students',     value: `${rankings.length} Students`, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 leading-none">{stat.label}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── RANKINGS TABLE ── */}
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  All Rankings
                </span>
              </div>
              <div className="overflow-x-auto">
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
                      return (
                        <tr
                          key={student.studentId}
                          className={`border-t border-slate-100 dark:border-white/5 transition-colors ${
                            idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/50 dark:bg-white/[0.02]'
                          } hover:bg-amber-50/30 dark:hover:bg-amber-950/10`}
                        >
                          <td className="px-5 py-3">
                            <RankCell rank={student.rank} />
                          </td>
                          <td className={`px-5 py-3 font-bold ${isTop3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {student.name}
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
            </div>

            {/* ── MOTIVATION CARD ── */}
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] dark:from-[#0d1b40] dark:to-[#0f2157] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#FBBF24]/20 border-2 border-[#FBBF24]/40 flex items-center justify-center shrink-0">
                  <Moon className="w-8 h-8 text-[#FBBF24] fill-current" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-lg sm:text-xl font-black leading-tight">Keep Earning Lunas!</h3>
                  <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed">
                    Attend classes, score full marks, complete handwriting practice and maintain attendance to earn more Lunas and move up the leaderboard.
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="shrink-0 px-5 py-3 bg-[#FBBF24] hover:bg-[#f59e0b] text-amber-900 font-black text-xs rounded-2xl transition-all shadow-md whitespace-nowrap"
                >
                  Join Luna Today
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
