import mongoose from 'mongoose';

const lunaSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    // Optional reference to the source (e.g. Test ID, Handwriting ID)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to avoid duplicate attendance lunas or handwriting lunas for the same week/event
lunaSchema.index({ studentId: 1, type: 1, referenceId: 1 }, { unique: true, sparse: true });

const Luna = mongoose.model('Luna', lunaSchema);
export default Luna;
