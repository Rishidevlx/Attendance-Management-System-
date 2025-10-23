import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
const CheckInIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const AttendanceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const LateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const LeaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>);
const ProfileIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

const StudentDashboardContent = ({ user, onNavigate }) => {
    const [history, setHistory] = useState([]);
    const [timeSettings, setTimeSettings] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [countdown, setCountdown] = useState('');
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [isOnApprovedLeave, setIsOnApprovedLeave] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [currentDate, setCurrentDate] = useState(new Date());

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchDashboardData = async () => {
        const config = getAuthConfig();
        if (!config) return;
        try {
            const [historyRes, settingsRes] = await Promise.all([
                axios.get('/api/attendance/history', config),
                axios.get('/api/settings/times', config)
            ]);
            const historyData = historyRes.data;
            setHistory(historyData);
            setTimeSettings(settingsRes.data.value);
            updateCheckInStatus(historyData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const updateCheckInStatus = (historyData) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRecord = historyData.find(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === today.getTime();
        });
        setIsCheckedInToday(todayRecord && todayRecord.status !== 'Declined');
        const approvedLeaveToday = historyData.some(item => {
            if (item.type === 'Leave' && item.status === 'Approved') {
                const leaveStart = new Date(item.date);
                const leaveEnd = new Date(item.leaveEndDate);
                leaveStart.setHours(0,0,0,0);
                leaveEnd.setHours(23,59,59,999);
                const now = new Date();
                return now >= leaveStart && now <= leaveEnd;
            }
            return false;
        });
        setIsOnApprovedLeave(approvedLeaveToday);
    };

    useEffect(() => {
        if (!timeSettings) return;
        const { startTime, lateTime } = timeSettings;
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [lateHour, lateMinute] = lateTime.split(':').map(Number);
        const now = currentTime;
        const start = new Date(now);
        start.setHours(startHour, startMinute, 0, 0);
        const late = new Date(now);
        late.setHours(lateHour, lateMinute, 59, 999);
        const isCurrentlyOpen = now >= start && now <= late;
        setIsWindowOpen(isCurrentlyOpen);

        let diff, hours, minutes, seconds, text;
        if (now < start) {
            diff = start - now;
            text = 'Opens in: ';
        } else if (now >= start && now <= late) {
            diff = late - now;
            text = 'Closes in: ';
        } else {
            setCountdown('Window is closed for today.');
            return;
        }
        hours = Math.floor(diff / (1000 * 60 * 60));
        minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${text} ${hours}h ${minutes}m ${seconds}s`);
    }, [currentTime, timeSettings]);
    
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleCheckIn = async () => {
        try {
            await axios.post('/api/attendance/check-in', {}, getAuthConfig());
            showMessage('Check-in request sent successfully!', 'success');
            fetchDashboardData();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Check-in failed.', 'error');
        }
    };
    
    const attendanceStats = useMemo(() => {
        return history.reduce((acc, record) => {
            if (record.type === 'Check-in') {
                if (record.wasLate) acc.late++;
                else if (record.status === 'Present') acc.present++;
                if (record.status === 'Absent') acc.absent++;
            } else if (record.type === 'Leave' && record.status === 'Approved') {
                acc.leave += record.leaveDuration;
            }
            return acc;
        }, { present: 0, absent: 0, late: 0, leave: 0 });
    }, [history]);
    
    const shortcutItems = [
        { name: 'Attendance', icon: <AttendanceIcon />, page: 'Attendance' },
        { name: 'Late History', icon: <LateIcon />, page: 'Late Attendance' },
        { name: 'Leave Request', icon: <LeaveIcon />, page: 'Leave Requests' },
        { name: 'My Profile', icon: <ProfileIcon />, page: 'Profile' },
        { name: 'Information', icon: <InfoIcon />, page: 'Information' },
        { name: 'Settings', icon: <SettingsIcon />, page: 'Settings' }
    ];

    // --- Calendar Logic ---
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const getDayStatus = (day) => {
        const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        dateToCheck.setHours(0,0,0,0);

        for (const record of history) {
            const recordDate = new Date(record.date);
            recordDate.setHours(0,0,0,0);
            
            if (record.type === 'Leave' && record.status === 'Approved') {
                 const leaveEndDate = new Date(record.leaveEndDate);
                 leaveEndDate.setHours(0,0,0,0);
                 if (dateToCheck >= recordDate && dateToCheck <= leaveEndDate) {
                     return 'leave-day';
                 }
            } else if (record.type === 'Check-in') {
                if (recordDate.getTime() === dateToCheck.getTime()) {
                    if (record.wasLate) return 'late-day';
                    if (record.status === 'Present') return 'present-day';
                    if (record.status === 'Absent') return 'absent-day';
                }
            }
        }
        return '';
    };

    const changeMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .welcome-banner { display: flex; justify-content: space-between; align-items: center; background: #0F172A; color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; }
                .welcome-text h1 { margin: 0; font-size: 2rem; }
                .welcome-text p { margin: 0.5rem 0 0; color: #94A3B8; }
                .profile-summary { display: flex; align-items: center; gap: 1rem; }
                .profile-summary img { width: 50px; height: 50px; border-radius: 50%; }
                .profile-info h3 { margin: 0; font-size: 1.1rem; }
                .profile-info p { margin: 0.25rem 0 0; font-size: 0.9rem; color: #94A3B8; }
                
                .quick-checkin-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
                .checkin-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; background-color: var(--brand-blue); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .checkin-btn:hover:not(:disabled) { background-color: #003ECC; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 82, 255, 0.2); }
                .checkin-btn.available-pulse { animation: pulse-border 2s infinite; }
                .checkin-btn:disabled { background-color: #94A3B8; cursor: not-allowed; }
                
                .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
                .shortcuts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
                .shortcut-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem 1rem; text-align: center; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
                .shortcut-card:hover { transform: translateY(-5px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-color: var(--brand-blue); color: var(--brand-blue); }
                .shortcut-card svg { color: var(--brand-blue); }

                .main-dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                @media (min-width: 1024px) { .main-dashboard-grid { grid-template-columns: 350px 1fr; } }
                
                .stats-container .card { 
                    display: flex; 
                    align-items: center; 
                    gap: 1.5rem; 
                    margin-bottom: 1.5rem; 
                    background: var(--white); 
                    border-left: 5px solid; 
                    border-radius: 1rem; 
                    padding: 1.5rem; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
                    transition: all 0.3s ease;
                }
                .stats-container .card:hover {
                    transform: translateX(5px);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.06);
                }
                .stats-container .card.present { border-color: #22C55E; }
                .stats-container .card.absent { border-color: #EF4444; }
                .stats-container .card.late { border-color: #FBBF24; }
                .stats-container .card.leave { border-color: #8B5CF6; }

                .stats-container .icon-wrapper { 
                    width: 50px; 
                    height: 50px; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background-color: #F8FAFC;
                }
                .stats-container .icon-wrapper.present { color: #22C55E; }
                .stats-container .icon-wrapper.absent { color: #EF4444; }
                .stats-container .icon-wrapper.late { color: #FBBF24; }
                .stats-container .icon-wrapper.leave { color: #8B5CF6; }

                .stats-container h4 { margin: 0; font-size: 1.5rem; font-weight: 700; }
                .stats-container p { margin: 0.25rem 0 0; color: var(--light-text); }
                
                .calendar-container { background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .calendar-header h3 { margin: 0; font-size: 1.25rem; }
                .calendar-nav button { background: none; border: 1px solid var(--border-color); border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
                .calendar-nav button:hover { background-color: #F8FAFC; border-color: var(--brand-blue); color: var(--brand-blue); }
                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; }
                .calendar-day-header { font-weight: 600; color: var(--light-text); font-size: 0.9rem; padding: 0.5rem 0; }
                .calendar-day { height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; }
                .calendar-day.present-day { background-color: #D1FAE5; color: #065F46; font-weight: bold; }
                .calendar-day.absent-day { background-color: #FEE2E2; color: #991B1B; font-weight: bold; }
                .calendar-day.late-day { background-color: #FEF3C7; color: #92400E; font-weight: bold; }
                .calendar-day.leave-day { background-color: #E9D5FF; color: #5B21B6; font-weight: bold; }

                .message-box { padding: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 500; animation: fadeIn 0.3s; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            {message.text && <div className={`message-box ${message.type === 'error' ? 'error-message-box' : 'success-message-box'}`}>{message.text}</div>}
            
            <div className="welcome-banner fade-in-up">
                <div className="welcome-text">
                    <h1>Welcome Back, {user.name.split(' ')[0]}!</h1>
                    <p>Ready to make today productive? Let's get started.</p>
                </div>
                <div className="profile-summary">
                    <img src={`https://placehold.co/80x80/E2E8F0/475569?text=${user.name.charAt(0)}`} alt="Profile"/>
                    <div className="profile-info">
                        <h3>{user.name}</h3>
                        <p>{user.domain || 'Intern'}</p>
                    </div>
                </div>
            </div>

            <div className="quick-checkin-card fade-in-up" style={{ animationDelay: '100ms' }}>
                <div>
                    <h4>Quick Check-in</h4>
                    <p style={{color: 'var(--light-text)', margin: 0, fontSize: '0.9rem'}}>
                        {isOnApprovedLeave ? "You are on approved leave today." : countdown}
                    </p>
                </div>
                <button 
                    className={`checkin-btn ${isWindowOpen && !isCheckedInToday && !isOnApprovedLeave ? 'available-pulse' : ''}`} 
                    onClick={handleCheckIn} 
                    disabled={!isWindowOpen || isCheckedInToday || isOnApprovedLeave}
                >
                    <CheckInIcon />
                    {isCheckedInToday ? 'Submitted Today' : (isOnApprovedLeave ? 'On Leave' : 'Mark My Attendance')}
                </button>
            </div>

            <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="section-title">Quick Actions</h3>
                <div className="shortcuts-grid">
                    {shortcutItems.map((item, index) => (
                        <div key={item.name} className="shortcut-card" onClick={() => onNavigate(item.page)} style={{animationDelay: `${index * 50}ms`}}>
                            {item.icon}
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="main-dashboard-grid">
                <div className="stats-container fade-in-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="section-title">Your Status</h3>
                    <div className="card present"><div className="icon-wrapper present"><CheckInIcon /></div><div><h4>{attendanceStats.present}</h4><p>Days Present</p></div></div>
                    <div className="card absent"><div className="icon-wrapper absent"><ProfileIcon/></div><div><h4>{attendanceStats.absent}</h4><p>Days Absent</p></div></div>
                    <div className="card late"><div className="icon-wrapper late"><LateIcon/></div><div><h4>{attendanceStats.late}</h4><p>Days Late</p></div></div>
                    <div className="card leave"><div className="icon-wrapper leave"><LeaveIcon/></div><div><h4>{attendanceStats.leave}</h4><p>Days On Leave</p></div></div>
                </div>
                
                <div className="calendar-container fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="calendar-header">
                        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <div className="calendar-nav" style={{display: 'flex', gap: '0.5rem'}}>
                            <button onClick={() => changeMonth(-1)}><ChevronLeftIcon/></button>
                            <button onClick={() => changeMonth(1)}><ChevronRightIcon/></button>
                        </div>
                    </div>
                    <div className="calendar-grid">
                        {daysOfWeek.map(day => <div key={day} className="calendar-day-header">{day}</div>)}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="calendar-day"></div>)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const statusClass = getDayStatus(day);
                            return <div key={day} className={`calendar-day ${statusClass}`}>{day}</div>;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardContent;

