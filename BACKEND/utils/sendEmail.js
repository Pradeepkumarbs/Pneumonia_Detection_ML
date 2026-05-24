// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
const { generatePDF } = require('./generatePDF');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmailReport = async (email, name, prediction, confidence, reportId, report, user) => {
  const confidencePct = (confidence * 100).toFixed(1);
  const color  = prediction === 'PNEUMONIA' ? '#e53e3e' : '#38a169';
  const status = prediction === 'PNEUMONIA'
    ? 'Pneumonia signs detected. Please consult a doctor immediately.'
    : 'No pneumonia detected. Chest X-ray appears normal.';

  // Generate PDF buffer
  const pdfBuffer = await generatePDF(report, user);

  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: #2b6cb0; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🫁 Pneumonia Detection Report</h1>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <p style="color: #4a5568;">Dear <strong>${name}</strong>,</p>
        <p style="color: #4a5568;">Your chest X-ray analysis is complete. Please find your detailed PDF report attached.</p>

        <!-- Result Card -->
        <div style="background: ${prediction === 'PNEUMONIA' ? '#fff5f5' : '#f0fff4'}; border-left: 4px solid ${color}; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: ${color}; margin: 0 0 12px;">
            ${prediction === 'PNEUMONIA' ? '⚠️ PNEUMONIA DETECTED' : '✅ NORMAL'}
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #718096; padding: 4px 0;">Confidence Score</td>
              <td style="color: #2d3748; font-weight: bold;">${confidencePct}%</td>
            </tr>
            <tr>
              <td style="color: #718096; padding: 4px 0;">Decision Threshold</td>
              <td style="color: #2d3748; font-weight: bold;">${report.threshold}</td>
            </tr>
            <tr>
              <td style="color: #718096; padding: 4px 0;">Report ID</td>
              <td style="color: #2d3748; font-size: 12px;">${reportId}</td>
            </tr>
            <tr>
              <td style="color: #718096; padding: 4px 0;">Date</td>
              <td style="color: #2d3748;">${new Date(report.createdAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Confidence Bar -->
        <p style="color: #4a5568; margin-bottom: 6px;">Confidence Level</p>
        <div style="background: #e2e8f0; border-radius: 6px; height: 12px; width: 100%;">
          <div style="background: ${color}; width: ${confidencePct}%; height: 12px; border-radius: 6px;"></div>
        </div>
        <p style="color: ${color}; text-align: right; font-weight: bold; margin-top: 4px;">${confidencePct}%</p>

        <!-- Advice -->
        <div style="background: #f7fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #4a5568; margin: 0;"><strong>Clinical Advice:</strong> ${status}</p>
        </div>

        <!-- Model Info -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
          <p style="color: #a0aec0; font-size: 12px; margin: 4px 0;">Algorithm: Random Forest Classifier</p>
          <p style="color: #a0aec0; font-size: 12px; margin: 4px 0;">Features: HOG (Histogram of Oriented Gradients)</p>
          <p style="color: #a0aec0; font-size: 12px; margin: 4px 0;">Accuracy: 88.8% | Macro F1: 0.88 | ROC-AUC: 0.927</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f7fafc; padding: 16px; text-align: center;">
        <p style="color: #a0aec0; font-size: 11px; margin: 0;">
          ⚠️ This is an AI-based prediction and does not replace professional medical advice.
          Always consult a qualified physician for diagnosis and treatment.
        </p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from:    `"Pneumonia Detection System" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `Your X-ray Result: ${prediction} — Pneumonia Detection Report`,
    html,
    attachments: [
      {
        filename: `pneumonia_report_${reportId}.pdf`,
        content:  pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};

module.exports = { sendEmailReport };