import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Ensure directories exist
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// --- Local Storage Configuration (for materials, etc.) ---
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/';
    if (file.fieldname === 'materialFile') {
      dest = 'uploads/materials/';
    }
    createDirectory(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const localFileFilter = (req, file, cb) => {
  if (file.fieldname === 'materialFile') {
    cb(null, true);
  } else {
    cb(null, true);
  }
};

export const uploadLocal = multer({
  storage: localStorage,
  fileFilter: localFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// --- Cloudinary Storage Configuration (for profile photos) ---
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luna-tuition-center/students',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // Cloudinary automatically generates a unique public_id, but we can configure it if needed
  },
});

const cloudinaryFileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePhoto') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photos!'), false);
    }
  } else {
    cb(new Error('Invalid field name for cloudinary upload'), false);
  }
};

export const uploadCloudinary = multer({
  storage: cloudinaryStorage,
  fileFilter: cloudinaryFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile photos
  },
});

// For backward compatibility with older routes, export local by default
export default uploadLocal;
