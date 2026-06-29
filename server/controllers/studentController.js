import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Test from '../models/Test.js';
import LunaAward from '../models/LunaAward.js';
import Fee from '../models/Fee.js';
import Handwriting from '../models/Handwriting.js';
import { sendParentWelcomeEmail } from '../utils/mailer.js';
import { calculateAttendanceStats } from '../utils/attendanceCalculator.js';
import fs from 'fs';
import path from 'path';

// @desc    Create student & Parent Account
// @route   POST /api/students
// @access  Private/Teacher
export const createStudent = async (req, res) => {
  const {
    name,
    standard,
    parentName,
    parentEmail,
    parentPhone,
    address,
    joiningDate,
    parentPassword,
    fatherName,
    motherName,
    rollNo,
  } = req.body;

  try {
    // 1. Check if parent user already exists
    const userExists = await User.findOne({ email: parentEmail.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Parent email already registered' });
    }

    if (rollNo) {
      const rollExists = await Student.findOne({ rollNo: rollNo.toUpperCase() });
      if (rollExists) {
        return res.status(400).json({ message: `Roll number ${rollNo.toUpperCase()} is already assigned` });
      }
    }

    // Get file path if photo uploaded
    let profilePhoto = '';
    if (req.file) {
      profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    // 2. Create Parent User Account
    const parentUser = await User.create({
      name: parentName,
      email: parentEmail.toLowerCase(),
      password: parentPassword,
      role: 'student',
    });

    // 3. Create Student
    const student = await Student.create({
      name,
      standard: Number(standard),
      parentName,
      parentEmail: parentEmail.toLowerCase(),
      parentPhone,
      address,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      profilePhoto,
      parentId: parentUser._id,
      fatherName: fatherName || '',
      motherName: motherName || '',
      rollNo: rollNo ? rollNo.toUpperCase() : undefined,
    });

    // 4. Link Student to Parent User
    parentUser.studentId = student._id;
    await parentUser.save();

    // 5. Automatically create a Fee record for the current month
    const currentDate = new Date();
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Fee Structure: Grades 1-5 = 200, Grades 6-7 = 300, Grades 8-9 = 400
    let feeAmount = 200;
    const std = Number(standard);
    if (std >= 6 && std <= 7) {
      feeAmount = 300;
    } else if (std >= 8 && std <= 9) {
      feeAmount = 400;
    }

    await Fee.create({
      studentId: student._id,
      month: currentMonthStr,
      amount: feeAmount,
      status: 'pending',
    });

    // Send welcome email to parent with credentials
    await sendParentWelcomeEmail(parentEmail, parentName, parentPassword);

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Teacher
export const getStudents = async (req, res) => {
  try {
    const { standard } = req.query;
    const query = {};
    if (standard) {
      query.standard = Number(standard);
    }
    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get paginated student roster with stats
// @route   GET /api/students/roster
// @access  Private/Teacher
export const getStudentRoster = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25, 
      search = '', 
      grade = 'all', 
      sort = 'newest' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // 1. Fetch all basic students matching grade & search
    let query = {};
    if (grade !== 'all') {
      query.standard = Number(grade);
    }
    
    let students = await Student.find(query).lean();

    // 2. Client-side search (Name, Roll, Parent, Phone)
    if (search) {
      const lowerSearch = search.toLowerCase();
      students = students.filter(s => 
        (s.name && s.name.toLowerCase().includes(lowerSearch)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(lowerSearch)) ||
        (s.parentName && s.parentName.toLowerCase().includes(lowerSearch)) ||
        (s.parentPhone && s.parentPhone.toLowerCase().includes(lowerSearch))
      );
    }

    // 3. Compute stats for all matching students
    // We need Attendance %, Average Marks, Luna Count
    const studentIds = students.map(s => s._id);

    // a. Luna Count
    const lunas = await LunaAward.aggregate([
      { $match: { studentId: { $in: studentIds }, status: 'awarded' } },
      { $group: { _id: "$studentId", totalCount: { $sum: "$count" } } }
    ]);
    const lunaMap = {};
    lunas.forEach(l => { lunaMap[l._id] = l.totalCount; });

    // b. Working Days for Attendance
    const workingDaysObjectsAll = await Attendance.aggregate([
      { $match: { status: { $in: ['present', 'absent'] } } },
      { $group: { _id: "$date" } }
    ]);
    const globalWorkingDaysAll = new Set(workingDaysObjectsAll.map(d => d._id.toISOString().split('T')[0]));

    // c. Attendance & Test Averages
    // Fetch all attendance for matching students
    const allAttendance = await Attendance.find({ studentId: { $in: studentIds } }).lean();
    const attendanceByStudent = {};
    allAttendance.forEach(a => {
      if (!attendanceByStudent[a.studentId]) attendanceByStudent[a.studentId] = [];
      attendanceByStudent[a.studentId].push(a);
    });

    // Fetch all tests for matching students
    // Average Marks = total marks / total max marks
    // We must find unique conducted tests globally
    const allTests = await Test.find({ studentId: { $in: studentIds } }).lean();
    const testsByStudent = {};
    allTests.forEach(t => {
      if (!testsByStudent[t.studentId]) testsByStudent[t.studentId] = [];
      testsByStudent[t.studentId].push(t);
    });

    const rosterData = students.map(student => {
      // Attendance
      const studentRecords = attendanceByStudent[student._id] || [];
      const attStats = calculateAttendanceStats(studentRecords, student.joiningDate, null, globalWorkingDaysAll);
      
      // Tests Average
      const studentTests = testsByStudent[student._id] || [];
      let totalObtained = 0;
      let totalMax = 0;
      studentTests.forEach(t => {
        totalObtained += t.marksObtained;
        totalMax += t.maxMarks;
      });
      let averageMarks = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : null;

      return {
        ...student,
        attendancePercentage: attStats.attendancePercentage,
        averageMarks: averageMarks ? Number(averageMarks) : null,
        lunaCount: lunaMap[student._id] || 0
      };
    });

    // 4. Sort
    if (sort === 'newest') rosterData.sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
    else if (sort === 'oldest') rosterData.sort((a, b) => new Date(a.joiningDate) - new Date(b.joiningDate));
    else if (sort === 'roll') rosterData.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));
    else if (sort === 'name') rosterData.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'highest_attendance') rosterData.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
    else if (sort === 'highest_luna') rosterData.sort((a, b) => b.lunaCount - a.lunaCount);

    // 5. Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedData = rosterData.slice(startIndex, endIndex);

    res.json({
      data: paginatedData,
      total: rosterData.length,
      page: pageNum,
      totalPages: Math.ceil(rosterData.length / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student profile & stats
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    // Both teacher and parents can view student profiles
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Security check: parents/students can only view their own child
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent && String(req.user.studentId) !== String(student._id)) {
      return res.status(403).json({ message: 'Access denied. You can only view your own child.' });
    }

    // Get Lunas summary
    const lunas = await LunaAward.find({ studentId: student._id, status: 'awarded' });
    const counts = {
      green: lunas.filter(l => l.lunaType === 'green').reduce((acc, curr) => acc + curr.count, 0),
      purple: lunas.filter(l => l.lunaType === 'purple').reduce((acc, curr) => acc + curr.count, 0),
      orange: lunas.filter(l => l.lunaType === 'orange').reduce((acc, curr) => acc + curr.count, 0),
      blue: lunas.filter(l => l.lunaType === 'blue').reduce((acc, curr) => acc + curr.count, 0),
    };
    const totalLunas = Object.values(counts).reduce((a, b) => a + b, 0);

    // Get rank info (Overall)
    // To calculate overall rank: aggregate all student lunas and rank them
    const allLunas = await LunaAward.aggregate([
      { $match: { status: 'awarded' } },
      { $group: { _id: '$studentId', total: { $sum: '$count' } } },
      { $sort: { total: -1 } }
    ]);
    
    // Find index of student in allLunas
    let rank = 1;
    const studentLunaRecord = allLunas.find(l => String(l._id) === String(student._id));
    if (studentLunaRecord) {
      rank = allLunas.indexOf(studentLunaRecord) + 1;
    } else {
      // If student has no lunas, rank them at the end
      const studentsWithLunasCount = allLunas.length;
      rank = studentsWithLunasCount + 1;
    }

    res.json({
      student,
      lunasSummary: {
        counts,
        total: totalLunas,
      },
      rank,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student details & Parent account
// @route   PUT /api/students/:id
// @access  Private/Teacher
export const updateStudent = async (req, res) => {
  const {
    name,
    standard,
    parentName,
    parentEmail,
    parentPhone,
    address,
    joiningDate,
    parentPassword,
    fatherName,
    motherName,
    rollNo,
  } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if new parent email conflicts with another user
    if (parentEmail && parentEmail.toLowerCase() !== student.parentEmail) {
      const emailExists = await User.findOne({ email: parentEmail.toLowerCase(), _id: { $ne: student.parentId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Parent email already registered to another user' });
      }
    }

    // Check if new rollNo conflicts with another student
    if (rollNo && rollNo.toUpperCase() !== student.rollNo) {
      const rollExists = await Student.findOne({ rollNo: rollNo.toUpperCase(), _id: { $ne: student._id } });
      if (rollExists) {
        return res.status(400).json({ message: `Roll number ${rollNo.toUpperCase()} is already assigned` });
      }
    }

    // Update parent user profile
    const parent = await User.findById(student.parentId);
    if (parent) {
      if (parentName) parent.name = parentName;
      if (parentEmail) parent.email = parentEmail.toLowerCase();
      if (parentPassword) {
        parent.password = parentPassword; // pre-save middleware will hash it
      }
      await parent.save();
    }

    // Update profile photo if upload
    let profilePhoto = student.profilePhoto;
    if (req.file) {
      // Delete old photo if exists
      if (student.profilePhoto) {
        const oldPath = path.join(process.cwd(), student.profilePhoto);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.error('Failed to delete old profile photo:', e);
          }
        }
      }
      profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    // Update student fields
    student.name = name || student.name;
    student.standard = standard ? Number(standard) : student.standard;
    student.parentName = parentName || student.parentName;
    student.parentEmail = parentEmail ? parentEmail.toLowerCase() : student.parentEmail;
    student.parentPhone = parentPhone || student.parentPhone;
    student.address = address || student.address;
    student.joiningDate = joiningDate ? new Date(joiningDate) : student.joiningDate;
    student.profilePhoto = profilePhoto;
    if (fatherName !== undefined) student.fatherName = fatherName;
    if (motherName !== undefined) student.motherName = motherName;
    if (rollNo !== undefined) student.rollNo = rollNo ? rollNo.toUpperCase() : undefined;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student & Parent account cascade
// @route   DELETE /api/students/:id
// @access  Private/Teacher
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete profile photo from system if exists
    if (student.profilePhoto) {
      const photoPath = path.join(process.cwd(), student.profilePhoto);
      if (fs.existsSync(photoPath)) {
        try {
          fs.unlinkSync(photoPath);
        } catch (e) {
          console.error('Failed to delete profile photo file:', e);
        }
      }
    }

    // Delete Parent User Account
    await User.findByIdAndDelete(student.parentId);

    // Cascade delete student records
    await Attendance.deleteMany({ studentId: student._id });
    await Test.deleteMany({ studentId: student._id });
    await Luna.deleteMany({ studentId: student._id });
    await Fee.deleteMany({ studentId: student._id });
    await Handwriting.deleteMany({ studentId: student._id });

    // Delete student
    await Student.findByIdAndDelete(student._id);

    res.json({ message: 'Student and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
