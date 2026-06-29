import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { 
  Search, Calendar, RefreshCw, CheckCircle2, 
  ChevronLeft, ChevronRight, PenTool, XCircle, Circle, Award
} from 'lucide-react';

const HandwritingManagement = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('2-line');
  
  const [students, setStudents] = useState([]);
  const [handwritingRecords, setHandwritingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCells, setSavingCells] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, hwRes] = await Promise.all([
        api.get('/students'),
        api.get(`/handwriting/month?year=${year}&month=${month}&type=${activeTab}`)
      ]);
      // Only keep Grade 1-5 students! (Handwriting is ONLY for grades 1-5 now)
      setStudents(studentsRes.data.filter(s => s.standard >= 1 && s.standard <= 5));
      if (hwRes.data && hwRes.data.records) {
        setHandwritingRecords(hwRes.data.records);
      } else {
        setHandwritingRecords(hwRes.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [year, month, activeTab]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedGrade !== 'all' && s.standard !== parseInt(selectedGrade)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) || 
          s.rollNumber.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }, [students, selectedGrade, searchQuery]);

  // Generate days array for the selected month/year
  const daysInMonth = useMemo(() => {
    const days = new Date(year, month, 0).getDate();
    const arr = [];
    for (let i = 1; i <= days; i++) {
      const d = new Date(year, month - 1, i);
      const isSunday = d.getDay() === 0;
      const isFuture = d > currentDate;
      // Format as YYYY-MM-DD local
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      arr.push({ date: i, dateStr, isSunday, isFuture });
    }
    return arr;
  }, [year, month]);

  // Map format: hwMap[studentId][dateStr] = status
  const hwMap = useMemo(() => {
    const map = {};
    handwritingRecords.forEach(r => {
      if (!map[r.studentId]) map[r.studentId] = {};
      const dObj = new Date(r.date);
      const dateStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
      map[r.studentId][dateStr] = r.status;
    });
    return map;
  }, [handwritingRecords]);

  // Identify global working days in this month (Monday-Friday + any tracked days)
  const globalWorkingDaysSet = useMemo(() => {
    const days = new Set();
    
    // 1. Add all Mon-Fri days in the selected month
    daysInMonth.forEach(dayInfo => {
      const dObj = new Date(year, month - 1, dayInfo.date);
      const dayOfWeek = dObj.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
        days.add(dayInfo.dateStr);
      }
    });

    // 2. Add any tracked days (even if Saturday)
    handwritingRecords.forEach(r => {
      const dObj = new Date(r.date);
      const dateStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
      days.add(dateStr);
    });

    return days;
  }, [daysInMonth, handwritingRecords, year, month]);

  const studentStats = useMemo(() => {
    const stats = {};
    
    const weeksInMonth = [];
    let currentWeek = [];
    daysInMonth.forEach(dayInfo => {
      currentWeek.push(dayInfo);
      const d = new Date(year, month - 1, dayInfo.date);
      if (d.getDay() === 6 || dayInfo.date === daysInMonth.length) {
        weeksInMonth.push(currentWeek);
        currentWeek = [];
      }
    });

    filteredStudents.forEach(s => {
      let completed = 0;
      let notCompleted = 0;
      let totalAssigned = 0;
      let eligibleWeeks = 0;

      weeksInMonth.forEach(week => {
        const tuitionDays = week.filter(d => {
          const dObj = new Date(year, month - 1, d.date);
          return dObj.getDay() >= 1 && dObj.getDay() <= 5; // Weekly eligibility is Mon-Fri only
        });
        let hasFuture = false;
        let isFullyCompleted = true;
        let workingDaysInThisWeek = 0;

        tuitionDays.forEach(dayInfo => {
          if (dayInfo.isFuture) hasFuture = true;
          
          if (globalWorkingDaysSet.has(dayInfo.dateStr)) {
            workingDaysInThisWeek++;
            const status = hwMap[s._id]?.[dayInfo.dateStr];
            if (status !== 'completed') {
              isFullyCompleted = false;
            }
          }
        });

        // The week is evaluated ONLY if it's not in the future.
        // It's eligible ONLY if all global working days in this week were completed by the student.
        // And there must be at least one working day to count as an eligible week.
        if (!hasFuture && workingDaysInThisWeek > 0 && isFullyCompleted) {
          eligibleWeeks++;
        }
      });

      daysInMonth.forEach(dayInfo => {
        const { dateStr } = dayInfo;
        const status = hwMap[s._id]?.[dateStr];
        
        if (globalWorkingDaysSet.has(dateStr)) {
          totalAssigned++;
        }

        if (status === 'completed') completed++;
        else if (status === 'not_completed') notCompleted++;
      });
      
      const percentage = totalAssigned > 0 ? Math.min(100, Math.round((completed / totalAssigned) * 100)) : 100;
      stats[s._id] = { completed, notCompleted, percentage, totalAssigned, eligibleWeeks };
    });
    return stats;
  }, [filteredStudents, daysInMonth, hwMap, globalWorkingDaysSet, year, month]);

  const overallStats = useMemo(() => {
    if (filteredStudents.length === 0) return { avg: 0, high: 0, low: 0, compToday: 0, pendToday: 0, wd: 0 };
    let totalComp = 0;
    let high = -1;
    let low = 101;
    let compToday = 0;
    let notCompToday = 0;
    
    const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    filteredStudents.forEach(s => {
      const p = studentStats[s._id].percentage;
      totalComp += p;
      if (p > high) high = p;
      if (p < low) low = p;

      const todayStatus = hwMap[s._id]?.[todayStr];
      if (todayStatus === 'completed') compToday++;
      if (todayStatus === 'not_completed') notCompToday++;
    });

    return {
      avg: Math.round(totalComp / filteredStudents.length),
      high: high === -1 ? 0 : high,
      low: low === 101 ? 0 : low,
      compToday,
      notCompToday,
      wd: globalWorkingDaysSet.size
    };
  }, [filteredStudents, studentStats, hwMap, globalWorkingDaysSet, currentDate]);

  const handleCellClick = async (studentId, dateStr, isSunday, isFuture) => {
    const cellKey = `${studentId}-${dateStr}`;
    if (savingCells[cellKey] || isSunday || isFuture) return; 
    
    const currentStatus = hwMap[studentId]?.[dateStr] || 'not_checked';
    
    let nextStatus = 'completed';
    if (currentStatus === 'completed') nextStatus = 'not_completed';
    else if (currentStatus === 'not_completed') nextStatus = 'not_checked';

    const originalRecords = [...handwritingRecords];
    let newRecords = [...handwritingRecords];
    
    const existingIndex = newRecords.findIndex(r => {
      if (r.studentId !== studentId) return false;
      const dObj = new Date(r.date);
      const rDateStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
      return rDateStr === dateStr;
    });
    
    if (existingIndex !== -1) {
      if (nextStatus === 'not_checked') {
         newRecords.splice(existingIndex, 1);
      } else {
         newRecords[existingIndex] = { ...newRecords[existingIndex], status: nextStatus };
      }
    } else {
      if (nextStatus !== 'not_checked') {
        const fakeDate = new Date(`${dateStr}T12:00:00.000Z`);
        newRecords.push({ studentId, date: fakeDate.toISOString(), status: nextStatus });
      }
    }
    
    setHandwritingRecords(newRecords);
    setSavingCells(prev => ({ ...prev, [cellKey]: true }));

    try {
      await api.post('/handwriting/single', {
        studentId,
        date: dateStr,
        status: nextStatus,
        type: activeTab
      });
    } catch (error) {
      console.error(error);
      setHandwritingRecords(originalRecords); 
    } finally {
      setSavingCells(prev => ({ ...prev, [cellKey]: false }));
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />;
    if (status === 'not_completed') return <XCircle className="w-4 h-4 text-rose-500 mx-auto" />;
    return null;
  };

  const getStatusColor = (status, isWorkingDay) => {
    if (status === 'completed') return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 shadow-sm';
    if (status === 'not_completed') return 'bg-rose-50 hover:bg-rose-100 border-rose-200 shadow-sm';
    return 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm';
  };

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-full mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-luna-blue">Daily Handwriting Register</h1>
          <p className="text-sm text-slate-500 font-semibold mt-0.5 flex items-center gap-2">
            Track daily handwriting completion for Grade 1-5 students.
          </p>
        </div>
        
        {/* Month Picker */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 font-bold text-slate-800 min-w-[140px] text-center">
            {monthNames[month - 1]} {year}
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('2-line')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${
            activeTab === '2-line' 
              ? 'bg-white text-orange-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          2-Line Register
        </button>
        <button
          onClick={() => setActiveTab('4-line')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${
            activeTab === '4-line' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          4-Line Register
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Students</span>
          <h4 className="text-2xl font-black text-slate-800">{filteredStudents.length}</h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Working Days</span>
          <h4 className="text-2xl font-black text-slate-800">{overallStats.wd}</h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Completed Today</span>
          <h4 className="text-2xl font-black text-emerald-600">{overallStats.compToday}</h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Missed Today</span>
          <h4 className="text-2xl font-black text-rose-600">{overallStats.notCompToday}</h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-luna-blue uppercase tracking-widest block mb-1">Avg Completion</span>
          <h4 className="text-2xl font-black text-luna-blue">{overallStats.avg}%</h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">High Completion</span>
          <h4 className="text-2xl font-black text-slate-800">{overallStats.high}%</h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Low Completion</span>
          <h4 className="text-2xl font-black text-slate-800">{overallStats.low}%</h4>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search Student or Roll No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-luna-blue text-sm font-semibold"
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-luna-blue text-sm font-semibold cursor-pointer"
          >
            <option value="all">All Grades (1-5)</option>
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-500" /> Missed
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="w-4 h-4 text-slate-300" /> Not Checked
          </div>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
            <span>Loading daily handwriting register...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold">
            {searchQuery ? 'No students found matching your search.' : 'No Grade 1-5 students registered.'}
          </div>
        ) : (
          <div className="overflow-auto relative">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">
                  <th className="px-4 py-4 sticky left-0 z-30 bg-slate-50/95 backdrop-blur-sm min-w-[200px] border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Student Details
                  </th>
                  {daysInMonth.map((day) => (
                    <th key={day.date} className={`px-1 py-4 text-center min-w-[44px] ${
                      day.isSunday ? 'bg-red-50/50 text-red-400' : 
                      day.isFuture ? 'text-slate-300' : 
                      globalWorkingDaysSet.has(day.dateStr) ? 'text-luna-blue' : ''
                    }`}>
                      <div className="flex flex-col items-center gap-1">
                        <span>{day.date}</span>
                        {globalWorkingDaysSet.has(day.dateStr) && (
                          <div className="w-1 h-1 rounded-full bg-luna-blue"></div>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center sticky right-0 z-30 bg-slate-50/95 backdrop-blur-sm border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    %
                  </th>
                  <th className="px-4 py-4 text-center sticky right-0 z-30 bg-slate-50/95 backdrop-blur-sm border-l border-slate-100">
                    Weekly Eligibility
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-semibold text-slate-600">
                {filteredStudents.map((student) => {
                  const stats = studentStats[student._id];
                  
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 truncate max-w-[180px]">{student.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                            {student.rollNumber}
                          </span>
                        </div>
                      </td>
                      
                      {daysInMonth.map(dayInfo => {
                        const status = hwMap[student._id]?.[dayInfo.dateStr];
                        const isSaving = savingCells[`${student._id}-${dayInfo.dateStr}`];
                        const isWorkingDay = globalWorkingDaysSet.has(dayInfo.dateStr);
                        
                        return (
                          <td key={dayInfo.date} className={`px-1 py-2 ${
                            dayInfo.isSunday ? 'bg-red-50/30' : 
                            dayInfo.isFuture ? 'bg-slate-50/30' : ''
                          }`}>
                            <button
                              onClick={() => handleCellClick(student._id, dayInfo.dateStr, dayInfo.isSunday, dayInfo.isFuture)}
                              disabled={isSaving || dayInfo.isSunday || dayInfo.isFuture}
                              title={dayInfo.isSunday ? 'Sunday' : dayInfo.isFuture ? 'Future Date' : ''}
                              className={`w-9 h-9 mx-auto rounded-lg border transition-all flex justify-center items-center ${getStatusColor(status, isWorkingDay)} ${
                                isSaving ? 'opacity-50' : 
                                (dayInfo.isSunday || dayInfo.isFuture) ? 'cursor-not-allowed opacity-50 bg-transparent border-transparent' : 
                                'cursor-pointer active:scale-95'
                              }`}
                            >
                              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin text-slate-400" /> : getStatusIcon(status)}
                            </button>
                          </td>
                        );
                      })}

                      <td className="px-4 py-3 text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.02)]">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-xs border-[3px] ${
                          stats.percentage === 100 && stats.totalAssigned > 0 ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                          stats.percentage >= 50 ? 'border-amber-100 text-amber-600 bg-amber-50' :
                          stats.totalAssigned === 0 ? 'border-slate-100 text-slate-400 bg-slate-50' :
                          'border-rose-100 text-rose-600 bg-rose-50'
                        }`}>
                          {stats.totalAssigned === 0 ? '-' : `${stats.percentage}%`}
                        </div>
                      </td>

                      <td className="px-4 py-3 sticky right-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100">
                        {stats.eligibleWeeks > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 ${activeTab === '2-line' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'} border rounded-md text-[9px] font-bold uppercase tracking-widest whitespace-nowrap`}>
                            <Award className="w-3 h-3" /> {stats.eligibleWeeks} {stats.eligibleWeeks === 1 ? 'Week' : 'Weeks'} Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-md text-[9px] font-bold uppercase tracking-widest">
                            Not Eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandwritingManagement;
