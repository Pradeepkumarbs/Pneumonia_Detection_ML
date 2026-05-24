// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>🫁 Pneumonia AI</Link>
      {user && (
        <div style={styles.links}>
          <Link to="/upload"  style={styles.link}>Upload X-ray</Link>
          <Link to="/history" style={styles.link}>History</Link>
          <span style={styles.userName}>👤 {user.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav:       { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#2b6cb0', padding:'1rem 2rem', color:'#fff' },
  brand:     { color:'#fff', textDecoration:'none', fontSize:'20px', fontWeight:'bold' },
  links:     { display:'flex', alignItems:'center', gap:'1rem' },
  link:      { color:'#fff', textDecoration:'none', fontSize:'15px' },
  userName:  { color:'#bee3f8', fontSize:'14px' },
  logoutBtn: { background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
};
