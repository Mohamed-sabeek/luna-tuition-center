import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { 
  Calendar, Check, XCircle, FileSpreadsheet,
  TrendingUp, Search, Eye, ClipboardCheck, GraduationCap, Award
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const subjects = [
  'Tamil', 'English', 'Maths', 'Science', 'Social Science'
];

const TestManagement = () => {
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [standard, setStandard] = useState('all');
  const [subject, setSubject] = useState('Tamil');

  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [marksMap, setMarksMap] = useState({}); 
  const [savingStatus, setSavingStatus] = useState({}); 
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [studentProfileData, setStudentProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      const [yearStr, monthStr] = month.split('-');
      const queryParams = new URLSearchParams({
        year: yearStr,
        month: monthStr,
        grade: standard,
        subject,
      });

      const { data } = await api.get(`/tests/monthly?${queryParams.toString()}`);
      setStudents(data.students || []);
      setTests(data.tests || []);

      const initialMap = {};
      if (data.tests && Array.isArray(data.tests)) {
        data.tests.forEach(t => {
          const d = new Date(t.date).getDate();
          initialMap[`${t.studentId}-${d}`] = t.marksObtained.toString();
        });
      }
      setMarksMap(initialMap);
    } catch (e) {
      showToast('Failed to load monthly register.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month && standard && subject) {
      loadMonthlyData();
    }
  }, [month, standard, subject]);

  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const days = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, monthNum - 1, i);
      const dayOfWeek = d.getDay();
      
      // Determine default display maxMarks for the header
      let displayMaxMarks = 0;
      if (dayOfWeek >= 1 && dayOfWeek <= 5) displayMaxMarks = 10;
      else if (dayOfWeek === 6) {
        if (standard === 'all') displayMaxMarks = 'Var';
        else if (standard >= 1 && standard <= 5) displayMaxMarks = 20;
        else if (standard >= 6 && standard <= 7) displayMaxMarks = 30;
        else displayMaxMarks = 40;
      }
      
      arr.push({
        day: i,
        date: d,
        dayOfWeek,
        isHoliday: dayOfWeek === 0,
        displayMaxMarks,
        weekdayShort: d.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return arr;
  }, [year, monthNum, daysInMonth, standard]);

  const saveMarkOnServer = async (studentId, d, marksValue) => {
    const cellKey = `${studentId}-${d.day}`;
    const valToSend = marksValue === '' ? '' : Number(marksValue);
    const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    
    setSavingStatus(prev => ({ ...prev, [cellKey]: 'saving' }));
    
    try {
      await api.post('/tests/save-mark', {
        studentId,
        date: dateStr,
        subject,
        marksObtained: valToSend,
        isMakeUp: false
      });
      setSavingStatus(prev => ({ ...prev, [cellKey]: 'saved' }));
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [cellKey]: null }));
      }, 2000);
    } catch (err) {
      setSavingStatus(prev => ({ ...prev, [cellKey]: 'error' }));
      const errMsg = err.response?.data?.message || 'Autosave failed.';
      showToast(errMsg, 'error');
    }
  };

  const handleMarkChange = (studentId, d, value) => {
    if (value !== '') {
      const num = Number(value);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) return;
      
      // Check individual student's maxMarks
      const student = students.find(s => s._id === studentId);
      let maxMarksForStudent = 0;
      if (d.dayOfWeek >= 1 && d.dayOfWeek <= 5) maxMarksForStudent = 10;
      else if (d.dayOfWeek === 6 && student) {
        const std = student.standard;
        if (std >= 1 && std <= 5) maxMarksForStudent = 20;
        else if (std >= 6 && std <= 7) maxMarksForStudent = 30;
        else maxMarksForStudent = 40;
      }
      if (num > maxMarksForStudent) return;
    }

    const cellKey = `${studentId}-${d.day}`;
    setMarksMap(prev => ({ ...prev, [cellKey]: value }));
    saveMarkOnServer(studentId, d, value);
  };

  // Calculations
  const rosterData = useMemo(() => {
    let list = students.map(student => {
      let totalObtained = 0;
      let totalMax = 0;
      let highest = -1;
      let lowest = 9999;
      let testsTaken = 0;

      days.forEach(d => {
        let maxMarksForStudent = 0;
        if (d.dayOfWeek >= 1 && d.dayOfWeek <= 5) maxMarksForStudent = 10;
        else if (d.dayOfWeek === 6) {
          const std = student.standard;
          if (std >= 1 && std <= 5) maxMarksForStudent = 20;
          else if (std >= 6 && std <= 7) maxMarksForStudent = 30;
          else maxMarksForStudent = 40;
        }

        const markStr = marksMap[`${student._id}-${d.day}`];
        if (markStr !== undefined && markStr !== '') {
           const m = Number(markStr);
           totalObtained += m;
           totalMax += maxMarksForStudent;
           testsTaken++;
           if (m > highest) highest = m;
           if (m < lowest) lowest = m;
        }
      });

      const percent = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(1)) : null;
      const averageMarks = testsTaken > 0 ? parseFloat((totalObtained / testsTaken).toFixed(1)) : null;

      return {
        student,
        percent,
        averageMarks,
        totalObtained,
        totalMax,
        testsTaken,
        highest: highest !== -1 ? highest : '-',
        lowest: lowest !== 9999 ? lowest : '-',
        grade: percent !== null ? getGrade(percent) : '-'
      };
    });

    const rankedList = list.filter(x => x.percent !== null).sort((a, b) => b.percent - a.percent);
    const rankMap = {};
    let currentRank = 1;
    rankedList.forEach((item, index) => {
      if (index > 0 && item.percent < rankedList[index - 1].percent) {
        currentRank = index + 1;
      }
      rankMap[item.student._id] = currentRank;
    });

    return list.map(item => ({
      ...item,
      rank: item.percent !== null ? rankMap[item.student._id] : '-'
    }));
  }, [students, marksMap, days]);

  const summaryStats = useMemo(() => {
    let testsConducted = 0;
    let pendingMarks = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    days.forEach(d => {
      if (d.isHoliday) return;
      if (d.date <= today) {
        let marksForDay = 0;
        students.forEach(s => {
          const val = marksMap[`${s._id}-${d.day}`];
          if (val !== undefined && val !== '') {
            marksForDay++;
          }
        });
        if (marksForDay > 0) {
          testsConducted++;
          pendingMarks += (students.length - marksForDay);
        }
      }
    });

    const graded = rosterData.filter(x => x.percent !== null);
    const avgList = graded.map(x => x.percent);
    
    const classAvg = avgList.length > 0 ? (avgList.reduce((a,b)=>a+b,0) / avgList.length).toFixed(1) : '-';
    const highestAvg = avgList.length > 0 ? Math.max(...avgList).toFixed(1) : '-';
    const lowestAvg = avgList.length > 0 ? Math.min(...avgList).toFixed(1) : '-';
    const passCount = graded.filter(x => x.percent >= 40).length;
    const passPercent = avgList.length > 0 ? ((passCount / avgList.length) * 100).toFixed(1) : '-';
    
    const tops = graded.filter(x => x.percent === Math.max(...avgList)).map(x => x.student.name);
    const topPerformer = tops.length > 0 ? tops.join(', ') : '-';

    return {
      totalStudents: students.length,
      testsConducted,
      pendingMarks,
      classAvg,
      highestAvg,
      lowestAvg,
      passPercent,
      topPerformer
    };
  }, [rosterData, days, students, marksMap]);

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', ...days.map(d => `${d.day} (${d.weekdayShort})`), 'Average Marks', 'Percentage', 'Grade', 'Rank'];
    const rows = rosterData.map(x => [
      x.student.rollNo || '-',
      x.student.name,
      ...days.map(d => marksMap[`${x.student._id}-${d.day}`] || '-'),
      x.averageMarks !== null ? x.averageMarks : '-',
      x.percent !== null ? `${x.percent}%` : '-',
      x.grade,
      x.rank
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Monthly_Register_Grade${standard}_${subject}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported Successfully');
  };

  const handleViewProfile = async (studentId) => {
    setSelectedStudentProfile(studentId);
    setProfileLoading(true);
    try {
      const { data } = await api.get(`/tests/profile/${studentId}`);
      setStudentProfileData(data);
    } catch (e) {
      showToast('Failed to load academic profile.', 'error');
      setSelectedStudentProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredRoster = rosterData.filter(r => 
    r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.student.rollNo && r.student.rollNo.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-[1600px] mx-auto w-full text-slate-800 dark:text-slate-200">
      
      {toast && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-2xl shadow-xl z-50 text-white font-bold animate-bounce flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-luna-blue" />
            Academic Marks Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Record classroom test marks using a monthly register.
          </p>
        </div>
        <div className="flex gap-3">
           <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Export CSV
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Month & Year</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Grade</label>
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue"
          >
            <option value="all">All Grades</option>
            {[1,2,3,4,5,6,7,8,9].map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Search Student</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 pl-9 pr-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-luna-blue"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Total Students</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{summaryStats.totalStudents}</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Tests Conducted</p>
          <p className="text-xl font-extrabold text-luna-blue mt-1">{summaryStats.testsConducted}</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Pending Marks</p>
          <p className="text-xl font-extrabold text-orange-500 mt-1">{summaryStats.pendingMarks}</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Class Average</p>
          <p className="text-xl font-extrabold text-purple-500 mt-1">{summaryStats.classAvg}%</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Highest Avg</p>
          <p className="text-xl font-extrabold text-emerald-500 mt-1">{summaryStats.highestAvg}%</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Lowest Avg</p>
          <p className="text-xl font-extrabold text-rose-500 mt-1">{summaryStats.lowestAvg}%</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Pass %</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{summaryStats.passPercent}%</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Top Performer</p>
          <p className="text-sm font-extrabold text-amber-500 mt-1 truncate" title={summaryStats.topPerformer}>{summaryStats.topPerformer}</p>
        </div>
      </div>

      {/* Main Register Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-luna-blue border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-400 font-bold">Loading Monthly Register...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-20 text-center text-sm text-slate-400 font-bold">No students found for this selection.</div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar pb-4">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 px-4 py-3 border-b border-r border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase min-w-[80px]">Roll No</th>
                  <th className="sticky left-[80px] bg-slate-50 dark:bg-slate-900 z-20 px-4 py-3 border-b border-r border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase min-w-[180px]">Student Name</th>
                  {days.map(d => (
                    <th key={d.day} className={`px-2 py-2 border-b border-r border-slate-200 dark:border-white/10 text-center min-w-[50px] ${d.isHoliday ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-slate-50 dark:bg-slate-900'}`}>
                      <div className={`text-sm font-black ${d.isHoliday ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>{d.day}</div>
                      <div className="text-[9px] font-bold uppercase text-slate-400">{d.weekdayShort}</div>
                      <div className={`text-[9px] font-black mt-1 ${d.isHoliday ? 'text-slate-400' : 'text-luna-blue'}`}>{d.isHoliday ? 'Hol' : `${d.displayMaxMarks}`}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-l border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase">Avg</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase">%</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase">Grade</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase">Rank</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((row, idx) => (
                  <tr key={row.student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="sticky left-0 bg-white dark:bg-[#1e293b] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 z-10 px-4 py-3 border-b border-r border-slate-100 dark:border-white/5 text-sm font-bold text-slate-500">
                      {row.student.rollNo || '-'}
                    </td>
                    <td 
                      className="sticky left-[80px] bg-white dark:bg-[#1e293b] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 z-10 px-4 py-3 border-b border-r border-slate-100 dark:border-white/5 text-sm font-extrabold text-slate-800 dark:text-white cursor-pointer hover:text-luna-blue flex items-center justify-between"
                      onClick={() => handleViewProfile(row.student._id)}
                    >
                      <span>{row.student.name}</span>
                      <Eye className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    {days.map(d => {
                      const cellKey = `${row.student._id}-${d.day}`;
                      const val = marksMap[cellKey] || '';
                      
                      let colorClass = 'bg-white dark:bg-[#1e293b]';
                      let textClass = 'text-slate-800 dark:text-white';

                      if (d.isHoliday) {
                        colorClass = 'bg-slate-100 dark:bg-slate-800/30';
                      } else if (val !== '') {
                        let studentMaxMarks = 10;
                        if (d.dayOfWeek === 6) {
                          const std = row.student.standard;
                          if (std >= 1 && std <= 5) studentMaxMarks = 20;
                          else if (std >= 6 && std <= 7) studentMaxMarks = 30;
                          else studentMaxMarks = 40;
                        }

                        const p = (Number(val) / studentMaxMarks) * 100;
                        if (p >= 90) { colorClass = 'bg-emerald-50 dark:bg-emerald-900/20'; textClass = 'text-emerald-700 dark:text-emerald-400'; }
                        else if (p >= 75) { colorClass = 'bg-blue-50 dark:bg-blue-900/20'; textClass = 'text-blue-700 dark:text-blue-400'; }
                        else if (p >= 50) { colorClass = 'bg-orange-50 dark:bg-orange-900/20'; textClass = 'text-orange-700 dark:text-orange-400'; }
                        else { colorClass = 'bg-rose-50 dark:bg-rose-900/20'; textClass = 'text-rose-700 dark:text-rose-400'; }
                      } else {
                        colorClass = 'bg-slate-50/30 dark:bg-slate-900/20';
                      }

                      return (
                        <td key={d.day} className={`border-b border-r border-slate-100 dark:border-white/5 p-0 relative ${colorClass}`}>
                          {!d.isHoliday && (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleMarkChange(row.student._id, d, e.target.value)}
                              className={`w-full h-12 text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-luna-blue text-sm font-extrabold ${textClass}`}
                            />
                          )}
                          {/* Autosave Indicators */}
                          {savingStatus[cellKey] === 'saving' && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>}
                          {savingStatus[cellKey] === 'saved' && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                          {savingStatus[cellKey] === 'error' && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 border-b border-l border-slate-100 dark:border-white/5 text-center font-bold text-slate-700 dark:text-slate-300">
                      {row.averageMarks !== null ? row.averageMarks : '-'}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 dark:border-white/5 text-center font-extrabold text-slate-800 dark:text-white">
                      {row.percent !== null ? `${row.percent}%` : '-'}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 dark:border-white/5 text-center">
                      {row.grade !== '-' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          row.grade === 'F' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-luna-blue/10 text-luna-blue dark:text-blue-400'
                        }`}>
                          {row.grade}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 dark:border-white/5 text-center font-black text-slate-800 dark:text-white">
                      {row.rank}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Academic Profile Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-150 dark:border-white/5 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col">
            
            <button
              onClick={() => {
                setSelectedStudentProfile(null);
                setStudentProfileData(null);
              }}
              className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-650 cursor-pointer transition-colors z-10"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {profileLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-luna-blue border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-bold">Loading Academic Profile...</span>
              </div>
            ) : studentProfileData ? (
              <div className="space-y-6">
                
                {/* Profile Header */}
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="p-3 bg-gradient-to-br from-luna-blue to-purple-600 text-white rounded-2xl shadow-lg">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{studentProfileData.student?.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Roll No: {studentProfileData.student?.rollNo || 'N/A'} • Grade {studentProfileData.student?.standard}
                    </p>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-400">Overall Average</span>
                    <h4 className="text-2xl font-black text-luna-blue mt-1">{studentProfileData.overallAveragePercentage}%</h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Tests</span>
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{studentProfileData.tests?.length}</h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-400">Highest Score</span>
                    <h4 className="text-sm font-black text-emerald-500 mt-1 truncate" title={studentProfileData.highestMarks}>
                      {studentProfileData.highestMarks}
                    </h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-400">Weakest Subject</span>
                    <h4 className="text-sm font-black text-rose-500 mt-1 truncate" title={studentProfileData.weakestSubject}>
                      {studentProfileData.weakestSubject}
                    </h4>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Trend Line */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Trend (%)</h4>
                    {studentProfileData.tests?.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-bold">No scores recorded.</div>
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={studentProfileData.tests.map(t => ({
                            date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                            percent: parseFloat(((t.marksObtained / t.maxMarks) * 100).toFixed(1))
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.1} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="percent" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject Average (%)</h4>
                    {studentProfileData.subjectPerformance?.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-bold">No scores recorded.</div>
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={studentProfileData.subjectPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.1} />
                            <XAxis dataKey="subject" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ fontSize: 11, borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="averagePercentage" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};

export default TestManagement;
