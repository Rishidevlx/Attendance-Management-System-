import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const InboxIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const XSmallIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const CheckSquareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);



const EmptyState = ({ message, subMessage }) => (
    <div className="empty-state-container">
        <InboxIcon />
        <h3>{message}</h3>
        <p>{subMessage}</p>
    </div>
);

const DeleteConfirmationModal = ({ count, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" style={{ maxWidth: '480px', padding: '2.5rem' }} onClick={(e) => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#FEE2E2', borderRadius: '50%', padding: '1rem' }}><AlertTriangleIcon /></div>
            </div>
            <h2 className="modal-title" style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Delete {count} Record{count > 1 && 's'}?</h2>
            <p style={{ textAlign: 'center', color: 'var(--light-text)', marginBottom: '2.5rem', maxWidth: '350px', margin: '0 auto 2.5rem' }}>
                Are you sure? This action cannot be undone. All related check-in records will also be removed.
            </p>
            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: 0, borderTop: 'none' }}>
                <button className="action-btn" style={{backgroundColor: '#F1F5F9', color: 'var(--dark-text)'}} onClick={onCancel}>Cancel</button>
                <button className="action-btn delete-btn" onClick={onConfirm}>Yes, Delete</button>
            </div>
        </div>
    </div>
);


const LeaveRequestsAdminPage = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [historyRequests, setHistoryRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Filters for Pending Requests
    const [searchTerm, setSearchTerm] = useState('');
    const [domainFilter, setDomainFilter] = useState('All');
    const [daysFilter, setDaysFilter] = useState('All');

    // --- NEW: Filters for History Requests ---
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState('All');


    const [editingRequestIds, setEditingRequestIds] = useState([]);

    // --- NEW: State for bulk selection and deletion in History ---
    const [isHistorySelectMode, setHistorySelectMode] = useState(false);
    const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [idsToDelete, setIdsToDelete] = useState([]);


    const uniqueDomains = useMemo(() => {
        const allReqs = [...pendingRequests, ...historyRequests];
        const domains = new Set(allReqs.map(req => req.studentId?.domain).filter(Boolean));
        return ['All', ...Array.from(domains)];
    }, [pendingRequests, historyRequests]);

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const fetchLeaveRequests = async () => {
        setIsLoading(true);
        try {
            const [pendingRes, historyRes] = await Promise.all([
                axios.get('/api/attendance/leave-requests', getAuthConfig()),
                axios.get('/api/attendance/leave-requests-history', getAuthConfig())
            ]);
            setPendingRequests(pendingRes.data);
            setHistoryRequests(historyRes.data);
        } catch (error) {
            console.error("Failed to fetch leave requests", error);
            showMessage('Failed to load leave requests.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleAction = async (requestId, status, isFromHistory = false) => {
        try {
            await axios.put(`/api/attendance/leave-requests/${requestId}`, { status }, getAuthConfig());
            showMessage(`Request has been ${status.toLowerCase()}.`, 'success');
            fetchLeaveRequests();
            if (isFromHistory) {
                setEditingRequestIds(prev => prev.filter(id => id !== requestId));
            }
        } catch (error) {
            console.error(`Failed to update leave status to ${status}`, error);
            showMessage('Action failed. Please try again.', 'error');
        }
    };

    // --- NEW: Bulk Delete for History ---
    const handleBulkDeleteHistory = async () => {
        if(selectedHistoryIds.length === 0) return;
        setIdsToDelete(selectedHistoryIds);
        setDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        try {
            await axios.post('/api/attendance/reports/bulk-delete', { ids: idsToDelete }, getAuthConfig());
            showMessage(`${idsToDelete.length} record(s) deleted.`, 'success');
            fetchLeaveRequests();
        } catch (error) {
            showMessage('Failed to delete records.', 'error');
        } finally {
            setDeleteModalOpen(false);
            setIdsToDelete([]);
            setSelectedHistoryIds([]);
            setHistorySelectMode(false);
        }
    };

    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center' };
        switch (status) {
            case 'Approved': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Approved</span>;
            case 'Declined': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Declined</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>Pending</span>;
        }
    };
    
    const filteredPendingRequests = useMemo(() => {
        return pendingRequests.filter(req =>
            (req.studentName || req.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
            (domainFilter === 'All' || req.studentId?.domain === domainFilter) &&
            (daysFilter === 'All' || req.leaveDuration >= parseInt(daysFilter))
        );
    }, [pendingRequests, searchTerm, domainFilter, daysFilter]);
    
    const filteredHistoryRequests = useMemo(() => {
         let requests = historyRequests.filter(req =>
            (req.studentName || req.studentId?.name || '').toLowerCase().includes(historySearchTerm.toLowerCase())
        );

        if (historyStatusFilter !== 'All') {
            requests = requests.filter(req => req.status === historyStatusFilter);
        }

        if (historyStartDate && historyEndDate) {
            const start = new Date(historyStartDate); start.setHours(0,0,0,0);
            const end = new Date(historyEndDate); end.setHours(23,59,59,999);
            requests = requests.filter(req => {
                const reqDate = new Date(req.updatedAt); // Filter based on when it was updated
                return reqDate >= start && reqDate <= end;
            });
        }
        return requests;
    }, [historyRequests, historySearchTerm, historyStartDate, historyEndDate, historyStatusFilter]);
    
    const toggleEditMode = (requestId) => {
        setEditingRequestIds(prevIds => 
            prevIds.includes(requestId) ? prevIds.filter(id => id !== requestId) : [...prevIds, requestId]
        );
    };
    
    // --- NEW: Quick Date Filters for History ---
    const setHistoryDateRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setHistoryStartDate(start.toISOString().split('T')[0]);
        setHistoryEndDate(end.toISOString().split('T')[0]);
    };

    // --- NEW: Handlers for History Selection ---
    const toggleHistorySelectMode = () => { setHistorySelectMode(!isHistorySelectMode); setSelectedHistoryIds([]); };
    const handleHistorySelectOne = (id) => setSelectedHistoryIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    const handleHistorySelectAll = () => {
        if (selectedHistoryIds.length === filteredHistoryRequests.length) { setSelectedHistoryIds([]); } 
        else { setSelectedHistoryIds(filteredHistoryRequests.map(r => r._id)); }
    };


    return (
        <div>
            {isDeleteModalOpen && <DeleteConfirmationModal count={idsToDelete.length} onConfirm={confirmDelete} onCancel={() => setDeleteModalOpen(false)} />}
            {message.text && <div className={`message-box ${message.type === 'error' ? 'error-message-box' : 'success-message-box'}`}>{message.text}</div>}
            <style>{`
                .requests-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap; }
                .requests-header h2 { font-size: 1.8rem; display: flex; align-items: center; gap: 0.75rem; margin: 0; }
                .request-count-badge { background-color: var(--brand-blue); color: white; font-size: 1rem; font-weight: 700; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .header-filters { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
                .search-bar { position: relative; }
                .search-bar input, .filter-select, .date-input, .date-quick-filter { height: 44px; padding: 0 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.9rem; background-color: #F8FAFC; }
                .search-bar input { padding-left: 40px; }
                .search-bar svg { position: absolute; left: 12px; top: 12px; color: var(--light-text); }
                .requests-table { width: 100%; border-collapse: collapse; }
                .requests-table td, .requests-table th { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
                .requests-table thead { background-color: #F8FAFC; }
                .requests-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .action-buttons { display: flex; gap: 0.75rem; }
                .action-btn { border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 0.5rem; }
                .approve-btn { background-color: #D1FAE5; color: #065F46; }
                .decline-btn { background-color: #FEE2E2; color: #991B1B; }
                .empty-state-container { text-align: center; padding: 3rem 1rem; color: var(--light-text); }
                .section-title { font-size: 1.5rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; color: var(--dark-text); }
                .section-title-main { display: flex; align-items: center; gap: 0.75rem; }
                .edit-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; }
                .select-btn { background-color: #F1F5F9; color: var(--dark-text); }
                .select-btn.active { background-color: #E2E8F0; }
                .delete-btn { background-color: #EF4444; color: var(--white); }
                .delete-btn:disabled { background-color: #F87171; cursor: not-allowed; }
                .message-box { padding: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 500; animation: fadeIn 0.3s; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }
                .custom-checkbox { width: 18px; height: 18px; accent-color: var(--brand-blue); }
                .modal-overlay { position: fixed; top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000; }
                .modal-content {background:white;padding:2rem;border-radius:1rem;max-width:480px;}
                .modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
            `}</style>

            <div className="requests-header">
                <h2>Leave Requests <span className="request-count-badge">{filteredPendingRequests.length}</span></h2>
                <div className="header-filters">
                    <select className="filter-select" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
                        {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="filter-select" value={daysFilter} onChange={e => setDaysFilter(e.target.value)}>
                        <option value="All">All Durations</option>
                        <option value="1">1 Day</option>
                        <option value="2">2+ Days</option>
                        <option value="5">5+ Days</option>
                    </select>
                    <div className="search-bar">
                        <SearchIcon />
                        <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p> : 
                    filteredPendingRequests.length > 0 ? (
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>Student Name</th><th>Domain</th><th>Dates</th><th>Duration</th><th>Reason</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPendingRequests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.studentName || req.studentId?.name}</td>
                                    <td>{req.studentId?.domain || 'N/A'}</td>
                                    <td>{new Date(req.date).toLocaleDateString('en-GB')} - {new Date(req.leaveEndDate).toLocaleDateString('en-GB')}</td>
                                    <td>{req.leaveDuration} Day{req.leaveDuration > 1 ? 's' : ''}</td>
                                    <td>{req.reason}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn approve-btn" onClick={() => handleAction(req._id, 'Approved')}><CheckIcon /> Approve</button>
                                            <button className="action-btn decline-btn" onClick={() => handleAction(req._id, 'Declined')}><XSmallIcon /> Decline</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : ( <EmptyState message="No Pending Leave Requests" subMessage="All leave requests have been processed." /> )
                }
             </div>

            <div className="section-title">
                <div className="section-title-main"><HistoryIcon /> Leave Requests History</div>
                <div className="header-actions">
                     <button className={`action-btn select-btn ${isHistorySelectMode ? 'active' : ''}`} onClick={toggleHistorySelectMode}><CheckSquareIcon/> Select</button>
                    {isHistorySelectMode && <button className="action-btn delete-btn" onClick={handleBulkDeleteHistory} disabled={selectedHistoryIds.length === 0}><DeleteIcon/> Delete ({selectedHistoryIds.length})</button>}
                </div>
            </div>

            {/* --- NEW: History Filters --- */}
            <div className="header-filters" style={{marginBottom: '1.5rem'}}>
                 <div className="search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search history..." value={historySearchTerm} onChange={(e) => setHistorySearchTerm(e.target.value)} />
                </div>
                <select className="filter-select" value={historyStatusFilter} onChange={e => setHistoryStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                </select>
                <input type="date" className="date-input" value={historyStartDate} onChange={e => setHistoryStartDate(e.target.value)} />
                <span>-</span>
                <input type="date" className="date-input" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} />
                <button className="date-quick-filter" onClick={() => setHistoryDateRange(15)}>Last 15 Days</button>
                <button className="date-quick-filter" onClick={() => setHistoryDateRange(30)}>Last 30 Days</button>
                 {(historyStartDate || historyEndDate) && <button className="action-btn" style={{padding:'0.5rem'}} onClick={() => {setHistoryStartDate(''); setHistoryEndDate('')}}><XIcon/></button>}
            </div>


             <div className="card" style={{ padding: 0 }}>
                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading history...</p> : 
                    filteredHistoryRequests.length > 0 ? (
                    <table className="requests-table">
                         <thead>
                            <tr>
                                {isHistorySelectMode && <th><input type="checkbox" className="custom-checkbox" onChange={handleHistorySelectAll} checked={selectedHistoryIds.length === filteredHistoryRequests.length && filteredHistoryRequests.length > 0} /></th>}
                                <th>Student Name</th><th>Dates</th><th>Status</th><th>Updated On</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistoryRequests.map(req => (
                                <tr key={req._id}>
                                    {isHistorySelectMode && <td><input type="checkbox" className="custom-checkbox" checked={selectedHistoryIds.includes(req._id)} onChange={() => handleHistorySelectOne(req._id)} /></td>}
                                    <td>{req.studentName || req.studentId?.name}</td>
                                    <td>{new Date(req.date).toLocaleDateString('en-GB')} - {new Date(req.leaveEndDate).toLocaleDateString('en-GB')}</td>
                                    <td>{getStatusChip(req.status)}</td>
                                    <td>{new Date(req.updatedAt).toLocaleString('en-GB')}</td>
                                    <td>
                                        {editingRequestIds.includes(req._id) ? (
                                            <div className="action-buttons">
                                                <button className="action-btn approve-btn" onClick={() => handleAction(req._id, 'Approved', true)}>Approve</button>
                                                <button className="action-btn decline-btn" onClick={() => handleAction(req._id, 'Declined', true)}>Decline</button>
                                            </div>
                                        ) : ( 
                                            <button className="edit-btn" title="Edit Status" onClick={() => toggleEditMode(req._id)}><EditIcon /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : ( <EmptyState message="No history found" subMessage="Try adjusting your filters to see more results." /> )}
            </div>

        </div>
    );
};

export default LeaveRequestsAdminPage;
