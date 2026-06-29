import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// Helper to determine fee amount based on standard
export const getFeeAmount = (standard) => {
  const std = Number(standard);
  if (std >= 1 && std <= 5) return 200;
  if (std >= 6 && std <= 7) return 300;
  if (std >= 8 && std <= 9) return 400;
  return 200;
};



// @desc    Get all fee records with filters
// @route   GET /api/fees
// @access  Private/Teacher
export const getFees = async (req, res) => {
  const { month, status, standard } = req.query;

  try {
    let studentQuery = {};
    if (standard) {
      studentQuery.standard = Number(standard);
    }

    // Find student IDs matching standard filter
    const students = await Student.find(studentQuery);
    const studentIds = students.map(s => s._id);

    let feeQuery = { studentId: { $in: studentIds } };
    if (month) {
      feeQuery.month = month;
    }
    if (status) {
      feeQuery.status = status;
    }

    const fees = await Fee.find(feeQuery)
      .populate('studentId', 'name standard parentName parentEmail parentPhone')
      .sort({ month: -1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a fee record status (Mark Paid / Mark Pending)
// @route   PUT /api/fees/:id
// @access  Private/Teacher
export const updateFeeStatus = async (req, res) => {
  const { status } = req.body;

  if (!status || !['paid', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (paid/pending) is required' });
  }

  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    fee.status = status;
    fee.paidDate = status === 'paid' ? new Date() : null;

    const updatedFee = await fee.save();
    
    // Return populated student
    const populated = await Fee.findById(updatedFee._id).populate('studentId', 'name standard');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fee details for a student (Parent & Teacher)
// @route   GET /api/fees/student/:studentId
// @access  Private
export const getStudentFees = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Security check
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent && String(req.user.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const fees = await Fee.find({ studentId }).sort({ month: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fee collections statistics & reports
// @route   GET /api/fees/reports
// @access  Private/Teacher
export const getFeeStats = async (req, res) => {
  try {
    const allFees = await Fee.find({});

    const totalCollected = allFees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);

    const totalPending = allFees
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0);

    // Group collections by month
    const monthlyStats = {};
    allFees.forEach(fee => {
      if (!monthlyStats[fee.month]) {
        monthlyStats[fee.month] = { month: fee.month, collected: 0, pending: 0, total: 0 };
      }
      if (fee.status === 'paid') {
        monthlyStats[fee.month].collected += fee.amount;
      } else {
        monthlyStats[fee.month].pending += fee.amount;
      }
      monthlyStats[fee.month].total += fee.amount;
    });

    const monthlyStatsArray = Object.values(monthlyStats).sort((a, b) => b.month.localeCompare(a.month));

    res.json({
      totalCollected,
      totalPending,
      monthlyStats: monthlyStatsArray,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
