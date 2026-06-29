import express from 'express';
import {
  createStudent,
  getStudents,
  getStudentRoster,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/roster')
  .get(protect, authorizeRoles('teacher'), getStudentRoster);

router
  .route('/')
  .post(protect, authorizeRoles('teacher'), upload.single('profilePhoto'), createStudent)
  .get(protect, authorizeRoles('teacher'), getStudents);

router
  .route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorizeRoles('teacher'), upload.single('profilePhoto'), updateStudent)
  .delete(protect, authorizeRoles('teacher'), deleteStudent);

export default router;
