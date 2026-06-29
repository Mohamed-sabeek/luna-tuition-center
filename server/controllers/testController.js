import Test from '../models/Test.js';
import Student from '../models/Student.js';
import LunaAward from '../models/LunaAward.js';

// Helper to determine automatic max marks based on date and standard
const getAutomaticTestDetails = (dateString, standard) => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 1-5 = Monday-Friday, 6 = Saturday
  const std = Number(standard);

  if (day === 0) {
    return {
      type: 'holiday',
      maxMarks: 0,
      duration: '0 Minutes',
      isHoliday: true,
      message: 'Today is a holiday. No scheduled tests.'
    };
  }

  if (day >= 1 && day <= 5) {
    return {
      type: 'daily',
      maxMarks: 10,
      duration: '10 Minutes',
      isHoliday: false
    };
  }

  if (day === 6) {
    let maxMarks = 20;
    if (std >= 1 && std <= 5) maxMarks = 20;
    else if (std >= 6 && std <= 7) maxMarks = 30;
    else if (std >= 8 && std <= 9) maxMarks = 40;

    return {
      type: 'weekly',
      maxMarks,
      duration: '45 Minutes',
      isHoliday: false
    };
  }

  // fallback
  return {
    type: 'daily',
    maxMarks: 10,
    duration: '10 Minutes',
    isHoliday: false
  };
};


