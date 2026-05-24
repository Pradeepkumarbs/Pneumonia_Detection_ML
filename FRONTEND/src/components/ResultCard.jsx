// src/components/ResultCard.jsx
import { useNavigate } from 'react-router-dom';

export default function ResultCard({ result }) {
  const navigate = useNavigate();
  if (!result) return null;

  const isPneumonia = result.prediction === 'PNEUMONIA';
  const color = isPneumonia ? '#e53e3e' : '#38a169';

  return (
    <div style={{ ...styles.card, borderColor: color }}>
      <h2 style={{ color, marginTop: 0 }}>
        {isPneumonia ? '⚠️ PNEUMONIA DETECTED' : '✅ NORMAL'}
      </h2>
      <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
      <p><strong>Threshold Used:</strong> {result.threshold}</p>
      <p style={styles.advice}>
        {isPneumonia
          ? 'Pneumonia signs detected. Please consult a qualified doctor immediately.'
          : 'No pneumonia detected. Chest X-ray appears normal.'}
      </p>
      <p style={styles.emailNote}>📧 A detailed report has been sent to your email.</p>
      <button onClick={() => navigate('/history')} style={styles.historyBtn}>
        View in History →
      </button>
    </div>
  );
}

const styles = {
  card:       { border:'2px solid', borderRadius:'12px', padding:'1.5rem', marginTop:'1.5rem', textAlign:'center' },
  advice:     { color:'#4a5568', fontSize:'14px' },
  emailNote:  { color:'#718096', fontSize:'13px', marginTop:'1rem' },
  historyBtn: { background:'#edf2f7', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', marginTop:'0.5rem', fontSize:'14px' },
};
