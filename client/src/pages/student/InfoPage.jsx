import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- ICONS ---
const PinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;
const PollIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const NoDataIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>;
const ThumbsUpIcon = ({ filled }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3 3 0 0 1 3 3z"></path></svg>);
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;


// --- View Post Modal ---
const ViewPostModal = ({ post, onClose, userId, onVote, onEditVote, showNotification }) => {
    if (!post) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{post.type === 'poll' ? 'Poll Details' : 'Announcement'}</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <PostItem post={post} userId={userId} onVote={onVote} onEditVote={onEditVote} showNotification={showNotification} isModalView={true} />
                </div>
            </div>
        </div>
    );
};

// --- Notification Component ---
const Notification = ({ message, type, onHide }) => (
    <div className={`notification ${type}`} onClick={onHide}>
        <AlertTriangleIcon />
        <span>{message}</span>
    </div>
);


const InfoPage = () => {
    const [allPosts, setAllPosts] = useState([]);
    const [latestPosts, setLatestPosts] = useState([]);
    const [pinnedPosts, setPinnedPosts] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewedPost, setViewedPost] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` } });

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    const fetchInfoData = async () => {
        try {
            const config = getAuthConfig();
            if (!config) throw new Error("User not authenticated");
            const { data } = await axios.get('/api/info', config);
            setAllPosts(data);
            setPinnedPosts(data.filter(p => p.isPinned));
            const nonPinned = data.filter(p => !p.isPinned);
            setLatestPosts(nonPinned.slice(0, 3));
        } catch (error) {
            console.error("Failed to fetch info data", error);
             // Show error notification only if it's not just an empty feed
             if (!axios.isAxiosError(error) || error.response?.status !== 404) {
                 showNotification("Could not load announcements. Please check connection.");
             }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) setUserId(user._id);
        fetchInfoData();
    }, []);

    const updatePostState = (updatedPost) => {
        const updater = posts => posts.map(p => p._id === updatedPost._id ? updatedPost : p);
        setAllPosts(updater);
        // Also update latestPosts and pinnedPosts if the updated post exists there
        setLatestPosts(posts => posts.map(p => p._id === updatedPost._id ? updatedPost : p));
        setPinnedPosts(posts => posts.map(p => p._id === updatedPost._id ? updatedPost : p));

        if (viewedPost?._id === updatedPost._id) {
            setViewedPost(updatedPost);
        }
    };


    const handleVote = async (pollId, selectedOptionIds) => {
         try {
             const config = getAuthConfig();
             if (!config) return false; // Added check
             const { data: updatedPoll } = await axios.put(`/api/info/vote/${pollId}`, { optionIds: selectedOptionIds }, config);
             updatePostState(updatedPoll);
             return true; // Indicate success
         } catch (error) {
             console.error("Failed to vote", error);
             showNotification(error.response?.data?.message || "Failed to submit vote.");
             return false; // Indicate failure
         }
     };

     const handleEditVote = async (pollId, selectedOptionIds) => {
         try {
             const config = getAuthConfig();
             if (!config) return false; // Added check
             const { data: updatedPoll } = await axios.put(`/api/info/vote/edit/${pollId}`, { optionIds: selectedOptionIds }, config);
             updatePostState(updatedPoll);
             return true; // Indicate success
         } catch (error) {
              console.error("Failed to edit vote", error);
             showNotification(error.response?.data?.message || "Failed to edit vote.");
             return false; // Indicate failure
         }
     };

     const handleLike = async (postId) => {
         try {
             const config = getAuthConfig();
             if (!config) return; // Added check
             const { data: updatedPost } = await axios.put(`/api/info/like/${postId}`, {}, config);
             updatePostState(updatedPost);
         } catch (error) {
             console.error("Failed to like post", error);
             showNotification("Could not update like status.");
         }
     };


    return (
        // --- ⭐⭐ FIX: Removed ALL inline styles from layout elements ---
        <div>
            {viewedPost && <ViewPostModal post={viewedPost} onClose={() => setViewedPost(null)} userId={userId} onVote={handleVote} onEditVote={handleEditVote} showNotification={showNotification} />}
            {notification.show && <Notification message={notification.message} type={notification.type} onHide={() => setNotification({ ...notification, show: false })} />}

            {/* No inline styles here */}
            <div className="student-info-grid">
                {/* No inline styles here */}
                <div className="feed-panel">
                    <div className="feed-header"><MessageSquareIcon/>Announcements Feed</div>
                    {/* No inline styles here */}
                    <div className="feed-content">
                        {isLoading ? <p>Loading feed...</p> : allPosts.length > 0 ? allPosts.map(post => (
                            <PostItem key={post._id} post={post} userId={userId} onVote={handleVote} onLike={handleLike} onEditVote={handleEditVote} showNotification={showNotification} />
                        )) : (
                            <div className="empty-state"><NoDataIcon/> <p>No announcements yet.</p></div>
                        )}
                    </div>
                     {/* Removed Message Input Area for Students */}
                </div>
                {/* No inline styles here */}
                <div className="side-cards-container">
                    {/* No inline styles here */}
                    <div className="side-card">
                        <div className="side-card-header"><CalendarIcon/> Latest Announcements</div>
                        {/* No inline styles here */}
                        <div className="side-card-list">
                            {isLoading ? <p>Loading...</p> : latestPosts.length > 0 ? latestPosts.map(p => (
                                <div key={p._id} className="side-card-item" onClick={() => setViewedPost(p)}>
                                    <p>{p.content}</p>
                                </div>
                            )) : <div className="empty-state"><NoDataIcon/> <p>No new announcements.</p></div>}
                        </div>
                    </div>
                     {/* No inline styles here */}
                     <div className="side-card">
                        <div className="side-card-header"><PinIcon/> Pinned Posts</div>
                        {/* No inline styles here */}
                        <div className="side-card-list">
                           {isLoading ? <p>Loading...</p> : pinnedPosts.length > 0 ? pinnedPosts.map(p => (
                                <div key={p._id} className="side-card-item" onClick={() => setViewedPost(p)}>
                                    <p>{p.content}</p>
                                </div>
                            )) : <div className="empty-state"><NoDataIcon/> <p>No pinned posts.</p></div>}
                        </div>
                    </div>
                </div>
            </div>
            {/* --- ⭐⭐ FIX END --- */}

             {/* Styles defined in InfoPage.jsx */}
             <style>{`
               /* --- Style definitions remain unchanged --- */
               .student-info-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
               @media (min-width: 1024px) { .student-info-grid { grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr); } }
               /* Removed fixed height from feed-panel for desktop */
               .feed-panel { display: flex; flex-direction: column; background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; /* height removed */ }
               .feed-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-weight: 600; display: flex; align-items: center; gap: 0.75rem; }
               .feed-content { flex-grow: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; }
               .post-item { background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.25rem 1.5rem; }
               .post-item p, .post-item h4 { margin: 0; line-height: 1.6; }
               .post-item h4 { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
               .post-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
               .timestamp { font-size: 0.8rem; color: var(--light-text); }
               .poll-options { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
               .poll-option, .multi-poll-option { border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.75rem 1rem; cursor: pointer; transition: all 0.2s ease; }
               .poll-option:hover { border-color: var(--brand-blue); background-color: #EFF6FF; }
               .multi-poll-option { display: flex; align-items: center; gap: 0.75rem; }
               .poll-option.voted { cursor: default; background-color: #F8FAFC; }
               .poll-option.my-vote { border-color: var(--brand-blue); background-color: #DBEAFE; font-weight: 600; }
               .poll-option-text { display: flex; justify-content: space-between; align-items: center; }
               .progress-bar { height: 8px; background: #E2E8F0; border-radius: 4px; margin-top: 4px; overflow: hidden;}
               .progress { height: 100%; background: #93C5FD; border-radius: 4px; }
               .side-cards-container { display: flex; flex-direction: column; gap: 1.5rem; }
               .side-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.5rem; }
               .side-card-header { font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
               .side-card-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 250px; overflow-y: auto; }
               .side-card-item { background: #F8FAFC; padding: 0.75rem 1rem; border-radius: 0.5rem; cursor: pointer; transition: background-color 0.2s ease; }
               .side-card-item:hover { background-color: #F1F5F9; }
               .side-card-item p { margin: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
               .modal-overlay { position: fixed; top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000; }
               .modal-content {background:white;padding:0;border-radius:1rem;width:90%;max-width:600px;overflow:hidden;}
               .modal-header {padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); display:flex; justify-content: space-between; align-items: center;}
               .modal-title {margin:0;}
               .modal-close-btn {background:none; border:none; font-size:1.5rem; cursor:pointer;}
               .modal-body {padding: 2rem;}
               .poll-option-result { margin-bottom: 1rem; }
               .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--light-text); padding: 1rem; }
               .submit-vote-btn, .edit-vote-btn { background-color: var(--brand-blue); color: white; border: none; padding: 0.6rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
               .edit-vote-btn { background-color: #F1F5F9; color: var(--dark-text); font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-left: auto;}
               .like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: var(--light-text); font-weight: 500; transition: all 0.2s ease; }
               .like-btn.liked { color: var(--brand-blue); font-weight: 700; }
               @keyframes like-anim { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
               .like-btn.liked svg { animation: like-anim 0.3s ease-in-out; }
                @keyframes slideDown { from { top: -100px; opacity: 0; } to { top: 20px; opacity: 1; } }
                .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1001; padding: 1rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; color: white; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); animation: slideDown 0.5s ease-out forwards; }
                .notification.error { background-color: #1E293B; border: 1px solid #334155; }
                .notification.error svg { color: #F87171; }
                .notification.success { background-color: #166534; border: 1px solid #15803d; } /* Added Success Style */
                .notification.success svg { color: #86EFAC; } /* Added Success Style */
            `}</style>
        </div>
    );
};

// PostItem component remains the same as previous version
const PostItem = ({ post, userId, onVote, onLike, onEditVote, showNotification, isModalView = false }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isEditingVote, setIsEditingVote] = useState(false);

    // Reset selection when editing is cancelled or completed
    useEffect(() => {
        if (!isEditingVote) {
            setSelectedOptions([]);
        }
    }, [isEditingVote]);


    const handleMultiSelectChange = (optionId) => {
        setSelectedOptions(prev =>
            prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        );
    };

    const handleVoteSubmit = async () => {
        // Prevent voting if no option is selected in multi-select mode
        if (post.isMultiSelect && selectedOptions.length === 0) {
            showNotification("Please select at least one option to submit.", "info"); // Use showNotification
            return;
        }

        if (selectedOptions.length > 0) {
            let success;
            if (isEditingVote) {
                success = await onEditVote(post._id, selectedOptions);
            } else {
                success = await onVote(post._id, selectedOptions);
            }
            if (success !== false) { // Check for explicit false return on failure
                setIsEditingVote(false);
            }
        }
    };


    const handleSingleSelectEdit = async (optionId) => {
        const success = await onEditVote(post._id, [optionId]);
        if (success !== false) { // Check for explicit false return on failure
            setIsEditingVote(false);
        }
    };

    // --- Animation state for like button ---
     const [isLikedAnimating, setIsLikedAnimating] = useState(false);

     const handleLikeClick = () => {
         const wasLiked = post.likes.includes(userId);
         onLike(post._id); // Call the like handler function passed as prop
         // Trigger animation only if it wasn't liked before
         if (!wasLiked) {
             setIsLikedAnimating(true);
             setTimeout(() => setIsLikedAnimating(false), 300); // Duration of the animation
         }
     };
     // --- End Like Animation ---


    if (post.type === 'message') {
        const hasLiked = post.likes.includes(userId);
        return (
            <div className="post-item message-item">
                <p>{post.content}</p>
                <div className="post-footer">
                    <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
                     <button
                        className={`like-btn ${hasLiked ? 'liked' : ''}`}
                        onClick={handleLikeClick} // Use the new handler
                    >
                         {/* Apply animation class conditionally */}
                        <ThumbsUpIcon filled={hasLiked} style={isLikedAnimating ? { animation: 'like-anim 0.3s ease-in-out'} : {}} />
                        {post.likes.length}
                    </button>
                </div>
            </div>
        );
    }

    if (post.type === 'poll') {
        const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
        const userVotes = post.pollOptions.filter(opt => opt.votes.includes(userId)).map(opt => opt._id);
        const canEditVote = userVotes.length > 0 && !post.votersWhoEdited.includes(userId);
        const hasLiked = post.likes.includes(userId);

        // Determine if voting is allowed (either hasn't voted yet, or is editing)
        const allowVoting = userVotes.length === 0 || isEditingVote;

        return (
            <div className="post-item poll-item">
                <h4><PollIcon /> {post.content} {post.isMultiSelect && <span>(Select multiple)</span>}</h4>
                <div className="poll-options">
                    {post.pollOptions.map(option => {
                        const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                        const isSelected = selectedOptions.includes(option._id);
                        const isMyPreviousVote = userVotes.includes(option._id);

                        // If user has voted AND is NOT editing, show results view
                        if (userVotes.length > 0 && !isEditingVote) {
                            return (
                                <div key={option._id} className={`poll-option voted ${isMyPreviousVote ? 'my-vote' : ''}`}>
                                    <div className="poll-option-text">
                                        <span>{option.text}</span>
                                        <span>{option.votes.length} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div className="progress-bar"><div className="progress" style={{ width: `${percentage}%` }}></div></div>
                                </div>
                            );
                        }

                        // Otherwise, show voting interface (checkbox/radio or clickable div)
                        if (post.isMultiSelect) {
                            return (
                                <div key={option._id} className="multi-poll-option">
                                    <input
                                        type="checkbox"
                                        id={`${post._id}-${option._id}`}
                                        checked={isSelected}
                                        onChange={() => handleMultiSelectChange(option._id)}
                                        disabled={!allowVoting} // Disable if not allowed to vote/edit
                                    />
                                    <label htmlFor={`${post._id}-${option._id}`}>{option.text}</label>
                                    {/* Optionally show results next to checkbox */}
                                     {!allowVoting && <span>({option.votes.length} - {percentage.toFixed(0)}%)</span>}
                                </div>
                            );
                        } else {
                             // Single select: Use clickable divs
                             return (
                                <div
                                    key={option._id}
                                    className={`poll-option ${isSelected ? 'my-vote' : ''}`} // Highlight selected temporary choice
                                    onClick={() => allowVoting ? (isEditingVote ? handleSingleSelectEdit(option._id) : onVote(post._id, [option._id])) : null}
                                    style={{ cursor: allowVoting ? 'pointer' : 'default' }} // Change cursor based on allowVoting
                                >
                                    <div className="poll-option-text">
                                        <span>{option.text}</span>
                                        {/* Show results if not in voting/editing mode */}
                                        {!allowVoting && <span>{option.votes.length} ({percentage.toFixed(0)}%)</span>}
                                    </div>
                                    {/* Show progress bar if not in voting/editing mode */}
                                    {!allowVoting && <div className="progress-bar"><div className="progress" style={{ width: `${percentage}%` }}></div></div>}
                                </div>
                            );
                        }
                    })}
                    {/* Show Submit button only for Multi-Select during voting/editing */}
                    {post.isMultiSelect && allowVoting && (
                        <button onClick={handleVoteSubmit} className="submit-vote-btn" disabled={selectedOptions.length === 0}>
                            {isEditingVote ? 'Update Vote' : 'Submit Vote'}
                        </button>
                    )}
                     {/* Show Cancel Edit button if editing */}
                    {isEditingVote && (
                         <button onClick={() => setIsEditingVote(false)} className="edit-vote-btn" style={{ marginLeft: '0', marginTop: '0.5rem', backgroundColor: '#E2E8F0'}}>Cancel Edit</button>
                    )}
                </div>
                 <div className="post-footer">
                    <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                         {/* Show Edit Vote button only if they can edit and are NOT currently editing */}
                         {canEditVote && !isEditingVote && <button className="edit-vote-btn" onClick={() => setIsEditingVote(true)}><EditIcon/> Edit Vote</button>}
                         <button
                            className={`like-btn ${hasLiked ? 'liked' : ''}`}
                            onClick={handleLikeClick} // Use the new handler
                         >
                            {/* Apply animation class conditionally */}
                             <ThumbsUpIcon filled={hasLiked} style={isLikedAnimating ? { animation: 'like-anim 0.3s ease-in-out'} : {}} />
                             {post.likes.length}
                         </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default InfoPage;
