import express from 'express';
import { getStudentLunas, getAllLunas } from '../controllers/lunaController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('teacher'), getAllLunas);
router.get('/student/:studentId', protect, getStudentLunas);

export default router;
