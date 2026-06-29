import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    fullMarksLunaAwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Test = mongoose.model('Test', testSchema);
export default Test;
