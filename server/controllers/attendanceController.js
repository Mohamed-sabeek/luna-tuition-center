import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { calculateAttendanceStats } from '../utils/attendanceCalculator.js';

// Helper to get Monday and Saturday dates of a given date's week
export const getMondayAndSaturday = (dateInput) => {
  const d = new Date(dateInput);
  const day = d.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  
  // Calculate difference to Monday
  // If Sunday (0), go back 6 days. If Monday (1), 0. If Tuesday (2), -1, etc.
  const diffToMonday = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  saturday.setHours(23, 59, 59, 999);

  return { monday, saturday };
};

// @desc    Mark attendance daily
// @route   POST /api/attendance
// @access  Private/Teacher
export const markAttendance = async (req, res) => {
  const { date, attendanceData } = req.body; // attendanceData: [{ studentId, status }]

  if (!date || !attendanceData || !Array.isArray(attendanceData)) {
    return res.status(400).json({ message: 'Date and attendance data array are required' });
  }

  try {
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0); // normalize time to midday to avoid timezone shifts

    const savedRecords = [];

    for (const record of attendanceData) {
      const { studentId, status } = record;
      
      const attendance = await Attendance.findOneAndUpdate(
        { studentId, date: targetDate },
        { status },
        { new: true, upsert: true }
      );
      savedRecords.push(attendance);
    }

    res.json({ message: 'Attendance marked successfully', records: savedRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Get attendance for all students for a specific date
// @route   GET /api/attendance/date/:date
// @access  Private/Teacher
export const getAttendanceByDate = async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    targetDate.setHours(12, 0, 0, 0);

    const attendance = await Attendance.find({ date: targetDate });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance for all students for a specific month/year
// @route   GET /api/attendance/month
// @access  Private/Teacher
export const getAttendanceByMonth = async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: 'Year and month are required.' });
  }

  try {
    const y = parseInt(year);
    const m = parseInt(month); // 1-indexed (e.g. 1 to 12)

    const startOfMonth = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Upsert a single attendance check-off log (auto-saves)
// @route   POST /api/attendance/single
// @access  Private/Teacher
export const saveSingleAttendance = async (req, res) => {
  const { studentId, date, status, remarks } = req.body;

  if (!studentId || !date || !status) {
    return res.status(400).json({ message: 'studentId, date, and status are required.' });
  }

  try {
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    if (status === 'not_marked') {
      await Attendance.findOneAndDelete({ studentId, date: targetDate });
      return res.json({ message: 'Attendance reset successfully', deleted: true });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, date: targetDate },
      { 
        status,
        markedBy: req.user._id,
        markedAt: new Date(),
        remarks: remarks || ''
      },
      { new: true, upsert: true }
    );

    res.json({ message: 'Attendance saved successfully', record: attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Perform bulk operations on attendance logs
// @route   POST /api/attendance/bulk-ops
// @access  Private/Teacher
export const bulkAttendanceOperations = async (req, res) => {
  const { action, date, standard } = req.body; // action: 'mark_all_present', 'mark_holiday', 'copy_yesterday', 'reset_today'

  if (!action || !date) {
    return res.status(400).json({ message: 'action and date are required.' });
  }

  try {
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    const query = {};
    if (standard && standard !== 'all') {
      query.standard = parseInt(standard);
    }
    const students = await Student.find(query);
    const studentIds = students.map(s => s._id);

    if (action === 'mark_all_present') {
      const records = [];
      for (const studentId of studentIds) {
        const att = await Attendance.findOneAndUpdate(
          { studentId, date: targetDate },
          { status: 'present', markedBy: req.user._id, markedAt: new Date() },
          { new: true, upsert: true }
        );
        records.push(att);
      }
      return res.json({ message: `Successfully marked ${students.length} students as Present`, records });
    }

    if (action === 'mark_holiday') {
      const records = [];
      for (const studentId of studentIds) {
        const att = await Attendance.findOneAndUpdate(
          { studentId, date: targetDate },
          { status: 'holiday', markedBy: req.user._id, markedAt: new Date() },
          { new: true, upsert: true }
        );
        records.push(att);
      }
      return res.json({ message: `Successfully marked holiday for ${students.length} students`, records });
    }

    if (action === 'reset_today') {
      await Attendance.deleteMany({
        studentId: { $in: studentIds },
        date: targetDate
      });
      for (const studentId of studentIds) {
      }
      return res.json({ message: `Successfully reset attendance for ${students.length} students` });
    }

    if (action === 'copy_yesterday') {
      const yesterday = new Date(targetDate);
      yesterday.setDate(targetDate.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      const yesterdayRecords = await Attendance.find({
        studentId: { $in: studentIds },
        date: yesterday
      });

      const copied = [];
      for (const record of yesterdayRecords) {
        const att = await Attendance.findOneAndUpdate(
          { studentId: record.studentId, date: targetDate },
          { status: record.status, markedBy: req.user._id, markedAt: new Date() },
          { new: true, upsert: true }
        );
        copied.push(att);
      }
      return res.json({ message: `Successfully copied yesterday's attendance for ${copied.length} students`, records: copied });
    }

    res.status(400).json({ message: 'Invalid bulk action' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to format Date to YYYY-MM-DD locally to match calculateAttendanceStats
const formatDateLocal = (d) => {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get attendance stats for a single student (Parent or Teacher)
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendanceStats = async (req, res) => {
  const { studentId } = req.params;

  try {
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent && String(req.user.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const records = await Attendance.find({ studentId }).sort({ date: -1 });

    const workingDaysObjects = await Attendance.aggregate([
      { $match: { status: { $in: ['present', 'absent'] } } },
      { $group: { _id: "$date" } }
    ]);
    const globalWorkingDays = new Set(workingDaysObjects.map(d => formatDateLocal(d._id)));

    // Calculate stats using the shared utility
    const overallStats = calculateAttendanceStats(records, student.joiningDate, null, globalWorkingDays);

    // Longest present streak calculation
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    let longestStreak = 0;
    let currentStreak = 0;
    sortedRecords.forEach(r => {
      if (r.status === 'present') {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else if (r.status === 'absent') {
        currentStreak = 0;
      }
    });

    // Weekly calculations
    const { monday, saturday } = getMondayAndSaturday(new Date());
    const weeklyStats = calculateAttendanceStats(records, student.joiningDate, { startDate: monday, endDate: saturday }, globalWorkingDays);

    // Monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthlyStats = calculateAttendanceStats(records, student.joiningDate, { startDate: startOfMonth, endDate: endOfMonth }, globalWorkingDays);

    res.json({
      records,
      stats: {
        totalDays: records.length,
        totalWorkingDays: overallStats.totalWorkingDays,
        presentDays: overallStats.presentDays,
        absentDays: overallStats.absentDays,
        holidayDays: overallStats.holidayDays,
        notMarkedDays: overallStats.notMarkedDays,
        percentage: overallStats.attendancePercentage,
        attendancePercentage: overallStats.attendancePercentage,
        longestStreak,
        weeklyPercentage: weeklyStats.attendancePercentage,
        monthlyPercentage: monthlyStats.attendancePercentage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
