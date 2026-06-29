import express from 'express';
import {
  addTestScore,
  bulkAddTestScores,
  getStudentTests,
  deleteTestScore,
  saveStudentMark,
  getClassTests,
  getMonthlyClassTests,
  getTestsHistory,
  getStudentAcademicProfile
} from '../controllers/testController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('teacher'), addTestScore);
router.post('/bulk', protect, authorizeRoles('teacher'), bulkAddTestScores);
router.post('/save-mark', protect, authorizeRoles('teacher'), saveStudentMark);
router.get('/class', protect, authorizeRoles('teacher'), getClassTests);
router.get('/monthly', protect, authorizeRoles('teacher'), getMonthlyClassTests);
router.get('/history', protect, authorizeRoles('teacher'), getTestsHistory);
router.get('/profile/:studentId', protect, getStudentAcademicProfile);
router.get('/student/:studentId', protect, getStudentTests);
router.delete('/:id', protect, authorizeRoles('teacher'), deleteTestScore);

export default router;
