import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import skeneticLogo from '../../assets/skenetic-logo.jpg';

// --- ICONS ---
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const CheckInIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);


const AttendancePage = () => {
    const [history, setHistory] = useState([]);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateRangeMessage, setDateRangeMessage] = useState('');
    const [userLoginDate, setUserLoginDate] = useState(null);

    const fetchHistory = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const user = JSON.parse(localStorage.getItem('user'));
            
            // --- FIX: Get user's registration date from the user object in localStorage ---
            // The user object must contain the 'createdAt' field from the backend for this to work.
            if (user && user.createdAt) {
                const loginDate = new Date(user.createdAt);
                loginDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
                setUserLoginDate(loginDate);
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/attendance/history', config);
            setHistory(data);

            const today = new Date().toISOString().split('T')[0];
            const hasCheckedIn = data.some(item => new Date(item.date).toISOString().split('T')[0] === today);
            setIsCheckedInToday(hasCheckedIn);
        } catch (error) {
            console.error("Failed to fetch attendance history", error);
            setMessage({ text: 'Could not load history.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchHistory();
    }, []);
    
    // --- FIX: Logic to refresh the check-in button daily ---
    // This effect runs every minute to check if the day has changed.
    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            const hasCheckedIn = history.some(item => new Date(item.date).toISOString().split('T')[0] === today);
            if (isCheckedInToday === hasCheckedIn) return; // No change, do nothing
            setIsCheckedInToday(hasCheckedIn);
        }, 1000 * 60); // Check every minute
        return () => clearInterval(interval);
    }, [history, isCheckedInToday]);


    const handleCheckIn = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/attendance/check-in', {}, config);
            
            setMessage({ text: 'Your check-in request has been sent.', type: 'success' });
            await fetchHistory();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Check-in failed.', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 5000); 
    };

    // --- FIX: Improved date range validation logic ---
    const filteredHistory = useMemo(() => {
        setDateRangeMessage('');
        if (!startDate || !endDate) return history;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (userLoginDate && start < userLoginDate) {
            setDateRangeMessage("You are too front! Please select a date after you joined.");
            return [];
        }
        if (start > today) {
            setDateRangeMessage("You are too fast! The start date cannot be in the future.");
            return [];
        }

        end.setHours(23, 59, 59, 999);
        return history.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });
    }, [history, startDate, endDate, userLoginDate]);

    const handleDownload = () => {
        if (!window.jspdf) { alert("PDF library is not loaded."); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const user = JSON.parse(localStorage.getItem('user'));

        doc.setFontSize(20);
        doc.text("Attendance Report", 14, 22);
        doc.setFontSize(12);
        doc.text(`Student: ${user?.name || 'N/A'}`, 14, 30);
        const img = new Image();
        img.src = skeneticLogo;
        doc.addImage(img, 'JPG', 160, 8, 35, 30);
        doc.autoTable({
            startY: 40,
            head: [['Request ID', 'Date', 'Type', 'Reason', 'Status']],
            body: filteredHistory.map(item => [
                item._id.slice(-6).toUpperCase(),
                new Date(item.date).toLocaleDateString('en-GB'),
                item.type,
                item.reason,
                item.status
            ]),
            theme: 'striped', headStyles: { fillColor: [30, 41, 59] }
        });
        doc.save(`attendance_report_${user?.name || 'student'}.pdf`);
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
    
    const DateRangeMessageComponent = ({ message }) => (
        <div className="date-range-message-container">
            <AlertTriangleIcon />
            <h3>Invalid Date Range</h3>
            <p>{message}</p>
        </div>
    );

    return (
        <div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .card { background: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .history-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .history-header h3 { margin: 0; font-size: 1.5rem; }
                .header-actions { display: flex; align-items: center; gap: 1rem; }
                .checkin-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem 1rem; background-color: var(--brand-blue); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .checkin-btn:hover { background-color: #003ECC; }
                .checkin-btn:disabled { background-color: #94A3B8; cursor: not-allowed; }
                .status-message { margin-bottom: 1rem; padding: 0.75rem; border-radius: 0.5rem; font-weight: 500; text-align: center; }
                .status-message.success { background-color: #D1FAE5; color: #065F46; }
                .status-message.error { background-color: #FEE2E2; color: #991B1B; }
                .date-filters { display: flex; align-items: center; gap: 0.5rem; }
                .date-filters input { border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 0.5rem; }
                .download-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--white); font-weight: 600; cursor: pointer; }
                .table-wrapper { min-height: 200px; max-height: 400px; overflow-y: auto; }
                .attendance-table { width: 100%; border-collapse: collapse; }
                .attendance-table th, .attendance-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .attendance-table thead { position: sticky; top: 0; background: #F8FAFC; }
                .attendance-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .date-range-message-container { text-align: center; padding: 3rem 1rem; border: 2px dashed var(--border-color); border-radius: 1rem; color: var(--light-text); }
                .date-range-message-container h3 { margin-top: 1rem; margin-bottom: 0.5rem; color: var(--dark-text); }
                .date-range-message-container p { margin: 0; max-width: 400px; margin-left: auto; margin-right: auto; }
            `}</style>
            <div className="card fade-in-up">
                <div className="history-header">
                    <h3>Attendance History</h3>
                    <div className="header-actions">
                        <div className="date-filters">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            <button className="download-btn" onClick={handleDownload}><DownloadIcon /> Download</button>
                        </div>
                        <button className="checkin-btn" onClick={handleCheckIn} disabled={isCheckedInToday}>
                            <CheckInIcon />
                            {isCheckedInToday ? 'Checked-in' : 'Check-in'}
                        </button>
                    </div>
                </div>

                {message.text && <div className={`status-message ${message.type}`}>{message.text}</div>}
                
                <div className="table-wrapper">
                     {isLoading ? <p>Loading history...</p> : 
                        dateRangeMessage ? <DateRangeMessageComponent message={dateRangeMessage} /> : (
                        <table className="attendance-table">
                            <thead>
                                <tr><th>Request ID</th><th>Date</th><th>Type</th><th>Reason</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(item => (
                                    <tr key={item._id}>
                                        <td>{item._id.slice(-6).toUpperCase()}</td>
                                        <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                        <td>{item.type}</td>
                                        <td>{item.reason}</td>
                                        <td>{getStatusChip(item.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     )}
                </div>
            </div>
        </div>
    );
};
export default AttendancePage;

