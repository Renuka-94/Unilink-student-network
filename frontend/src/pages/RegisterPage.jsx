import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Auth.css';

const departments = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','Biotechnology','MBA','Law','Arts','Commerce','Other'];
const years = ['1st Year','2nd Year','3rd Year','4th Year','PG 1st Year','PG 2nd Year'];

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data, res.data.token);
      navigate('/profile/edit');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
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
      <div className="auth-container" style={{ maxWidth: 480 }}>
        <div className="auth-brand">
          <div className="auth-logo"><i className="fas fa-link"></i></div>
          <h1>UniLink</h1>
          <p>Join your university network today</p>
        </div>
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start networking with your peers</p>

          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" type="text" name="name"
                placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-control" type="email" name="email"
                placeholder="your@university.edu" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password"
                placeholder="At least 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="name-row">
              <div className="form-group">
                <label>Department</label>
                <select className="form-control" name="department" value={form.department} onChange={handleChange}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Year of Study</label>
                <select className="form-control" name="year" value={form.year} onChange={handleChange}>
                  <option value="">Select</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating account...</> : <><i className="fas fa-user-plus"></i> Create Account</>}
            </button>
          </form>

          <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
