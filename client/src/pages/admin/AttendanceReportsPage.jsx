import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import skeneticLogo from '../../assets/skenetic-logo.jpg';

// --- ICONS ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const FilterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);


const AttendanceReportsPage = () => {
    const [allReports, setAllReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('All');
    // --- FIX: Changed default date filter to 'All Time' ---
    const [dateFilter, setDateFilter] = useState('All Time');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReports = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/attendance/reports', config);
            setAllReports(data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        let reports = [...allReports];

        // 1. Filter by Status
        if (statusFilter !== 'All') {
            reports = reports.filter(report => report.status === statusFilter);
        }

        // 2. Filter by Search Query (Student Name)
        if (searchQuery) {
            reports = reports.filter(report =>
                report.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 3. Filter by Date Range
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
            case 'This Week':
                startDate.setDate(now.getDate() - now.getDay()); 
                break;
            case 'Last 15 Days':
                startDate.setDate(now.getDate() - 15);
                break;
            case 'This Month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default: // This includes 'All Time'
                break;
        }

        if (dateFilter !== 'All Time') {
             startDate.setHours(0, 0, 0, 0);
             reports = reports.filter(report => new Date(report.date) >= startDate);
        }
        
        return reports;
    }, [allReports, statusFilter, dateFilter, searchQuery]);
    
    const handleDownload = () => {
        if (!window.jspdf) { return alert("PDF library is not loaded."); }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Attendance Report", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Filters: Status - ${statusFilter}, Period - ${dateFilter}`, 14, 30);
        
        const img = new Image();
        img.src = skeneticLogo;
        doc.addImage(img, 'JPG', 160, 8, 35, 30);
        
        doc.autoTable({
            startY: 40,
            head: [['Student Name', 'Date', 'Status', 'Reason']],
            body: filteredReports.map(item => [
                item.name,
                new Date(item.date).toLocaleDateString('en-GB'),
                item.status,
                item.reason
            ]),
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] }
        });
        
        doc.save('attendance_report.pdf');
    };

    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem' };
        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Present</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Absent</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
        }
    };

    return (
        <div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                
                .reports-header {
                    background: var(--white);
                    padding: 1rem 1.5rem;
                    border-radius: 1rem;
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .filter-group { display: flex; align-items: center; gap: 0.5rem; }
                .filter-group label { font-weight: 500; font-size: 0.9rem; color: var(--light-text); }
                .filter-select, .search-bar input {
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    padding: 0.6rem;
                    background: #F8FAFC;
                    font-size: 0.9rem;
                }
                .search-bar { position: relative; }
                .search-bar input { padding-left: 35px; }
                .search-bar svg { position: absolute; left: 10px; top: 11px; color: var(--light-text); }
                .download-btn {
                    margin-left: auto; 
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.6rem 1rem; background-color: var(--brand-blue);
                    color: white; border: none; border-radius: 0.5rem;
                    font-weight: 600; cursor: pointer; transition: background-color 0.2s;
                }
                .download-btn:hover { background-color: #003ECC; }

                .reports-table { width: 100%; border-collapse: collapse; }
                .reports-table th, .reports-table td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .reports-table thead { background-color: #F8FAFC; }
                .reports-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }

                /* --- NEW: Styles for 'No Results' message --- */
                .no-results-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--light-text);
                }
                .no-results-container svg {
                    margin-bottom: 1rem;
                }
                .no-results-container h3 {
                    font-size: 1.25rem;
                    color: var(--dark-text);
                    margin: 0 0 0.5rem 0;
                }

            `}</style>
            
            <div className="reports-header fade-in-up">
                <div className="filter-group">
                    <FilterIcon />
                    <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                        {/* --- FIX: Added 'All Time' as the first option --- */}
                        <option>All Time</option>
                        <option>Last 15 Days</option>
                        <option>This Week</option>
                        <option>This Month</option>
                    </select>
                </div>
                <div className="filter-group search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search by student name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button className="download-btn" onClick={handleDownload}><DownloadIcon /> Download PDF</button>
            </div>
            
            <div className="card fade-in-up" style={{ padding: 0, animationDelay: '100ms' }}>
                 {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</p>
                 ) : filteredReports.length > 0 ? (
                    <table className="reports-table">
                        <thead>
                            <tr><th>Student Name</th><th>Date</th><th>Status</th><th>Reason</th></tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report._id}>
                                    <td>{report.name}</td>
                                    <td>{new Date(report.date).toLocaleDateString('en-GB')}</td>
                                    <td>{getStatusChip(report.status)}</td>
                                    <td>{report.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    // --- NEW: 'No Results' message ---
                    <div className="no-results-container">
                        <NoResultsIcon />
                        <h3>No Reports Found</h3>
                        <p>Try adjusting your filters to see more results.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};
export default AttendanceReportsPage;

