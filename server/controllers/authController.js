import User from '../models/User.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';

// Generate Token with payload: { id, name, email, role }
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'luna_secret_key_987654321_secure', 
    {
      expiresIn: '30d',
    }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // 2. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // Normalize user's database role for portal verification ('parent' maps to 'student')
    const userRole = user.role === 'parent' ? 'student' : user.role;

    // 3. Compare selected role
    if (userRole !== role) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // 4. Generate JWT
    const token = generateToken(user);

    // 5. Find student detail if student/parent
    let student = null;
    if ((user.role === 'student' || user.role === 'parent') && user.studentId) {
      student = await Student.findById(user.studentId);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      student: student,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let student = null;
      if ((user.role === 'student' || user.role === 'parent') && user.studentId) {
        student = await Student.findById(user.studentId);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        student: student,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
