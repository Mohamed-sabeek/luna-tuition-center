import Luna from '../models/Luna.js';
import Student from '../models/Student.js';

// @desc    Get detailed Lunas for a student
// @route   GET /api/lunas/student/:studentId
// @access  Private
export const getStudentLunas = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Security check
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent && String(req.user.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const lunas = await Luna.find({ studentId }).sort({ date: -1 });

    const breakdown = {
      full_marks: lunas.filter(l => ['full_marks', 'gold_luna', 'blue_luna', 'purple_luna', 'orange_luna'].includes(l.type)).reduce((acc, curr) => acc + curr.count, 0),
      attendance: lunas.filter(l => l.type === 'attendance').reduce((acc, curr) => acc + curr.count, 0),
      handwriting_2_line: lunas.filter(l => l.type === 'handwriting_2_line').reduce((acc, curr) => acc + curr.count, 0),
      handwriting_4_line: lunas.filter(l => l.type === 'handwriting_4_line').reduce((acc, curr) => acc + curr.count, 0),
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    res.json({
      student,
      lunas,
      breakdown,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all awarded lunas (Teacher only)
// @route   GET /api/lunas
// @access  Private/Teacher
export const getAllLunas = async (req, res) => {
  try {
    const lunas = await Luna.find().populate('studentId', 'name standard').sort({ date: -1 });
    res.json(lunas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
