import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './GroupsPage.css';

const categories = ['all','coding','design','entrepreneurship','sports','literature','photography','music','other'];
const catIcons = { coding:'fa-code', design:'fa-paint-brush', entrepreneurship:'fa-lightbulb', sports:'fa-futbol', literature:'fa-book', photography:'fa-camera', music:'fa-music', other:'fa-star' };

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', category:'coding', isPrivate:false });
  const [formLoading, setFormLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchGroups(); }, [category]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups', { params: { category } });
      setGroups(res.data);
    } catch {}
    setLoading(false);
  };

  const handleJoin = async (groupId, isMember) => {
    setJoinLoading(prev => ({ ...prev, [groupId]: true }));
    try {
      if (isMember) {
        await api.put(`/groups/${groupId}/leave`);
      } else {
        await api.put(`/groups/${groupId}/join`);
      }
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
    setJoinLoading(prev => ({ ...prev, [groupId]: false }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/groups', form);
      setMsg('Group created!');
      setShowForm(false);
      setForm({ name:'', description:'', category:'coding', isPrivate:false });
      fetchGroups();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
    setFormLoading(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>👥 Student Groups</h1>
          <p>Join communities, collaborate, and learn together</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i> {showForm ? 'Cancel' : 'Create Group'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontFamily:'Sora' }}>Create New Group</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Group Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="Coding Club, Photo Society..." />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({...form, description:e.target.value})} required placeholder="What is this group about?" rows={3} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                  {categories.filter(c=>c!=='all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Privacy</label>
                <select className="form-control" value={form.isPrivate} onChange={e => setForm({...form, isPrivate:e.target.value==='true'})}>
                  <option value="false">Public</option>
                  <option value="true">Private</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={formLoading}>
              {formLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-users"></i> Create Group</>}
            </button>
          </form>
        </div>
      )}

      <div className="tabs">
        {categories.map(c => (
          <button key={c} className={`tab ${category===c?'active':''}`} onClick={() => setCategory(c)}>
            <i className={`fas ${catIcons[c]||'fa-star'}`} style={{ marginRight:4 }}></i>
            {c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner"><div className="spinner-circle"></div></div> : (
        groups.length === 0 ? (
          <div className="empty-state"><i className="fas fa-users-slash"></i><h3>No groups found</h3><p>Create the first group!</p></div>
        ) : (
          <div className="groups-grid">
            {groups.map(group => {
              const isMember = group.members?.some(m => (m._id||m).toString() === user._id);
              const isCreator = group.creator?._id === user._id || group.creator === user._id;
              return (
                <div key={group._id} className="group-card card">
                  <div className="group-card-icon">
                    <i className={`fas ${catIcons[group.category]||'fa-star'}`}></i>
                  </div>
                  <Link to={`/groups/${group._id}`} className="group-name">{group.name}</Link>
                  <p className="group-desc">{group.description}</p>
                  <div className="group-meta">
                    <span><i className="fas fa-users"></i> {group.members?.length || 0} members</span>
                    <span className={`badge badge-${group.isPrivate?'warning':'success'}`}>
                      <i className={`fas fa-${group.isPrivate?'lock':'globe'}`}></i> {group.isPrivate?'Private':'Public'}
                    </span>
                  </div>
                  <div className="group-creator">
                    <i className="fas fa-crown"></i> by {group.creator?.name}
                  </div>
                  {!isCreator && (
                    <button
                      className={`btn btn-sm btn-full ${isMember?'btn-danger':'btn-primary'}`}
                      onClick={() => handleJoin(group._id, isMember)}
                      disabled={joinLoading[group._id]}
                      style={{ marginTop: 14 }}
                    >
                      {joinLoading[group._id] ? <i className="fas fa-spinner fa-spin"></i>
                        : isMember ? <><i className="fas fa-sign-out-alt"></i> Leave</>
                        : <><i className="fas fa-sign-in-alt"></i> Join Group</>}
                    </button>
                  )}
                  {isCreator && (
                    <Link to={`/groups/${group._id}`} className="btn btn-sm btn-full btn-outline" style={{ marginTop: 14 }}>
                      <i className="fas fa-cog"></i> Manage
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default GroupsPage;
