import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directories exist
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/';
    if (file.fieldname === 'profilePhoto') {
      dest = 'uploads/profiles/';
    } else if (file.fieldname === 'materialFile') {
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

// File filter (optional, e.g. for verifying file types)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePhoto') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photos!'), false);
    }
  } else if (file.fieldname === 'materialFile') {
    // Allow PDFs, Word docs, Images, etc. for materials
    cb(null, true);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
