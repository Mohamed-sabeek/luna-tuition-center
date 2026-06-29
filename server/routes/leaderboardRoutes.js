import express from 'express';
import {
  getOverallLeaderboard,
  getClassLeaderboard,
  getMonthlyLeaderboard,
} from '../controllers/leaderboardController.js';

const router = express.Router();

// Public routes — leaderboard is visible without login
router.get('/overall', getOverallLeaderboard);
router.get('/class/:standard', getClassLeaderboard);
router.get('/monthly', getMonthlyLeaderboard);

export default router;
