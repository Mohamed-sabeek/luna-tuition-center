import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Users,
  Award,
  CalendarCheck,
  Percent,
  Coins,
  Star,
  RefreshCw,
  Plus,
  BookOpen,
  PlusCircle,
  FileCheck,
  TrendingUp,
  UserCheck,
  Clock,
  Sparkles,
  ClipboardList,
  Bell,
  LogOut,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsRes = await api.get('/dashboard/teacher');
        setData(statsRes.data);

        const studentsRes = await api.get('/students');
        setStudents(studentsRes.data || []);
      } catch (err) {
        console.warn('Failed to fetch dashboard metrics. Setting fallback mock data.', err);
        // Fallback Mock Data
        setData({
          summary: {
            totalStudents: 15,
            totalParents: 14,
            todayAttendance: { present: 13, absent: 2, totalMarked: 15 },
            monthlyAttendancePercentage: 92,
            totalLunas: 245,
          },
          lunasByType: {
            full_marks: 110,
            attendance: 55,
            handwriting_2_line: 42,
            handwriting_4_line: 38,
          },
          topStudents: [
            { name: 'Aditya Sharma', standard: 5, totalLunas: 28, rank: 1 },
            { name: 'Diya Patel', standard: 6, totalLunas: 24, rank: 2 },
            { name: 'Rohan Verma', standard: 8, totalLunas: 21, rank: 3 },
            { name: 'Ananya Rao', standard: 4, totalLunas: 19, rank: 4 },
            { name: 'Kabir Mehta', standard: 5, totalLunas: 18, rank: 5 },
          ],
          feeOverview: {
            collected: 3200,
            pending: 800,
          }
        });
        setStudents([
          { _id: '1', name: 'Aditya Sharma', standard: 5, parentName: 'Rajesh Sharma', joiningDate: new Date() },
          { _id: '2', name: 'Diya Patel', standard: 6, parentName: 'Suresh Patel', joiningDate: new Date() },
          { _id: '3', name: 'Rohan Verma', standard: 8, parentName: 'Amit Verma', joiningDate: new Date() },
          { _id: '4', name: 'Ananya Rao', standard: 4, parentName: 'Kiran Rao', joiningDate: new Date() },
          { _id: '5', name: 'Kabir Mehta', standard: 5, parentName: 'Vijay Mehta', joiningDate: new Date() },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [refresh]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3 min-h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#1e3a8a]" />
        <span className="font-bold text-sm">Launching Teacher Mission Control...</span>
      </div>
    );
  }

  const { summary, lunasByType, topStudents, feeOverview } = data;

  const pieData = [
    { name: 'Full Marks', value: lunasByType.full_marks || 0, color: '#22C55E' },
    { name: 'Attendance', value: lunasByType.attendance || 0, color: '#A855F7' },
    { name: '2 Line', value: lunasByType.handwriting_2_line || 0, color: '#F97316' },
    { name: '4 Line', value: lunasByType.handwriting_4_line || 0, color: '#3B82F6' },
  ];

  const feeData = [
    { name: 'Collected', value: feeOverview.collected || 0, fill: '#1E3A8A' },
    { name: 'Pending', value: feeOverview.pending || 0, fill: '#F59E0B' },
  ];

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="px-6 lg:px-8 xl:px-10 py-6 space-y-8 max-w-[1600px] mx-auto w-full text-left transition-all duration-200">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <div className="text-slate-400 dark:text-slate-400 font-medium text-sm">{todayStr}</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Good Morning, {user?.name || 'Teacher'}
          </h1>
          <p className="text-slate-500 dark:text-slate-350 text-sm">
            Here's what's happening at the center today.
          </p>
        </div>

        {/* Action icons / quick panel */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <button
            onClick={() => setRefresh(prev => prev + 1)}
            className="p-2.5 bg-white dark:bg-[#1e293b] text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button className="p-2.5 bg-white dark:bg-[#1e293b] text-slate-500 hover:text-slate-850 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold rounded-xl border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest block mb-3 px-1">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/teacher/students')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1e3a8a] hover:bg-[#152a66] text-white rounded-lg text-xs font-bold transition-all hover:shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student
          </button>
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-550/5 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-purple-500" />
            Take Attendance
          </button>
          <button
            onClick={() => navigate('/teacher/tests')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-550/5 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-emerald-500" />
            Upload Marks
          </button>
          <button
            onClick={() => navigate('/teacher/luna-rewards')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-550/5 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-500" />
            Assign Luna
          </button>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-550/5 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-550" />
            View Reports
          </button>
        </div>
      </div>

      {/* 2. Stats Cards (5 cards responsive grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Total Students</span>
            <div className="p-2 bg-blue-500/10 text-[#1e3a8a] dark:text-blue-400 rounded-lg">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{summary.totalStudents}</div>
            <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+2 this month</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Attendance Rate</span>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <Percent className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{summary.monthlyAttendancePercentage}%</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-300 font-semibold mt-1">
              <span>90% min requirement</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Luna Rewards</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Star className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{summary.totalLunas}</div>
            <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+45 this week</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Tuition Fees</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Coins className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹{feeOverview.collected}</div>
            <div className="text-[10px] text-amber-500 font-bold mt-1">
              <span>₹{feeOverview.pending} outstanding</span>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Total Parents</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{summary.totalParents}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-300 font-semibold mt-1">
              <span>100% active links</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Luna Stars Distribution</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mb-6">Percentage breakdown of academic reward stars</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} Stars`} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Monthly Billing Dues</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mb-6">Overview of tuition collections and pending amounts</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>





    </div>
  );
};

export default TeacherDashboard;
