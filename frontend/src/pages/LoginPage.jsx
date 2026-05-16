import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Auth.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb1"></div>
        <div className="auth-orb orb2"></div>
        <div className="auth-orb orb3"></div>
      </div>
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo"><i className="fas fa-link"></i></div>
          <h1>UniLink</h1>
          <p>Your University Network</p>
        </div>
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to connect with your peers</p>

          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-control" type="email" name="email"
                placeholder="your@university.edu" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password"
                placeholder="Enter your password" value={form.password} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</> : <><i className="fas fa-sign-in-alt"></i> Sign In</>}
            </button>
          </form>

          <div className="auth-demo">
            <p>🎓 Demo Admin: <strong>admin@unilink.com</strong> / <strong>admin123</strong></p>
          </div>

          <p className="auth-link">Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
