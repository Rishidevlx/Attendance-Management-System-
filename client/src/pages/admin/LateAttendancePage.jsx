import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const InboxIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const CheckSquareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


const DeclineReasonModal = ({ onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const handleConfirm = () => {
        if (!reason.trim()) { alert('Please provide a reason for declining.'); return; }
        onConfirm(reason);
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Reason for Absence</h3>
                <p className="modal-subtitle">Please provide a brief reason for marking this student as absent.</p>
                <textarea className="reason-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Uninformed leave..." />
                <div className="modal-actions">
                    <button className="action-btn cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="action-btn decline-btn" onClick={handleConfirm}>Mark Absent</button>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ message, subMessage }) => (
    <div className="empty-state-container">
        <InboxIcon />
        <h3>{message}</h3>
        <p>{subMessage}</p>
    </div>
);


const LateAttendancePage = () => {
    const [allLateRequests, setAllLateRequests] = useState([]);
    const [todayLateHistory, setTodayLateHistory] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingRequestIds, setEditingRequestIds] = useState([]);
    const [isDeclineModalOpen, setDeclineModalOpen] = useState(false);
    const [requestToDecline, setRequestToDecline] = useState(null);
    const [isSelectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkActionStatus, setBulkActionStatus] = useState(null);


    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [allLateRes, todayHistoryRes] = await Promise.all([
                axios.get('/api/attendance/late-requests', config),
                axios.get('/api/attendance/today-late-history', config) 
            ]);

            setAllLateRequests(allLateRes.data);
            setTodayLateHistory(todayHistoryRes.data);

        } catch (error) {
            console.error("Failed to fetch late attendance data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAction = async (requestId, newStatus, reason = '-') => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: updatedRequest } = await axios.put(`/api/attendance/requests/${requestId}`, { status: newStatus, reason }, config);
            
            setAllLateRequests(prev => prev.filter(req => req._id !== requestId));
            
            const isAlreadyInHistory = todayLateHistory.some(req => req._id === requestId);
            if (isAlreadyInHistory) {
                setTodayLateHistory(prev => prev.map(req => req._id === requestId ? updatedRequest : req));
            } else {
                 setTodayLateHistory(prev => [updatedRequest, ...prev].sort((a,b) => new Date(b.date) - new Date(a.date)));
            }

            setEditingRequestIds(prevIds => prevIds.filter(id => id !== requestId));
        } catch (error) {
            console.error(`Failed to update status`, error);
        }
    };
    
    const handleBulkAction = async (status, reason = '') => {
        if (selectedIds.length === 0) return;

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/attendance/requests/bulk-update', { ids: selectedIds, status, reason }, config);
            
            await fetchAllData();
            
            setSelectedIds([]);
            setSelectMode(false);
        } catch (error) {
            console.error(`Failed to perform bulk action`, error);
        }
    };

    const openDeclineModal = (request) => {
        setRequestToDecline(request);
        setDeclineModalOpen(true);
    };

    const openBulkDeclineModal = () => {
        setBulkActionStatus('Absent');
        setDeclineModalOpen(true);
    };
    
    const confirmDecline = (reason) => {
        if (isSelectMode && bulkActionStatus === 'Absent') {
            handleBulkAction('Absent', reason);
        }
        else if(requestToDecline) {
            handleAction(requestToDecline._id, 'Absent', reason);
        }
        setDeclineModalOpen(false);
        setRequestToDecline(null);
        setBulkActionStatus(null);
    };

    const toggleEditMode = (requestId) => {
        setEditingRequestIds(prevIds => 
            prevIds.includes(requestId) ? prevIds.filter(id => id !== requestId) : [...prevIds, requestId]
        );
    };

    const getStatusChip = (request) => {
        const { status, wasLate } = request;
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '4px' };
        
        const lateIndicator = <span style={{ backgroundColor: '#DC2626', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>L</span>;

        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Approved {wasLate && lateIndicator}</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Declined {wasLate && lateIndicator}</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
        }
    };
    
    const filteredAllLateRequests = useMemo(() => {
        return allLateRequests.filter(req =>
            (req.studentName || req.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allLateRequests, searchTerm]);
    
    const filteredTodayLateHistory = useMemo(() => {
        return todayLateHistory.filter(req =>
             (req.studentName || req.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [todayLateHistory, searchTerm]);
    
    const toggleSelectMode = () => { setSelectMode(!isSelectMode); setSelectedIds([]); };
    const handleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    const handleSelectAll = () => {
        if (selectedIds.length === filteredAllLateRequests.length) { setSelectedIds([]); } 
        else { setSelectedIds(filteredAllLateRequests.map(r => r._id)); }
    };


    return (
        <div>
             {isDeclineModalOpen && <DeclineReasonModal onClose={() => setDeclineModalOpen(false)} onConfirm={confirmDecline} />}
             <style>{`
                .requests-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; }
                .requests-header h2 { font-size: 1.8rem; margin: 0; }
                .header-actions-right { display: flex; align-items: center; gap: 1rem; }
                .search-bar { position: relative; width: 100%; max-width: 320px; }
                .search-bar input { width: 90%; height: 44px; padding-left: 40px; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.9rem; }
                .search-bar svg { position: absolute; left: 12px; top: 12px; color: var(--light-text); }
                .requests-table { width: 100%; border-collapse: collapse; }
                .requests-table td, .requests-table th { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
                .requests-table thead { background-color: #F8FAFC; }
                .requests-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .empty-state-container { text-align: center; padding: 3rem 1rem; color: var(--light-text); }
                .empty-state-container svg { margin-bottom: 1rem; color: #CBD5E1; }
                .empty-state-container h3 { color: var(--dark-text); font-size: 1.25rem; margin: 0 0 0.5rem; }
                .empty-state-container p { margin: 0; }
                .action-buttons { display: flex; gap: 0.75rem; }
                .action-btn { border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 0.5rem; }
                .approve-btn { background-color: #D1FAE5; color: #065F46; }
                .decline-btn { background-color: #FEE2E2; color: #991B1B; }
                .cancel-btn { background-color: #E5E7EB; color: #374151; }
                .edit-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
                .modal-content { background: var(--white); padding: 2rem; border-radius: 1rem; width: 90%; max-width: 450px; }
                .modal-title { margin-top: 0; font-size: 1.5rem; }
                .modal-subtitle { color: var(--light-text); margin-bottom: 1.5rem; }
                .reason-textarea { width: 100%; min-height: 100px; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.75rem; font-family: 'Inter', sans-serif; font-size: 1rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
                .section-title { font-size: 1.5rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: var(--dark-text); }
                .select-btn { background-color: #F1F5F9; color: var(--dark-text); }
                .select-btn.active { background-color: #E2E8F0; }
                .custom-checkbox { width: 18px; height: 18px; accent-color: var(--brand-blue); }
             `}</style>

             <div className="requests-header">
                <h2>Late Attendance Requests</h2>
                
                 {isSelectMode && selectedIds.length > 0 && (
                    <div className="action-buttons">
                        <button className="action-btn approve-btn" onClick={() => handleBulkAction('Present')}><CheckIcon /> Present All ({selectedIds.length})</button>
                        <button className="action-btn decline-btn" onClick={openBulkDeclineModal}><XIcon /> Absent All ({selectedIds.length})</button>
                    </div>
                )}

                <div className="header-actions-right">
                    <button className={`action-btn select-btn ${isSelectMode ? 'active' : ''}`} onClick={toggleSelectMode}><CheckSquareIcon/> Select</button>
                    <div className="search-bar">
                        <SearchIcon />
                        <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
             </div>
             <div className="card" style={{ padding: 0 }}>
                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading late requests...</p> : 
                    filteredAllLateRequests.length > 0 ? (
                    <table className="requests-table">
                        <thead>
                            <tr>
                                {isSelectMode && <th><input type="checkbox" className="custom-checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredAllLateRequests.length && filteredAllLateRequests.length > 0} /></th>}
                                <th>Student Name</th>
                                <th>Date</th>
                                <th>Check-in Time</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllLateRequests.map(req => (
                                <tr key={req._id}>
                                    {isSelectMode && <td><input type="checkbox" className="custom-checkbox" checked={selectedIds.includes(req._id)} onChange={() => handleSelectOne(req._id)}/></td>}
                                    <td>{req.studentName || req.studentId?.name}</td>
                                    <td>{new Date(req.date).toLocaleDateString('en-GB')}</td>
                                    <td>{new Date(req.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                    <td>{getStatusChip(req)}</td>
                                    <td>{req.reason}</td>
                                    <td>
                                       <div className="action-buttons">
                                            <button className="action-btn approve-btn" onClick={() => handleAction(req._id, 'Present')}>Present</button>
                                            <button className="action-btn decline-btn" onClick={() => openDeclineModal(req)}>Absent</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <EmptyState message="No Pending Late Requests" subMessage="All late check-ins have been processed." />
                 )
                }
             </div>

            <div className="section-title">
                <HistoryIcon />
                Today's Late Attendance History
            </div>
            <div className="card" style={{ padding: 0 }}>
                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading today's history...</p> : 
                    filteredTodayLateHistory.length > 0 ? (
                    <table className="requests-table">
                         <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Date</th>
                                <th>Check-in Time</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTodayLateHistory.map(req => (
                                <tr key={req._id}>
                                    <td>{req.studentName || req.studentId?.name}</td>
                                    <td>{new Date(req.date).toLocaleDateString('en-GB')}</td>
                                    <td>{new Date(req.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                    <td>{getStatusChip(req)}</td>
                                    <td>{req.reason}</td>
                                    <td>
                                        {editingRequestIds.includes(req._id) ? (
                                            <div className="action-buttons">
                                                <button className="action-btn approve-btn" onClick={() => handleAction(req._id, 'Present')}>Present</button>
                                                <button className="action-btn decline-btn" onClick={() => openDeclineModal(req)}>Absent</button>
                                            </div>
                                        ) : ( 
                                            <button className="edit-btn" title="Edit Status" onClick={() => toggleEditMode(req._id)}>
                                                <EditIcon />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <EmptyState message="No Late History Today" subMessage="No student was marked as late today." />
                 )}
            </div>
        </div>
    );
};

export default LateAttendancePage;
