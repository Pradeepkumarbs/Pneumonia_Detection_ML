// src/pages/Upload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ResultCard from '../components/ResultCard';

export default function Upload() {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && ['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError('');
    } else {
      setError('Please drop a valid JPEG or PNG image.');
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError('Please select an X-ray image first.');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('xray', file);
      const { data } = await API.post('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.back}>← Dashboard</button>
          <h2 style={styles.title}>Upload Chest X-ray</h2>
          <p style={styles.hint}>Accepted formats: JPG, JPEG, PNG — max 5MB</p>
        </div>

        {/* Drop zone */}
        <div
          style={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            style={{ display:'none' }}
            id="fileInput"
          />
          <label htmlFor="fileInput" style={styles.dropLabel}>
            {preview ? (
              <img src={preview} alt="X-ray preview" style={styles.preview} />
            ) : (
              <div>
                <p style={{ fontSize:'3.5rem', margin:'0 0 0.5rem' }}>🫁</p>
                <p style={{ color:'#4a5568', margin:'0 0 0.25rem', fontWeight:'600' }}>Click to select or drag & drop</p>
                <p style={{ color:'#a0aec0', fontSize:'13px', margin:0 }}>Chest X-ray image (JPG / PNG)</p>
              </div>
            )}
          </label>
        </div>

        {file && !result && (
          <p style={styles.fileName}>📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.actions}>
          {!result ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                style={{ ...styles.analyzeBtn, opacity: (!file || loading) ? 0.6 : 1 }}
              >
                {loading ? '🔍 Analyzing...' : '🔬 Analyze X-ray'}
              </button>
              {file && (
                <button onClick={handleReset} style={styles.resetBtn}>Clear</button>
              )}
            </>
          ) : (
            <button onClick={handleReset} style={styles.resetBtn}>Analyze Another X-ray</button>
          )}
        </div>

        {loading && (
          <div style={styles.loadingBox}>
            <p>⏳ Running HOG feature extraction and Random Forest prediction...</p>
          </div>
        )}

        <ResultCard result={result} />
      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight:'100vh', background:'#f0f4f8', fontFamily:'Arial, sans-serif' },
  container:  { maxWidth:'620px', margin:'0 auto', padding:'2rem' },
  header:     { marginBottom:'1.5rem' },
  back:       { background:'none', border:'none', color:'#2b6cb0', cursor:'pointer', fontSize:'15px', padding:0, marginBottom:'0.75rem' },
  title:      { color:'#2d3748', margin:'0 0 0.25rem', fontSize:'24px' },
  hint:       { color:'#a0aec0', fontSize:'13px', margin:0 },
  dropZone:   { border:'2px dashed #cbd5e0', borderRadius:'14px', background:'#fff', padding:'2rem', textAlign:'center', marginBottom:'1rem', transition:'border-color 0.2s' },
  dropLabel:  { cursor:'pointer', display:'block' },
  preview:    { maxWidth:'100%', maxHeight:'320px', borderRadius:'10px', objectFit:'contain' },
  fileName:   { color:'#4a5568', fontSize:'13px', margin:'0.25rem 0 1rem' },
  errorBox:   { background:'#fff5f5', color:'#c53030', padding:'10px 14px', borderRadius:'8px', marginBottom:'1rem', fontSize:'14px', border:'1px solid #fed7d7' },
  actions:    { display:'flex', gap:'0.75rem', marginBottom:'1rem' },
  analyzeBtn: { flex:1, padding:'13px', background:'#2b6cb0', color:'#fff', border:'none', borderRadius:'9px', fontSize:'16px', cursor:'pointer', fontWeight:'600' },
  resetBtn:   { padding:'13px 20px', background:'#edf2f7', border:'none', borderRadius:'9px', cursor:'pointer', fontSize:'15px' },
  loadingBox: { background:'#ebf8ff', color:'#2b6cb0', padding:'12px 16px', borderRadius:'8px', fontSize:'14px', textAlign:'center' },
};
