import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const departments = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','Biotechnology','MBA','Law','Arts','Commerce','Other'];
const years = ['1st Year','2nd Year','3rd Year','4th Year','PG 1st Year','PG 2nd Year'];

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    year: user?.year || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    achievements: user?.achievements?.join('\n') || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        achievements: form.achievements.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const res = await api.put('/users/profile', payload);
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1><i className="fas fa-user-edit" style={{ color: 'var(--primary)', marginRight: 12 }}></i>Edit Profile</h1>
        <p>Keep your profile up to date to connect with the right peers</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 20, fontFamily: 'Sora', fontSize: 16 }}><i className="fas fa-id-card" style={{ color: 'var(--primary)', marginRight: 8 }}></i>Basic Information</h3>
          <div className="form-group">
            <label>Full Name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Department</label>
              <select className="form-control" name="department" value={form.department} onChange={handleChange}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select className="form-control" name="year" value={form.year} onChange={handleChange}>
                <option value="">Select year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea className="form-control" name="bio" value={form.bio} onChange={handleChange}
              placeholder="Tell others about yourself, your goals, and what you're working on..." rows={3} />
          </div>
          <div className="form-group">
            <label>Profile Picture URL</label>
            <input className="form-control" name="avatar" value={form.avatar} onChange={handleChange}
              placeholder="https://example.com/your-photo.jpg" />
            {form.avatar && (
              <div style={{ marginTop: 10 }}>
                <img src={form.avatar} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 20, fontFamily: 'Sora', fontSize: 16 }}><i className="fas fa-rocket" style={{ color: 'var(--primary)', marginRight: 8 }}></i>Skills & Interests</h3>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input className="form-control" name="skills" value={form.skills} onChange={handleChange}
              placeholder="JavaScript, Python, React, Machine Learning, UI/UX..." />
          </div>
          <div className="form-group">
            <label>Interests (comma separated)</label>
            <input className="form-control" name="interests" value={form.interests} onChange={handleChange}
              placeholder="Coding, Hackathons, Photography, Entrepreneurship..." />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontFamily: 'Sora', fontSize: 16 }}><i className="fas fa-trophy" style={{ color: 'var(--secondary)', marginRight: 8 }}></i>Achievements</h3>
          <div className="form-group">
            <label>Achievements (one per line)</label>
            <textarea className="form-control" name="achievements" value={form.achievements} onChange={handleChange}
              placeholder="Won National Hackathon 2024&#10;Google Developer Student Club Lead&#10;Published research paper on AI..." rows={5} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
          </button>
          <button className="btn btn-outline" type="button" onClick={() => navigate(`/profile/${user._id}`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