// @desc    Save single student mark (creates, updates, or deletes if clear)
// @route   POST /api/tests/save-mark
// @access  Private/Teacher
export const saveStudentMark = async (req, res) => {
  const { studentId, date, subject, marksObtained, isMakeUp, makeUpType, makeUpMaxMarks } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const testDate = new Date(date);
    const day = testDate.getDay();

    // If marksObtained is empty or null, we assume the teacher wants to clear/delete this mark
    if (marksObtained === null || marksObtained === undefined || marksObtained === '') {
      const normalizedDate = new Date(testDate);
      normalizedDate.setUTCHours(12, 0, 0, 0);

      let targetType = 'daily';
      if (!isMakeUp && day === 6) targetType = 'weekly';
      else if (isMakeUp) targetType = makeUpType || 'daily';

      const existingTest = await Test.findOne({
        studentId,
        date: normalizedDate,
        type: targetType,
        subject
      });

      if (existingTest) {
        await Test.findByIdAndDelete(existingTest._id);
        
        // Remove pending green luna eligibility if test is cleared
        await LunaAward.findOneAndDelete({
          studentId,
          lunaType: 'green',
          achievementReference: existingTest._id.toString(),
          status: 'pending'
        });
      }

      return res.json({ message: 'Mark cleared successfully.', cleared: true });
    }

    let type = 'daily';
    let maxMarks = 10;

    if (isMakeUp) {
      type = makeUpType || 'daily';
      if (type === 'weekly') {
        const std = Number(student.standard);
        if (std >= 1 && std <= 5) maxMarks = 20;
        else if (std >= 6 && std <= 7) maxMarks = 30;
        else if (std >= 8 && std <= 9) maxMarks = 40;
      } else if (type === 'custom') {
        maxMarks = Number(makeUpMaxMarks) || 10;
      } else {
        maxMarks = 10;
      }
    } else {
      if (day === 0) {
        return res.status(400).json({ message: 'Today is a holiday. No scheduled tests. Use make-up option to override.' });
      }

      const details = getAutomaticTestDetails(date, student.standard);
      type = details.type;
      maxMarks = details.maxMarks;
    }

    // Validation
    const marks = Number(marksObtained);
    if (isNaN(marks) || marks < 0 || !Number.isInteger(marks)) {
      return res.status(400).json({ message: 'Marks must be a non-negative integer.' });
    }
    if (marks > maxMarks) {
      return res.status(400).json({ message: `Marks cannot exceed today's maximum marks of ${maxMarks}.` });
    }

    const normalizedDate = new Date(testDate);
    normalizedDate.setUTCHours(12, 0, 0, 0);

    let test = await Test.findOne({
      studentId,
      date: normalizedDate,
      type,
      subject,
    });

    if (test) {
      test.marksObtained = marks;
      test.maxMarks = maxMarks;
      await test.save();
    } else {
      test = await Test.create({
        studentId,
        date: normalizedDate,
        type,
        subject,
        marksObtained: marks,
        maxMarks,
      });
    }

    const percentage = (marks / maxMarks) * 100;

    // GREEN LUNA ELIGIBILITY LOGIC
    if (marks === maxMarks && maxMarks > 0) {
      // Check if an award/eligibility already exists
      const existingAward = await LunaAward.findOne({
        studentId,
        lunaType: 'green',
        achievementReference: test._id.toString()
      });
      
      if (!existingAward) {
        await LunaAward.create({
          studentId,
          lunaType: 'green',
          achievementSource: 'marks',
          achievementReference: test._id.toString(),
          reason: `Full Marks (${marks}/${maxMarks}) in ${test.subject} ${type === 'daily' ? 'Daily Test' : 'Saturday Test'}`,
          status: 'pending',
          eligibilityDate: normalizedDate
        });
      }
    } else {
      // If marks were lowered from full marks, delete the pending eligibility if it hasn't been awarded yet
      await LunaAward.findOneAndDelete({
        studentId,
        lunaType: 'green',
        achievementReference: test._id.toString(),
        status: 'pending'
      });
    }

    res.json({
      message: 'Mark saved successfully.',
      test,
      percentage,
      lunaAwarded: test.fullMarksLunaAwarded
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students in a grade and their marks on a specific date, grade, subject
// @route   GET /api/tests/class
// @access  Private/Teacher
export const getClassTests = async (req, res) => {
  const { date, grade, subject, isMakeUp, makeUpType, makeUpMaxMarks } = req.query;

  try {
    const std = Number(grade);
    const students = await Student.find({ standard: std }).sort({ rollNo: 1, name: 1 });

    const testDate = new Date(date);
    const day = testDate.getDay();

    let targetType = 'daily';
    let maxMarks = 10;

    if (isMakeUp === 'true') {
      targetType = makeUpType || 'daily';
      if (targetType === 'weekly') {
        if (std >= 1 && std <= 5) maxMarks = 20;
        else if (std >= 6 && std <= 7) maxMarks = 30;
        else if (std >= 8 && std <= 9) maxMarks = 40;
      } else if (targetType === 'custom') {
        maxMarks = Number(makeUpMaxMarks) || 10;
      } else {
        maxMarks = 10;
      }
    } else {
      if (day === 0) {
        // Holiday fallback
        targetType = 'holiday';
        maxMarks = 0;
      } else {
        const details = getAutomaticTestDetails(date, std);
        targetType = details.type;
        maxMarks = details.maxMarks;
      }
    }

    const normalizedDate = new Date(testDate);
    normalizedDate.setUTCHours(12, 0, 0, 0);

    const tests = await Test.find({
      date: normalizedDate,
      type: targetType,
      subject,
      studentId: { $in: students.map(s => s._id) }
    });

    res.json({
      students,
      tests,
      maxMarks,
      type: targetType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students in a grade and their marks for an entire month
// @route   GET /api/tests/monthly
// @access  Private/Teacher
export const getMonthlyClassTests = async (req, res) => {
  const { month, year, grade, subject } = req.query;

  try {
    let studentQuery = {};
    if (grade && grade !== 'all') {
      studentQuery.standard = Number(grade);
    }
    const students = await Student.find(studentQuery).sort({ rollNo: 1, name: 1 });

    const y = Number(year);
    const m = Number(month); // 1-indexed

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const tests = await Test.find({
      date: { $gte: start, $lte: end },
      subject,
      studentId: { $in: students.map(s => s._id) }
    });

    res.json({ students, tests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get academic history records browse data
// @route   GET /api/tests/history
// @access  Private/Teacher
export const getTestsHistory = async (req, res) => {
  const { grade, subject, type, month } = req.query;

  try {
    const query = {};

    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    if (grade && grade !== 'all') {
      const students = await Student.find({ standard: Number(grade) }).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const start = new Date(Number(yearStr), Number(monthStr) - 1, 1);
      const end = new Date(Number(yearStr), Number(monthStr), 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const tests = await Test.find(query)
      .populate('studentId', 'name rollNo standard')
      .sort({ date: -1 });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get academic analytics profile for a single student
// @route   GET /api/tests/profile/:studentId
// @access  Private
export const getStudentAcademicProfile = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Security check
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent && String(req.user.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const tests = await Test.find({ studentId }).sort({ date: 1 });

    const subjectStats = {};
    let totalObtained = 0;
    let totalMax = 0;
    let highestScorePercent = 0;
    let highestTest = null;

    tests.forEach(test => {
      const percentage = (test.marksObtained / test.maxMarks) * 100;
      totalObtained += test.marksObtained;
      totalMax += test.maxMarks;

      if (percentage > highestScorePercent) {
        highestScorePercent = percentage;
        highestTest = test;
      }

      if (!subjectStats[test.subject]) {
        subjectStats[test.subject] = {
          totalObtained: 0,
          totalMax: 0,
          highestObtained: 0,
          highestMax: 0,
          count: 0
        };
      }

      const sub = subjectStats[test.subject];
      sub.totalObtained += test.marksObtained;
      sub.totalMax += test.maxMarks;
      sub.count += 1;
      if (test.marksObtained > sub.highestObtained) {
        sub.highestObtained = test.marksObtained;
        sub.highestMax = test.maxMarks;
      }
    });

    const subjectPerformance = Object.keys(subjectStats).map(subject => {
      const sub = subjectStats[subject];
      const avgPercent = sub.totalMax > 0 ? (sub.totalObtained / sub.totalMax) * 100 : 0;
      return {
        subject,
        averagePercentage: parseFloat(avgPercent.toFixed(2)),
        highestMarks: `${sub.highestObtained}/${sub.highestMax}`,
        testCount: sub.count
      };
    });

    let weakestSubject = 'None';
    let lowestAvg = 100;
    subjectPerformance.forEach(sub => {
      if (sub.averagePercentage < lowestAvg) {
        lowestAvg = sub.averagePercentage;
        weakestSubject = sub.subject;
      }
    });

    const highestMarksStr = highestTest ? `${highestTest.marksObtained}/${highestTest.maxMarks} (${highestTest.subject})` : 'N/A';

    res.json({
      student,
      tests,
      overallAveragePercentage: totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0,
      highestMarks: highestMarksStr,
      weakestSubject,
      subjectPerformance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BACKWARD COMPATIBLE CONTROLLERS (keep to prevent broken references) ---

// @desc    Add single test score
// @route   POST /api/tests
// @access  Private/Teacher
export const addTestScore = async (req, res) => {
  const { studentId, date, type, subject, marksObtained } = req.body;
  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let maxMarks = 10;
    if (type === 'weekly') {
      const std = Number(student.standard);
      if (std >= 1 && std <= 5) maxMarks = 20;
      else if (std >= 6 && std <= 7) maxMarks = 30;
      else if (std >= 8 && std <= 9) maxMarks = 40;
    }

    const test = await Test.create({
      studentId,
      date: new Date(date),
      type,
      subject,
      marksObtained: Number(marksObtained),
      maxMarks,
    });

    const percentage = (test.marksObtained / maxMarks) * 100;
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk add test scores for a class/standard
// @route   POST /api/tests/bulk
// @access  Private/Teacher
export const bulkAddTestScores = async (req, res) => {
  const { date, type, subject, scores } = req.body;
  try {
    const createdTests = [];
    for (const item of scores) {
      const { studentId, marksObtained } = item;
      const student = await Student.findById(studentId);
      if (!student) continue;

      let maxMarks = 10;
      if (type === 'weekly') {
        const std = Number(student.standard);
        if (std >= 1 && std <= 5) maxMarks = 20;
        else if (std >= 6 && std <= 7) maxMarks = 30;
        else if (std >= 8 && std <= 9) maxMarks = 40;
      }

      const targetDate = new Date(date);
      targetDate.setHours(12, 0, 0, 0);

      let test = await Test.findOne({ studentId, date: targetDate, type, subject });
      if (test) {
        test.marksObtained = Number(marksObtained);
        await test.save();
      } else {
        test = await Test.create({
          studentId,
          date: targetDate,
          type,
          subject,
          marksObtained: Number(marksObtained),
          maxMarks,
        });
      }

      const percentage = (test.marksObtained / maxMarks) * 100;
      createdTests.push(test);
    }
    res.json({ message: 'Bulk test scores submitted successfully', tests: createdTests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all test results for a student (Parent & Teacher)
// @route   GET /api/tests/student/:studentId
// @access  Private
export const getStudentTests = async (req, res) => {
  const { studentId } = req.params;
  try {
    const tests = await Test.find({ studentId }).sort({ date: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a test score
// @route   DELETE /api/tests/:id
// @access  Private/Teacher
export const deleteTestScore = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test score not found' });

    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test score deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
