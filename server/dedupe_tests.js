import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Test = mongoose.model('Test', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, date: Date, marksObtained: Number, subject: String, type: String }));
  
  const allTests = await Test.find({});
  const testMap = new Map();
  let deletedCount = 0;

  for (const test of allTests) {
    const key = `${test.studentId}-${test.date.toISOString()}-${test.subject}-${test.type}`;
    if (testMap.has(key)) {
      // It's a duplicate, delete it!
      // Keep the one with higher marks, or just delete the oldest one. Let's keep the one already in the map and delete this one.
      // Wait, let's keep the most recently updated one.
      const existing = testMap.get(key);
      if (test.updatedAt > existing.updatedAt) {
         await Test.findByIdAndDelete(existing._id);
         testMap.set(key, test);
         deletedCount++;
      } else {
         await Test.findByIdAndDelete(test._id);
         deletedCount++;
      }
    } else {
      testMap.set(key, test);
    }
  }

  console.log(`Deduplication complete. Deleted ${deletedCount} duplicate test records.`);
  process.exit();
}).catch(console.error);
