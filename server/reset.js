/**
 * Reset Script — Clears all Attendance, Luna, LunaAward records from the database.
 * Run with: node reset.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ No MongoDB URI found in .env (MONGO_URI or MONGODB_URI)');
  process.exit(1);
}

const AttendanceSchema = new mongoose.Schema({}, { strict: false });
const LunaSchema       = new mongoose.Schema({}, { strict: false });
const LunaAwardSchema  = new mongoose.Schema({}, { strict: false });
const FeeSchema        = new mongoose.Schema({}, { strict: false });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Luna       = mongoose.model('Luna',       LunaSchema);
const LunaAward  = mongoose.model('LunaAward',  LunaAwardSchema);
const Fee        = mongoose.model('Fee',         FeeSchema);

async function reset() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const attCount  = await Attendance.countDocuments();
  const lunaCount = await Luna.countDocuments();
  const awardCount = await LunaAward.countDocuments();
  const feeCount  = await Fee.countDocuments();

  console.log(`📊 Records found:`);
  console.log(`   Attendance : ${attCount}`);
  console.log(`   Luna       : ${lunaCount}`);
  console.log(`   LunaAward  : ${awardCount}`);
  console.log(`   Fees       : ${feeCount}`);
  console.log('');

  const attDel   = await Attendance.deleteMany({});
  const lunaDel  = await Luna.deleteMany({});
  const awardDel = await LunaAward.deleteMany({});
  const feeDel   = await Fee.deleteMany({});

  console.log('🗑️  Deleted:');
  console.log(`   Attendance : ${attDel.deletedCount} records`);
  console.log(`   Luna       : ${lunaDel.deletedCount} records`);
  console.log(`   LunaAward  : ${awardDel.deletedCount} records`);
  console.log(`   Fees       : ${feeDel.deletedCount} records`);
  console.log('');
  console.log('✅ Reset complete. Database is clean.');

  await mongoose.disconnect();
  process.exit(0);
}

reset().catch(err => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});
