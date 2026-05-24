// backend/routes/predictRoutes.js
const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');
const path     = require('path');
const Report   = require('../models/Report');
const { protect } = require('../middleware/authMiddleware');
const { sendEmailReport } = require('../utils/sendEmail');
const router   = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer config — save to uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPEG/PNG images allowed'));
  }
});

// POST /api/predict
router.post('/', protect, upload.single('xray'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    // 1. Forward image to FastAPI ML service
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
      form,
      { headers: form.getHeaders() }
    );

    const { prediction, confidence, threshold } = mlResponse.data;

    // 2. Save report to MongoDB
    const report = await Report.create({
      userId:     req.user._id,
      imagePath:  req.file.path,
      prediction,
      confidence,
      threshold
    });

    // 3. Send email report to user (non-blocking)
  sendEmailReport(req.user.email, req.user.name, prediction, confidence, report._id, report, req.user)
      .catch(err => console.error('Email failed:', err.message));

    res.json({ prediction, confidence, threshold, reportId: report._id });

  } catch (err) {
    console.error('Predict error:', err.message);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Prediction failed', error: err.message });
  }
});

module.exports = router;
