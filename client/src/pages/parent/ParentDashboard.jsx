import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  User,
  Award,
  CalendarCheck,
  Megaphone,
  GraduationCap,
  Coins,
  Star,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParentStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/dashboard/parent');
        setData(data);
      } catch (err) {
        console.warn('Failed to fetch parent metrics. Loading fallback mock data.', err);
        // Fallback Mock data
        setData({
          student: {
            _id: 'mock123',
            name: 'Aditya Sharma',
            standard: 5,
            parentName: 'Rajesh Sharma',
            joiningDate: '2026-01-10T00:00:00.000Z',
          },
          attendancePercentage: 94,
          totalLunas: 28,
          rank: 1,
          recentTests: [
            { _id: 't1', subject: 'Mathematics', marksObtained: 30, maxMarks: 30, date: '2026-06-20T00:00:00.000Z' },
            { _id: 't2', subject: 'Science', marksObtained: 27, maxMarks: 30, date: '2026-06-13T00:00:00.000Z' },
            { _id: 't3', subject: 'English Grammar', marksObtained: 10, maxMarks: 10, date: '2026-06-08T00:00:00.000Z' },
          ],
          feeStatus: {
            month: '2026-06',
            amount: 200,
            status: 'pending',
          },
          announcements: [
            { _id: 'a1', title: 'Weekly Mock Examination', content: 'Fractions and science cells mockup tests scheduled for Saturday June 27th. Revision sheets uploaded.', createdAt: '2026-06-22T00:00:00.000Z' },
            { _id: 'a2', title: 'Monsoon Class Timing revisions', content: 'Timing unchanged. Classes run standard hours from 4:30pm to 7:00pm. Safe travel coordinates advised.', createdAt: '2026-06-18T00:00:00.000Z' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchParentStats();
  }, [refresh]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3 min-h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#1e3a8a]" />
        <span className="font-bold text-sm">Syncing Student Portal console...</span>
      </div>
    );
  }

  const { student, attendancePercentage, totalLunas, rank, recentTests, feeStatus, announcements } = data;
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto w-full text-left transition-all duration-200">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <div className="text-slate-400 dark:text-slate-400 font-medium text-xs sm:text-sm">{todayStr}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome, {student.parentName}
          </h1>
          <p className="text-slate-500 dark:text-slate-350 text-sm">
            Monitor your child's progress report card and star rewards in real time.
          </p>
        </div>

        {/* Action icons / child tag */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="px-3.5 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Student: {student.name}</span>
          </div>

          <button
            onClick={() => setRefresh(prev => prev + 1)}
            className="p-2.5 bg-white dark:bg-[#1e293b] text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Sync stats"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Stats Cards (4 items grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Class Standard</span>
            <div className="p-2 bg-blue-500/10 text-[#1e3a8a] dark:text-blue-400 rounded-lg">
              <User className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Grade {student.standard}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-300 font-semibold mt-1">
              <span>Primary Orbit group</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Attendance Rate</span>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{Number(attendancePercentage).toFixed(2)}%</div>
            <div className="text-[10px] text-slate-405 dark:text-slate-300 font-semibold mt-1">
              <span>Requirement: 90% min</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Luna Stars</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Star className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalLunas}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">
              <span>Active rewards balance</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Tuition Rank</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Rank #{rank}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-300 font-semibold mt-1">
              <span>Overall class standing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Exam Marks */}
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Recent Exam Marks</h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mb-6">Latest classroom test reports</p>
            
            {recentTests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-semibold">
                No recent tests recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {recentTests.map((test) => {
                  const isFull = test.marksObtained === test.maxMarks;
                  return (
                    <div key={test._id} className="p-4 border border-slate-100 dark:border-white/5 hover:border-slate-200 bg-slate-50/30 dark:bg-white/5 rounded-xl flex items-center justify-between transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{test.subject}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Conducted on {new Date(test.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-base font-extrabold block ${isFull ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {test.marksObtained} / {test.maxMarks}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">Score</span>
                        </div>
                        {isFull && (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white fill-white shadow-sm" title="Full Marks Green Luna Awarded!">
                            <Star className="w-4 h-4 fill-current text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-right mt-6">
            <Link to="/student/tests" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e3a8a] dark:text-luna-gold hover:underline">
              Analyze academic trends
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          {/* Tuition Fee alert */}
          {feeStatus ? (
            <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${
              feeStatus.status === 'paid'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-750'
                : 'bg-yellow-500/10 border-yellow-500/20 text-slate-750'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block mb-1">Billing Reminder</span>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{feeStatus.month} Monthly Fee</h4>
                <p className="text-xs text-slate-500 dark:text-slate-350 mt-1">Amount Due: <strong>₹{feeStatus.amount}</strong></p>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                  feeStatus.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {feeStatus.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
                
                <Link to="/student/fees" className="text-xs font-bold text-[#1e3a8a] dark:text-luna-gold hover:underline">
                  Fee details
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-150 dark:border-white/5 text-center text-slate-400 text-xs font-semibold">
              No pending invoice records found for this month.
            </div>
          )}


        </div>

      </div>

    </div>
  );
};

export default ParentDashboard;
