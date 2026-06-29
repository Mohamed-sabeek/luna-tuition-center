import Handwriting from '../models/Handwriting.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';

// Helper to format Date to YYYY-MM-DD locally
const formatDateLocal = (d) => {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get handwriting logs for a specific month/year
// @route   GET /api/handwriting/month
// @access  Private/Teacher
export const getHandwritingByMonth = async (req, res) => {
  const { year, month, type } = req.query; // type: '2-line' or '4-line'

  if (!year || !month || !type) {
    return res.status(400).json({ message: 'Year, month, and type are required.' });
  }

  try {
    const y = parseInt(year);
    const m = parseInt(month); // 1-indexed

    const startOfMonth = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

    const records = await Handwriting.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
      handwritingType: type
    });

    const attWorkingDaysObjects = await Attendance.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth }, status: { $in: ['present', 'absent', 'late', 'half_day'] } } },
      { $group: { _id: "$date" } }
    ]);
    const workingDays = attWorkingDaysObjects.map(d => formatDateLocal(d._id));

    res.json({ records, workingDays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Toggle a single handwriting check-off log (auto-saves)
// @route   POST /api/handwriting/single
// @access  Private/Teacher
export const toggleSingleHandwriting = async (req, res) => {
  const { studentId, date, status, type } = req.body;

  if (!studentId || !date || !status || !type) {
    return res.status(400).json({ message: 'studentId, date, status, and type are required.' });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    if (status === 'not_checked') {
      await Handwriting.findOneAndDelete({ 
        studentId, 
        date: targetDate,
        handwritingType: type
      });
      return res.json({ message: 'Handwriting reset successfully', deleted: true });
    }

    const record = await Handwriting.findOneAndUpdate(
      { 
        studentId, 
        date: targetDate,
        handwritingType: type
      },
      { 
        $set: {
          rollNumber: student.rollNo || '-',
          grade: student.standard,
          handwritingType: type,
          status,
          lastModifiedBy: req.user._id,
        },
        $setOnInsert: {
          createdBy: req.user._id,
        }
      },
      { new: true, upsert: true }
    );

    res.json({ message: 'Handwriting saved successfully', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get handwriting stats for a single student (Parent or Teacher)
// @route   GET /api/handwriting/student/:studentId
// @access  Private
export const getStudentHandwriting = async (req, res) => {
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

    const records = await Handwriting.find({ studentId }).sort({ date: -1 });

    const statsByType = {
      '2-line': { completedDays: 0, notCompletedDays: 0, longestStreak: 0, currentStreak: 0, totalWorkingDays: 0, completionPercentage: 100 },
      '4-line': { completedDays: 0, notCompletedDays: 0, longestStreak: 0, currentStreak: 0, totalWorkingDays: 0, completionPercentage: 100 }
    };

    const processType = async (type) => {
      const typeRecords = records.filter(r => r.handwritingType === type);
      const workingDaysObjects = await Handwriting.aggregate([
        { $match: { status: { $in: ['completed', 'not_completed'] }, handwritingType: type } },
        { $group: { _id: "$date" } }
      ]);
      const globalWorkingDays = new Set(workingDaysObjects.map(d => formatDateLocal(d._id)));

      let completedDays = 0;
      let notCompletedDays = 0;
      let longestStreak = 0;
      let currentStreak = 0;
      let totalWorkingDays = 0;

      typeRecords.forEach(r => {
        if (r.status === 'completed') completedDays++;
        else if (r.status === 'not_completed') notCompletedDays++;
      });

      if (typeRecords.length > 0) {
        const earliestRecord = typeRecords[typeRecords.length - 1]; 
        let startDate = new Date(earliestRecord.date);
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        let current = new Date(startDate);
        let notMarkedDays = 0;
        
        const recordMap = {};
        typeRecords.forEach(r => recordMap[formatDateLocal(r.date)] = r.status);

        while (current <= today) {
          const dateStr = formatDateLocal(current);
          if (current.getDay() !== 0) {
            if (globalWorkingDays.has(dateStr)) {
              if (!recordMap[dateStr]) {
                notMarkedDays++;
              }
            }
          }
          current.setDate(current.getDate() + 1);
        }
        totalWorkingDays = completedDays + notCompletedDays + notMarkedDays;
      }

      const sortedAsc = [...typeRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
      sortedAsc.forEach(r => {
        if (r.status === 'completed') {
          currentStreak++;
          if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else if (r.status === 'not_completed') {
          currentStreak = 0;
        }
      });

      let completionPercentage = 100.00;
      if (totalWorkingDays > 0) {
        completionPercentage = Math.max(0, Math.min(100, (completedDays / totalWorkingDays) * 100));
      }

      statsByType[type] = {
        totalDays: typeRecords.length,
        totalWorkingDays,
        completedDays,
        notCompletedDays,
        completionPercentage: parseFloat(completionPercentage.toFixed(2)),
        longestStreak
      };
    };

    await processType('2-line');
    await processType('4-line');

    res.json({
      records,
      stats: statsByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
