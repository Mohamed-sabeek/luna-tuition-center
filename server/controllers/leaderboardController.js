import Student from '../models/Student.js';
import LunaAward from '../models/LunaAward.js';
import Leaderboard from '../models/Leaderboard.js';

// Helper: Calculate rankings — uses LunaAward as single source of truth (same as Luna Wallet)
const calculateRankings = async (filterQuery = {}, lunaDateFilter = {}) => {
  const students = await Student.find(filterQuery);
  const ranksList = [];

  for (const student of students) {
    const lunaQuery = { studentId: student._id, status: 'awarded' };
    if (lunaDateFilter.start && lunaDateFilter.end) {
      lunaQuery.awardedAt = { $gte: lunaDateFilter.start, $lte: lunaDateFilter.end };
    }

    const studentLunas = await LunaAward.find(lunaQuery);
    const total = studentLunas.reduce((acc, curr) => acc + (curr.count || 1), 0);

    ranksList.push({
      studentId: student._id,
      name: student.name,
      standard: student.standard,
      totalLunas: total,
    });
  }

  // Sort by total Lunas descending
  ranksList.sort((a, b) => b.totalLunas - a.totalLunas);

  // Add rank numbers (handling ties or simple index)
  return ranksList.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
};

// Helper: Cache rankings to Leaderboard collection
const cacheRankings = async (rankings, type, period) => {
  try {
    // Clear old cache for this type & period
    await Leaderboard.deleteMany({ type, period });

    // Save new cache
    const docs = rankings.map(r => ({
      studentId: r.studentId,
      studentName: r.name,
      standard: r.standard,
      totalLunas: r.totalLunas,
      rank: r.rank,
      type,
      period,
    }));

    if (docs.length > 0) {
      await Leaderboard.insertMany(docs);
    }
  } catch (error) {
    console.error('Failed to cache rankings:', error);
  }
};

// @desc    Get Overall Leaderboard
// @route   GET /api/leaderboard/overall
// @access  Private
export const getOverallLeaderboard = async (req, res) => {
  try {
    const rankings = await calculateRankings();
    
    // Cache background write
    await cacheRankings(rankings, 'overall', 'overall');

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Class-wise Leaderboard
// @route   GET /api/leaderboard/class/:standard
// @access  Private
export const getClassLeaderboard = async (req, res) => {
  const standard = Number(req.params.standard);

  if (isNaN(standard) || standard < 1 || standard > 9) {
    return res.status(400).json({ message: 'Invalid standard. Must be between 1 and 9.' });
  }

  try {
    const rankings = await calculateRankings({ standard });
    
    // Cache background write
    await cacheRankings(rankings, 'class', String(standard));

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Monthly Leaderboard
// @route   GET /api/leaderboard/monthly
// @access  Private
export const getMonthlyLeaderboard = async (req, res) => {
  const { month } = req.query; // format: "YYYY-MM" (e.g., "2026-06")

  if (!month) {
    return res.status(400).json({ message: 'Month query parameter is required (format: YYYY-MM)' });
  }

  try {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const mNum = Number(monthStr);

    if (isNaN(year) || isNaN(mNum) || mNum < 1 || mNum > 12) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
    }

    const start = new Date(year, mNum - 1, 1);
    const end = new Date(year, mNum, 0, 23, 59, 59, 999);

    const rankings = await calculateRankings({}, { start, end });

    // Cache background write
    await cacheRankings(rankings, 'monthly', month);

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
