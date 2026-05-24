// src/pages/History.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/history')
      .then(({ data }) => setReports(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (reportId) => {
    try {
      const response = await API.get(`/history/${reportId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `pneumonia_report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF. Please try again.');
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Delete this report permanently?')) return;
    setDeleting(reportId);
    try {
      await API.delete(`/history/${reportId}`);
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch {
      alert('Failed to delete report.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.center}>⏳ Loading your history...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.back}>← Dashboard</button>
          <h2 style={styles.title}>Prediction History</h2>
          <p style={styles.count}>{reports.length} record{reports.length !== 1 ? 's' : ''} found</p>
        </div>

        {reports.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize:'3rem' }}>📂</p>
            <p style={{ color:'#4a5568', fontWeight:'600' }}>No predictions yet</p>
            <p style={{ color:'#a0aec0', fontSize:'14px' }}>Upload a chest X-ray to get started.</p>
            <button onClick={() => navigate('/upload')} style={styles.uploadBtn}>Upload X-ray</button>
          </div>
        ) : (
          reports.map(report => {
            const isPneumonia = report.prediction === 'PNEUMONIA';
            const color = isPneumonia ? '#e53e3e' : '#38a169';
            return (
              <div key={report._id}
                   style={{ ...styles.card, borderLeft:`4px solid ${color}` }}>
                <div style={styles.cardTop}>
                  <span style={{ ...styles.badge, background: isPneumonia ? '#fff5f5' : '#f0fff4', color }}>
                    {isPneumonia ? '⚠️' : '✅'} {report.prediction}
                  </span>
                  <span style={styles.date}>
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <div style={styles.cardDetails}>
                  <span style={styles.detail}>
                    Confidence: <strong>{(report.confidence * 100).toFixed(1)}%</strong>
                  </span>
                  <span style={styles.detail}>
                    Threshold: <strong>{report.threshold}</strong>
                  </span>
                </div>

                {/* Confidence bar */}
                <div style={styles.barBg}>
                  <div style={{ ...styles.barFill, width:`${(report.confidence*100).toFixed(1)}%`, background: color }} />
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => downloadPDF(report._id)}
                    style={styles.pdfBtn}
                  >
                    📄 Download PDF
                  </button>
                  <button
                    onClick={() => deleteReport(report._id)}
                    disabled={deleting === report._id}
                    style={styles.deleteBtn}
                  >
                    {deleting === report._id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight:'100vh', background:'#f0f4f8', fontFamily:'Arial, sans-serif' },
  container:   { maxWidth:'700px', margin:'0 auto', padding:'2rem' },
  header:      { marginBottom:'1.5rem' },
  back:        { background:'none', border:'none', color:'#2b6cb0', cursor:'pointer', fontSize:'15px', padding:0, marginBottom:'0.75rem' },
  title:       { color:'#2d3748', margin:'0 0 0.25rem', fontSize:'24px' },
  count:       { color:'#a0aec0', fontSize:'13px', margin:0 },
  center:      { textAlign:'center', marginTop:'4rem', color:'#4a5568', fontSize:'16px' },
  empty:       { background:'#fff', borderRadius:'14px', padding:'3rem', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' },
  uploadBtn:   { marginTop:'1rem', background:'#2b6cb0', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'8px', cursor:'pointer', fontSize:'15px' },
  card:        { background:'#fff', borderRadius:'12px', padding:'1.25rem 1.5rem', marginBottom:'1rem', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' },
  cardTop:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' },
  badge:       { padding:'4px 12px', borderRadius:'20px', fontWeight:'700', fontSize:'14px' },
  date:        { color:'#a0aec0', fontSize:'12px' },
  cardDetails: { display:'flex', gap:'2rem', marginBottom:'0.75rem' },
  detail:      { color:'#4a5568', fontSize:'14px' },
  barBg:       { height:'6px', background:'#e2e8f0', borderRadius:'4px', marginBottom:'1rem', overflow:'hidden' },
  barFill:     { height:'100%', borderRadius:'4px', transition:'width 0.4s ease' },
  cardActions: { display:'flex', gap:'0.75rem' },
  pdfBtn:      { background:'#ebf8ff', color:'#2b6cb0', border:'none', padding:'7px 16px', borderRadius:'7px', cursor:'pointer', fontSize:'13px', fontWeight:'600' },
  deleteBtn:   { background:'#fff5f5', color:'#e53e3e', border:'none', padding:'7px 14px', borderRadius:'7px', cursor:'pointer', fontSize:'13px' },
};
