import express from 'express';
import {
  getHandwritingByMonth,
  toggleSingleHandwriting,
  getStudentHandwriting,
} from '../controllers/handwritingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/month', protect, authorizeRoles('teacher'), getHandwritingByMonth);
router.post('/single', protect, authorizeRoles('teacher'), toggleSingleHandwriting);
router.get('/student/:studentId', protect, getStudentHandwriting);

export default router;
