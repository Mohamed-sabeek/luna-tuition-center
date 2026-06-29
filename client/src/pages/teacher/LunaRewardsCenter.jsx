import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { Moon, Star, Check, XCircle, RefreshCw, Filter, Search, Eye, Award, Calendar, FileSpreadsheet, ChevronDown } from 'lucide-react';

const LUNA_CONFIG = {
  green: { label: 'Green Luna', emoji: '🟢', color: 'emerald' },
  purple: { label: 'Purple Luna', emoji: '🟣', color: 'purple' },
  orange: { label: 'Orange Luna', emoji: '🟠', color: 'orange' },
  blue: { label: 'Blue Luna', emoji: '🔵', color: 'blue' },
};

const colorMap = {
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  purple: 'text-purple-600 bg-purple-50 border-purple-200',
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  blue: 'text-blue-600 bg-blue-50 border-blue-200',
};

const LunaBadge = ({ lunaType, size = 'sm' }) => {
  const cfg = LUNA_CONFIG[lunaType] || { label: lunaType, emoji: '🌙', color: 'slate' };
  const cls = colorMap[cfg.color] || 'text-slate-600 bg-slate-50 border-slate-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cls}`}>
      <span>{cfg.emoji}</span>{cfg.label}
    </span>
  );
};

// ── Award Confirmation Modal ──────────────────────────────────────────────────
const AwardModal = ({ item, onConfirm, onClose, loading }) => {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-100 dark:border-white/5 w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Confirm Luna Award</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Review before confirming</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-400 font-bold">Student</span><span className="font-black text-slate-800 dark:text-white">{item.studentName}</span></div>
          <div className="flex justify-between"><span className="text-slate-400 font-bold">Roll No</span><span className="font-black text-slate-800 dark:text-white">{item.rollNo}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">Luna</span><LunaBadge lunaType={item.lunaType} /></div>
          <div className="flex flex-col gap-1"><span className="text-slate-400 font-bold">Reason</span><span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{item.reason}</span></div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Teacher Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any notes..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-luna-blue resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-black cursor-pointer hover:bg-slate-200 transition-all">Cancel</button>
          <button
            onClick={() => onConfirm(notes)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-luna-blue text-white text-xs font-black cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Award Luna
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const LunaRewardsCenter = () => {
  const [activeTab, setActiveTab] = useState('eligible');
  const [eligible, setEligible] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ todayCount: 0, weekCount: 0, monthCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [awardModal, setAwardModal] = useState(null);
  const [awarding, setAwarding] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterLuna, setFilterLuna] = useState('all');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyNotAwarded, setOnlyNotAwarded] = useState(true);
  const [histMonth, setHistMonth] = useState(new Date().toISOString().substring(0, 7));

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEligible = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ grade: filterGrade, lunaType: filterLuna, date: filterDate, searchTerm, onlyNotAwarded });
      const { data } = await api.get(`/luna-awards/eligible?${params}`);
      setEligible(data.eligible || []);
    } catch { showToast('Failed to load eligible students.', 'error'); }
    finally { setLoading(false); }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ grade: filterGrade, lunaType: filterLuna, month: histMonth, searchTerm });
      const { data } = await api.get(`/luna-awards/history?${params}`);
      setHistory(data.awards || []);
    } catch { showToast('Failed to load award history.', 'error'); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/luna-awards/stats');
      setStats(data);
    } catch {}
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (activeTab === 'eligible') loadEligible();
    else loadHistory();
  }, [activeTab, filterGrade, filterLuna, filterDate, onlyNotAwarded, histMonth]);

  const handleAward = async (notes) => {
    if (!awardModal) return;
    setAwarding(true);
    try {
      await api.post('/luna-awards/award', {
        studentId: awardModal.studentId,
        lunaType: awardModal.lunaType,
        achievementSource: awardModal.achievementSource,
        achievementReference: awardModal.achievementReference,
        reason: awardModal.reason,
        teacherNotes: notes,
        date: awardModal.date,
      });
      showToast(`🌙 ${LUNA_CONFIG[awardModal.lunaType]?.label || 'Luna'} awarded to ${awardModal.studentName}!`);
      setAwardModal(null);
      loadEligible();
      loadStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Award failed.', 'error');
    } finally { setAwarding(false); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this Luna award?')) return;
    try {
      await api.delete(`/luna-awards/${id}`);
      showToast('Award revoked.');
      loadHistory();
      loadStats();
    } catch { showToast('Revoke failed.', 'error'); }
  };

  const eligibleFiltered = useMemo(() => {
    if (!searchTerm) return eligible;
    return eligible.filter(e => e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || e.rollNo.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [eligible, searchTerm]);

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-2xl shadow-xl z-50 text-white font-bold flex items-center gap-2 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {awardModal && <AwardModal item={awardModal} onConfirm={handleAward} onClose={() => setAwardModal(null)} loading={awarding} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Moon className="w-7 h-7 text-amber-400 fill-amber-400" /> Luna Rewards Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Review eligible students and manually award Luna achievements.</p>
        </div>
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-full md:w-64">
          {['eligible','history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 rounded-xl text-xs font-black capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'eligible' ? 'Eligible Students' : 'Award History'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Awards", value: stats.todayCount, color: 'text-emerald-500' },
          { label: 'This Week', value: stats.weekCount, color: 'text-blue-500' },
          { label: 'This Month', value: stats.monthCount, color: 'text-purple-500' },
          { label: 'Total Luna Awarded', value: stats.totalCount, color: 'text-amber-500' },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">{card.label}</span>
            <h3 className={`text-3xl font-extrabold ${card.color}`}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="relative col-span-2 md:col-span-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold focus:outline-none" />
        </div>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none">
          <option value="all">All Grades</option>
          {[1,2,3,4,5,6,7,8,9].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select
          value={filterLuna}
          onChange={e => setFilterLuna(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:border-luna-blue cursor-pointer"
        >
          <option value="all">All Lunas</option>
          <option value="green">Green Luna (Marks)</option>
          <option value="purple">Purple Luna (Attendance)</option>
          <option value="orange">Orange Luna (2-Line)</option>
          <option value="blue">Blue Luna (4-Line)</option>
        </select>
        {activeTab === 'eligible' ? (
          <>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
            <label className="flex items-center gap-2 cursor-pointer col-span-2 md:col-span-1 text-xs font-black text-slate-600 dark:text-slate-300 px-1">
              <input type="checkbox" checked={onlyNotAwarded} onChange={e => setOnlyNotAwarded(e.target.checked)} className="w-4 h-4 rounded" />
              Only Not Awarded
            </label>
          </>
        ) : (
          <input type="month" value={histMonth} onChange={e => setHistMonth(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
        )}
        <button onClick={activeTab === 'eligible' ? loadEligible : loadHistory}
          className="flex items-center justify-center gap-1.5 bg-luna-blue text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer hover:opacity-90 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
            <span className="text-xs font-bold">Loading {activeTab === 'eligible' ? 'eligibility records' : 'award history'}...</span>
          </div>
        ) : activeTab === 'eligible' ? (
          eligibleFiltered.length === 0 ? (
            <div className="p-16 text-center">
              <Moon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400">No eligible students found for the selected filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                      <th className="px-5 py-4">Roll No</th>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Grade</th>
                      <th className="px-5 py-4">Eligible For</th>
                      <th className="px-5 py-4">Reason</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
                    {eligibleFiltered.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-400">{item.rollNo}</td>
                        <td className="px-5 py-4 font-black text-slate-800 dark:text-white">{item.studentName}</td>
                        <td className="px-5 py-4 text-slate-500">Grade {item.standard}</td>
                        <td className="px-5 py-4"><LunaBadge lunaType={item.lunaType} /></td>
                        <td className="px-5 py-4 text-slate-500 max-w-[220px] truncate" title={item.reason}>{item.reason}</td>
                        <td className="px-5 py-4 text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-center">
                          {item.alreadyAwarded ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-400">
                              <Check className="w-3 h-3" /> Awarded
                            </span>
                          ) : (
                            <button onClick={() => setAwardModal(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black bg-amber-400 hover:bg-amber-500 text-white cursor-pointer transition-all">
                              <Star className="w-3 h-3" /> Award
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="block md:hidden p-4 space-y-3">
                {eligibleFiltered.map(item => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-sm">{item.studentName}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{item.rollNo} • Grade {item.standard}</p>
                      </div>
                      <LunaBadge lunaType={item.lunaType} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">{item.reason}</p>
                    <div className="flex justify-end">
                      {item.alreadyAwarded ? (
                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" />Awarded</span>
                      ) : (
                        <button onClick={() => setAwardModal(item)} className="px-4 py-1.5 rounded-xl bg-amber-400 text-white text-[10px] font-black cursor-pointer flex items-center gap-1">
                          <Star className="w-3 h-3" />Award
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          history.length === 0 ? (
            <div className="p-16 text-center text-xs font-bold text-slate-400">No award history found for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    <th className="px-5 py-4">Date Awarded</th>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Grade</th>
                    <th className="px-5 py-4">Luna</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Awarded By</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
                  {history.map(award => (
                    <tr key={award._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-5 py-4 text-slate-400">{new Date(award.awardedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-black text-slate-800 dark:text-white">{award.studentId?.name || '-'}</td>
                      <td className="px-5 py-4 text-slate-500">Grade {award.studentId?.standard}</td>
                      <td className="px-5 py-4"><LunaBadge lunaType={award.lunaType} /></td>
                      <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate" title={award.reason}>{award.reason}</td>
                      <td className="px-5 py-4 text-slate-400 font-semibold">{award.awardedBy?.name || 'Teacher'}</td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => handleRevoke(award._id)}
                          className="px-3 py-1 rounded-xl text-[10px] font-black bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-100 dark:border-rose-500/20 cursor-pointer hover:bg-rose-100 transition-all">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LunaRewardsCenter;
