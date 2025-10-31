import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const CheckInIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


const AttendancePage = () => {
    const [history, setHistory] = useState([]);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [summaryStartDate, setSummaryStartDate] = useState('');
    const [summaryEndDate, setSummaryEndDate] = useState('');
    const [dateRangeMessage, setDateRangeMessage] = useState('');
    const [userLoginDate, setUserLoginDate] = useState(null);
    const [timeSettings, setTimeSettings] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [isOnApprovedLeave, setIsOnApprovedLeave] = useState(false);

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        if (!token) {
            console.error("Authentication error: No token found.");
            // Optionally show a persistent error message or redirect to login
            showMessage("Authentication error. Please log in again.", 'error');
            return null;
        }
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        // Auto-hide message after 5 seconds (adjust as needed)
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };


    const fetchHistoryAndSettings = async () => {
        const config = getAuthConfig();
        if (!config) { setIsLoading(false); return; }

        try {
            const [historyRes, settingsRes] = await Promise.all([
                axios.get('/api/attendance/history', config),
                axios.get('/api/settings/times', config)
            ]);

            const historyData = historyRes.data;
            setHistory(historyData);
            setTimeSettings(settingsRes.data.value);

            const today = new Date();
            today.setHours(0,0,0,0);

            const todayRecord = historyData.find(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0,0,0,0);
                return itemDate.getTime() === today.getTime();
            });

            const hasSubmittedRequest = todayRecord && todayRecord.status !== 'Declined';
            setIsCheckedInToday(hasSubmittedRequest);

            const approvedLeaveToday = historyData.some(item => {
                if (item.type === 'Leave' && item.status === 'Approved') {
                    const leaveStart = new Date(item.date);
                    const leaveEnd = new Date(item.leaveEndDate);
                    leaveStart.setHours(0,0,0,0);
                    leaveEnd.setHours(23,59,59,999); // Check until end of leave day
                    return today >= leaveStart && today <= leaveEnd;
                }
                return false;
            });
            setIsOnApprovedLeave(approvedLeaveToday);


            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.createdAt) {
                const loginDate = new Date(user.createdAt);
                loginDate.setHours(0, 0, 0, 0);
                setUserLoginDate(loginDate);
            }

        } catch (error) {
            console.error("Failed to fetch initial data", error);
            setMessage({ text: 'Could not load data. Please check your connection.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryAndSettings();
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!timeSettings) return;
        const { startTime, lateTime } = timeSettings; // Use lateTime as the absolute end
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [lateHour, lateMinute] = lateTime.split(':').map(Number);
        const now = currentTime;
        const start = new Date(now);
        start.setHours(startHour, startMinute, 0, 0);
        const late = new Date(now);
        late.setHours(lateHour, lateMinute, 59, 999); // Window closes at the end of late minute

        const isCurrentlyOpen = now >= start && now <= late;
        setIsWindowOpen(isCurrentlyOpen);

        let diff, hours, minutes, seconds, text;
        if (now < start) {
            diff = start - now;
            text = 'Window opens in: ';
        } else if (now >= start && now <= late) {
            diff = late - now;
            text = 'Window closes in: ';
        } else {
            setCountdown('Check-in window is closed for today.');
            return;
        }

        diff = Math.max(0, diff); // Ensure diff is not negative
        hours = Math.floor(diff / (1000 * 60 * 60));
        minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${text} ${hours}h ${minutes}m ${seconds}s`);

    }, [currentTime, timeSettings]);


    const handleCheckIn = async () => {
        try {
            const config = getAuthConfig();
            if(!config) return;
            await axios.post('/api/attendance/check-in', {}, config);
            showMessage('Your check-in request has been sent.', 'success');
            fetchHistoryAndSettings(); // Refresh data after successful check-in
        } catch (error) {
            const msg = error.response?.data?.message || 'Check-in failed. Please check your network.';
            showMessage(msg, 'error');
        }
    };

    const filteredHistory = useMemo(() => {
        setDateRangeMessage('');
        if (!startDate || !endDate) return history;
        const start = new Date(startDate); start.setHours(0,0,0,0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        const today = new Date(); today.setHours(23, 59, 59, 999);

        if (userLoginDate && start < userLoginDate) {
            setDateRangeMessage("You can't select a date before you joined.");
            return [];
        }
        if (start > today) {
            setDateRangeMessage("Start date cannot be in the future.");
            return [];
        }
        if (end < start) {
             setDateRangeMessage("End date cannot be before start date.");
             return [];
        }

        return history.filter(item => {
            const itemDate = new Date(item.date);
            // Adjust itemDate for comparison if it's a multi-day leave record start date
            const effectiveDate = item.type === 'Leave' ? new Date(item.date) : itemDate;
            effectiveDate.setHours(0,0,0,0); // Ensure comparison is date-only

            // Also check leave end date if applicable
            const leaveEndDate = item.type === 'Leave' && item.leaveEndDate ? new Date(item.leaveEndDate) : null;
            if (leaveEndDate) leaveEndDate.setHours(23,59,59,999);

            // Check if the record's date OR its leave range overlaps with the filter range
            const overlaps = (effectiveDate >= start && effectiveDate <= end) ||
                             (leaveEndDate && leaveEndDate >= start && effectiveDate <= end);

            return overlaps;
        });
    }, [history, startDate, endDate, userLoginDate]);


    const filteredSummaryHistory = useMemo(() => {
        if (!summaryStartDate || !summaryEndDate) return history;
        const start = new Date(summaryStartDate); start.setHours(0,0,0,0);
        const end = new Date(summaryEndDate); end.setHours(23, 59, 59, 999);
         if (end < start) {
             // Optionally show a message for summary range too
             return [];
         }
        return history.filter(item => {
             const itemDate = new Date(item.date);
             const effectiveDate = item.type === 'Leave' ? new Date(item.date) : itemDate;
             effectiveDate.setHours(0,0,0,0);
             const leaveEndDate = item.type === 'Leave' && item.leaveEndDate ? new Date(item.leaveEndDate) : null;
             if (leaveEndDate) leaveEndDate.setHours(23,59,59,999);

             const overlaps = (effectiveDate >= start && effectiveDate <= end) ||
                              (leaveEndDate && leaveEndDate >= start && effectiveDate <= end);
            return overlaps;
        });
    }, [history, summaryStartDate, summaryEndDate]);

    // --- ⭐⭐ PDF DOWNLOAD FIX START ⭐⭐ ---
    const checkPdfLibrary = () => {
        // Check if window.jspdf exists, then check if jsPDF constructor exists,
        // then check if autoTable function exists on the jsPDF prototype
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof window.jspdf.jsPDF.API.autoTable !== 'function') {
            console.error("jsPDF or jsPDF-AutoTable library is not loaded correctly.");
            showMessage("Could not generate PDF. Library missing or corrupted.", "error");
            return false;
        }
        return true;
    };

    const handleDownload = (type) => {
        if (!checkPdfLibrary()) return; // Check libraries first

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const user = JSON.parse(localStorage.getItem('user'));
        const dataToExport = type === 'summary' ? filteredSummaryHistory : filteredHistory;
        const title = type === 'summary' ? "Attendance Summary Report" : "Check-in History Report";
        const filename = type === 'summary' ? "attendance_summary.pdf" : "checkin_history.pdf";
        const dateFilterText = type === 'summary'
            ? (summaryStartDate && summaryEndDate ? `Period: ${summaryStartDate} to ${summaryEndDate}` : '')
            : (startDate && endDate ? `Period: ${startDate} to ${endDate}` : '');


        try { // Wrap PDF generation in try...catch
            doc.setFontSize(18);
            doc.text(title, 14, 22);
            doc.setFontSize(12);
            doc.text(`Student: ${user.name}`, 14, 32);
            if (dateFilterText) {
                doc.text(dateFilterText, 14, 42);
            }

            doc.autoTable({ // Use doc.autoTable directly
                startY: 50,
                head: [['Date', 'Type', 'Check-in Time', 'Status', 'Reason']],
                body: dataToExport.map(item => [
                    new Date(item.date).toLocaleDateString('en-GB'),
                    item.type,
                    item.type === 'Check-in' ? new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
                    item.status + (item.wasLate ? ' (Late)' : ''), // Combine status and late indication
                    item.reason
                ]),
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59] } // Dark blue header
            });
            doc.save(filename);
            showMessage("Report downloaded successfully!", "success");

        } catch (error) {
            console.error("PDF Generation Error:", error);
            showMessage("Failed to generate PDF content.", "error");
        }
    };
    // --- ⭐⭐ PDF DOWNLOAD FIX END ⭐⭐ ---


    const clearDateFilter = (type) => {
        if (type === 'checkin') {
            setStartDate('');
            setEndDate('');
        } else { // type === 'summary'
            setSummaryStartDate('');
            setSummaryEndDate('');
        }
    };

    const getStatusChip = (item) => {
        const { status, type, wasLate } = item; // Added wasLate
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '4px' };
        const lateIndicator = <span style={{ backgroundColor: '#DC2626', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>L</span>;


        if (type === 'Leave') {
            switch (status) {
                case 'Approved': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Approved</span>;
                case 'Declined': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Declined</span>;
                case 'Pending': return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>Pending</span>;
                default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
            }
        } else { // type === 'Check-in'
             switch (status) {
                // Show late indicator next to Present/Absent if wasLate is true
                case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Present {wasLate && lateIndicator}</span>;
                case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Absent {wasLate && lateIndicator}</span>;
                case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late</span>; // Keep Late status distinct if needed
                case 'Pending': return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>Pending</span>;
                default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
            }
        }
    };


    const DateRangeMessageComponent = ({ message }) => (
        <div className="date-range-message-container">
            <AlertTriangleIcon />
            <h3>Invalid Date Range</h3>
            <p>{message}</p>
        </div>
    );

    const NoResultsComponent = ({ message }) => (
        <div className="no-results-container">
            <NoResultsIcon />
            <h3>No Records Found</h3>
            <p>{message}</p>
        </div>
    );

    return (
        <div className="attendance-page">
            {/* Styles remain unchanged */}
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .card { background: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .card-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .card-header h3 { margin: 0; font-size: 1.5rem; }
                .header-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
                .checkin-container { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
                .countdown-timer { font-size: 0.8rem; color: var(--light-text); font-weight: 500; }
                .checkin-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem 1rem; background-color: var(--brand-blue); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .checkin-btn:hover { background-color: #003ECC; }
                .checkin-btn:disabled { background-color: #94A3B8; cursor: not-allowed; opacity: 0.7; }
                .status-message { margin-bottom: 1rem; padding: 0.75rem; border-radius: 0.5rem; font-weight: 500; text-align: center; }
                .status-message.success { background-color: #D1FAE5; color: #065F46; }
                .status-message.error { background-color: #FEE2E2; color: #991B1B; }
                .date-filters { display: flex; align-items: center; gap: 0.5rem; }
                .date-filters input { border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 0.5rem; }
                .clear-date-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; display: flex; align-items: center; justify-content: center; }
                .clear-date-btn:hover { color: var(--dark-text); }
                .download-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--white); font-weight: 600; cursor: pointer; }
                .table-wrapper { min-height: 150px; }
                .attendance-table { width: 100%; border-collapse: collapse; }
                .attendance-table th, .attendance-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .attendance-table thead { position: sticky; top: 0; background: #F8FAFC; z-index: 1; }
                .attendance-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .date-range-message-container, .no-results-container { text-align: center; padding: 3rem 1rem; border: 2px dashed var(--border-color); border-radius: 1rem; color: var(--light-text); }
                .date-range-message-container h3, .no-results-container h3 { margin-top: 1rem; margin-bottom: 0.5rem; color: var(--dark-text); }
                .date-range-message-container p, .no-results-container p { margin: 0; max-width: 400px; margin-left: auto; margin-right: auto; }
                .card-list-scrollable { /* Styles applied via responsive.css */ }
            `}</style>

            <div className="card fade-in-up">
                 <div className="card-header">
                    <h3>Check-in Requests</h3>
                    <div className="header-actions">
                        <div className="date-filters">
                            <CalendarIcon />
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                             {(startDate || endDate) && <button className="clear-date-btn" onClick={() => clearDateFilter('checkin')}><XIcon /></button>}
                        </div>
                        <div className="checkin-container">
                             <button className="checkin-btn" onClick={handleCheckIn} disabled={!isWindowOpen || isCheckedInToday || isOnApprovedLeave}>
                                <CheckInIcon />
                                {isCheckedInToday ? 'Submitted' : (isOnApprovedLeave ? 'On Leave' : 'Check-in')}
                            </button>
                            <span className="countdown-timer">
                                {isOnApprovedLeave ? "You are on approved leave today." : countdown}
                            </span>
                        </div>
                    </div>
                </div>

                {message.text && <div className={`status-message ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

                {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading history...</p> :
                    dateRangeMessage ? <DateRangeMessageComponent message={dateRangeMessage} /> : (
                        <div className="table-wrapper">
                            <div className="card-list-scrollable">
                                {filteredHistory.length > 0 ? (
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Request ID</th>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHistory.map(item => (
                                                <tr key={item._id}>
                                                    <td data-label="Request ID">{item._id.slice(-6).toUpperCase()}</td>
                                                    <td data-label="Date">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                                    <td data-label="Type">{item.type}</td>
                                                    <td data-label="Reason">{item.reason}</td>
                                                    <td data-label="Status">{getStatusChip(item)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <NoResultsComponent message="No check-in requests found for the selected period." />
                                )}
                            </div>
                        </div>
                     )
                }
            </div>

            <div className="card fade-in-up" style={{ marginTop: '2rem' }}>
                 <div className="card-header">
                     <h3>Your Attendance Summary</h3>
                     <div className="header-actions">
                        <div className="date-filters">
                            <CalendarIcon />
                            <input type="date" value={summaryStartDate} onChange={(e) => setSummaryStartDate(e.target.value)} />
                            <span>to</span>
                            <input type="date" value={summaryEndDate} onChange={(e) => setSummaryEndDate(e.target.value)} min={summaryStartDate} />
                             {(summaryStartDate || summaryEndDate) && <button className="clear-date-btn" onClick={() => clearDateFilter('summary')}><XIcon /></button>}
                        </div>
                        <button className="download-btn" onClick={() => handleDownload('summary')} disabled={filteredSummaryHistory.length === 0}>
                            <DownloadIcon /> Download Summary
                        </button>
                    </div>
                </div>
                <div className="table-wrapper">
                     <div className="card-list-scrollable">
                        {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading summary...</p> : filteredSummaryHistory.length > 0 ? (
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
                                    {filteredSummaryHistory.map(item => (
                                        <tr key={item._id}>
                                            <td data-label="Date">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                            <td data-label="Check-in Time">{item.type === 'Check-in' ? new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</td>
                                            <td data-label="Status">{getStatusChip(item)}</td>
                                            <td data-label="Reason">{item.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                           <NoResultsComponent message="You do not have any attendance records yet." />
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};
export default AttendancePage;
