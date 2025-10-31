import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import skeneticLogo from '../../assets/skenetic-logo.jpg'; // Assuming logo is needed for download?

// --- ICONS ---
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);


const LateAttendancePage = () => {
    const [lateHistory, setLateHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        if (!token) {
            console.error("Auth token not found.");
            showMessage('Authentication error. Please log in again.', 'error');
            return null;
        }
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const fetchLateHistory = async () => {
        const config = getAuthConfig();
        if (!config) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/attendance/late-history', config);
            setLateHistory(data);
        } catch (error) {
            console.error('Failed to fetch late attendance history', error);
            if (error.response && error.response.status === 404) {
                 showMessage('Could not find late history data on the server.', 'error');
            } else {
                showMessage('Could not load late history.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLateHistory();
    }, []);

    const filteredLateHistory = useMemo(() => {
        if (!startDate || !endDate) return lateHistory;
        const start = new Date(startDate); start.setHours(0,0,0,0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        // Basic date range validation
        if (end < start) {
            // Optionally show a message or handle invalid range
            return [];
        }
        return lateHistory.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });
    }, [lateHistory, startDate, endDate]);

    // --- ⭐⭐ PDF DOWNLOAD FIX START ⭐⭐ ---
    const checkPdfLibrary = () => {
        // Updated check for both jsPDF and autoTable
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof window.jspdf.jsPDF.API.autoTable !== 'function') {
            console.error("jsPDF or jsPDF-AutoTable library is not loaded correctly.");
            showMessage("Could not generate PDF. Library missing or corrupted.", "error");
            return false;
        }
        return true;
    };


    const handleDownload = () => {
        if (!checkPdfLibrary()) return; // Check libraries first

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const user = JSON.parse(localStorage.getItem('user'));

        try { // Wrap PDF generation in try...catch
            doc.setFontSize(18);
            doc.text("Late Attendance Report", 14, 22);
            doc.setFontSize(12);
            doc.text(`Student: ${user.name}`, 14, 32);
            if (startDate && endDate) {
                doc.text(`Period: ${startDate} to ${endDate}`, 14, 42);
            }

            doc.autoTable({ // Use doc.autoTable directly
                startY: 50,
                head: [['Date', 'Check-in Time', 'Status', 'Reason']],
                body: filteredLateHistory.map(item => [
                    new Date(item.date).toLocaleDateString('en-GB'),
                    new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    item.status,
                    item.reason
                ]),
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59] } // Dark blue header
            });
            doc.save('late_attendance_report.pdf');
            showMessage("Report downloaded successfully!", 'success');
        } catch(error) {
             console.error("PDF Generation Error:", error);
             showMessage("Failed to generate PDF content.", "error");
        }
    };
    // --- ⭐⭐ PDF DOWNLOAD FIX END ⭐⭐ ---


    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center' };
        // Late history page typically shows records AFTER admin action (Present/Absent)
        // Adjust based on your backend logic for the /late-history endpoint
        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Present (Late)</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Absent (Late)</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late (Pending)</span>; // If pending late requests are included
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
        }
    };


    const NoResultsComponent = ({ message }) => (
       <div className="no-results-container">
           <NoResultsIcon/>
           <h3>No Records Found</h3>
           <p>{message}</p>
       </div>
   );

    return (
        <div>
            {/* Styles remain unchanged */}
            <style>{`
                .card { background: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .card-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .card-header h3 { margin: 0; font-size: 1.5rem; }
                .header-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
                .date-filters { display: flex; align-items: center; gap: 0.5rem; }
                .date-filters input { border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 0.5rem; }
                .download-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--white); font-weight: 600; cursor: pointer; }
                .clear-date-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; }
                .table-wrapper { min-height: 200px; }
                .attendance-table { width: 100%; border-collapse: collapse; }
                .attendance-table th, .attendance-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .attendance-table thead { position: sticky; top: 0; background: #F8FAFC; z-index: 1; }
                .attendance-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .no-results-container { text-align: center; padding: 3rem 1rem; color: var(--light-text); }
                .message-box { padding: 1rem 1.5rem; border-radius: 0.75rem; text-align: center; font-weight: 600; animation: fadeIn 0.3s; position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.75rem; }
                .error-message-box { background-color: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
                .success-message-box { background-color: #F0FDF4; color: #16A34A; border: 1px solid #86EFAC; }
                .info-message-box { background-color: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .card-list-scrollable { /* Styles applied via responsive.css */ }
            `}</style>

            {message.text && (
                 <div className={`message-box ${message.type}-message-box`}>
                     {message.type === 'error' && <AlertTriangleIcon />}
                     <span>{message.text}</span>
                 </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3>Your Late Attendance History</h3>
                    <div className="header-actions">
                        <div className="date-filters">
                            <CalendarIcon />
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                             {(startDate || endDate) && <button className="clear-date-btn" onClick={() => { setStartDate(''); setEndDate(''); }}><XIcon /></button>}
                        </div>
                        <button className="download-btn" onClick={handleDownload} disabled={filteredLateHistory.length === 0}><DownloadIcon /> Download PDF</button>
                    </div>
                </div>

                <div className="table-wrapper">
                     <div className="card-list-scrollable">
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
                                            <td data-label="Date">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                            <td data-label="Check-in Time">{new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td data-label="Status">{getStatusChip(item.status)}</td>
                                            <td data-label="Reason">{item.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                           message.type === 'error' ?
                           <NoResultsComponent message="Could not load data. Please check connection or contact admin." /> :
                           <NoResultsComponent message="Great! You have no late attendance records." />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LateAttendancePage;
