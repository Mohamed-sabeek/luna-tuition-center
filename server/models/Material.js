import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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
    filePath: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Material = mongoose.model('Material', materialSchema);
export default Material;
