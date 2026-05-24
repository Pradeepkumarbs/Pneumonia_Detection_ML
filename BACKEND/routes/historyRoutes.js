// backend/routes/historyRoutes.js
const express = require('express');
const Report  = require('../models/Report');
const { protect } = require('../middleware/authMiddleware');
const router  = express.Router();

// GET /api/history — get all reports for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/history/:id — get single report
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/history/:id/pdf — download PDF report
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { generatePDF } = require('../utils/generatePDF');
    const pdfBuffer = await generatePDF(report, req.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${report._id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/history/:id — delete a report
router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
