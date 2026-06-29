import Material from '../models/Material.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload new study material
// @route   POST /api/materials
// @access  Private/Teacher
export const uploadMaterial = async (req, res) => {
  const { title, description, standard } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  try {
    const material = await Material.create({
      title,
      description,
      standard: Number(standard),
      filePath: `/uploads/materials/${req.file.filename}`,
      fileName: req.file.originalname,
    });

    res.status(201).json(material);
  } catch (error) {
    // Delete file if creation fails
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads/materials', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get study materials
// @route   GET /api/materials
// @access  Private
export const getMaterials = async (req, res) => {
  try {
    let query = {};

    // Parents can only view materials matching their child's standard
    const isStudentOrParent = req.user.role === 'parent' || req.user.role === 'student';
    if (isStudentOrParent) {
      if (!req.user.studentId) {
        return res.status(400).json({ message: 'No student linked to parent profile' });
      }
      
      // Look up student standard
      const Student = (await import('../models/Student.js')).default;
      const student = await Student.findById(req.user.studentId);
      if (!student) {
        return res.status(404).json({ message: 'Linked student not found' });
      }
      query.standard = student.standard;
    } else {
      // Teacher can filter by standard if query provided
      const { standard } = req.query;
      if (standard) {
        query.standard = Number(standard);
      }
    }

    const materials = await Material.find(query).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private/Teacher
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Delete local file
    const filePath = path.join(process.cwd(), material.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to delete material file:', e);
      }
    }

    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
