import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await api.get(`/groups/${id}`);
        setGroup(res.data);
      } catch {}
      setLoading(false);
    };
    fetchGroup();
  }, [id]);

  const isMember = group?.members?.some(m => (m._id||m)?.toString() === user._id);

  const handlePost = async e => {
    e.preventDefault();
    if (!postText.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/groups/${id}/post`, { content: postText });
      setGroup(res.data);
      setPostText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
    setPosting(false);
  };

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await api.put(`/groups/${id}/leave`);
      } else {
        await api.put(`/groups/${id}/join`);
      }
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;
  if (!group) return <div className="empty-state"><h3>Group not found</h3></div>;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Group Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'Sora', fontSize:28, marginBottom:6 }}>{group.name}</h1>
            <p style={{ color:'var(--text-muted)', marginBottom:10 }}>{group.description}</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <span className="badge badge-primary">{group.category}</span>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}><i className="fas fa-users" style={{marginRight:6,color:'var(--primary)'}}></i>{group.members?.length || 0} members</span>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}><i className="fas fa-crown" style={{marginRight:6,color:'var(--secondary)'}}></i>by {group.creator?.name}</span>
            </div>
          </div>
          {group.creator?._id !== user._id && (
            <button className={`btn ${isMember?'btn-danger':'btn-primary'}`} onClick={handleJoinLeave}>
              {isMember ? <><i className="fas fa-sign-out-alt"></i> Leave Group</> : <><i className="fas fa-sign-in-alt"></i> Join Group</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
        {/* Discussion */}
        <div>
          {isMember && (
            <div className="card" style={{ marginBottom:20 }}>
              <form onSubmit={handlePost}>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <textarea className="form-control" placeholder="Share something with the group..." value={postText} onChange={e => setPostText(e.target.value)} rows={3} />
                </div>
                <button className="btn btn-primary btn-sm" type="submit" disabled={posting || !postText.trim()}>
                  {posting ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Post in Group</>}
                </button>
              </form>
            </div>
          )}

          {group.posts?.length === 0 ? (
            <div className="empty-state"><i className="fas fa-comments"></i><h3>No discussions yet</h3><p>{isMember ? 'Start the conversation!' : 'Join to participate'}</p></div>
          ) : (
            [...group.posts].reverse().map((post, i) => (
              <div key={i} className="card" style={{ marginBottom:12 }}>
                <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                  <div className="avatar" style={{ width:36, height:36, fontSize:14 }}>
                    {post.user?.avatar ? <img src={post.user.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} /> : post.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <Link to={`/profile/${post.user?._id}`} style={{ fontWeight:600, fontSize:14, color:'var(--text)', textDecoration:'none' }}>{post.user?.name}</Link>
                    <span style={{ display:'block', fontSize:11, color:'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'})}</span>
                  </div>
                </div>
                <p style={{ fontSize:14, lineHeight:1.7 }}>{post.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Members list */}
        <div className="card" style={{ height:'fit-content' }}>
          <h3 style={{ fontFamily:'Sora', fontSize:15, marginBottom:16 }}><i className="fas fa-users" style={{color:'var(--primary)',marginRight:8}}></i>Members ({group.members?.length})</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {group.members?.map(m => (
              <Link key={m._id} to={`/profile/${m._id}`} style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', color:'inherit', padding:'6px', borderRadius:8, transition:'background 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div className="avatar" style={{ width:34, height:34, fontSize:13 }}>
                  {m.avatar ? <img src={m.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} /> : m.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <span style={{ display:'block', fontSize:13, fontWeight:500 }}>{m.name}</span>
                  <span style={{ display:'block', fontSize:11, color:'var(--text-muted)' }}>{m.department || ''}</span>
                </div>
                {(m._id === (group.creator?._id || group.creator)) && <i className="fas fa-crown" style={{color:'var(--secondary)',marginLeft:'auto',fontSize:12}}></i>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
