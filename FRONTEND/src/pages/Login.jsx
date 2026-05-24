// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>🫁</div>
        <h2 style={styles.brand}>Pneumonia Detection AI</h2>
        <h3 style={styles.subtitle}>Sign In</h3>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:     { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'linear-gradient(135deg,#ebf8ff,#e9d8fd)' },
  card:     { background:'#fff', padding:'2.5rem 2rem', borderRadius:'16px', boxShadow:'0 8px 30px rgba(0,0,0,0.12)', width:'360px', textAlign:'center' },
  iconWrap: { fontSize:'3rem', marginBottom:'0.5rem' },
  brand:    { color:'#2b6cb0', margin:'0 0 0.25rem', fontSize:'20px' },
  subtitle: { color:'#4a5568', margin:'0 0 1.5rem', fontWeight:'normal', fontSize:'16px' },
  input:    { display:'block', width:'100%', padding:'11px 14px', margin:'10px 0', border:'1px solid #cbd5e0', borderRadius:'8px', fontSize:'15px', boxSizing:'border-box' },
  button:   { width:'100%', padding:'12px', background:'#2b6cb0', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', marginTop:'8px', fontWeight:'600' },
  error:    { background:'#fff5f5', color:'#c53030', padding:'10px 14px', borderRadius:'8px', marginBottom:'1rem', fontSize:'14px', border:'1px solid #fed7d7' },
  footer:   { marginTop:'1.25rem', color:'#718096', fontSize:'14px' },
  link:     { color:'#2b6cb0', fontWeight:'600' },
};
