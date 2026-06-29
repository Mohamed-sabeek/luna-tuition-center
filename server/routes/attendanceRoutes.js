import express from 'express';
import {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendanceStats,
  getAttendanceByMonth,
  saveSingleAttendance,
  bulkAttendanceOperations,
} from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('teacher'), markAttendance);
router.post('/single', protect, authorizeRoles('teacher'), saveSingleAttendance);
router.post('/bulk-ops', protect, authorizeRoles('teacher'), bulkAttendanceOperations);
router.get('/month', protect, authorizeRoles('teacher'), getAttendanceByMonth);
router.get('/date/:date', protect, authorizeRoles('teacher'), getAttendanceByDate);
router.get('/student/:studentId', protect, getStudentAttendanceStats);

export default router;
