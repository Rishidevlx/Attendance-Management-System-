import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);

const AttendanceRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRequestIds, setEditingRequestIds] = useState([]);

    const fetchRequests = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/attendance/requests', config);
            setRequests(data.map(req => ({ ...req, justEdited: false })));
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, newStatus) => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/attendance/requests/${requestId}`, { status: newStatus }, config);
            
            setRequests(prevRequests => 
                prevRequests.map(req => 
                    req._id === requestId ? { ...req, status: newStatus, justEdited: true } : req
                )
            );
            setEditingRequestIds(prevIds => prevIds.filter(id => id !== requestId));
        } catch (error) {
            console.error(`Failed to update status to ${newStatus}`, error);
        }
    };

    const toggleEditMode = (requestId) => {
        setEditingRequestIds(prevIds => 
            prevIds.includes(requestId) 
                ? prevIds.filter(id => id !== requestId)
                : [...prevIds, requestId]
        );
    };

    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center' };
        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Approved</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Declined</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>Pending</span>;
        }
    };
    
    const filteredRequests = useMemo(() => {
        return requests.filter(req =>
            req.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [requests, searchTerm]);

    const requestsToCount = useMemo(() => {
        const pending = requests.filter(req => req.status === 'Pending').map(r => r._id);
        const editing = editingRequestIds;
        return new Set([...pending, ...editing]).size;
    }, [requests, editingRequestIds]);

    return (
        <div>
             <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                
                /* --- FIX: Styles for header layout --- */
                .requests-header { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; /* This is the main fix */
                    margin-bottom: 2rem; 
                    gap: 1rem; 
                    flex-wrap: wrap; 
                    margin-right: 1rem; /* Added margin to the right for spacing */
                }
                .requests-header h2 { 
                    font-size: 1.8rem; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.75rem; 
                    margin: 0;
                    /* margin-right: auto; Removed this */
                }

                .request-count-badge { background-color: var(--brand-blue); color: white; font-size: 1rem; font-weight: 700; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .search-bar { position: relative; width: 100%; max-width: 320px; }
                .search-bar input { width: 100%; height: 44px; padding-left: 40px; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.9rem; }
                .search-bar svg { position: absolute; left: 12px; top: 12px; color: var(--light-text); }
                .requests-table { width: 100%; border-collapse: collapse; }
                .requests-table th, .requests-table td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .requests-table thead { background-color: #F8FAFC; }
                .requests-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .action-buttons { display: flex; gap: 0.75rem; }
                .action-btn { border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
                .approve-btn { background-color: #D1FAE5; color: #065F46; }
                .approve-btn:hover { background-color: #A7F3D0; }
                .decline-btn { background-color: #FEE2E2; color: #991B1B; }
                .decline-btn:hover { background-color: #FECACA; }
                .edit-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; }
                .edit-btn:hover { color: var(--brand-blue); }
                .status-cell { display: flex; align-items: center; gap: 0.5rem; }
                .edited-tag { font-size: 0.7rem; color: #4338CA; font-weight: 500; }
             `}</style>

             <div className="requests-header fade-in-up">
                <h2>Requests <span className="request-count-badge">{requestsToCount}</span></h2>
                <div className="search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
             </div>
             <div className="card fade-in-up" style={{ padding: 0, animationDelay: '100ms' }}>
                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading requests...</p> : (
                    <table className="requests-table">
                        <thead>
                            <tr><th>Student Name</th><th>Date</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.studentName}</td>
                                    <td>{new Date(req.date).toLocaleDateString('en-GB')}</td>
                                    <td className="status-cell">
                                        {getStatusChip(req.status)}
                                        {req.justEdited && <span className="edited-tag">(Edited)</span>}
                                    </td>
                                    <td>
                                        {req.status === 'Pending' || editingRequestIds.includes(req._id) ? (
                                            <div className="action-buttons">
                                                <button className="action-btn approve-btn" onClick={() => handleAction(req._id, 'Present')}>Present</button>
                                                <button className="action-btn decline-btn" onClick={() => handleAction(req._id, 'Absent')}>Absent</button>
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
                )}
             </div>
        </div>
    );
};

export default AttendanceRequestsPage;

