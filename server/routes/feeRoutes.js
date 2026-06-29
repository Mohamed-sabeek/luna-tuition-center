import express from 'express';
import {

  getFees,
  updateFeeStatus,
  getStudentFees,
  getFeeStats,
} from '../controllers/feeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('teacher'), getFees);
router.get('/reports', protect, authorizeRoles('teacher'), getFeeStats);
router.put('/:id', protect, updateFeeStatus);
router.get('/student/:studentId', protect, getStudentFees);

export default router;
