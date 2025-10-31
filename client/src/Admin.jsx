import React, { useState } from 'react';
import skeneticLogo from './assets/skenetic-logo.jpg';
// --- NEW: Import the admin responsive CSS ---
import './adminresponsive.css';

// Page Components
import DashboardContent from './pages/admin/DashboardContent.jsx';
import StudentsPage from './pages/admin/StudentsPage.jsx';
import AttendanceRequestsPage from './pages/admin/AttendanceRequestsPage.jsx';
import AttendanceReportsPage from './pages/admin/AttendanceReportsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import LateAttendancePage from './pages/admin/LateAttendancePage.jsx';
import LeaveRequestsAdminPage from './pages/admin/LeaveRequestsAdminPage.jsx';
import AdminInfoPage from './pages/admin/AdminInfoPage.jsx';
import VerificationPage from './pages/admin/VerificationPage.jsx';


// --- ICONS ---
// (No changes to Icon components)
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const StudentsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const AttendanceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const LateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const LeaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const VerificationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
// --- NEW: Menu (Hamburger) Icon ---
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
// --- NEW: X (Close) Icon ---
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

const AdminDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isAttendanceSubmenuOpen, setAttendanceSubmenuOpen] = useState(false);
  // --- NEW: State for mobile menu visibility ---
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // --- MODIFIED: Handle navigation click (for both desktop & mobile) ---
  const handleNavigate = (itemName, isSubItem = false) => {
    // Close Attendance submenu if clicking a different MAIN item
    if (itemName !== 'Attendance' && !isSubItem && isAttendanceSubmenuOpen) {
        setAttendanceSubmenuOpen(false);
    }

    // Toggle Attendance submenu or navigate to other pages
    if (itemName === 'Attendance' && !isSubItem) {
        setAttendanceSubmenuOpen(!isAttendanceSubmenuOpen);
        // Default to 'Requests' if opening submenu and not already on a subitem
        if (!isAttendanceSubmenuOpen && !adminMenuItems.find(i => i.name === 'Attendance').subItems.includes(activePage)) {
            setActivePage('Requests');
        }
    } else {
        setActivePage(itemName);
    }

    // Close mobile menu after any navigation
    setMobileMenuOpen(false);
  };

  // --- NEW: Handler for Logout (closes mobile menu) ---
  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    onLogout();
  };


  const renderContent = () => {
    switch (activePage) {
      // Pass handleNavigate instead of setActivePage directly
      case 'Dashboard': return <DashboardContent onNavigate={handleNavigate} />;
      case 'Students': return <StudentsPage />;
      case 'Requests': return <AttendanceRequestsPage />;
      case 'Reports': return <AttendanceReportsPage />;
      case 'Settings': return <AdminSettingsPage />;
      case 'Late Attendance': return <LateAttendancePage />;
      case 'Leave Requests': return <LeaveRequestsAdminPage />;
      case 'Information': return <AdminInfoPage />;
      case 'Verification': return <VerificationPage />;
      default: return <div>Select a page from the menu.</div>;
    }
  };

  return (
    // Add admin-layout class for specific mobile styles
    <div className="admin-layout">
        {/* --- MODIFICATION: Removed inline styles, moved to adminresponsive.css --- */}
        {/* Styles specific to Admin can also go into adminresponsive.css */}
        <style>{`
          /* Base admin layout styles (keep common ones if applicable) */
          .admin-layout { display: flex; min-height: 100vh; background-color: var(--light-bg); }

          /* Desktop Sidebar Styles (Remain largely unchanged) */
          .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
            background-color: var(--admin-sidebar-bg);
            color: var(--admin-text-primary);
            display: flex; flex-direction: column;
            width: 80px;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden; /* Keep hidden */
          }
          .sidebar:hover {
            width: 260px;
          }
          .sidebar-content { height: 100%; display: flex; flex-direction: column; }
          .sidebar-header {
            padding: 0 1.5rem; display: flex; align-items: center; gap: 1rem;
            min-height: 70px; box-sizing: border-box; flex-shrink: 0;
          }
          .sidebar-logo {
            height: 40px; width: 40px; background-image: url(${skeneticLogo});
            background-size: contain; background-repeat: no-repeat; background-position: center;
            flex-shrink: 0; filter: brightness(0) invert(1);
          }
          .sidebar-title {
            font-size: 1.25rem; font-weight: 700; white-space: nowrap; opacity: 0;
            transition: opacity 0.2s ease;
          }
          .sidebar:hover .sidebar-title { opacity: 1; transition-delay: 0.1s; }
          .menu-list { list-style: none; padding: 0; margin: 2rem 0; flex-grow: 1; overflow-y: auto; overflow-x: hidden; }
          /* Add scrollbar styling */
          .menu-list::-webkit-scrollbar { width: 8px; }
          .menu-list::-webkit-scrollbar-track { background: transparent; }
          .menu-list::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 10px; border: 3px solid var(--admin-sidebar-bg); }

          .menu-item a {
            color: var(--admin-text-secondary); text-decoration: none; display: flex; align-items: center;
            padding: 1rem 1.7rem; gap: 1rem; white-space: nowrap; transition: all 0.2s ease;
            border-left: 4px solid transparent; position: relative; /* Added relative for badge */
          }
          .menu-item a:hover { background-color: var(--admin-bg); color: var(--admin-text-primary); }
          .menu-item.active > a { color: var(--admin-text-primary); background-color: var(--admin-bg); border-left-color: var(--admin-accent); font-weight: 600; }
          .menu-icon { flex-shrink: 0; }
          .menu-text { opacity: 0; transition: opacity 0.2s ease; }
          .sidebar:hover .menu-text { opacity: 1; transition-delay: 0.1s; }
          .menu-text .submenu-toggle-icon {
              margin-left: auto;
              transition: transform 0.3s;
              display: inline-block; /* Needed for transform */
          }
          .submenu-list {
            list-style: none; padding-left: calc(1.7rem + 24px + 1rem); /* Align with text */
            max-height: 0; overflow: hidden;
            transition: max-height 0.3s ease-in-out;
            background-color: rgba(0,0,0,0.1);
          }
          .submenu-list.open { max-height: 200px; }
          .submenu-item a { padding: 0.75rem 0; font-size: 0.9rem; color: var(--admin-text-secondary); border-left: none; display: block; }
          .submenu-item.active a { color: var(--admin-text-primary); font-weight: 600; }
          .submenu-item a:hover { color: var(--admin-text-primary); }
          .sidebar:not(:hover) .submenu-list { display: none; }
          .logout-section { padding: 1rem 0; flex-shrink: 0; border-top: 1px solid var(--admin-bg); }

          /* Main Content Area Styles (Common) */
          .main-content {
            flex-grow: 1; padding: 2rem; display: flex; flex-direction: column;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
           /* Desktop specific margins */
           @media (min-width: 993px) {
              .main-content { margin-left: 80px; }
              .sidebar:hover + .main-content { margin-left: 260px; }
           }

          /* Desktop Header Styles (Hidden on mobile via adminresponsive.css) */
          .admin-header {
            display: flex; /* Kept flex */
            justify-content: space-between; align-items: center; background: var(--white);
            padding: 1rem 2rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
          }
          .admin-header h2 { font-size: 1.5rem; margin: 0; color: var(--dark-text); }
          .admin-header .user-info div:first-child { font-weight: 600; }
          .admin-header .user-info div:last-child { font-size: 0.8rem; color: var(--light-text); }

          .content-area {
            flex-grow: 1; background: var(--white); padding: 2rem; border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; min-height: 0;
          }

        `}</style>

      {/* --- DESKTOP Sidebar (Hidden on Mobile) --- */}
      <nav className="sidebar">
        <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo"></div>
              <h1 className="sidebar-title">Skenetic</h1>
            </div>
            <ul className="menu-list">
              {adminMenuItems.map((item) => (
                <li key={item.name} className={`menu-item ${(item.subItems ? item.subItems.includes(activePage) : activePage === item.name) ? 'active' : ''}`}>
                  {/* --- Use handleNavigate --- */}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate(item.name, false); }}>
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">
                        {item.name}
                        {item.subItems && (
                          <span className="submenu-toggle-icon" style={{ transform: isAttendanceSubmenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                            <ChevronDownIcon />
                          </span>
                        )}
                    </span>
                  </a>
                  {item.subItems && (
                    <ul className={`submenu-list ${isAttendanceSubmenuOpen ? 'open' : ''}`}>
                      {item.subItems.map(subItem => (
                        <li key={subItem} className={`submenu-item ${activePage === subItem ? 'active' : ''}`}>
                           {/* --- Use handleNavigate with isSubItem=true --- */}
                          <a href="#" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleNavigate(subItem, true); }}>
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
                 {/* --- Use handleLogoutClick --- */}
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}>
                  <span className="menu-icon"><LogoutIcon/></span>
                  <span className="menu-text">Logout</span>
                </a>
              </div>
            </div>
        </div>
      </nav>

      {/* --- MOBILE Navigation (Added structure) --- */}
      <header className="mobile-header">
          <h2>{activePage}</h2>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon />
          </button>
      </header>
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
      <nav className={`mobile-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
              <img src={skeneticLogo} alt="Skenetic Logo" className="mobile-nav-logo" />
              <h1 className="mobile-nav-title">Skenetic</h1>
              {/* Optional close button inside menu */}
              {/* <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(false)} style={{marginLeft: 'auto'}}><XIcon /></button> */}
          </div>
          <ul className="mobile-menu-list">
              {adminMenuItems.map((item) => (
                <React.Fragment key={item.name}>
                  <li className={`mobile-menu-item ${(item.subItems ? item.subItems.includes(activePage) : activePage === item.name) ? 'active' : ''}`}>
                      {/* --- Use handleNavigate --- */}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate(item.name, false); }}>
                          <span className="menu-icon">{item.icon}</span>
                          <span>{item.name}</span>
                          {item.subItems && (
                            <span className="submenu-toggle-icon" style={{ marginLeft: 'auto', transform: isAttendanceSubmenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              <ChevronDownIcon />
                            </span>
                          )}
                      </a>
                  </li>
                  {/* --- Mobile Submenu --- */}
                  {item.subItems && (
                       <ul className={`mobile-submenu-list ${isAttendanceSubmenuOpen ? 'open' : ''}`}>
                          {item.subItems.map(subItem => (
                            <li key={subItem} className={`mobile-submenu-item ${activePage === subItem ? 'active' : ''}`}>
                              {/* --- Use handleNavigate with isSubItem=true --- */}
                              <a href="#" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleNavigate(subItem, true); }}>
                                {subItem}
                              </a>
                            </li>
                          ))}
                       </ul>
                   )}
                 </React.Fragment>
              ))}
          </ul>
          <div className="mobile-logout-section">
              <div className="mobile-menu-item">
                  {/* --- Use handleLogoutClick --- */}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}>
                      <span className="menu-icon"><LogoutIcon/></span>
                      <span>Logout</span>
                  </a>
              </div>
          </div>
      </nav>

      {/* --- Main Content Area (No structural changes needed here) --- */}
      <main className="main-content">
        {/* --- Desktop Header (Hidden on Mobile) --- */}
        <header className="admin-header">
          <h2>{activePage}</h2>
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: '600' }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--light-text)' }}>Skenetic</div>
            </div>
          </div>
        </header>
        {/* --- Page Content --- */}
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
