import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const FilterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);


const AdminSettingsPage = () => {
    const [timeSettings, setTimeSettings] = useState({ startTime: '18:00', endTime: '18:30', lateTime: '18:45' });
    const [allStudents, setAllStudents] = useState([]);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [domainFilter, setDomainFilter] = useState('All');

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const config = getAuthConfig();
                const [studentsRes, settingsRes] = await Promise.all([
                    axios.get('/api/users/students', config),
                    axios.get('/api/settings', config)
                ]);
                setAllStudents(studentsRes.data);
                if (settingsRes.data) {
                    setTimeSettings({
                        startTime: settingsRes.data.value.startTime || '18:00',
                        endTime: settingsRes.data.value.endTime || '18:30',
                        lateTime: settingsRes.data.value.lateTime || '18:45'
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings data", error);
                setMessage({ text: 'Could not load data.', type: 'error' });
            }
        };
        fetchAllData();
    }, []);
    
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleSaveTime = async (e) => {
        e.preventDefault();
        if (isLateTimeInvalid) {
            showMessage('Late check-in time must be after the check-in window ends.', 'error');
            return;
        }
        try {
            await axios.put('/api/settings', { value: timeSettings }, getAuthConfig());
            showMessage('Attendance time settings saved successfully!', 'success');
        } catch (error) {
            showMessage('Failed to save time settings.', 'error');
        }
    };

    const handleStudentStatusChange = async (studentId, currentStatus) => {
        try {
            await axios.put(`/api/users/students/${studentId}/status`, { isActive: !currentStatus }, getAuthConfig());
            setAllStudents(allStudents.map(s => s._id === studentId ? { ...s, isActive: !currentStatus } : s));
            showMessage('Student status updated.', 'success');
        } catch (error) {
            showMessage('Failed to update student status.', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return showMessage("New passwords do not match.", 'error');
        }
        if (passwordData.newPassword.length < 8) {
             return showMessage("Password must be at least 8 characters.", 'error');
        }
        try {
            await axios.put('/api/users/admin/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            }, getAuthConfig());
            showMessage('Password changed successfully!', 'success');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to change password.', 'error');
        }
    };
    
    const uniqueDomains = useMemo(() => {
        const domains = new Set(allStudents.map(student => student.domain).filter(Boolean));
        return ['All', ...domains];
    }, [allStudents]);

    const filteredStudents = useMemo(() => {
        return allStudents.filter(student => {
            const matchesDomain = domainFilter === 'All' || student.domain === domainFilter;
            const matchesSearch = searchTerm === '' || student.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesDomain && matchesSearch;
        });
    }, [allStudents, searchTerm, domainFilter]);

    const isLateTimeInvalid = useMemo(() => {
        if (!timeSettings.endTime || !timeSettings.lateTime) return false;
        return timeSettings.lateTime <= timeSettings.endTime;
    }, [timeSettings.endTime, timeSettings.lateTime]);


    return (
        <div>
            <style>{`
                /* --- UI CORRECTION STARTS HERE --- */
                .settings-grid { 
                    display: grid; 
                    grid-template-columns: 1fr; /* Mobile-la default-ah oru column */
                    gap: 2rem; 
                }
                @media (min-width: 992px) {
                    .settings-grid {
                        grid-template-columns: repeat(2, 1fr); /* Periya screen-la correct-ah rendu column */
                    }
                }
                /* --- UI CORRECTION ENDS HERE --- */

                .settings-card { background-color: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem; }
                .card-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
                .card-header-title { display: flex; align-items: center; gap: 1rem; }
                .card-header .icon { color: var(--brand-blue); }
                .card-header h3 { margin: 0; font-size: 1.25rem; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .input-field { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; box-sizing: border-box; font-size: 1rem; }
                .time-inputs { display: flex; align-items: center; gap: 1rem; }
                .save-btn { display: inline-flex; align-items: center; gap: 0.5rem; background-color: var(--brand-blue); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
                .save-btn:hover { background-color: #003ECC; }
                .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; animation: fadeIn 0.3s; }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .student-table-container { max-height: 400px; overflow-y: auto; }
                .student-table { width: 100%; border-collapse: collapse; }
                .student-table th, .student-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .student-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .student-table thead { position: sticky; top: 0; background: white; z-index: 1; }
                
                .table-filters { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
                .search-bar { position: relative; width: 100%; max-width: 320px; }
                .search-bar input { width: 100%; height: 44px; padding-left: 40px; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.9rem; }
                .search-bar svg { position: absolute; left: 12px; top: 12px; color: var(--light-text); }
                .filter-select { height: 44px; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0 0.75rem; background: var(--white); font-size: 0.9rem; }

                .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
                .toggle-switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: #22C55E; }
                input:focus + .slider { box-shadow: 0 0 1px #22C55E; }
                input:checked + .slider:before { transform: translateX(22px); }

                .validation-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #F59E0B;
                    font-size: 0.8rem;
                    margin-top: 0.5rem;
                }
            `}</style>
            
            {message.text && <div className={`message-box ${message.type === 'error' ? 'error-message-box' : 'success-message-box'}`}>{message.text}</div>}
            
            <div className="settings-grid">
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-header-title">
                           <span className="icon"><ClockIcon /></span>
                           <h3>Attendance Time Settings</h3>
                        </div>
                    </div>
                    <form onSubmit={handleSaveTime}>
                        <div className="form-group">
                            <label>Check-in Window</label>
                            <div className="time-inputs">
                                <input type="time" className="input-field" value={timeSettings.startTime} onChange={e => setTimeSettings({...timeSettings, startTime: e.target.value})} />
                                <span>–</span>
                                <input type="time" className="input-field" value={timeSettings.endTime} onChange={e => setTimeSettings({...timeSettings, endTime: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Late Check-in (Max Time)</label>
                            <div className="time-inputs">
                                <input type="time" className="input-field" value={timeSettings.lateTime} onChange={e => setTimeSettings({...timeSettings, lateTime: e.target.value})} />
                            </div>
                            {isLateTimeInvalid && (
                                <div className="validation-message">
                                    <AlertTriangleIcon />
                                    <span>Late time must be after check-in ends.</span>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="save-btn"><SaveIcon /> Save Time</button>
                    </form>
                </div>

                <div className="settings-card">
                    <div className="card-header">
                         <div className="card-header-title">
                            <span className="icon"><LockIcon /></span>
                            <h3>Admin Profile Settings</h3>
                        </div>
                    </div>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>Old Password</label>
                            <input type="password" placeholder="Enter your current password" className="input-field" value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" placeholder="Enter new password (min. 8 characters)" className="input-field" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="Confirm your new password" className="input-field" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                        </div>
                        <button type="submit" className="save-btn"><SaveIcon /> Change Password</button>
                    </form>
                </div>

                <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                         <div className="card-header-title">
                            <span className="icon"><UsersIcon /></span>
                            <h3>Student Management</h3>
                        </div>
                    </div>
                    
                    <div className="table-filters">
                        <div className="search-bar">
                            <SearchIcon />
                            <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="filter-select" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
                            {uniqueDomains.map(domain => <option key={domain} value={domain}>{domain === 'All' ? 'All Domains' : domain}</option>)}
                        </select>
                    </div>

                    <div className="student-table-container">
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Domain</th>
                                    <th>Action (Active / De-active)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student._id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.phone || 'N/A'}</td>
                                        <td>{student.domain || 'N/A'}</td>
                                        <td>
                                            <label className="toggle-switch">
                                                <input type="checkbox" checked={student.isActive} onChange={() => handleStudentStatusChange(student._id, student.isActive)} />
                                                <span className="slider"></span>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
