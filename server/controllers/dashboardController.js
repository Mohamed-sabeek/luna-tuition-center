import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import LunaAward from '../models/LunaAward.js';
import Test from '../models/Test.js';
import { calculateAttendanceStats } from '../utils/attendanceCalculator.js';

// @desc    Get dashboard metrics for Teacher
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher
export const getTeacherDashboardStats = async (req, res) => {
  try {
    // 1. Total Students
    const totalStudents = await Student.countDocuments({});

    // 2. Total Parents
    const totalParents = await User.countDocuments({ role: { $in: ['parent', 'student'] } });

    // 3. Today's Attendance
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayAttendance = await Attendance.find({ date: today });
    const todayPresent = todayAttendance.filter(r => r.status === 'present').length;
    const todayAbsent = todayAttendance.filter(r => r.status === 'absent').length;

    // 4. Monthly Attendance Percentage (All students combined for current month) using tuition rules
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const workingDaysObjects = await Attendance.aggregate([
      { $match: { 
          status: { $in: ['present', 'absent'] },
          date: { $gte: startOfMonth, $lte: endOfMonth }
      } },
      { $group: { _id: "$date" } }
    ]);
    const globalWorkingDays = new Set(workingDaysObjects.map(d => d._id.toISOString().split('T')[0]));

    const studentsListForMonth = await Student.find({});
    let totalPresentsSum = 0;
    let totalWorkingDaysSum = 0;

    for (const student of studentsListForMonth) {
      const studentRecords = await Attendance.find({ 
        studentId: student._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const stats = calculateAttendanceStats(studentRecords, student.joiningDate, { startDate: startOfMonth, endDate: endOfMonth }, globalWorkingDays);
      totalPresentsSum += stats.presentDays;
      totalWorkingDaysSum += stats.totalWorkingDays;
    }

    const monthlyPercentage = totalWorkingDaysSum > 0 
      ? Math.max(0, Math.min(100, parseFloat(((totalPresentsSum / totalWorkingDaysSum) * 100).toFixed(2))))
      : 100.00;

    // 5. Total Lunas Awarded
    const lunas = await LunaAward.find({ status: 'awarded' });
    const totalLunas = lunas.reduce((sum, l) => sum + l.count, 0);

    // Luna breakdown by type
    const lunasByType = {
      green: lunas.filter(l => l.lunaType === 'green').reduce((sum, l) => sum + l.count, 0),
      purple: lunas.filter(l => l.lunaType === 'purple').reduce((sum, l) => sum + l.count, 0),
      orange: lunas.filter(l => l.lunaType === 'orange').reduce((sum, l) => sum + l.count, 0),
      blue: lunas.filter(l => l.lunaType === 'blue').reduce((sum, l) => sum + l.count, 0),
    };

    // 6. Top 10 Students based on total Lunas
    const studentLunasAggregation = await LunaAward.aggregate([
      { $match: { status: 'awarded' } },
      { $group: { _id: '$studentId', total: { $sum: '$count' } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Populate student names and standards manually or via lookup
    const topStudents = [];
    for (const item of studentLunasAggregation) {
      const student = await Student.findById(item._id).select('name standard');
      if (student) {
        topStudents.push({
          studentId: student._id,
          name: student.name,
          standard: student.standard,
          totalLunas: item.total,
        });
      }
    }

    // Sort again just in case, and rank
    topStudents.sort((a, b) => b.totalLunas - a.totalLunas);
    const rankedTopStudents = topStudents.map((s, i) => ({ ...s, rank: i + 1 }));

    // Monthly collections stats
    const Fee = (await import('../models/Fee.js')).default;
    const fees = await Fee.find({});
    const collected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const pending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);

    res.json({
      summary: {
        totalStudents,
        totalParents,
        todayAttendance: {
          present: todayPresent,
          absent: todayAbsent,
          totalMarked: todayAttendance.length,
        },
        monthlyAttendancePercentage: monthlyPercentage,
        totalLunas,
      },
      lunasByType,
      topStudents: rankedTopStudents,
      feeOverview: {
        collected,
        pending,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public statistics for home page
// @route   GET /api/dashboard/public-stats
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    const testsConductedAgg = await Test.aggregate([
      { $group: { _id: { date: "$date", subject: "$subject" } } },
      { $count: "totalTests" }
    ]);
    const testsConducted = testsConductedAgg[0] ? testsConductedAgg[0].totalTests : 0;
    
    const studentsListAll = await Student.find({});
    let totalPresentsSumAll = 0;
    let totalWorkingDaysSumAll = 0;

    const workingDaysObjectsAll = await Attendance.aggregate([
      { $match: { status: { $in: ['present', 'absent'] } } },
      { $group: { _id: "$date" } }
    ]);
    const globalWorkingDaysAll = new Set(workingDaysObjectsAll.map(d => d._id.toISOString().split('T')[0]));

    for (const student of studentsListAll) {
      const studentRecords = await Attendance.find({ studentId: student._id });
      const stats = calculateAttendanceStats(studentRecords, student.joiningDate, null, globalWorkingDaysAll);
      totalPresentsSumAll += stats.presentDays;
      totalWorkingDaysSumAll += stats.totalWorkingDays;
    }

    const attendanceRate = totalWorkingDaysSumAll > 0 
      ? Math.max(0, Math.min(100, parseFloat(((totalPresentsSumAll / totalWorkingDaysSumAll) * 100).toFixed(2))))
      : 100.00;
    const lunas = await LunaAward.find({ status: 'awarded' });
    const lunasAwarded = lunas.reduce((sum, l) => sum + l.count, 0);

    res.json({
      testsConducted,
      attendanceRate,
      lunasAwarded,
      topRewardsCount: 3
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for Parent/Student
// @route   GET /api/dashboard/parent
// @access  Private/Parent/Student
export const getParentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ message: 'No student associated with this account.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 1. Attendance Percentage
    const records = await Attendance.find({ studentId });
    const workingDaysObjects = await Attendance.aggregate([
      { $match: { status: { $in: ['present', 'absent'] } } },
      { $group: { _id: "$date" } }
    ]);
    const globalWorkingDays = new Set(workingDaysObjects.map(d => d._id.toISOString().split('T')[0]));
    const stats = calculateAttendanceStats(records, student.joiningDate, null, globalWorkingDays);
    const attendancePercentage = stats.attendancePercentage;

    // 2. Total Lunas
    const lunas = await LunaAward.find({ studentId, status: 'awarded' });
    const totalLunas = lunas.reduce((sum, l) => sum + l.count, 0);

    // 3. Rank
    // Calculate total Lunas per student to find rank
    const allLunasGrouped = await LunaAward.aggregate([
      { $match: { status: 'awarded' } },
      { $group: { _id: '$studentId', total: { $sum: '$count' } } },
      { $sort: { total: -1 } }
    ]);
    
    let rank = 1;
    const studentIndex = allLunasGrouped.findIndex(item => String(item._id) === String(studentId));
    if (studentIndex !== -1) {
      rank = studentIndex + 1;
    } else {
      // If student has no Lunas yet, they are ranked after those who do
      rank = Math.max(1, allLunasGrouped.length + 1);
    }

    // 4. Recent Tests
    const recentTests = await Test.find({ studentId }).sort({ date: -1 }).limit(5);

    // 5. Fee Status
    const Fee = (await import('../models/Fee.js')).default;
    const currentDate = new Date();
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    let feeStatus = await Fee.findOne({ studentId, month: currentMonthStr });
    if (!feeStatus) {
      // Fallback: check any pending fee, or latest fee
      feeStatus = await Fee.findOne({ studentId }).sort({ month: -1 });
    }

    // 6. Announcements
    const Announcement = (await import('../models/Announcement.js')).default;
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
      student,
      attendancePercentage,
      totalLunas,
      rank,
      recentTests,
      feeStatus: feeStatus || { month: currentMonthStr, amount: 200, status: 'paid' },
      announcements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
