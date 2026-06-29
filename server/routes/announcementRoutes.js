import express from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorizeRoles('teacher'), createAnnouncement)
  .get(protect, getAnnouncements);

router.delete('/:id', protect, authorizeRoles('teacher'), deleteAnnouncement);

export default router;
