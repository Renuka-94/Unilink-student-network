import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ExplorePage.css';

const departments = ['All','Computer Science','Information Technology','Electronics','Mechanical','Civil','MBA','Arts'];

const ExplorePage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [connectStatus, setConnectStatus] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async (searchVal = '', deptVal = 'All') => {
    setLoading(true);
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (deptVal !== 'All') params.department = deptVal;
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch {}
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const meRes = await api.get(`/users/${user._id}`);
      const reqFromMe = meRes.data.connectionRequests || [];
      const statuses = {};
      reqFromMe.forEach(r => { if (r.status === 'pending') statuses[r.from] = 'pending'; });
      const connIds = meRes.data.connections?.map(c => c._id || c) || [];
      connIds.forEach(id => { statuses[id] = 'connected'; });
      setConnectStatus(statuses);
    } catch {}
  };

  const handleSearch = (e) => { setSearch(e.target.value); fetchUsers(e.target.value, dept); };
  const handleDept = (d) => { setDept(d); fetchUsers(search, d); };

  const handleConnect = async (userId) => {
    try {
      await api.post(`/users/${userId}/connect`);
      setConnectStatus(prev => ({ ...prev, [userId]: 'pending' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleAcceptRequest = async (fromId) => {
    try {
      await api.put(`/users/${fromId}/respond`, { action: 'accept' });
      setConnectStatus(prev => ({ ...prev, [fromId]: 'connected' }));
      fetchRequests();
    } catch {}
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Explore Students</h1>
        <p>Find and connect with peers across your university</p>
      </div>

      {/* Search bar */}
      <div className="explore-search card" style={{ marginBottom: 20 }}>
        <div className="explore-search-input">
          <i className="fas fa-search"></i>
          <input
            className="form-control" placeholder="Search by name, department, or skills..."
            value={search} onChange={handleSearch}
            style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none', color: 'var(--text)', fontSize: 15, padding: '0 8px' }}
          />
        </div>
      </div>

      {/* Department filter */}
      <div className="tabs">
        {departments.map(d => (
          <button key={d} className={`tab ${dept === d ? 'active' : ''}`} onClick={() => handleDept(d)}>{d}</button>
        ))}
      </div>

      {loading ? (
        <div className="spinner"><div className="spinner-circle"></div></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-user-slash"></i>
          <h3>No students found</h3>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map(u => {
            const status = connectStatus[u._id];
            return (
              <div key={u._id} className="user-card card">
                <Link to={`/profile/${u._id}`} className="user-card-top">
                  <div className="avatar" style={{ width: 64, height: 64, fontSize: 24, margin: '0 auto 12px' }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.[0]?.toUpperCase()}
                  </div>
                  <h3 className="user-card-name">{u.name}</h3>
                  <p className="user-card-dept">{u.department} {u.year ? `· ${u.year}` : ''}</p>
                  {u.bio && <p className="user-card-bio">{u.bio}</p>}
                </Link>
                {u.skills?.length > 0 && (
                  <div className="user-card-skills">
                    {u.skills.slice(0, 3).map(s => <span key={s} className="badge badge-primary" style={{ fontSize: 11 }}>{s}</span>)}
                    {u.skills.length > 3 && <span className="badge" style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{u.skills.length - 3}</span>}
                  </div>
                )}
                <div className="user-card-footer">
                  <span className="user-card-connections"><i className="fas fa-users"></i> {u.connections?.length || 0} connections</span>
                  <button
                    className={`btn btn-sm ${status === 'connected' ? 'btn-success' : status === 'pending' ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => handleConnect(u._id)}
                    disabled={status === 'connected' || status === 'pending'}
                  >
                    {status === 'connected' && <><i className="fas fa-check"></i> Connected</>}
                    {status === 'pending' && <><i className="fas fa-clock"></i> Pending</>}
                    {!status && <><i className="fas fa-user-plus"></i> Connect</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
