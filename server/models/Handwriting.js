import mongoose from 'mongoose';

const handwritingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    handwritingType: {
      type: String,
      enum: ['2-line', '4-line'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'not_completed', 'not_checked'],
      default: 'not_checked',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same student, date, and handwritingType
handwritingSchema.index({ studentId: 1, date: 1, handwritingType: 1 }, { unique: true });

const Handwriting = mongoose.model('Handwriting', handwritingSchema);
export default Handwriting;
