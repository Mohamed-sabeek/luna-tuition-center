import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    standard: {
      type: Number,
      required: true,
    },
    totalLunas: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['overall', 'class', 'monthly'],
      required: true,
    },
    period: {
      type: String, // 'overall', class standard (e.g. '5'), or monthly identifier (e.g. '2026-06')
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
