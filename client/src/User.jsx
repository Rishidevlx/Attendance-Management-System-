import React, { useState, useEffect } from 'react';
import axios from 'axios';
import skeneticLogo from './assets/skenetic-logo.jpg';
import SurveyPage from './pages/student/SurveyPage.jsx';
import StudentDashboardContent from './pages/student/StudentDashboardContent.jsx';
// --- FIX: Importing the new AttendancePage component ---
import AttendancePage from './pages/student/AttendancePage.jsx';


// --- ICONS ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const AttendanceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const LateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const LeaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 21h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"></path><line x1="16" y1="17" x2="10" y2="17"></line><polyline points="13 14 10 17 13 20"></polyline><rect x="3" y="3" width="7" height="7"></rect></svg>);
const ProfileIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);

// --- Main Student Dashboard Layout ---
const StudentDashboard = ({ user, onLogout }) => {
    const [isSidebarExpanded, setSidebarExpanded] = useState(false);
    const [activePage, setActivePage] = useState('Dashboard');

    const studentMenuItems = [
        { name: 'Dashboard', icon: <DashboardIcon /> },
        { name: 'Attendance', icon: <AttendanceIcon /> },
        { name: 'Late Attendance', icon: <LateIcon /> },
        { name: 'Leave Requests', icon: <LeaveIcon /> },
        { name: 'Profile', icon: <ProfileIcon /> },
        { name: 'Settings', icon: <SettingsIcon /> },
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'Dashboard':
                return <StudentDashboardContent user={user} />;
            // --- FIX: Rendering the new AttendancePage ---
            case 'Attendance':
                return <AttendancePage />;
            default:
                return <StudentDashboardContent user={user} />;
        }
    };

    return (
        <div className="admin-layout">
            <style>{`
                .admin-layout { display: flex; min-height: 100vh; background-color: var(--light-bg); }
                .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
                  background-color: var(--admin-sidebar-bg); color: var(--admin-text-primary); padding: 1.5rem 0; display: flex; flex-direction: column; width: 80px; transition: width 0.3s ease-in-out; overflow-x: hidden; }
                .main-content { margin-left: 80px; flex-grow: 1; padding: 2rem; display: flex; flex-direction: column; transition: margin-left 0.3s ease-in-out; }
                .sidebar.expanded + .main-content { margin-left: 260px; }
                .sidebar.expanded { width: 260px; }
                .sidebar-header { padding: 0 1.5rem; display: flex; align-items: center; gap: 1rem; min-height: 70px; box-sizing: border-box; }
                .sidebar-logo { height: 40px; width: 40px; background-image: url(${skeneticLogo}); background-size: contain; background-repeat: no-repeat; background-position: center; flex-shrink: 0; filter: brightness(0) invert(1); }
                .sidebar-title { font-size: 1.25rem; font-weight: 700; white-space: nowrap; opacity: 0; transition: opacity 0.3s ease; }
                .sidebar.expanded .sidebar-title { opacity: 1; }
                .menu-list { list-style: none; padding: 0; margin: 2rem 0; flex-grow: 1; }
                .menu-item a { color: var(--admin-text-secondary); text-decoration: none; display: flex; align-items: center; padding: 1rem 1.7rem; gap: 1rem; white-space: nowrap; transition: all 0.2s ease; border-left: 4px solid transparent; }
                .menu-item a:hover { background-color: var(--admin-bg); color: var(--admin-text-primary); }
                .menu-item.active a { color: var(--admin-text-primary); background-color: var(--admin-bg); border-left-color: var(--admin-accent); font-weight: 600; }
                .menu-icon { flex-shrink: 0; }
                .menu-text { opacity: 0; transition: opacity 0.3s ease; }
                .sidebar.expanded .menu-text { opacity: 1; }
                .logout-section { padding: 1rem 0; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; background: var(--white); padding: 1rem 2rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2rem; }
                .content-area { flex-grow: 1; background: var(--white); padding: 2rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            `}</style>
            <nav 
                className={`sidebar ${isSidebarExpanded ? 'expanded' : ''}`}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="sidebar-header">
                    <div className="sidebar-logo"></div>
                    <h1 className="sidebar-title">Skenetic</h1>
                </div>
                <ul className="menu-list">
                    {studentMenuItems.map((item) => (
                        <li key={item.name} className={`menu-item ${activePage === item.name ? 'active' : ''}`}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage(item.name); }}>
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-text">{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="logout-section">
                    <div className="menu-item">
                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
                            <span className="menu-icon"><LogoutIcon/></span>
                            <span className="menu-text">Logout</span>
                        </a>
                    </div>
                </div>
            </nav>
            <main className="main-content">
                <header className="admin-header">
                    <h2>{activePage}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <div style={{ fontWeight: '600' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--light-text)' }}>Student</div>
                        </div>
                        <button onClick={onLogout} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark-text)'}}><ArrowRightIcon/></button>
                    </div>
                </header>
                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};


// --- Student Platform Controller (Handles Survey vs Dashboard logic) ---
const StudentPlatform = ({ user, onLogout }) => {
    const [userData, setUserData] = useState(user);
    
    const handleSurveyComplete = async (surveyData) => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if (!token) throw new Error("No auth token found");

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/api/users/survey', surveyData, config);
            
            setUserData(data); 
            localStorage.setItem('user', JSON.stringify(data));
            
        } catch (error) {
            console.error("Failed to submit survey:", error);
        }
    };

    if (!userData?.hasCompletedSurvey) {
        return <SurveyPage user={userData} onSurveyComplete={handleSurveyComplete} />;
    }

    return <StudentDashboard user={userData} onLogout={onLogout} />;
};

export default StudentPlatform;

