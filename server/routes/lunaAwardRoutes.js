import express from 'express';
import {
  getEligibleStudents,
  awardLuna,
  getAwardHistory,
  revokeAward,
  getStudentLunaWallet,
  getLunaAwardStats,
} from '../controllers/lunaEligibilityController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher routes
router.get('/eligible', protect, authorizeRoles('teacher'), getEligibleStudents);
router.post('/award', protect, authorizeRoles('teacher'), awardLuna);
router.get('/history', protect, authorizeRoles('teacher'), getAwardHistory);
router.get('/stats', protect, authorizeRoles('teacher'), getLunaAwardStats);
router.delete('/:id', protect, authorizeRoles('teacher'), revokeAward);

// Student/Parent routes
router.get('/student/:studentId', protect, getStudentLunaWallet);

export default router;
