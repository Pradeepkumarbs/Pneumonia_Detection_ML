// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pneumonia: 0, normal: 0 });

  useEffect(() => {
    API.get('/history').then(({ data }) => {
      const total     = data.length;
      const pneumonia = data.filter(r => r.prediction === 'PNEUMONIA').length;
      const normal    = total - pneumonia;
      setStats({ total, pneumonia, normal });
    }).catch(() => {});
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome back, {user?.name} 👋</h1>
        <p style={styles.heroSub}>
          Upload a chest X-ray image for an instant AI-powered pneumonia prediction.
        </p>
        <button onClick={() => navigate('/upload')} style={styles.ctaBtn}>
          📤 Upload X-ray Now
        </button>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Scans',       value: stats.total,     color: '#2b6cb0' },
          { label: 'Pneumonia Found',   value: stats.pneumonia, color: '#e53e3e' },
          { label: 'Normal Results',    value: stats.normal,    color: '#38a169' },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={styles.cards}>
        {[
          { icon:'📤', title:'Upload X-ray',  desc:'Upload a chest X-ray image (JPG/PNG) for instant AI analysis.', path:'/upload',  cta:'Upload Now' },
          { icon:'📋', title:'View History',  desc:'Browse all your past predictions with confidence scores.',       path:'/history', cta:'View History' },
          { icon:'📄', title:'PDF Reports',   desc:'Download detailed PDF reports for any past prediction.',          path:'/history', cta:'Get Reports' },
        ].map(card => (
          <div key={card.title} style={styles.featureCard}>
            <div style={styles.featureIcon}>{card.icon}</div>
            <h3 style={styles.featureTitle}>{card.title}</h3>
            <p style={styles.featureDesc}>{card.desc}</p>
            <button onClick={() => navigate(card.path)} style={styles.featureBtn}>
              {card.cta}
            </button>
          </div>
        ))}
      </div>

      <p style={styles.disclaimer}>
        ⚠️ This tool is AI-assisted and does not replace professional medical diagnosis.
      </p>
    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', background:'#f0f4f8', fontFamily:'Arial, sans-serif' },
  hero:         { textAlign:'center', padding:'3rem 2rem 2rem', background:'linear-gradient(135deg,#2b6cb0,#553c9a)', color:'#fff' },
  heroTitle:    { fontSize:'28px', margin:'0 0 0.5rem' },
  heroSub:      { fontSize:'16px', margin:'0 0 1.5rem', opacity:0.9 },
  ctaBtn:       { background:'#fff', color:'#2b6cb0', border:'none', padding:'14px 36px', borderRadius:'10px', fontSize:'16px', cursor:'pointer', fontWeight:'700' },
  statsRow:     { display:'flex', justifyContent:'center', gap:'1.5rem', padding:'1.5rem 2rem', flexWrap:'wrap' },
  statCard:     { background:'#fff', borderRadius:'12px', padding:'1.5rem 2.5rem', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', minWidth:'140px' },
  statNum:      { fontSize:'2.5rem', fontWeight:'bold' },
  statLabel:    { color:'#718096', fontSize:'13px', marginTop:'4px' },
  cards:        { display:'flex', justifyContent:'center', gap:'1.5rem', padding:'1rem 2rem 2rem', flexWrap:'wrap' },
  featureCard:  { background:'#fff', borderRadius:'14px', padding:'2rem', width:'220px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', textAlign:'center' },
  featureIcon:  { fontSize:'2.5rem', marginBottom:'0.5rem' },
  featureTitle: { color:'#2d3748', margin:'0 0 0.5rem', fontSize:'17px' },
  featureDesc:  { color:'#718096', fontSize:'13px', lineHeight:'1.5' },
  featureBtn:   { marginTop:'1rem', background:'#ebf8ff', color:'#2b6cb0', border:'none', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' },
  disclaimer:   { textAlign:'center', color:'#a0aec0', fontSize:'12px', padding:'0 2rem 2rem' },
};
