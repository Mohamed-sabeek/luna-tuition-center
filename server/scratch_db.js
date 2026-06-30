import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Test = mongoose.model('Test', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, date: Date, marksObtained: Number, subject: String, type: String }));
  const Student = mongoose.model('Student', new mongoose.Schema({ name: String }));
  
  const s = await Student.findOne({ name: 'Sabee' });
  if (!s) { console.log('Sabee not found'); process.exit(); }
  
  const tests = await Test.find({ studentId: s._id, date: { $gte: new Date('2026-06-25'), $lte: new Date('2026-06-27') } });
  console.log('TESTS:', tests);
  
  process.exit();
}).catch(console.error);
