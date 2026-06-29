import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    standard: {
      type: Number,
      required: true,
      min: 1,
      max: 9,
    },
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    motherName: {
      type: String,
      trim: true,
      default: '',
    },
    parentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    profilePhoto: {
      type: String, // local path or URL
      default: '',
    },
    rollNo: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
