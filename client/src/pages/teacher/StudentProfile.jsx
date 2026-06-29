import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  User,
  ArrowLeft,
  Moon,
  Star,
  CalendarCheck,
  CheckCircle,
  FileText,
  Coins,
  PenTool,
  TrendingUp,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [testData, setTestData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [handwritingData, setHandwritingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentAllStats = async () => {
      setLoading(true);
      try {
        // Fetch Profile & Lunas
        const profileRes = await api.get(`/students/${id}`);
        setProfileData(profileRes.data);

        // Fetch Attendance Stats
        const attendanceRes = await api.get(`/attendance/student/${id}`);
        setAttendanceData(attendanceRes.data);

        // Fetch Tests
        const testRes = await api.get(`/tests/student/${id}`);
        setTestData(testRes.data);

        // Fetch Fees
        const feeRes = await api.get(`/fees/student/${id}`);
        setFeeData(feeRes.data);

        // Fetch Handwriting
        const hwRes = await api.get(`/handwriting/student/${id}`);
        setHandwritingData(hwRes.data);

      } catch (err) {
        console.error('Error fetching student details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentAllStats();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
        <span className="font-bold">Aggregating Student Portfolios...</span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold">
        Student not found.
      </div>
    );
  }

  const { student, lunasSummary, rank } = profileData;
  const { counts, total } = lunasSummary;
  const stats = attendanceData?.stats || { percentage: 100, presentDays: 0, totalDays: 0, totalWorkingDays: 0, absentDays: 0 };

  // Format test data for chart (reverse chronologically to show left-to-right timeline)
  const chartData = [...testData]
    .slice(0, 8)
    .reverse()
    .map(t => ({
      date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.round((t.marksObtained / t.maxMarks) * 100),
      subject: t.subject,
    }));

  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Back button & Header */}
      <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-slate-50 text-slate-500 hover:text-luna-blue hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-luna-blue">{student.name}'s Profile</h1>
          <p className="text-xs text-slate-450 font-semibold">Student Academic Report & Star Rewards ledger</p>
        </div>
      </div>

      {/* Main Student Card & Luna Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="text-center pb-6 border-b border-slate-55 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-luna-blue/5 border border-luna-blue/10 overflow-hidden flex items-center justify-center text-luna-blue mb-4">
              {student.profilePhoto ? (
                <img src={`http://localhost:5000${student.profilePhoto}`} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">{student.name}</h2>
            <div className="flex gap-2 justify-center mt-2">
              <span className="inline-block px-3 py-1 bg-luna-blue/5 text-luna-blue text-xs font-bold rounded-full">
                Grade {student.standard}
              </span>
              {student.rollNo && (
                <span className="inline-block px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                  {student.rollNo}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 py-6 border-b border-slate-55 text-xs font-semibold text-slate-550">

            {student.fatherName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Father: <strong className="text-slate-700">{student.fatherName}</strong></span>
              </div>
            )}
            {student.motherName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Mother: <strong className="text-slate-700">{student.motherName}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{student.parentEmail}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{student.parentPhone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{student.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined: {new Date(student.joiningDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between text-center items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Overall Rank</span>
              <span className="text-lg font-black text-luna-blue block mt-0.5">#{rank}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance %</span>
              <span className="text-lg font-black text-luna-purple block mt-0.5">{Number(stats.attendancePercentage || stats.percentage || 0).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Stars</span>
              <span className="text-lg font-black text-luna-green block mt-0.5 flex items-center gap-0.5 justify-center">
                <Star className="w-4 h-4 text-moon-gold fill-current" />
                {total}
              </span>
            </div>
          </div>
        </div>

        {/* Luna Breakdown Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Luna Wallet breakdown</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">Earned collectibles ledger</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-luna-green/20 bg-green-50/20 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Academic Marks Lunas</span>
                <span className="text-2xl font-black text-luna-green">{counts.full_marks}</span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Test performance rewards</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-luna-green flex items-center justify-center text-white fill-white shadow-md shadow-luna-green/25">
                <Moon className="w-5 h-5 rotate-[-15deg] fill-current" />
              </div>
            </div>

            <div className="p-4 border border-luna-purple/20 bg-luna-purple/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Perfect Attendance</span>
                <span className="text-2xl font-black text-luna-purple">{counts.attendance}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-luna-purple flex items-center justify-center text-white fill-white shadow-md shadow-luna-purple/25">
                <Moon className="w-5 h-5 rotate-[-15deg] fill-current" />
              </div>
            </div>

            <div className="p-4 border border-luna-orange/20 bg-luna-orange/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">2 Line Handwriting</span>
                <span className="text-2xl font-black text-luna-orange">{counts.handwriting_2_line}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-luna-orange flex items-center justify-center text-white fill-white shadow-md shadow-luna-orange/25">
                <Moon className="w-5 h-5 rotate-[-15deg] fill-current" />
              </div>
            </div>

            <div className="p-4 border border-luna-blue-accent/20 bg-luna-blue-accent/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">4 Line Handwriting</span>
                <span className="text-2xl font-black text-luna-blue-accent">{counts.handwriting_4_line}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-luna-blue-accent flex items-center justify-center text-white fill-white shadow-md shadow-luna-blue-accent/25">
                <Moon className="w-5 h-5 rotate-[-15deg] fill-current" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Luna collection ledger</span>
            <span>Total Stars: <strong>{total} Lunas</strong></span>
          </div>
        </div>
      </div>

      {/* Reports and In-depth listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test scores Line Chart */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-luna-green" />
            Academic Test Progress
          </h3>
          
          {chartData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 font-semibold text-sm">
              No test logs available for this student.
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip formatter={(value, name, props) => [`${value}%`, `Accuracy (${props.payload.subject})`]} />
                  <Line type="monotone" dataKey="score" stroke="#1E3A8A" strokeWidth={3} dot={{ fill: '#1E3A8A', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Fees Ledger */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-moon-gold" />
            Tuition Fee History
          </h3>
          
          {feeData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-semibold">
              No monthly fee logs generated.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {feeData.map((fee) => (
                <div key={fee._id} className="p-4 border border-slate-50 hover:border-slate-100 bg-slate-50/20 rounded-2xl flex items-center justify-between transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">{fee.month} Invoice</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      {fee.paidDate ? `Paid on ${new Date(fee.paidDate).toLocaleDateString()}` : 'Outstanding dues'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-800 block">₹{fee.amount}</span>
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full mt-1 ${
                      fee.status === 'paid'
                        ? 'bg-green-50 text-green-700 border border-green-150'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                    }`}>
                      {fee.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Handwriting Logs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-slate-500" />
              Handwriting Progress
            </div>
            {handwritingData?.stats && (
              <span className="px-3 py-1 bg-luna-blue/10 text-luna-blue rounded-xl text-xs font-black">
                {(() => {
                  const s2 = handwritingData.stats['2-line'];
                  const s4 = handwritingData.stats['4-line'];
                  const totalWD = s2.totalWorkingDays + s4.totalWorkingDays;
                  const totalComp = s2.completedDays + s4.completedDays;
                  return totalWD > 0 ? Math.round((totalComp / totalWD) * 100) : 100;
                })()}%
              </span>
            )}
          </h3>
          
          {handwritingData?.stats && (
            <div className="flex items-center gap-4 mb-4 text-center">
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Streak</span>
                 <span className="text-xl font-black text-amber-500">{Math.max(handwritingData.stats['2-line'].longestStreak, handwritingData.stats['4-line'].longestStreak)} 🔥</span>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</span>
                 <span className="text-xl font-black text-emerald-500">{handwritingData.stats['2-line'].completedDays + handwritingData.stats['4-line'].completedDays}</span>
              </div>
            </div>
          )}

          {!handwritingData || !handwritingData.records || handwritingData.records.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-semibold">
              No handwriting logs found.
            </div>
          ) : (
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2">
              {handwritingData.records.map((log) => {
                const dateObj = new Date(log.date);
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return (
                  <div key={log._id} className="p-3 border border-slate-50 bg-slate-50/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">
                        {dateObj.getDate()} {monthNames[dateObj.getMonth()]} {dateObj.getFullYear()}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {log.handwritingType === '2-line' ? '2-Line' : '4-Line'} Handwriting
                      </p>
                    </div>
                    <div>
                      {log.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
