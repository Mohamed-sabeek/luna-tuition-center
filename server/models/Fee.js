import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    month: {
      type: String, // format: "YYYY-MM" (e.g., "2026-06")
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate fee entries for the same student and month
feeSchema.index({ studentId: 1, month: 1 }, { unique: true });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
