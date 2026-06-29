import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import testRoutes from './routes/testRoutes.js';
import handwritingRoutes from './routes/handwritingRoutes.js';
import lunaRoutes from './routes/lunaRoutes.js';
import lunaAwardRoutes from './routes/lunaAwardRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Models for seeding
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  seedTeacher();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload folders exist
const dirs = ['uploads', 'uploads/profiles', 'uploads/materials'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/handwriting', handwritingRoutes);
app.use('/api/lunas', lunaRoutes);
app.use('/api/luna-awards', lunaAwardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Luna Tuition Center API is running...');
});

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Seed default teacher
async function seedTeacher() {
  try {
    const teacherExists = await User.findOne({ role: 'teacher' });
    if (!teacherExists) {
      await User.create({
        name: 'Luna Teacher',
        email: 'teacher@luna.com',
        password: 'password123', // Pre-save hooks will encrypt
        role: 'teacher',
      });
      console.log('Seeded default teacher account (teacher@luna.com / password123)');
    }
  } catch (error) {
    console.error('Error seeding teacher account:', error.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
