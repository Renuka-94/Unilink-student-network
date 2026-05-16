import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './PostCard.css';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(res.data.comments);
      setCommentText('');
      if (onUpdate) onUpdate(res.data);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch {}
  };

  const isOwner = user?._id === post.user?._id || user?.role === 'admin';

  return (
    <div className="post-card card">
      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${post.user?._id}`} className="post-user">
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
            {post.user?.avatar
              ? <img src={post.user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : post.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <span className="post-user-name">{post.user?.name}</span>
            <span className="post-user-meta">{post.user?.department} · {timeAgo(post.createdAt)}</span>
          </div>
        </Link>
        {isOwner && (
          <button className="post-delete-btn" onClick={handleDelete} title="Delete post">
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>

      {/* Content */}
      <p className="post-content">{post.content}</p>
      {post.image && <img src={post.image} alt="post" className="post-image" />}
      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map(tag => <span key={tag} className="badge badge-primary">#{tag}</span>)}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button className={`post-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <i className={`${liked ? 'fas' : 'far'} fa-heart`}></i>
          <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button className="post-action-btn" onClick={() => setShowComments(!showComments)}>
          <i className="far fa-comment"></i>
          <span>{comments.length} Comments</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments">
          {comments.map((c, i) => (
            <div key={i} className="comment">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                {c.user?.avatar
                  ? <img src={c.user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : c.user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="comment-body">
                <span className="comment-user">{c.user?.name}</span>
                <span className="comment-text">{c.text}</span>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <input
              className="form-control" placeholder="Write a comment..."
              value={commentText} onChange={e => setCommentText(e.target.value)}
              style={{ padding: '8px 14px', fontSize: 13 }}
            />
            <button className="btn btn-primary btn-sm" type="submit" disabled={loading || !commentText.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
