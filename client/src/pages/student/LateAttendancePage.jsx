import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import skeneticLogo from '../../assets/skenetic-logo.jpg';

// --- ICONS ---
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2" /></svg>);
const LateStatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


const LateAttendancePage = () => {
    const [lateHistory, setLateHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const totalLateDays = useMemo(() => lateHistory.length, [lateHistory]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/attendance/history', config);
                setLateHistory(data.filter(item => item.wasLate === true));
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDownload = () => {
        // ... (No changes to this function)
    };

    const filteredLateHistory = useMemo(() => {
        if (!startDate || !endDate) return lateHistory;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return lateHistory.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });
    }, [lateHistory, startDate, endDate]);

    // --- CORRECTION 3: Corrected Status Text ---
    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center' };
        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Present</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Absent</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late (Pending)</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
        }
    };
    
    const NoResultsComponent = ({ message }) => (
        <div className="no-results-container">
            <NoResultsIcon />
            <h3>No Records Found</h3>
            <p>{message}</p>
        </div>
    );

    return (
        <div>
            <style>{`
                 /* ... (No changes to CSS) ... */
                .card { background: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .card-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .card-header h3 { margin: 0; font-size: 1.5rem; }
                .header-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
                .date-filters { display: flex; align-items: center; gap: 0.5rem; }
                .date-filters input { border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 0.5rem; }
                .download-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--white); font-weight: 600; cursor: pointer; }
                .table-wrapper { min-height: 200px; max-height: 400px; overflow-y: auto; }
                .attendance-table { width: 100%; border-collapse: collapse; }
                .attendance-table th, .attendance-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .attendance-table thead { position: sticky; top: 0; background: #F8FAFC; z-index: 1; }
                .attendance-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .no-results-container { text-align: center; padding: 3rem 1rem; color: var(--light-text); }
                .stat-card { display: flex; align-items: center; gap: 1rem; background-color: #F0F4F8; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border-color); margin-bottom: 1.5rem; }
                .stat-icon-wrapper { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--white); background-color: #F59E0B; }
                .stat-info h4 { margin: 0 0 0.25rem; color: var(--light-text); font-weight: 500; font-size: 0.9rem; }
                .stat-info p { margin: 0; font-size: 1.75rem; font-weight: 700; color: var(--dark-text); }
                .clear-date-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; display: flex; align-items: center; justify-content: center; }
            `}</style>
            
            <div className="card">
                <div className="card-header">
                     <h3>Your Late Attendance History</h3>
                     <div className="header-actions">
                        <div className="date-filters">
                            <CalendarIcon />
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                             {(startDate || endDate) && <button className="clear-date-btn" onClick={() => {setStartDate(''); setEndDate('')}}><XIcon /></button>}
                        </div>
                        <button className="download-btn" onClick={handleDownload}><DownloadIcon /> Download PDF</button>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-wrapper"><LateStatIcon /></div>
                    <div className="stat-info">
                        <h4>Total Late Days</h4>
                        <p>{totalLateDays}</p>
                    </div>
                </div>

                <div className="table-wrapper">
                    {isLoading ? <p style={{textAlign: 'center', padding: '2rem'}}>Loading late history...</p> : filteredLateHistory.length > 0 ? (
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check-in Time</th>
                                    <th>Status</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLateHistory.map(item => (
                                    <tr key={item._id}>
                                        <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                        <td>{new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                        <td>{getStatusChip(item.status)}</td>
                                        <td>{item.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                       <NoResultsComponent message="Great! You have no late attendance records." />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LateAttendancePage;
