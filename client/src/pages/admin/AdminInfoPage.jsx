import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- ICONS ---
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const PollIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const PinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const ActionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const ThumbsUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3 3 0 0 1 3 3z"></path></svg>;

// --- All Modals ---
const PinDurationModal = ({ onPin, onCancel }) => {
    const [duration, setDuration] = useState('7');
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Pin Duration</h3>
                <p className="modal-subtitle">Choose how long this post should be pinned.</p>
                <div className="radio-group">
                    <label><input type="radio" name="duration" value="1" checked={duration === '1'} onChange={e => setDuration(e.target.value)} /> 24 hours</label>
                    <label><input type="radio" name="duration" value="7" checked={duration === '7'} onChange={e => setDuration(e.target.value)} /> 7 days</label>
                    <label><input type="radio" name="duration" value="30" checked={duration === '30'} onChange={e => setDuration(e.target.value)} /> 30 days</label>
                </div>
                <div className="modal-actions">
                    <button className="action-btn cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="action-btn pin-btn" onClick={() => onPin(duration)}>Pin</button>
                </div>
            </div>
        </div>
    );
};

const ViewPinnedModal = ({ post, onClose }) => {
    if (!post) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <div className="modal-header">
                    <h3 className="modal-title">Pinned Post</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {post.type === 'message' ? <p>{post.content}</p> : (
                        <>
                            <h4><PollIcon /> {post.content}</h4>
                            <div className="poll-results">
                                {post.pollOptions.map(option => {
                                    const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
                                    const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                                    return (
                                        <div className="poll-option" key={option._id}>
                                            <strong>{option.text}</strong> ({option.votes.length} votes)
                                            <div className="progress-bar"><div className="progress" style={{ width: `${percentage}%` }}></div></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReplacePinModal = ({ pinnedPosts, onReplace, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Replace a Pinned Post</h3>
                <p className="modal-subtitle">You have reached the maximum of 2 pinned posts. Please choose one to unpin and replace.</p>
                <div className="replace-list">
                    {pinnedPosts.map(post => (
                        <div key={post._id} className="replace-item">
                            <span>{post.content.substring(0, 40)}...</span>
                            <button onClick={() => onReplace(post._id)}>Unpin & Replace</button>
                        </div>
                    ))}
                </div>
                 <div className="modal-actions">
                    <button className="action-btn cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    )
};

const EditPostModal = ({ post, onSave, onCancel }) => {
    const [content, setContent] = useState(post.content);
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Edit Post</h3>
                <textarea className="edit-textarea" value={content} onChange={e => setContent(e.target.value)} />
                <div className="modal-actions">
                    <button className="action-btn cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="action-btn pin-btn" onClick={() => onSave(post._id, content)}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ count, onConfirm, onCancel }) => (
     <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content">
             <h3 className="modal-title">Confirm Deletion</h3>
             <p className="modal-subtitle">Are you sure you want to delete {count} post(s)? This action cannot be undone.</p>
             <div className="modal-actions">
                <button className="action-btn cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="action-btn delete-btn" onClick={onConfirm}>Delete</button>
            </div>
        </div>
    </div>
);


const AdminInfoPage = () => {
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState('');
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const feedRef = useRef(null);

    const [isPinDurationModalOpen, setPinDurationModalOpen] = useState(false);
    const [isReplacePinModalOpen, setReplacePinModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    
    const [postToPin, setPostToPin] = useState(null);
    const [postToEdit, setPostToEdit] = useState(null);
    const [postsToDelete, setPostsToDelete] = useState([]);

    const [viewedPinnedPost, setViewedPinnedPost] = useState(null);
    const [isDeleteMode, setDeleteMode] = useState(false);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` } });

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get('/api/info', getAuthConfig());
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
            showNotification('Failed to load posts.', 'error');
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    useEffect(() => {
        if (feedRef.current && posts.length > 4) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [posts]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        try {
            await axios.post('/api/info', { type: 'message', content: message }, getAuthConfig());
            setMessage('');
            fetchPosts();
            showNotification('Announcement sent!', 'success');
        } catch (error) { showNotification('Failed to send announcement.', 'error'); }
    };
    
    const handleCreatePoll = async () => {
        if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())) {
            showNotification('Please fill in the poll question and all options.', 'error'); return;
        }
        try {
            await axios.post('/api/info', { type: 'poll', content: pollQuestion, pollOptions, isMultiSelect }, getAuthConfig());
            setPollQuestion(''); setPollOptions(['', '']); setIsMultiSelect(false); fetchPosts();
            showNotification('Poll created successfully!', 'success');
        } catch (error) { showNotification('Failed to create poll.', 'error'); }
    };
    
    const handleOptionChange = (index, value) => {
        const newOptions = [...pollOptions]; newOptions[index] = value; setPollOptions(newOptions);
    };
    const addOption = () => { if (pollOptions.length < 5) setPollOptions([...pollOptions, '']); };
    const removeOption = (index) => { if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index)); };

    const openPinDurationModal = (post) => {
        const pinnedCount = posts.filter(p => p.isPinned).length;
        if (pinnedCount >= 2) { setPostToPin(post); setReplacePinModalOpen(true); return; }
        setPostToPin(post); setPinDurationModalOpen(true);
    };

    const handleConfirmPin = async (duration) => {
        if (!postToPin) return;
        try {
            await axios.put(`/api/info/pin/${postToPin._id}`, { pin: true, durationDays: duration }, getAuthConfig());
            fetchPosts(); showNotification('Post pinned successfully!', 'success');
        } catch (error) { showNotification(error.response?.data?.message || 'Failed to pin post.', 'error');
        } finally { setPinDurationModalOpen(false); setPostToPin(null); }
    };
    
    const handleUnpin = async (postId) => {
         try {
            await axios.put(`/api/info/pin/${postId}`, { pin: false }, getAuthConfig());
            fetchPosts(); showNotification('Post unpinned successfully!', 'success');
        } catch (error) { showNotification('Failed to unpin post.', 'error'); }
    };

    const handleReplacePin = async (unpinPostId) => {
        try {
            await axios.put(`/api/info/pin/${unpinPostId}`, { pin: false }, getAuthConfig());
            setReplacePinModalOpen(false); setPinDurationModalOpen(true);
        } catch (error) { showNotification('Failed to replace pin.', 'error'); }
    };

    const handleUpdatePost = async (postId, content) => {
        try {
            await axios.put(`/api/info/${postId}`, { content }, getAuthConfig());
            fetchPosts(); showNotification('Post updated successfully!', 'success');
        } catch (error) { showNotification(error.response?.data?.message || 'Failed to update post.', 'error');
        } finally { setEditModalOpen(false); setPostToEdit(null); }
    };

    const handleDelete = async () => {
        try {
            if (postsToDelete.length > 1) {
                await axios.post('/api/info/bulk-delete', { ids: postsToDelete }, getAuthConfig());
            } else {
                await axios.delete(`/api/info/${postsToDelete[0]}`, getAuthConfig());
            }
            fetchPosts(); showNotification(`${postsToDelete.length} post(s) deleted.`, 'success');
        } catch (error) { showNotification('Failed to delete post(s).', 'error');
        } finally {
            setDeleteConfirmModalOpen(false);
            setPostsToDelete([]);
            setDeleteMode(false);
        }
    };

    const handleSelectForDelete = (postId) => {
        setPostsToDelete(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
    };

    const pinnedPosts = posts.filter(p => p.isPinned);

    return (
        <div className="info-page-container">
            {isPinDurationModalOpen && <PinDurationModal onCancel={() => setPinDurationModalOpen(false)} onPin={handleConfirmPin} />}
            {isReplacePinModalOpen && <ReplacePinModal pinnedPosts={pinnedPosts} onCancel={() => setReplacePinModalOpen(false)} onReplace={handleReplacePin} />}
            {viewedPinnedPost && <ViewPinnedModal post={viewedPinnedPost} onClose={() => setViewedPinnedPost(null)} />}
            {isEditModalOpen && <EditPostModal post={postToEdit} onCancel={() => setEditModalOpen(false)} onSave={handleUpdatePost} />}
            {isDeleteConfirmModalOpen && <DeleteConfirmationModal count={postsToDelete.length} onCancel={() => setDeleteConfirmModalOpen(false)} onConfirm={handleDelete} />}

            <style>{`
                /* --- CORRECTION 2: Outer Layout Fix --- */
                .info-page-container { display: flex; flex-direction: column; flex-grow: 1; min-height: 0; }
                .info-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; flex-grow: 1; min-height: 0; }
                @media (min-width: 1024px) { .info-grid { grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr); } }
                
                .feed-panel { display: flex; flex-direction: column; background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; min-height: 0; }
                .feed-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-weight: 600; display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
                .pinned-bar { padding: 0.75rem 1.5rem; background-color: #F8FAFC; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
                .pinned-item-chip { display: flex; align-items: center; gap: 0.5rem; background: var(--white); padding: 0.5rem 1rem; border-radius: 99px; border: 1px solid var(--border-color); font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
                .pinned-item-chip:hover { border-color: var(--brand-blue); color: var(--brand-blue); }
                
                /* --- CORRECTION 1: Feed Height & Scrollbar --- */
                .feed-content { flex-grow: 1; padding: 1.5rem; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 1.5rem; }
                .feed-content::-webkit-scrollbar { width: 8px; }
                .feed-content::-webkit-scrollbar-track { background: #F8FAFC; }
                .feed-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 10px; border: 2px solid #F8FAFC; }
                .feed-content::-webkit-scrollbar-thumb:hover { background-color: #A0AEC0; }


                .post-item { width: 95%; padding: 1.25rem 1.5rem; border-radius: 0.75rem; background-color: var(--white); border: 1px solid var(--border-color); position: relative; transition: all 0.2s ease-in-out; }
                
                /* --- CORRECTION 2: Message Width Fix --- */
                .post-item p, .post-item h4 { margin: 0; line-height: 1.6; max-width: calc(100% - 140px); word-wrap: break-word; }

                .post-actions { position: absolute; top: 1rem; right: 1rem; display: flex; align-items: center; gap: 0.5rem; }
                .action-icon-btn { background: none; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.3rem; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;}
                .pin-action-btn { border: 1px solid var(--border-color); border-radius: 6px; padding: 0.3rem 0.75rem; font-size: 0.8rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; transition: all 0.3s ease; }
                .pin-action-btn.unpin { background-color: #FEF3C7; color: #92400E; border-color: #FBBF24; }
                .pin-action-btn:not(.unpin) { background-color: #F1F5F9; color: var(--light-text); }
                .pin-action-btn:hover:not(.unpin) { background-color: #E2E8F0; color: var(--dark-text); }
                .pin-action-btn.unpin:hover { background-color: #FDE68A; }
                .message-input-area { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; background: #F8FAFC; flex-shrink: 0; }
                .message-input-area textarea { flex-grow: 1; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 0.75rem 1.25rem; font-size: 1rem; resize: none; height: 50px; line-height: 1.5; }
                .message-input-area button { width: 50px; height: 50px; border-radius: 0.75rem; border: none; background-color: var(--brand-blue); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
                .controls-panel { display: flex; flex-direction: column; gap: 1.5rem; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
                .modal-content { background: var(--white); padding: 2rem; border-radius: 1rem; width: 90%; max-width: 450px; }
                .modal-title { margin-top: 0; font-size: 1.5rem; }
                .modal-subtitle { color: var(--light-text); margin-bottom: 1.5rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
                .radio-group { display: flex; flex-direction: column; gap: 1rem; }
                .radio-group label { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
                .replace-list { display: flex; flex-direction: column; gap: 1rem; }
                .replace-item { display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 1rem; border-radius: 0.5rem; }
                .replace-item span { font-weight: 500; }
                .replace-item button { background: #FEE2E2; color: #991B1B; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
                .edit-textarea { width: 100%; min-height: 150px; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; font-size: 1rem; }
                 .notification { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); padding: 1rem 2rem; border-radius: 0.5rem; color: white; z-index: 1001; }
                .notification.success { background-color: #22C55E; }
                .notification.error { background-color: #EF4444; }
                .notification.info { background-color: #3B82F6; }
                .post-item h4 { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
                .post-item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
                .timestamp { font-size: 0.8rem; color: var(--light-text); }
                .like-section { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--light-text); font-weight: 500; }
                .poll-results { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .poll-option { font-size: 0.9rem; }
                .poll-option .progress-bar { height: 8px; background: #E2E8F0; border-radius: 4px; margin-top: 4px; overflow: hidden;}
                .poll-option .progress { height: 100%; background: #93C5FD; border-radius: 4px; }
                .control-card { background: var(--white); padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 1rem; }
                .control-card.delete-mode-active { min-height: 155px; }
                .control-card-header { font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;}
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--light-text); }
                .input-field { width: 100%; padding: 0.7rem; border-radius: 0.5rem; border: 1px solid var(--border-color); }
                .option-input { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
                .option-input button { background: none; border: none; cursor: pointer; color: #EF4444; }
                .add-option-btn, .action-btn { width: 100%; border: 1px solid var(--border-color); padding: 0.7rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
                .create-poll-btn { background-color: var(--brand-blue); color: white; border: none; margin-top: 1rem; }
                .pin-btn, .delete-btn { background-color: #EF4444; color: white; border: none; }
                .cancel-btn { background-color: #F1F5F9; }
                .modal-header { padding: 0 0 1.5rem; border-bottom: 1px solid var(--border-color); display:flex; justify-content: space-between; align-items: center; }
                .modal-close-btn { background:none; border:none; font-size:1.5rem; cursor:pointer; }
                .modal-body { padding: 1.5rem 0 0; }
                .checkbox-group { display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
                .checkbox-group label { font-size: 0.9rem; font-weight: 500; color: var(--dark-text); }
            `}</style>
            
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            
            <div className="info-grid">
                <div className="feed-panel">
                    <div className="feed-header"><MessageSquareIcon/>Announcements Feed</div>
                    {pinnedPosts.length > 0 && (
                        <div className="pinned-bar">
                            {pinnedPosts.map(p => (
                                <div key={p._id} className="pinned-item-chip" onClick={() => setViewedPinnedPost(p)}>
                                    <PinIcon />
                                    <span>{p.content.substring(0, 20)}...</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="feed-content" ref={feedRef}>
                        {posts.map(post => {
                            const isEditable = new Date(post.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                            return (
                             <div key={post._id} className='post-item'>
                                {isDeleteMode ? (
                                    <input type="checkbox" checked={postsToDelete.includes(post._id)} onChange={() => handleSelectForDelete(post._id)} style={{position: 'absolute', top: '1rem', left: '1rem'}} />
                                ) : (
                                    <div className="post-actions">
                                        {isEditable && <button className="action-icon-btn" title="Edit Post" onClick={() => { setPostToEdit(post); setEditModalOpen(true); }}><EditIcon/></button>}
                                        <button className="action-icon-btn" title="Delete Post" onClick={() => { setPostsToDelete([post._id]); setDeleteConfirmModalOpen(true); }}><TrashIcon/></button>
                                        {post.isPinned ? (
                                             <button className="pin-action-btn unpin" onClick={() => handleUnpin(post._id)}>Unpin</button>
                                        ) : (
                                            <button className="pin-action-btn" onClick={() => openPinDurationModal(post)}><PinIcon/> Pin</button>
                                        )}
                                    </div>
                                )}
                                <div style={{ marginLeft: isDeleteMode ? '2rem' : '0' }}>
                                    {post.type === 'message' ? (
                                        <p>{post.content}</p>
                                    ) : (
                                        <>
                                            <h4><PollIcon /> {post.content}</h4>
                                            <div className="poll-results">
                                                {post.pollOptions.map(option => {
                                                    const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
                                                    const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                                                    return (
                                                        <div className="poll-option" key={option._id}>
                                                            <strong>{option.text}</strong> ({option.votes.length} votes)
                                                            <div className="progress-bar"><div className="progress" style={{ width: `${percentage}%` }}></div></div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                     <div className="post-item-footer">
                                        <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
                                        <div className="like-section">
                                            <ThumbsUpIcon />
                                            <span>{post.likes ? post.likes.length : 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                    <div className="message-input-area">
                        <textarea 
                            placeholder="Type an announcement..." 
                            value={message} 
                            onChange={e => setMessage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        />
                        <button onClick={handleSendMessage}><SendIcon/></button>
                    </div>
                </div>

                 <div className="controls-panel">
                     <div className="control-card">
                        <div className="control-card-header"><PollIcon /> Create a Poll</div>
                         <div className="form-group">
                            <label>Poll Question</label>
                            <input type="text" className="input-field" placeholder="e.g., What should we focus on?" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Options</label>
                            {pollOptions.map((option, index) => (
                                <div className="option-input" key={index}>
                                    <input type="text" className="input-field" value={option} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} />
                                    {pollOptions.length > 2 && <button onClick={() => removeOption(index)}><XIcon/></button>}
                                </div>
                            ))}
                        </div>
                        {pollOptions.length < 5 && <button className="add-option-btn" onClick={addOption}><PlusIcon/> Add Option</button>}
                        
                        <div className="checkbox-group">
                            <input type="checkbox" id="multiSelect" checked={isMultiSelect} onChange={e => setIsMultiSelect(e.target.checked)} />
                            <label htmlFor="multiSelect">Allow multi-option selection</label>
                        </div>

                        <button className="action-btn create-poll-btn" onClick={handleCreatePoll}>Publish Poll</button>
                    </div>
                     <div className={`control-card ${isDeleteMode ? 'delete-mode-active' : ''}`}>
                        <div className="control-card-header"><ActionsIcon/> Actions</div>
                        {isDeleteMode ? (
                            <>
                                <button className="action-btn delete-btn" onClick={() => setDeleteConfirmModalOpen(true)} disabled={postsToDelete.length === 0}>Delete Selected ({postsToDelete.length})</button>
                                <button className="action-btn cancel-btn" onClick={() => { setDeleteMode(false); setPostsToDelete([]); }} style={{marginTop: '0.5rem'}}>Cancel</button>
                            </>
                        ) : (
                            <button className="action-btn" onClick={() => setDeleteMode(true)}>Bulk Delete Posts</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInfoPage;

