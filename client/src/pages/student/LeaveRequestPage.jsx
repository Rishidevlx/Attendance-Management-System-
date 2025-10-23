import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>);
// --- NEW: Icon for the stat card ---
const LeaveStatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;


const LeaveRequestPage = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState(1);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // --- NEW: Calculate total approved leave days ---
    const totalLeaveDays = useMemo(() => {
        return history
            .filter(item => item.status === 'Approved')
            .reduce((total, item) => total + item.leaveDuration, 0);
    }, [history]);


    useEffect(() => {
        if (!startDate) {
            setEndDate('');
            setDuration(0);
            return;
        }
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(startDate);
        if (end < start) {
            setEndDate(startDate);
            setDuration(1);
        } else {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setDuration(diffDays);
        }
    }, [startDate, endDate]);

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };
    
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get('/api/attendance/leave-history', getAuthConfig());
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch leave history', error);
            showMessage('Could not load leave history.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !reason) {
            return showMessage('Please select a date and provide a reason.', 'error');
        }
        try {
            await axios.post('/api/attendance/leave-request', { startDate, endDate: endDate || startDate, reason, duration }, getAuthConfig());
            showMessage('Leave request submitted successfully!', 'success');
            setStartDate('');
            setEndDate('');
            setReason('');
            fetchHistory(); // Refresh history after submission
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to submit leave request.', 'error');
        }
    };
    
    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center' };
        switch (status) {
            case 'Approved': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Approved</span>;
            case 'Declined': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Declined</span>;
            case 'Pending': return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>Pending</span>;
            default: return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>{status}</span>;
        }
    };

    return (
        <div>
            <style>{`
                .leave-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                @media (min-width: 992px) { .leave-grid { grid-template-columns: 400px 1fr; } }
                .card { background: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
                .card-header h3 { margin: 0; font-size: 1.5rem; }
                .card-header svg { color: var(--brand-blue); }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--dark-text); }
                .date-inputs { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                @media (min-width: 576px) { .date-inputs { grid-template-columns: 1fr 1fr; align-items: center; } }
                .input-field, .textarea-field { width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background-color: #F8FAFC; color: var(--dark-text); font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box; }
                .textarea-field { min-height: 120px; resize: vertical; }
                .duration-display { background-color: #F1F5F9; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-weight: 600; }
                .submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem 1rem; background-color: var(--brand-blue); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s; font-size: 1rem; }
                .submit-btn:hover { background-color: #003ECC; }
                .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }
                .table-wrapper { min-height: 200px; max-height: 400px; overflow-y: auto; }
                .leave-table { width: 100%; border-collapse: collapse; }
                .leave-table th, .leave-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .leave-table thead { position: sticky; top: 0; background: #F8FAFC; z-index: 1; }
                .leave-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .no-results-container { text-align: center; padding: 3rem 1rem; color: var(--light-text); }
                
                /* --- NEW: Styles for the stat card --- */
                .stat-card { display: flex; align-items: center; gap: 1rem; background-color: #F0F4F8; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border-color); margin-bottom: 1.5rem; }
                .stat-icon-wrapper { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--white); background-color: #8B5CF6; }
                .stat-info h4 { margin: 0 0 0.25rem; color: var(--light-text); font-weight: 500; font-size: 0.9rem; }
                .stat-info p { margin: 0; font-size: 1.75rem; font-weight: 700; color: var(--dark-text); }
            `}</style>
            
            <div className="leave-grid">
                <div className="card">
                    <div className="card-header">
                        <CalendarIcon />
                        <h3>Apply for Leave</h3>
                    </div>
                    {message.text && <div className={`message-box ${message.type}-message-box`}>{message.text}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Leave Dates</label>
                            <div className="date-inputs">
                                <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
                                <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} disabled={!startDate} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Duration</label>
                            <div className="duration-display">{duration} Day{duration !== 1 && 's'}</div>
                        </div>
                        <div className="form-group">
                            <label>Reason for Leave</label>
                            <textarea className="textarea-field" value={reason} onChange={e => setReason(e.target.value)} placeholder="Please provide a brief reason..." required></textarea>
                        </div>
                        <button type="submit" className="submit-btn"><SendIcon /> Submit Request</button>
                    </form>
                </div>

                <div className="card">
                     <div className="card-header">
                        <HistoryIcon />
                        <h3>Your Leave History</h3>
                    </div>

                    {/* --- NEW: Stat Card for Total Leave Days --- */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper"><LeaveStatIcon /></div>
                        <div className="stat-info">
                            <h4>Total Approved Leave Days</h4>
                            <p>{totalLeaveDays}</p>
                        </div>
                    </div>

                    <div className="table-wrapper">
                         {isLoading ? <p>Loading history...</p> : history.length > 0 ? (
                            <table className="leave-table">
                                <thead>
                                    <tr><th>Start Date</th><th>End Date</th><th>Duration</th><th>Reason</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {history.map(item => (
                                        <tr key={item._id}>
                                            <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                            <td>{new Date(item.leaveEndDate).toLocaleDateString('en-GB')}</td>
                                            <td>{item.leaveDuration} Day{item.leaveDuration > 1 ? 's' : ''}</td>
                                            <td>{item.reason}</td>
                                            <td>{getStatusChip(item.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-results-container">
                                <NoResultsIcon/>
                                <p style={{marginTop: '1rem'}}>You haven't applied for any leaves yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestPage;

