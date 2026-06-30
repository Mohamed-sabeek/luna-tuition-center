import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Test = mongoose.model('Test', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, date: Date, marksObtained: Number, subject: String, type: String }));
  const LunaAward = mongoose.model('LunaAward', new mongoose.Schema({ achievementSource: String }, { strict: false }));
  
  const deletedTests = await Test.deleteMany({});
  const deletedLunas = await LunaAward.deleteMany({ achievementSource: 'marks' });
  
  console.log(`Successfully reset test data.`);
  console.log(`- Deleted ${deletedTests.deletedCount} test records.`);
  console.log(`- Deleted ${deletedLunas.deletedCount} associated Luna Awards.`);
  
  process.exit();
}).catch(console.error);
