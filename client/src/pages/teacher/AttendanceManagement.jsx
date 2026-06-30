import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { 
  Users, CheckCircle2, XCircle, AlertCircle, Calendar, Search, Filter, 
  Download, ChevronLeft, ChevronRight, Award, Flame, TrendingUp,
  RefreshCw, ClipboardCheck, Sparkles, User, Info, FileSpreadsheet, Eye, Grid
} from 'lucide-react';
import { calculateAttendanceStats } from '../../utils/attendanceCalculator';

const AttendanceManagement = () => {
  // 1. Core State
  const [viewMode, setViewMode] = useState('register'); // 'register' or 'calendar'
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Date configuration
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed (1-12)
  const [activeDate, setActiveDate] = useState(now.toISOString().split('T')[0]); // For bulk/daily operations
  
  // Roster and Records
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]); // All records for the current month
  const [singleStudentStats, setSingleStudentStats] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [savingCell, setSavingCell] = useState(null); // { studentId, day }
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRollNo, setSearchRollNo] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [onlyAbsentees, setOnlyAbsentees] = useState(false);
  const [onlyToday, setOnlyToday] = useState(false);
  
  // Feedback
  const [toast, setToast] = useState(null);
  const [activeDetailStudent, setActiveDetailStudent] = useState(null);

  // Helper: show auto-expiring toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 2. Fetch Data
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch students list
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      // Fetch attendance records for selected month
      const attendanceRes = await api.get(`/attendance/month?year=${year}&month=${month}`);
      setAttendanceRecords(attendanceRes.data);

      // Set default selected student for calendar view if empty
      if (studentsRes.data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsRes.data[0]._id);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load roster or attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual student stats when entering calendar view or selecting a student
  const loadStudentStats = async (studentId) => {
    if (!studentId) return;
    try {
      const { data } = await api.get(`/attendance/student/${studentId}`);
      setSingleStudentStats(data);
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch student statistics.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, [year, month]);

  useEffect(() => {
    if (viewMode === 'calendar' && selectedStudentId) {
      loadStudentStats(selectedStudentId);
    }
  }, [viewMode, selectedStudentId, year, month]);

  // 3. Computed Date Values
  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);
  const monthName = useMemo(() => {
    return new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
  }, [year, month]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Index attendance records by studentId and day number for O(1) cell lookup
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach(record => {
      const d = new Date(record.date);
      // Ensure we offset timezones appropriately
      const dayNum = d.getUTCDate(); 
      const sId = record.studentId;
      if (!map[sId]) {
        map[sId] = {};
      }
      map[sId][dayNum] = record.status;
    });
    return map;
  }, [attendanceRecords]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRoll = searchRollNo 
        ? student.rollNo?.toLowerCase().includes(searchRollNo.toLowerCase()) 
        : true;
      const matchGrade = selectedGrade === 'all' 
        ? true 
        : student.standard === parseInt(selectedGrade);
      
      // Filter by today's attendance status
      const todayDay = new Date(activeDate).getDate();
      const todayStatus = attendanceMap[student._id]?.[todayDay];
      
      const matchAbsentees = onlyAbsentees 
        ? todayStatus === 'absent' 
        : true;
        
      const matchTodayMarked = onlyToday 
        ? !!todayStatus 
        : true;

      return matchName && matchRoll && matchGrade && matchAbsentees && matchTodayMarked;
    });
  }, [students, searchTerm, searchRollNo, selectedGrade, onlyAbsentees, onlyToday, activeDate, attendanceMap]);

  // Monthly summary metrics for filtered cohort
  const metrics = useMemo(() => {
    const targetDay = new Date(activeDate).getDate();
    let total = filteredStudents.length;
    let present = 0;
    let absent = 0;
    let holiday = 0;

    filteredStudents.forEach(student => {
      const status = attendanceMap[student._id]?.[targetDay];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'holiday') holiday++;
    });

    const unmarked = total - (present + absent + holiday);
    const active = present + absent; // Only Present or Absent count towards active working days
    const rate = active > 0 ? parseFloat(((present / active) * 100).toFixed(2)) : 100.00;

    return { total, present, absent, holiday, unmarked, rate };
  }, [filteredStudents, attendanceMap, activeDate]);

  // Compute Global Working Days (dates where at least one student is present or absent)
  const globalWorkingDays = useMemo(() => {
    const workingDays = new Set();
    attendanceRecords.forEach(r => {
      if (r.status === 'present' || r.status === 'absent') {
        const d = new Date(r.date);
        const dateStr = d.toISOString().split('T')[0];
        workingDays.add(dateStr);
      }
    });
    return workingDays;
  }, [attendanceRecords]);

  // 4. Cycle Attendance Cell Status (Auto-Save)
  const cycleStatus = async (studentId, dayNum) => {
    const currentStatus = attendanceMap[studentId]?.[dayNum];
    let nextStatus;

    // Cycle: Not Marked (undefined) -> present -> absent -> holiday -> Not Marked (not_marked)
    if (!currentStatus) nextStatus = 'present';
    else if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'holiday';
    else nextStatus = 'not_marked';

    // Format date string for saving
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    // Optimistic UI update
    setSavingCell({ studentId, day: dayNum });
    const originalRecords = [...attendanceRecords];

    setAttendanceRecords(prev => {
      // Remove previous entry for this student and date
      const filtered = prev.filter(r => {
        const rDay = new Date(r.date).getUTCDate();
        return !(r.studentId === studentId && rDay === dayNum);
      });

      if (nextStatus === 'not_marked') {
        return filtered;
      } else {
        return [
          ...filtered,
          {
            studentId,
            date: new Date(dateStr),
            status: nextStatus
          }
        ];
      }
    });

    try {
      const res = await api.post('/attendance/single', {
        studentId,
        date: dateStr,
        status: nextStatus
      });

      if (res.data.deleted) {
        showToast('Attendance cleared.', 'info');
      } else {
        showToast(`Attendance marked as ${nextStatus}.`);
      }
      
      // Auto-refresh the single student statistics if they are currently being viewed
      if (viewMode === 'calendar' && selectedStudentId === studentId) {
        loadStudentStats(studentId);
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setAttendanceRecords(originalRecords);
      showToast('Connection issue. Could not update attendance.', 'error');
    } finally {
      setSavingCell(null);
    }
  };

  // 5. Bulk Operations
  const handleBulkAction = async (action) => {
    setBulkSubmitting(true);
    try {
      const res = await api.post('/attendance/bulk-ops', {
        action,
        date: activeDate,
        standard: selectedGrade
      });
      showToast(res.data.message);
      // Reload month logs
      const attendanceRes = await api.get(`/attendance/month?year=${year}&month=${month}`);
      setAttendanceRecords(attendanceRes.data);
      
      if (selectedStudentId) {
        loadStudentStats(selectedStudentId);
      }
    } catch (error) {
      console.error(error);
      showToast('Bulk update failed.', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  // 6. Navigation Helpers
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  // 7. Export Roster Logic
  const handleExportCSV = () => {
    try {
      let headers = ['Roll No', 'Student Name', 'Grade', ...daysArray.map(d => `Day ${d}`), 'Working Days', 'Present', 'Absent', 'Holidays', 'Attendance %'];
      let rows = filteredStudents.map(student => {
        const studentDays = daysArray.map(day => {
          const status = attendanceMap[student._id]?.[day];
          if (status === 'present') return 'P';
          if (status === 'absent') return 'A';
          if (status === 'holiday') return 'H';
          return '-';
        });

        // Compute student attendance rate and statistics for this month using shared utility
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const marked = attendanceRecords.filter(r => r.studentId === student._id);
        const stats = calculateAttendanceStats(marked, student.joiningDate, { startDate: startOfMonth, endDate: endOfMonth }, globalWorkingDays);

        return [
          student.rollNo || '-',
          student.name,
          `Grade ${student.standard}`,
          ...studentDays,
          stats.totalWorkingDays,
          stats.presentDays,
          stats.absentDays,
          stats.holidayDays,
          `${stats.attendancePercentage.toFixed(2)}%`
        ];
      });

      const csvContent = 
        'data:text/csv;charset=utf-8,' + 
        [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Luna_Attendance_Register_${monthName}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV report generated and downloaded.');
    } catch (e) {
      showToast('Export failed.', 'error');
    }
  };



  // 8. Style mapping for status color badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20';
      case 'absent':
        return 'bg-rose-500 text-white dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20';
      case 'holiday':
        return 'bg-sky-500 text-white dark:bg-sky-500/20 dark:text-sky-400 border-sky-500/20';
      default:
        return 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 border-slate-200 dark:border-white/5';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'P';
      case 'absent': return 'A';
      case 'holiday': return 'H';
      default: return '-';
    }
  };

  // Calendar mode helper: Grid of days Sunday-Saturday for single student view
  const renderCalendarDaysGrid = () => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0: Sun, 1: Mon...
    const gridCells = [];
    
    // Add empty slots for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      gridCells.push(<div key={`empty-${i}`} className="h-14 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-transparent"></div>);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = attendanceMap[selectedStudentId]?.[day];
      const isToday = now.getDate() === day && now.getMonth() + 1 === month && now.getFullYear() === year;

      gridCells.push(
        <button
          key={`day-${day}`}
          onClick={() => cycleStatus(selectedStudentId, day)}
          className={`h-14 relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 text-left font-semibold ${
            status ? getStatusColor(status) : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-350 border-slate-150 dark:border-white/5 hover:border-luna-blue'
          } ${isToday ? 'ring-2 ring-luna-blue ring-offset-2 dark:ring-offset-[#0f172a]' : ''}`}
        >
          <span className="text-[10px] self-start leading-none opacity-80">{day}</span>
          <span className="text-sm font-extrabold tracking-wide uppercase">{getStatusText(status)}</span>
        </button>
      );
    }

    return gridCells;
  };

  // Compute graph data for Single Student Profile (last 6 months overview)
  const statsOverview = useMemo(() => {
    if (!singleStudentStats || !singleStudentStats.records) return [];
    
    const monthsNameShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const studentObj = students.find(s => s._id === selectedStudentId);

    // Build a working days set from the student's own records so the chart works across all months
    const studentWorkingDays = new Set(
      singleStudentStats.records
        .filter(r => r.status === 'present' || r.status === 'absent')
        .map(r => new Date(r.date).toISOString().split('T')[0])
    );

    return monthsNameShort.map((name, index) => {
      const startOfMonth = new Date(currentYear, index, 1);
      const endOfMonth = new Date(currentYear, index + 1, 0, 23, 59, 59, 999);

      const monthlyRecords = singleStudentStats.records.filter(r => {
        const d = new Date(r.date);
        return d >= startOfMonth && d <= endOfMonth;
      });

      const stats = calculateAttendanceStats(monthlyRecords, studentObj?.joiningDate, { startDate: startOfMonth, endDate: endOfMonth }, studentWorkingDays);
      const active = stats.totalWorkingDays > 0;

      return { 
        month: name, 
        rate: active ? stats.attendancePercentage : 100.00, 
        active 
      };
    });
  }, [singleStudentStats, students, selectedStudentId]);

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-[1600px] mx-auto w-full relative">
      
      {/* Toast Alert overlay */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border font-bold text-sm ${
            toast.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/90 text-red-600 dark:text-red-300 border-red-200 dark:border-red-900/50' 
              : toast.type === 'info'
              ? 'bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800'
              : 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-600 dark:text-emerald-300 border-emerald-250 dark:border-emerald-900/50'
          }`}>
            {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5 text-emerald-500" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-luna-blue dark:text-luna-gold text-xs font-black uppercase tracking-wider">
            <ClipboardCheck className="w-4 h-4" />
            Attendance Module Redesign
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Tuition Attendance Register</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Auto-saves records instantly. Click on any date cell to update attendance logs.
          </p>
        </div>

        {/* View Mode & Date Selection Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Mode Switcher */}
          <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('register')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Register View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>

          {/* Month selector wheel */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/20 rounded-2xl p-1">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="px-3 text-xs font-black text-slate-800 dark:text-white min-w-[100px] text-center uppercase tracking-wide">
              {monthName} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Class Size</span>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white">{metrics.total}</h3>
          </div>
          <div className="absolute right-4 top-5 w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Present Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Present Today</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.present}</h3>
          </div>
          <div className="absolute right-4 top-5 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-505 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Absent Today</span>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.absent}</h3>
          </div>
          <div className="absolute right-4 top-5 w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <XCircle className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* Working Days Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Working Days</span>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{globalWorkingDays.size}</h3>
          </div>
          <div className="absolute right-4 top-5 w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Holiday Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Holiday Today</span>
            <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400">{metrics.holiday}</h3>
          </div>
          <div className="absolute right-4 top-5 w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Attendance Rate</span>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{Number(metrics.rate).toFixed(2)}%</h3>
          </div>
          <div className="absolute right-4 top-5 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-550 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Legend & Daily Action Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl">
        {/* Quick Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-650 dark:text-slate-350">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Holiday</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> Unmarked</span>
        </div>

        {/* Selected target date for daily/bulk actions */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Date for Daily Action:</span>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="bg-white dark:bg-slate-700 border border-slate-250 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-luna-blue"
          />
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {/* Search by Name */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 pl-9 pr-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue dark:text-white"
            />
          </div>

          {/* Search by Roll No */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Roll No..."
              value={searchRollNo}
              onChange={(e) => setSearchRollNo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 pl-9 pr-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue dark:text-white"
            />
          </div>

          {/* Select Grade */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue dark:text-white appearance-none"
            >
              <option value="all">All Grades</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
            </select>
          </div>

          {/* Filter Status Checks */}
          <div className="flex items-center gap-4 pl-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-650 dark:text-slate-350">
              <input
                type="checkbox"
                checked={onlyAbsentees}
                onChange={(e) => setOnlyAbsentees(e.target.checked)}
                className="rounded border-slate-300 text-luna-blue focus:ring-luna-blue w-4 h-4"
              />
              Absentees Only
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-650 dark:text-slate-350">
              <input
                type="checkbox"
                checked={onlyToday}
                onChange={(e) => setOnlyToday(e.target.checked)}
                className="rounded border-slate-300 text-luna-blue focus:ring-luna-blue w-4 h-4"
              />
              Marked Today
            </label>
          </div>
        </div>

        {/* Export / Report Actions */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer"
            title="Download CSV report"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            CSV Export
          </button>

        </div>
      </div>

      {/* Bulk Operations Roster Panel */}
      {viewMode === 'register' && (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulk Class Actions ({new Date(activeDate).toLocaleDateString()}):</span>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('mark_all_present')}
              disabled={bulkSubmitting}
              className="px-3.5 py-2 bg-emerald-550/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black transition-all border border-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              Mark Entire Class Present
            </button>
            
            <button
              onClick={() => handleBulkAction('mark_holiday')}
              disabled={bulkSubmitting}
              className="px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 rounded-xl text-xs font-black transition-all border border-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              Mark Holiday
            </button>

            <button
              onClick={() => handleBulkAction('copy_yesterday')}
              disabled={bulkSubmitting}
              className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition-all border border-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              Copy Yesterday's Attendance
            </button>

            <button
              onClick={() => handleBulkAction('reset_today')}
              disabled={bulkSubmitting}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black transition-all border border-rose-500/20 disabled:opacity-50 cursor-pointer"
            >
              Reset Today's Attendance
            </button>
          </div>
          
          {bulkSubmitting && <RefreshCw className="w-4 h-4 animate-spin text-luna-blue ml-auto" />}
        </div>
      )}

      {/* 9. MAIN CONTENT VIEWS */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-3xl p-16 text-center text-slate-450 font-semibold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-10 h-10 animate-spin text-luna-blue" />
          <span className="text-sm">Synchronizing tuition logs register...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-3xl p-16 text-center text-slate-400 font-semibold">
          No students registered in the tuition center roster.
        </div>
      ) : viewMode === 'register' ? (
        /* ==================== REGISTER GRID VIEW ==================== */
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-4 sticky left-0 bg-slate-50 dark:bg-[#0f172a] z-10 min-w-[200px] border-r border-slate-200/40 dark:border-white/5">Student Details</th>
                  <th className="px-4 py-4 text-center border-r border-slate-200/40 dark:border-white/5">%</th>
                  {daysArray.map((day) => {
                    const isToday = now.getDate() === day && now.getMonth() + 1 === month && now.getFullYear() === year;
                    const dateObj = new Date(year, month - 1, day);
                    const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    return (
                      <th 
                        key={`th-day-${day}`} 
                        className={`p-1.5 text-center min-w-[38px] border-r border-slate-200/40 dark:border-white/5 ${isToday ? 'bg-luna-blue/5 text-luna-blue' : ''}`}
                      >
                        <div className="text-xs font-black">{day}</div>
                        <div className={`text-[8px] uppercase tracking-wider font-bold mt-0.5 ${isToday ? 'text-luna-blue opacity-80' : 'text-slate-400'}`}>{weekdayShort}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm font-semibold text-slate-600">
                {filteredStudents.map((student) => {
                  // Compute student attendance rate and statistics for this month using shared utility
                  const startOfMonth = new Date(year, month - 1, 1);
                  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
                  const marked = attendanceRecords.filter(r => r.studentId === student._id);
                  const stats = calculateAttendanceStats(marked, student.joiningDate, { startDate: startOfMonth, endDate: endOfMonth }, globalWorkingDays);
                  const studentRate = stats.attendancePercentage;

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      {/* Name / Info card (Sticky) */}
                      <td className="px-6 py-3.5 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200/40 dark:border-white/5">
                        <button 
                          onClick={() => {
                            setSelectedStudentId(student._id);
                            setViewMode('calendar');
                          }}
                          className="flex flex-col text-left hover:opacity-80 transition-opacity cursor-pointer py-1"
                        >
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {student.name}
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                              {student.rollNo || 'N/A'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Grade {student.standard}</div>
                        </button>
                      </td>

                      {/* Percentage pill */}
                      <td className="px-4 py-3.5 text-center border-r border-slate-200/40 dark:border-white/5">
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                          studentRate >= 90 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : studentRate >= 75 
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-650 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}>
                          {studentRate.toFixed(2)}%
                        </span>
                      </td>

                      {/* Register Cell Day Blocks */}
                      {daysArray.map((day) => {
                        const status = attendanceMap[student._id]?.[day];
                        const isSaving = savingCell?.studentId === student._id && savingCell?.day === day;

                        return (
                          <td key={`cell-${student._id}-${day}`} className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => cycleStatus(student._id, day)}
                              className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-black transition-all border shadow-sm cursor-pointer ${
                                isSaving 
                                  ? 'bg-slate-200 animate-pulse text-slate-500' 
                                  : getStatusColor(status)
                              } hover:scale-110`}
                            >
                              {isSaving ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                              ) : (
                                getStatusText(status)
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Register (Accordion / Stack list) */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
            {filteredStudents.map((student) => {
              const startOfMonth = new Date(year, month - 1, 1);
              const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
              const marked = attendanceRecords.filter(r => r.studentId === student._id);
              const stats = calculateAttendanceStats(marked, student.joiningDate, { startDate: startOfMonth, endDate: endOfMonth }, globalWorkingDays);
              const studentRate = stats.attendancePercentage;

              return (
                <div key={`mob-${student._id}`} className="p-4 space-y-3 bg-white dark:bg-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {student.name}
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                          {student.rollNo || 'N/A'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Grade {student.standard}</div>
                    </div>

                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                      studentRate >= 90 ? 'bg-emerald-50 text-emerald-600 shadow-sm' : studentRate >= 75 ? 'bg-amber-50 text-amber-600 shadow-sm' : 'bg-rose-50 text-rose-600 shadow-sm'
                    }`}>
                      {studentRate.toFixed(2)}%
                    </span>
                  </div>

                  {/* Horizontal scrolling days for mobile row */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1 border-t border-slate-100 dark:border-white/5">
                    {daysArray.map((day) => {
                      const status = attendanceMap[student._id]?.[day];
                      const isToday = now.getDate() === day && now.getMonth() + 1 === month && now.getFullYear() === year;

                      return (
                        <button
                          key={`mob-day-${student._id}-${day}`}
                          onClick={() => cycleStatus(student._id, day)}
                          className={`flex-shrink-0 flex flex-col items-center gap-1 p-1.5 min-w-[38px] rounded-lg border cursor-pointer ${
                            status ? getStatusColor(status) : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-450 border-slate-200/50 dark:border-white/5'
                          } ${isToday ? 'ring-1 ring-luna-blue' : ''}`}
                        >
                          <span className="text-[9px] font-bold opacity-60 leading-none">{day}</span>
                          <span className="text-xs font-black uppercase">{getStatusText(status)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== CALENDAR VIEW MODE ==================== */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left panel student roster list */}
          <div className="xl:col-span-4 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Student</h3>
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 pl-9 pr-4 py-1.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue dark:text-white"
              />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map((student) => {
                const isSelected = student._id === selectedStudentId;
                return (
                  <button
                    key={`list-${student._id}`}
                    onClick={() => setSelectedStudentId(student._id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-luna-blue/5 dark:bg-slate-700/60 text-luna-blue border-l border-luna-blue shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="text-left">
                      <div className={`font-extrabold text-xs ${isSelected ? 'text-luna-blue dark:text-luna-gold' : 'text-slate-800 dark:text-white'}`}>
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        {student.rollNo || 'N/A'} • Grade {student.standard}
                      </div>
                    </div>
                    <Eye className={`w-4 h-4 ${isSelected ? 'opacity-100 text-luna-blue dark:text-luna-gold' : 'opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel monthly calendar display with stats */}
          <div className="xl:col-span-8 space-y-6">
            {selectedStudentId && singleStudentStats ? (
              <>
                {/* Stats cards for active student */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Streak Card */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-2xl text-white relative overflow-hidden shadow-md">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block">Max Present Streak</span>
                      <h4 className="text-3xl font-black">{singleStudentStats.stats.longestStreak || 0} Days</h4>
                    </div>
                    <Flame className="w-12 h-12 text-white/20 absolute right-4 bottom-2 fill-current animate-pulse" />
                  </div>

                  {/* Present Count */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Presents</span>
                      <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{singleStudentStats.stats.presentDays || 0}</h4>
                    </div>
                    <Award className="w-8 h-8 text-emerald-500/10 absolute right-4 top-5" />
                  </div>

                  {/* Absents Count */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Absents</span>
                      <h4 className="text-2xl font-black text-rose-605 dark:text-rose-400">{singleStudentStats.stats.absentDays || 0}</h4>
                    </div>
                    <XCircle className="w-8 h-8 text-rose-500/10 absolute right-4 top-5" />
                  </div>

                  {/* Overall Percentage */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Overall Attendance %</span>
                      <h4 className="text-2xl font-black text-indigo-650 dark:text-indigo-400">{singleStudentStats.stats.percentage}%</h4>
                    </div>
                    <TrendingUp className="w-8 h-8 text-indigo-500/10 absolute right-4 top-5" />
                  </div>
                </div>

                {/* Calendar Layout */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Monthly Calendar view</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400">Click any block to change attendance status.</p>
                    </div>
                    
                    <span className="text-xs font-black px-3.5 py-1.5 bg-slate-105 dark:bg-white/5 text-slate-800 dark:text-slate-350 rounded-xl uppercase tracking-wider">
                      {monthName} {year}
                    </span>
                  </div>

                  {/* Calendar Grid of days */}
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {/* Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
                        {d}
                      </div>
                    ))}
                    {/* Days blocks */}
                    {renderCalendarDaysGrid()}
                  </div>
                </div>

                {/* Monthly and Yearly Distribution Graph Panel */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1">Monthly Analytics</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Attendance percentage rating over the year.</p>

                  <div className="space-y-4">
                    {statsOverview.map((item) => (
                      <div key={item.month} className="flex items-center gap-4 text-xs font-bold">
                        <span className="w-10 text-left text-slate-550 dark:text-slate-400">{item.month}</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden relative border border-transparent dark:border-white/5">
                          <div 
                            style={{ width: `${item.active ? item.rate : 0}%` }} 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.rate >= 90 
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
                                : item.rate >= 75 
                                ? 'bg-gradient-to-r from-amber-400 to-orange-550' 
                                : 'bg-gradient-to-r from-rose-400 to-red-500'
                            }`}
                          ></div>
                        </div>
                        <span className={`w-10 text-right ${item.active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                          {item.active ? `${item.rate}%` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-3xl p-16 text-center text-slate-400 font-semibold">
                Select a student from the roster list to view calendar logs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
