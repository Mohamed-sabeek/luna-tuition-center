import express from 'express';
import { uploadMaterial, getMaterials, deleteMaterial } from '../controllers/materialController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorizeRoles('teacher'), upload.single('materialFile'), uploadMaterial)
  .get(protect, getMaterials);

router.delete('/:id', protect, authorizeRoles('teacher'), deleteMaterial);

export default router;
