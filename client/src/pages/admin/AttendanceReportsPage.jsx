import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const FilterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>);
const NoResultsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const CheckSquareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


const LeaveDetailsModal = ({ student, onClose }) => {
    if (!student) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{student.studentName}'s Leave Details</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <table className="leave-details-table">
                        <thead><tr><th>Date</th><th>Reason</th><th>Status</th></tr></thead>
                        <tbody>
                            {student.leaveDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td>{new Date(detail.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</td>
                                    <td>{detail.reason || '-'}</td>
                                    <td>{detail.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ count, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" style={{ maxWidth: '480px', padding: '2.5rem' }} onClick={(e) => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#FEE2E2', borderRadius: '50%', padding: '1rem' }}><AlertTriangleIcon /></div>
            </div>
            <h2 className="modal-title" style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Delete {count} Record{count > 1 && 's'}?</h2>
            <p style={{ textAlign: 'center', color: 'var(--light-text)', marginBottom: '2.5rem', maxWidth: '350px', margin: '0 auto 2.5rem' }}>
                Are you sure? This action cannot be undone.
            </p>
            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: 0, borderTop: 'none' }}>
                <button className="action-btn" style={{backgroundColor: '#F1F5F9', color: 'var(--dark-text)'}} onClick={onCancel}>Cancel</button>
                <button className="action-btn delete-btn" onClick={onConfirm}>Yes, Delete</button>
            </div>
        </div>
    </div>
);


const AttendanceReportsPage = () => {
    const [allReports, setAllReports] = useState([]);
    const [leaveSummary, setLeaveSummary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [statusFilter, setStatusFilter] = useState('All');
    const [domainFilter, setDomainFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [leaveSearchQuery, setLeaveSearchQuery] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [isSelectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [isLeaveSelectMode, setLeaveSelectMode] = useState(false);
    const [selectedLeaveIds, setSelectedLeaveIds] = useState([]);


    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const fetchReports = async () => {
         try {
            const { data } = await axios.get('/api/attendance/reports', getAuthConfig());
            setAllReports(data);
         } catch (error) {
            console.error("Failed to fetch reports", error);
         }
    };

    const fetchLeaveSummary = async () => {
        try {
            const params = new URLSearchParams();
            if (leaveStartDate) params.append('startDate', leaveStartDate);
            if (leaveEndDate) params.append('endDate', leaveEndDate);

            const { data } = await axios.get(`/api/attendance/leave-summary?${params.toString()}`, getAuthConfig());
            setLeaveSummary(data);
        } catch (error) {
            console.error("Failed to fetch leave summary", error);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            await Promise.all([fetchReports(), fetchLeaveSummary()]);
            setIsLoading(false);
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            fetchLeaveSummary();
        }
    }, [leaveStartDate, leaveEndDate]);


    const uniqueDomains = useMemo(() => {
        const domains = new Set(allReports.map(report => report.domain));
        return ['All', ...domains];
    }, [allReports]);

    const filteredReports = useMemo(() => {
        let reports = [...allReports];

        // --- CORRECTION 1: Hiding Approved/Declined by default ---
        // 'All' nu filter irundha, 'Approved' and 'Declined' status ah kaatama hide panrom
        if (statusFilter === 'All') {
            reports = reports.filter(report => report.status !== 'Approved' && report.status !== 'Declined');
        } 
        else if (statusFilter === 'Late') { 
            reports = reports.filter(report => report.wasLate === true); 
        } 
        else if (statusFilter !== 'All') { 
            reports = reports.filter(report => report.status === statusFilter); 
        }

        if (domainFilter !== 'All') { reports = reports.filter(report => report.domain === domainFilter); }
        if (searchQuery) { reports = reports.filter(report => report.name.toLowerCase().includes(searchQuery.toLowerCase())); }
        if (startDate && endDate) {
            const start = new Date(startDate); start.setHours(0, 0, 0, 0);
            const end = new Date(endDate); end.setHours(23, 59, 59, 999);
            reports = reports.filter(report => { const reportDate = new Date(report.date); return reportDate >= start && reportDate <= end; });
        }
        return reports;
    }, [allReports, statusFilter, startDate, endDate, domainFilter, searchQuery]);
    
    const filteredLeaveSummary = useMemo(() => {
        if (!leaveSearchQuery) return leaveSummary;
        return leaveSummary.filter(summary => 
            summary.studentName.toLowerCase().includes(leaveSearchQuery.toLowerCase())
        );
    }, [leaveSummary, leaveSearchQuery]);

    
    const handleDownload = (type) => {
        if (!window.jspdf) { return alert("PDF library is not loaded."); }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        // This is a placeholder for a logo, replace with your actual logo if available
        // const skeneticLogo = "https://i.imgur.com/832g9eJ.jpg";
        
        if (type === 'reports') {
            doc.setFontSize(20); doc.text("Attendance Report", 14, 22);
            doc.setFontSize(10); doc.setTextColor(100);
            doc.text(`Filters: Status - ${statusFilter}, Domain - ${domainFilter}`, 14, 30);
            // doc.addImage(skeneticLogo, 'JPG', 160, 8, 35, 30);
            doc.autoTable({
                startY: 40,
                head: [['Student Name', 'Domain', 'Dates', 'Status', 'Reason']],
                body: filteredReports.map(item => {
                    const dateText = item.type === 'Leave' ? 
                        `${new Date(item.date).toLocaleDateString('en-GB')} - ${new Date(item.leaveEndDate).toLocaleDateString('en-GB')}` :
                        new Date(item.date).toLocaleDateString('en-GB');
                    return [ 
                        item.name, 
                        item.domain, 
                        dateText,
                        `${item.status} ${item.wasLate ? '(L)' : ''}`, 
                        item.reason 
                    ];
                }),
                theme: 'striped', headStyles: { fillColor: [30, 41, 59] }
            });
            doc.save('attendance_report.pdf');
        } else {
             doc.setFontSize(20); doc.text("Student Leave Summary Report", 14, 22);
            // doc.addImage(skeneticLogo, 'JPG', 160, 8, 35, 30);
             doc.autoTable({
                startY: 40,
                head: [['Student Name', 'Domain', 'No. of Days (Absent/Late)']],
                body: filteredLeaveSummary.map(item => [ item.studentName, item.domain, item.noOfDaysLeave ]),
                theme: 'striped', headStyles: { fillColor: [30, 41, 59] }
            });
            doc.save('leave_summary_report.pdf');
        }
    };

    const getStatusChip = (report) => {
        const { status, wasLate, type } = report;
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' };
        const lateIndicator = <span style={{ backgroundColor: '#DC2626', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>L</span>;
        
        if (type === 'Leave') {
             switch (status) {
                case 'Approved': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Approved</span>;
                case 'Declined': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Declined</span>;
                default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
            }
        }

        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Present {wasLate && lateIndicator}</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Absent {wasLate && lateIndicator}</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#374151' }}>{status}</span>;
        }
    };

    const openDetailsModal = (student) => { setSelectedStudent(student); setIsModalOpen(true); };

    const openDeleteModal = (record, type) => {
        if (type === 'leave') {
            const allLeaveRecordIds = selectedLeaveIds.flatMap(studentId => {
                const student = leaveSummary.find(s => s.studentId === studentId);
                return student ? student.leaveDetails.map(d => d._id) : [];
            });
             setRecordToDelete({ ids: allLeaveRecordIds, type: 'leave' });
        } else {
             setRecordToDelete({ record, type: 'report' });
        }
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setRecordToDelete(null);
        setSelectedIds([]);
        setSelectedLeaveIds([]);
        setDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        let idsToDelete = [];
        if (recordToDelete?.type === 'report') {
            idsToDelete = [recordToDelete.record._id];
        } else if (recordToDelete?.type === 'leave') {
            idsToDelete = recordToDelete.ids;
        } else if (isSelectMode && selectedIds.length > 0) {
            idsToDelete = selectedIds;
        } else if (isLeaveSelectMode && selectedLeaveIds.length > 0) {
             idsToDelete = selectedLeaveIds.flatMap(studentId => {
                const student = leaveSummary.find(s => s.studentId === studentId);
                return student ? student.leaveDetails.map(d => d._id) : [];
            });
        }
        
        if (idsToDelete.length === 0) {
            closeDeleteModal();
            return;
        }

        try {
            await axios.post('/api/attendance/reports/bulk-delete', { ids: idsToDelete }, getAuthConfig());
            await Promise.all([fetchReports(), fetchLeaveSummary()]);
            showMessage(`${idsToDelete.length} record(s) deleted!`, 'success');
        } catch (error) {
            console.error("Failed to delete", error);
            showMessage('Failed to delete records.', 'error');
        } finally {
            closeDeleteModal();
            setSelectMode(false);
            setLeaveSelectMode(false);
        }
    };
    
    const toggleSelectMode = () => { setSelectMode(!isSelectMode); setSelectedIds([]); };
    const handleSelectOne = (id) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]); };
    const handleSelectAll = () => {
        if (selectedIds.length === filteredReports.length) { setSelectedIds([]); } 
        else { setSelectedIds(filteredReports.map(r => r._id)); }
    };
    const openBulkDeleteModal = () => {
        if(selectedIds.length === 0) return;
        setRecordToDelete(null);
        setDeleteModalOpen(true);
    };

    const toggleLeaveSelectMode = () => { setLeaveSelectMode(!isLeaveSelectMode); setSelectedLeaveIds([]); };
    const handleLeaveSelectOne = (id) => { setSelectedLeaveIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]); };
    const handleLeaveSelectAll = () => {
        if (selectedLeaveIds.length === filteredLeaveSummary.length) { setSelectedLeaveIds([]); } 
        else { setSelectedLeaveIds(filteredLeaveSummary.map(r => r.studentId)); }
    };
    const openLeaveBulkDeleteModal = () => {
        if(selectedLeaveIds.length === 0) return;
        setRecordToDelete(null);
        setDeleteModalOpen(true);
    };

    const clearDateFilter = (type) => {
        if (type === 'reports') { setStartDate(''); setEndDate(''); } 
        else { setLeaveStartDate(''); setLeaveEndDate(''); }
    };

    return (
        <div>
            {isModalOpen && <LeaveDetailsModal student={selectedStudent} onClose={() => setIsModalOpen(false)} />}
            {isDeleteModalOpen && <DeleteConfirmationModal count={recordToDelete?.record ? 1 : (recordToDelete?.ids?.length || selectedIds.length || selectedLeaveIds.length) } onConfirm={confirmDelete} onCancel={closeDeleteModal} />}
            <style>{`
                /* General Styles */
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; margin-top: 2.5rem; padding-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; }
                
                /* Header Styles */
                .reports-header { background: var(--white); padding: 1.25rem 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; margin-bottom: 1rem; }
                .filter-group { display: flex; align-items: center; gap: 0.5rem; }
                .filter-select, .search-bar input, .date-input { border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.75rem; background: #F8FAFC; font-size: 0.9rem; font-family: 'Inter', sans-serif; }
                .search-bar { position: relative; }
                .search-bar input { padding-left: 35px; }
                .search-bar svg { position: absolute; left: 10px; top: 13px; color: var(--light-text); }
                .header-actions { margin-left: auto; display: flex; align-items: center; gap: 1rem; }
                .action-btn { border: none; padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; width: auto; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; white-space: nowrap; }
                .download-btn { background-color: var(--brand-blue); color: white; }
                .download-btn:hover { background-color: #003ECC; }
                .select-btn { background-color: #F1F5F9; color: var(--dark-text); }
                .select-btn.active { background-color: #E2E8F0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
                .delete-btn { background-color: #EF4444; color: var(--white); }
                .delete-btn:hover { background-color: #B91C1C; }
                .delete-btn:disabled { background-color: #F87171; cursor: not-allowed; }
                .clear-date-btn { background: none; border: none; cursor: pointer; color: var(--light-text); padding: 0.5rem; display: flex; align-items: center; justify-content: center; }
                .clear-date-btn:hover { color: var(--dark-text); }

                .summary-header-wrapper { 
                    border-bottom: 2px solid var(--border-color); 
                    padding-bottom: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                 .summary-header .filter-group {
                    padding: 0.5rem;
                    background-color: #F8FAFC;
                    border: 1px solid var(--border-color);
                    border-radius: 0.75rem;
                }
                .summary-header .date-input, .summary-header .search-bar input {
                    background: transparent;
                    border: none;
                    padding: 0.5rem;
                }
                 .summary-header .search-bar input:focus-within {
                    outline: none;
                    box-shadow: none;
                }
                .summary-header .header-actions {
                    margin-left: 0;
                }

                /* Table Styles */
                .reports-table { width: 100%; border-collapse: collapse; }
                .reports-table th, .reports-table td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
                .reports-table thead { background-color: #F8FAFC; }
                .reports-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .custom-checkbox { width: 18px; height: 18px; accent-color: var(--brand-blue); }

                /* Other Component Styles */
                .no-results-container { text-align: center; padding: 4rem 2rem; color: var(--light-text); }
                .no-results-container svg { margin-bottom: 1rem; }
                .no-results-container h3 { font-size: 1.25rem; color: var(--dark-text); margin: 0 0 0.5rem 0; }
                .view-btn { background: none; border: 1px solid var(--border-color); color: var(--dark-text); padding: 5px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
                .view-btn:hover { background-color: #F8FAFC; }
                .action-icon-btn { background: none; border: none; cursor: pointer; color: var(--light-text); transition: color 0.2s ease; padding: 0.25rem; }
                .action-icon-btn:hover { color: #EF4444; }
                .message-box { padding: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 500; animation: fadeIn 0.3s; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
                .modal-content { background: var(--white); padding: 0; border-radius: 1rem; width: 90%; max-width: 600px; position: relative; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); overflow: hidden; }
                .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
                .modal-title { margin: 0; font-size: 1.25rem; }
                .modal-close-btn { background: none; border: none; font-size: 1.75rem; cursor: pointer; color: var(--light-text); }
                .modal-body { padding: 0; max-height: 60vh; overflow-y: auto; }
                .leave-details-table { width: 100%; border-collapse: collapse; }
                .leave-details-table th, .leave-details-table td { text-align: left; padding: 1rem 2rem; border-bottom: 1px solid var(--border-color); }
                .leave-details-table th { background-color: #F8FAFC; color: var(--light-text); font-size: 0.8rem; text-transform: uppercase; }
            `}</style>
            
            {message.text && <div className={`message-box ${message.type === 'error' ? 'error-message-box' : 'success-message-box'}`}>{message.text}</div>}

            <div className="section-title">
                <h2>Attendance Reports</h2>
                <div className="header-actions">
                    <button className={`action-btn select-btn ${isSelectMode ? 'active' : ''}`} onClick={toggleSelectMode}><CheckSquareIcon/> Select</button>
                    {isSelectMode && (<button className="action-btn delete-btn" onClick={openBulkDeleteModal} disabled={selectedIds.length === 0}><DeleteIcon/> Delete ({selectedIds.length})</button>)}
                    <button className="action-btn download-btn" onClick={() => handleDownload('reports')}><DownloadIcon /> Download PDF</button>
                </div>
            </div>
            
            <div className="reports-header fade-in-up">
                <div className="filter-group"><FilterIcon />
                     {/* --- Filter options updated to include Leave statuses --- */}
                    <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Approved">Approved (Leave)</option>
                        <option value="Declined">Declined (Leave)</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select className="filter-select" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
                        {uniqueDomains.map(domain => <option key={domain} value={domain}>{domain === 'All' ? 'All Domains' : domain}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <CalendarIcon/>
                    <input type="date" className="date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>-</span>
                    <input type="date" className="date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    {(startDate || endDate) && <button className="clear-date-btn" onClick={() => clearDateFilter('reports')}><XIcon /></button>}
                </div>
                <div className="filter-group search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search by student name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>
            
            <div className="card fade-in-up" style={{ padding: 0, animationDelay: '100ms' }}>
                 {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</p> : filteredReports.length > 0 ? (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                {isSelectMode && <th><input type="checkbox" className="custom-checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredReports.length && filteredReports.length > 0} /></th>}
                                <th>Student Name</th><th>Domain</th><th>Dates</th><th>Status</th><th>Reason</th>
                                {!isSelectMode && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report._id}>
                                    {isSelectMode && <td><input type="checkbox" className="custom-checkbox" checked={selectedIds.includes(report._id)} onChange={() => handleSelectOne(report._id)} /></td>}
                                    <td>{report.name}</td><td>{report.domain}</td>
                                    <td>
                                        {report.type === 'Leave' ? 
                                            `${new Date(report.date).toLocaleDateString('en-GB')} - ${new Date(report.leaveEndDate).toLocaleDateString('en-GB')}` :
                                            new Date(report.date).toLocaleDateString('en-GB')
                                        }
                                    </td>
                                    <td>{getStatusChip(report)}</td><td>{report.reason}</td>
                                    {!isSelectMode && <td><button className="action-icon-btn" title="Delete Record" onClick={() => openDeleteModal(report, 'report')}><DeleteIcon /></button></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : ( <div className="no-results-container"><NoResultsIcon /><h3>No Reports Found</h3><p>Try adjusting your filters to see more results.</p></div> )}
            </div>

            <div className="summary-header-wrapper fade-in-up" style={{animationDelay: '200ms', marginTop: '2.5rem'}}>
                <div className="summary-header">
                    <h2>Student Leave Summary</h2>
                    <div className="header-actions">
                        <button className={`action-btn select-btn ${isLeaveSelectMode ? 'active' : ''}`} onClick={toggleLeaveSelectMode}><CheckSquareIcon/> Select</button>
                        {isLeaveSelectMode && (<button className="action-btn delete-btn" onClick={openLeaveBulkDeleteModal} disabled={selectedLeaveIds.length === 0}><DeleteIcon/> Delete ({selectedLeaveIds.length})</button>)}
                        <button className="action-btn download-btn" onClick={() => handleDownload('leave')}><DownloadIcon /> Download PDF</button>
                    </div>
                </div>
                 <div className="reports-header" style={{ marginTop: '1.5rem', marginBottom: 0, padding: '1rem' }}>
                    <div className="filter-group"> <CalendarIcon/>
                        <input type="date" className="date-input" value={leaveStartDate} onChange={e => setLeaveStartDate(e.target.value)} />
                        <span>-</span>
                        <input type="date" className="date-input" value={leaveEndDate} onChange={e => setLeaveEndDate(e.target.value)} />
                        {(leaveStartDate || leaveEndDate) && <button className="clear-date-btn" onClick={() => clearDateFilter('leave')}><XIcon /></button>}
                    </div>
                     <div className="filter-group search-bar" style={{ marginLeft: 'auto' }}> <SearchIcon />
                        <input type="text" placeholder="Search by student name..." value={leaveSearchQuery} onChange={e => setLeaveSearchQuery(e.target.value)} />
                    </div>
                </div>
            </div>
            
            <div className="card fade-in-up" style={{ padding: 0, animationDelay: '300ms' }}>
                 {isLoading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading summary...</p> : filteredLeaveSummary.length > 0 ? (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                {isLeaveSelectMode && <th><input type="checkbox" className="custom-checkbox" onChange={handleLeaveSelectAll} checked={selectedLeaveIds.length === filteredLeaveSummary.length && filteredLeaveSummary.length > 0} /></th>}
                                <th>Student Name</th><th>Domain</th><th>No. of Days (Absent/Late)</th><th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaveSummary.map(student => (
                                <tr key={student.studentId}>
                                    {isLeaveSelectMode && <td><input type="checkbox" className="custom-checkbox" checked={selectedLeaveIds.includes(student.studentId)} onChange={() => handleLeaveSelectOne(student.studentId)} /></td>}
                                    <td>{student.studentName}</td><td>{student.domain}</td>
                                    <td>{student.noOfDaysLeave}</td>
                                    <td><button className="view-btn" onClick={() => openDetailsModal(student)}><EyeIcon /> View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : ( <div className="no-results-container"><NoResultsIcon /><h3>No Leave Data Found</h3><p>Try adjusting your date range or search term.</p></div> )}
            </div>
        </div>
    );
};
export default AttendanceReportsPage;
