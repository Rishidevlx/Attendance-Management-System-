import React, { useState } from 'react';
import skeneticLogo from './assets/skenetic-logo.jpg';

// Page Components
import DashboardContent from './pages/admin/DashboardContent.jsx';
import StudentsPage from './pages/admin/StudentsPage.jsx';
import AttendanceRequestsPage from './pages/admin/AttendanceRequestsPage.jsx';
import AttendanceReportsPage from './pages/admin/AttendanceReportsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import LateAttendancePage from './pages/admin/LateAttendancePage.jsx';
import LeaveRequestsAdminPage from './pages/admin/LeaveRequestsAdminPage.jsx';
import AdminInfoPage from './pages/admin/AdminInfoPage.jsx';
import VerificationPage from './pages/admin/VerificationPage.jsx'; // --- NEW: Import VerificationPage ---


// --- ICONS ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const StudentsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const AttendanceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const LateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const LeaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const VerificationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);

const AdminDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isAttendanceSubmenuOpen, setAttendanceSubmenuOpen] = useState(false);

  // --- NEW: Add Verification to menu ---
  const adminMenuItems = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Students', icon: <StudentsIcon /> },
    { name: 'Attendance', icon: <AttendanceIcon />, subItems: ['Requests', 'Reports'] },
    { name: 'Late Attendance', icon: <LateIcon /> },
    { name: 'Leave Requests', icon: <LeaveIcon /> },
    { name: 'Information', icon: <InfoIcon /> },
    { name: 'Verification', icon: <VerificationIcon /> },
    { name: 'Settings', icon: <SettingsIcon /> },
  ];

  const handleMenuClick = (itemName) => {
    // Close submenu if clicking a different main item
    if (itemName !== 'Attendance' && isAttendanceSubmenuOpen) {
        setAttendanceSubmenuOpen(false);
    }

    if (itemName === 'Attendance') {
      setAttendanceSubmenuOpen(!isAttendanceSubmenuOpen);
      // If opening the submenu, default to 'Requests' if not already on Requests/Reports
      if(!isAttendanceSubmenuOpen && activePage !== 'Requests' && activePage !== 'Reports') {
          setActivePage('Requests');
      }
      // If clicking Attendance while already on Requests/Reports, just toggle submenu
      // No need to change activePage here unless toggling off to another page
    }
    // Handle clicks on items other than Attendance
    else {
        // Prevent setting activePage to 'Attendance' itself when just toggling
        if(itemName !== 'Attendance'){
             setActivePage(itemName);
        }
    }
  };

  const handleSubMenuClick = (e, subItemName) => {
      e.stopPropagation(); // Prevent parent menu click handler
      setActivePage(subItemName);
      // Keep submenu open when clicking a subitem
      if (!isAttendanceSubmenuOpen) {
          setAttendanceSubmenuOpen(true);
      }
  };


  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard': return <DashboardContent onNavigate={setActivePage} />;
      case 'Students': return <StudentsPage />;
      case 'Requests': return <AttendanceRequestsPage />;
      case 'Reports': return <AttendanceReportsPage />;
      case 'Settings': return <AdminSettingsPage />;
      case 'Late Attendance': return <LateAttendancePage />;
      case 'Leave Requests': return <LeaveRequestsAdminPage />;
      case 'Information': return <AdminInfoPage />;
      case 'Verification': return <VerificationPage />; // --- NEW: Render VerificationPage ---
      default: return <div>Select a page from the menu.</div>; // Default case
    }
  };

  return (
    <div className="admin-layout">
        {/* Styles remain the same, no changes needed here */}
        <style>{`
        .admin-layout { display: flex; min-height: 100vh; background-color: var(--light-bg); }
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
          background-color: var(--admin-sidebar-bg);
          color: var(--admin-text-primary);
          display: flex; flex-direction: column;
          width: 80px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .sidebar:hover {
          width: 260px;
        }

        .sidebar-content {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .main-content {
          flex-grow: 1;
          padding: 2rem;
          display: flex; flex-direction: column;
          margin-left: 80px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar:hover + .main-content {
          margin-left: 260px;
        }

        .sidebar-header {
          padding: 0 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          min-height: 70px; box-sizing: border-box;
          flex-shrink: 0;
        }
        .sidebar-logo {
          height: 40px; width: 40px;
          background-image: url(${skeneticLogo});
          background-size: contain; background-repeat: no-repeat; background-position: center;
          flex-shrink: 0; filter: brightness(0) invert(1);
        }
        .sidebar-title {
          font-size: 1.25rem; font-weight: 700; white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .sidebar:hover .sidebar-title {
          opacity: 1;
          transition-delay: 0.1s;
        }

        .menu-list {
            list-style: none; padding: 0; margin: 2rem 0; flex-grow: 1;
            overflow-y: auto; overflow-x: hidden;
        }
        .menu-list::-webkit-scrollbar {
            width: 8px;
        }
        .menu-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .menu-list::-webkit-scrollbar-thumb {
            background-color: #4A5568;
            border-radius: 10px;
            border: 3px solid var(--admin-sidebar-bg);
        }

        .menu-item a {
          color: var(--admin-text-secondary); text-decoration: none;
          display: flex; align-items: center;
          padding: 1rem 1.7rem; gap: 1rem;
          white-space: nowrap; transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }
        .menu-item a:hover { background-color: var(--admin-bg); color: var(--admin-text-primary); }
        .menu-item.active > a { color: var(--admin-text-primary); background-color: var(--admin-bg); border-left-color: var(--admin-accent); font-weight: 600; }
        .menu-icon { flex-shrink: 0; }
        .menu-text {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .sidebar:hover .menu-text {
          opacity: 1;
          transition-delay: 0.1s;
        }
        .submenu-list {
          list-style: none; padding-left: calc(1.7rem + 24px + 1rem); /* Align with text */
          max-height: 0; overflow: hidden;
          transition: max-height 0.3s ease-in-out;
          background-color: rgba(0,0,0,0.1); /* Slightly different bg for submenu */
        }
        .submenu-list.open { max-height: 200px; } /* Adjust as needed */
        .submenu-item a { padding: 0.75rem 0; font-size: 0.9rem; color: var(--admin-text-secondary); border-left: none; /* Remove border from subitems */ display: block; /* Ensure full width clickable */}
        .submenu-item.active a { color: var(--admin-text-primary); font-weight: 600; }
        .submenu-item a:hover { color: var(--admin-text-primary); }
        /* Hide submenu completely when sidebar is collapsed */
        .sidebar:not(:hover) .submenu-list {
            display: none;
        }
        .logout-section { padding: 1rem 0; flex-shrink: 0; border-top: 1px solid var(--admin-bg); }
        .admin-header { display: flex; justify-content: space-between; align-items: center; background: var(--white); padding: 1rem 2rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2rem; }

        /* --- PERMANENT LAYOUT FIX --- */
        .content-area {
          flex-grow: 1;
          background: var(--white);
          padding: 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          display: flex; /* Ensure content area can flex */
          flex-direction: column; /* Stack content vertically */
          min-height: 0; /* Allow shrinking */
        }
      `}</style>
      <nav
        className="sidebar"
      >
        <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo"></div>
              <h1 className="sidebar-title">Skenetic</h1>
            </div>
            <ul className="menu-list">
              {adminMenuItems.map((item) => (
                <li key={item.name} className={`menu-item ${(item.subItems ? item.subItems.includes(activePage) : activePage === item.name) ? 'active' : ''}`}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick(item.name); }}>
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.name}</span>
                    {item.subItems && <span className="menu-text" style={{ marginLeft: 'auto', transition: 'transform 0.3s', transform: isAttendanceSubmenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}><ChevronDownIcon /></span>}
                  </a>
                  {item.subItems && (
                    <ul className={`submenu-list ${isAttendanceSubmenuOpen ? 'open' : ''}`}>
                      {item.subItems.map(subItem => (
                        <li key={subItem} className={`submenu-item ${activePage === subItem ? 'active' : ''}`}>
                          <a href="#" onClick={(e) => handleSubMenuClick(e, subItem)}>
                            {subItem}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
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
        </div>
      </nav>
      <main className="main-content">
        <header className="admin-header">
          <h2>{activePage}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: '600' }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--light-text)' }}>Admin</div>
            </div>
            {/* Removed the ArrowRightIcon logout button from here as logout is in sidebar */}
          </div>
        </header>
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
