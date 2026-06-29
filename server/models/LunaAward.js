import mongoose from 'mongoose';

// LunaAward — Represents a confirmed, teacher-approved Luna award.
// Eligibility is determined separately by each module (marks, attendance, handwriting).
// This collection is the source of truth for all Luna rewards.

const lunaAwardSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    // The Luna type awarded
    lunaType: {
      type: String,
      enum: ['green', 'purple', 'orange', 'blue'],
      required: true,
    },
    // Where the eligibility originated from
    achievementSource: {
      type: String,
      enum: ['marks', 'attendance', 'handwriting', 'teacher_discretion'],
      required: true,
    },
    // Reference to the source record (Test._id, Attendance week key, Handwriting._id, etc.)
    achievementReference: {
      type: String, // Flexible string key to avoid hard model dependencies
      default: null,
    },
    // Human-readable reason for the award
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional notes from the teacher
    teacherNotes: {
      type: String,
      default: '',
      trim: true,
    },
    // The teacher who confirmed the award (null if pending)
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Date of the actual achievement (test date, attendance week end, etc.)
    eligibilityDate: {
      type: Date,
      default: Date.now,
    },
    // Date the award was manually given
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    // Status for future revoke/admin flow
    status: {
      type: String,
      enum: ['pending', 'awarded', 'revoked'],
      default: 'awarded',
    },
    // The count of lunas this award represents (usually 1)
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate awards for the exact same achievement reference + luna type per student
lunaAwardSchema.index({ studentId: 1, lunaType: 1, achievementReference: 1 }, { unique: true, sparse: true });

const LunaAward = mongoose.model('LunaAward', lunaAwardSchema);
export default LunaAward;
