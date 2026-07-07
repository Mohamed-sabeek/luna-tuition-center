import Test from '../models/Test.js';
import Attendance from '../models/Attendance.js';
import Handwriting from '../models/Handwriting.js';
import Student from '../models/Student.js';
import LunaAward from '../models/LunaAward.js';
import { getMondayAndSaturday } from './attendanceController.js';

// ─────────────────────────────────────────────────────────────────────────────
// LUNA TYPE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
export const LUNA_CONFIG = {
  green: {
    label: 'Green Luna',
    description: 'Scored 100% (Full Marks) in a test',
    color: 'emerald',
    emoji: '🟢',
    source: 'marks',
  },
  purple: {
    label: 'Purple Luna',
    description: 'Perfect attendance for the week',
    color: 'purple',
    emoji: '🟣',
    source: 'attendance',
  },
  orange: {
    label: 'Orange Luna',
    description: 'Completed 2-Line handwriting for the week',
    color: 'orange',
    emoji: '🟠',
    source: 'handwriting',
  },
  blue: {
    label: 'Blue Luna',
    description: 'Completed 4-Line handwriting for the week',
    color: 'blue',
    emoji: '🔵',
    source: 'handwriting',
  },
};

// Helper: format Date to YYYY-MM-DD locally
const formatDateLocal = (d) => {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/luna-awards/eligible
// ─────────────────────────────────────────────────────────────────────────────
export const getEligibleStudents = async (req, res) => {
  const { grade, lunaType, date, searchTerm, searchRoll, onlyNotAwarded } = req.query;

  try {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(12, 0, 0, 0);

    const eligibleList = [];

    // ── 1. GREEN LUNA (MARKS) ──
    if (!lunaType || lunaType === 'all' || lunaType === 'green') {
      const awardQuery = { 
        lunaType: 'green'
      };
      
      // If we are looking for pending awards, ignore the date filter to show the full queue.
      // Otherwise, show all green lunas for the selected month.
      if (onlyNotAwarded === 'true') {
        awardQuery.status = 'pending';
      } else {
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
        awardQuery.eligibilityDate = { $gte: startOfMonth, $lte: endOfMonth };
      }
      
      const greenLunas = await LunaAward.find(awardQuery)
        .populate('studentId', 'name rollNo standard profilePhoto');
        
      for (const award of greenLunas) {
        if (!award.studentId) continue;
        
        // If grade filter is applied
        if (grade && grade !== 'all' && String(award.studentId.standard) !== grade) {
          continue;
        }

        eligibleList.push({
          id: `test_${award.achievementReference}`,
          studentId: award.studentId._id,
          studentName: award.studentId.name,
          rollNo: award.studentId.rollNo || '-',
          standard: award.studentId.standard,
          profilePhoto: award.studentId.profilePhoto || null,
          lunaType: 'green',
          lunaLabel: LUNA_CONFIG.green.label,
          lunaEmoji: LUNA_CONFIG.green.emoji,
          lunaColor: LUNA_CONFIG.green.color,
          achievementSource: 'marks',
          achievementReference: award.achievementReference,
          reason: award.reason,
          date: award.eligibilityDate,
          alreadyAwarded: award.status === 'awarded',
          awardedAt: award.status === 'awarded' ? award.awardedAt : null,
        });
      }
    }

    // Determine all weeks to evaluate for weekly Lunas
    const evaluateWeeks = [];
    
    // Evaluate all Saturdays in the month of targetDate UP TO the most recently completed Saturday relative to targetDate.
    let evalDate = new Date(targetDate);
    const currentDay = evalDate.getDay();
    if (currentDay !== 6) {
      const daysToSubtract = currentDay === 0 ? 1 : currentDay + 1;
      evalDate.setDate(evalDate.getDate() - daysToSubtract);
    }
    
    const year = evalDate.getFullYear();
    const month = evalDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i, 12, 0, 0, 0);
      if (d.getDay() === 6 && d <= evalDate) {
        evaluateWeeks.push(d);
      }
    }

    const studentQuery = grade && grade !== 'all' ? { standard: Number(grade) } : {};
    const allStudents = await Student.find(studentQuery).select('_id name rollNo standard profilePhoto');

    // Loop through all weeks that need evaluation
    for (const weekEnd of evaluateWeeks) {
      const { monday, saturday } = getMondayAndSaturday(weekEnd);
      const weekKey = saturday.toISOString().split('T')[0];

      // Find global working days for attendance this week
      const attWorkingDaysObjects = await Attendance.aggregate([
        { $match: { date: { $gte: monday, $lte: saturday }, status: { $in: ['present', 'absent', 'late', 'half_day'] } } },
        { $group: { _id: "$date" } }
      ]);
      const attGlobalWorkingDays = new Set(attWorkingDaysObjects.map(d => formatDateLocal(d._id)));

      // ── 2. PURPLE LUNA (ATTENDANCE) ──
      if (!lunaType || lunaType === 'all' || lunaType === 'purple') {
      if (attGlobalWorkingDays.size > 0) {
        for (const student of allStudents) {
          const weekRecords = await Attendance.find({
            studentId: student._id,
            date: { $gte: monday, $lte: saturday },
          });
          
          let isEligible = true;
          // Check if student was present on every working day
          for (const wd of attGlobalWorkingDays) {
            const record = weekRecords.find(r => formatDateLocal(r.date) === wd);
            if (!record || record.status !== 'present') {
              isEligible = false;
              break;
            }
          }

          if (isEligible) {
            const achievementRef = `att_${student._id}_${weekKey}`;
            const alreadyAwarded = await LunaAward.findOne({
              studentId: student._id,
              lunaType: 'purple',
              achievementReference: achievementRef,
            });

            eligibleList.push({
              id: achievementRef,
              studentId: student._id,
              studentName: student.name,
              rollNo: student.rollNo || '-',
              standard: student.standard,
              profilePhoto: student.profilePhoto || null,
              lunaType: 'purple',
              lunaLabel: LUNA_CONFIG.purple.label,
              lunaEmoji: LUNA_CONFIG.purple.emoji,
              lunaColor: LUNA_CONFIG.purple.color,
              achievementSource: 'attendance',
              achievementReference: achievementRef,
              reason: `Attended every class from Monday to Saturday`,
              date: saturday,
              alreadyAwarded: !!alreadyAwarded,
              awardedAt: alreadyAwarded?.awardedAt || null,
            });
          }
        }
      }
      }

      // ── 3 & 4. ORANGE & BLUE LUNA (HANDWRITING) ──
      const processHandwritingLuna = async (lType, bookType) => {
        // Only Grades 1-8
        const eligibleStudents = allStudents.filter(s => s.standard >= 1 && s.standard <= 8);
        
        // Generate an array of Mon-Fri date strings for this week
        const monToFriDates = [];
        for (let i = 0; i <= 4; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          monToFriDates.push(formatDateLocal(d));
        }

        for (const student of eligibleStudents) {
          const weekRecords = await Handwriting.find({
            studentId: student._id,
            date: { $gte: monday, $lte: saturday },
            handwritingType: bookType
          });
          
          let isEligible = true;
          // Must have a completed record for every Mon-Fri day
          for (const wd of monToFriDates) {
            const record = weekRecords.find(r => formatDateLocal(r.date) === wd);
            if (!record || record.status !== 'completed') {
              isEligible = false;
              break;
            }
          }

          if (isEligible) {
            const achievementRef = `hw_${bookType}_${student._id}_${weekKey}`;
            const alreadyAwarded = await LunaAward.findOne({
              studentId: student._id,
              lunaType: lType,
              achievementReference: achievementRef,
            });

            eligibleList.push({
              id: achievementRef,
              studentId: student._id,
              studentName: student.name,
              rollNo: student.rollNo || '-',
              standard: student.standard,
              profilePhoto: student.profilePhoto || null,
              lunaType: lType,
              lunaLabel: LUNA_CONFIG[lType].label,
              lunaEmoji: LUNA_CONFIG[lType].emoji,
              lunaColor: LUNA_CONFIG[lType].color,
              achievementSource: 'handwriting',
              achievementReference: achievementRef,
              reason: `Completed ${bookType === '2-line' ? '2-Line' : '4-Line'} writing every day from Monday to Saturday`,
              date: saturday,
              alreadyAwarded: !!alreadyAwarded,
              awardedAt: alreadyAwarded?.awardedAt || null,
            });
          }
        }
      };

      if (!lunaType || lunaType === 'all' || lunaType === 'orange') {
        await processHandwritingLuna('orange', '2-line');
      }

      if (!lunaType || lunaType === 'all' || lunaType === 'blue') {
        await processHandwritingLuna('blue', '4-line');
      }
    }

    // ── Apply filters ──
    let filtered = eligibleList;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => e.studentName.toLowerCase().includes(term));
    }

    if (searchRoll) {
      const roll = searchRoll.toLowerCase();
      filtered = filtered.filter(e => e.rollNo.toLowerCase().includes(roll));
    }

    if (onlyNotAwarded === 'true') {
      filtered = filtered.filter(e => !e.alreadyAwarded);
    }

    res.json({
      eligible: filtered,
      totalEligible: filtered.length,
      notYetAwarded: filtered.filter(e => !e.alreadyAwarded).length,
      alreadyAwarded: filtered.filter(e => e.alreadyAwarded).length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/luna-awards/award
// Teacher manually confirms an award for a specific eligibility record.
// ─────────────────────────────────────────────────────────────────────────────
export const awardLuna = async (req, res) => {
  const { studentId, lunaType, achievementSource, achievementReference, reason, teacherNotes, date } = req.body;

  if (!studentId || !lunaType || !achievementSource || !reason) {
    return res.status(400).json({ message: 'Missing required award fields.' });
  }

  try {
    // Prevent duplicate awards
    if (achievementReference) {
      const existing = await LunaAward.findOne({
        studentId,
        lunaType,
        achievementReference,
      });
      if (existing && existing.status === 'awarded') {
        return res.status(409).json({ message: 'This Luna has already been awarded for this achievement.' });
      }
    }

    let award;
    if (achievementReference) {
      award = await LunaAward.findOneAndUpdate(
        { studentId, lunaType, achievementReference },
        {
          $set: {
            achievementSource,
            reason,
            teacherNotes: teacherNotes || '',
            awardedBy: req.user._id,
            awardedAt: new Date(),
            status: 'awarded',
            count: 1,
          },
          $setOnInsert: {
            eligibilityDate: date ? new Date(date) : new Date(),
          }
        },
        { new: true, upsert: true }
      );
    } else {
      award = await LunaAward.create({
        studentId,
        lunaType,
        achievementSource,
        achievementReference: null,
        reason,
        teacherNotes: teacherNotes || '',
        awardedBy: req.user._id,
        eligibilityDate: date ? new Date(date) : new Date(),
        awardedAt: new Date(),
        status: 'awarded',
        count: 1,
      });
    }

    const populated = await LunaAward.findById(award._id)
      .populate('studentId', 'name rollNo standard')
      .populate('awardedBy', 'name');

    res.status(201).json({ message: 'Luna awarded successfully!', award: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate award prevented. This Luna was already awarded.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/luna-awards/history
// Returns paginated award history with filters.
// ─────────────────────────────────────────────────────────────────────────────
export const getAwardHistory = async (req, res) => {
  const { grade, lunaType, month, searchTerm, page = 1, limit = 50 } = req.query;

  try {
    const query = { status: 'awarded' };

    if (lunaType && lunaType !== 'all') {
      query.lunaType = lunaType;
    }

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const start = new Date(Number(yearStr), Number(monthStr) - 1, 1);
      const end = new Date(Number(yearStr), Number(monthStr), 0, 23, 59, 59);
      query.awardedAt = { $gte: start, $lte: end };
    }

    if (grade && grade !== 'all') {
      const studentsInGrade = await Student.find({ standard: Number(grade) }).select('_id');
      query.studentId = { $in: studentsInGrade.map(s => s._id) };
    }

    let awards = await LunaAward.find(query)
      .populate('studentId', 'name rollNo standard profilePhoto')
      .populate('awardedBy', 'name')
      .sort({ awardedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      awards = awards.filter(a => a.studentId?.name?.toLowerCase().includes(term));
    }

    const total = await LunaAward.countDocuments(query);

    res.json({ awards, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/luna-awards/:id
// Revoke an award (soft delete — sets status to 'revoked')
// ─────────────────────────────────────────────────────────────────────────────
export const revokeAward = async (req, res) => {
  try {
    const award = await LunaAward.findById(req.params.id);
    if (!award) {
      return res.status(404).json({ message: 'Award record not found.' });
    }

    award.status = 'revoked';
    await award.save();

    res.json({ message: 'Luna award revoked successfully.', award });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/luna-awards/student/:studentId
// Returns all awarded Lunas for a student (for wallet display)
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentLunaWallet = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Security: parents/students can only view their own
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent && String(req.user.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const awards = await LunaAward.find({ studentId, status: 'awarded' })
      .populate('awardedBy', 'name')
      .sort({ awardedAt: -1 });

    const totalCount = awards.reduce((sum, a) => sum + a.count, 0);

    // Build breakdown by type
    const breakdown = {};
    awards.forEach(a => {
      if (!breakdown[a.lunaType]) {
        breakdown[a.lunaType] = {
          count: 0,
          label: LUNA_CONFIG[a.lunaType]?.label || a.lunaType,
          emoji: LUNA_CONFIG[a.lunaType]?.emoji || '🌙',
          color: LUNA_CONFIG[a.lunaType]?.color || 'slate',
        };
      }
      breakdown[a.lunaType].count += a.count;
    });

    res.json({ awards, totalCount, breakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/luna-awards/stats
// Dashboard summary stats for teacher Luna center
// ─────────────────────────────────────────────────────────────────────────────
export const getLunaAwardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      LunaAward.countDocuments({ status: 'awarded', awardedAt: { $gte: todayStart, $lte: todayEnd } }),
      LunaAward.countDocuments({ status: 'awarded', awardedAt: { $gte: weekStart } }),
      LunaAward.countDocuments({ status: 'awarded', awardedAt: { $gte: monthStart } }),
      LunaAward.countDocuments({ status: 'awarded' }),
    ]);

    res.json({ todayCount, weekCount, monthCount, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
