import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/posts', { content, tags: tagArr, image });
      onPostCreated(res.data);
      setContent(''); setTags(''); setImage(''); setExpanded(false);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="create-post card">
      <div className="create-post-top">
        <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}>
          {user?.avatar
            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : user?.name?.[0]?.toUpperCase()}
        </div>
        <textarea
          className="form-control create-post-input"
          placeholder="What's on your mind? Share an update, idea, or achievement..."
          value={content}
          onChange={e => { setContent(e.target.value); if (!expanded) setExpanded(true); }}
          onFocus={() => setExpanded(true)}
          rows={expanded ? 3 : 1}
        />
      </div>

      {expanded && (
        <div className="create-post-extras">
          <input
            className="form-control" placeholder="Add tags (comma separated): hackathon, coding, AI..."
            value={tags} onChange={e => setTags(e.target.value)} style={{ fontSize: 13 }}
          />
          <input
            className="form-control" placeholder="Image URL (optional)"
            value={image} onChange={e => setImage(e.target.value)} style={{ fontSize: 13 }}
          />
          <div className="create-post-actions">
            <div className="create-post-hints">
              <span><i className="fas fa-hashtag"></i> Tags</span>
              <span><i className="fas fa-image"></i> Image</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setExpanded(false); setContent(''); setTags(''); setImage(''); }}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={!content.trim() || loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Post</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
