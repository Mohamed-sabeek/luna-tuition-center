import express from 'express';
import { getTeacherDashboardStats, getPublicStats, getParentDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/teacher', protect, authorizeRoles('teacher'), getTeacherDashboardStats);
router.get('/parent', protect, getParentDashboardStats);
router.get('/public-stats', getPublicStats);

export default router;
