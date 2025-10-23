import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- ICONS ---
const UsersGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>;
const UserXIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12.2l2.4 2.4 5.1-5.1"></path><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2z"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

const DashboardContent = ({ onNavigate }) => {
    const areaChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalStudents: 0,
        todaysPresent: 0,
        todaysAbsent: 0,
        todaysLate: 0,
        pendingRequestsCount: 0,
        lateRequestsCount: 0,
        leaveRequestsCount: 0,
        last30DaysAttendance: [],
        absentTodayList: [],
        domainWiseAttendance: [],
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                if (!token) throw new Error("Authentication token not found.");

                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/users/dashboard-data', config);
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        let areaChartInstance;
        let pieChartInstance;

        const cleanupCharts = () => {
            if (areaChartInstance) areaChartInstance.destroy();
            if (pieChartInstance) pieChartInstance.destroy();
        };

        if (window.Chart && areaChartRef.current && dashboardData.last30DaysAttendance.length > 0) {
            const areaCtx = areaChartRef.current.getContext('2d');
            cleanupCharts();
            
            const presentGradient = areaCtx.createLinearGradient(0, 0, 0, areaCtx.canvas.height);
            presentGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            presentGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            
            const absentGradient = areaCtx.createLinearGradient(0, 0, 0, areaCtx.canvas.height);
            absentGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            absentGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

            areaChartInstance = new window.Chart(areaCtx, {
                type: 'line',
                data: {
                    labels: dashboardData.last30DaysAttendance.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [
                        {
                            label: 'Present',
                            data: dashboardData.last30DaysAttendance.map(d => d.presentCount),
                            borderColor: '#3B82F6',
                            backgroundColor: presentGradient,
                            borderWidth: 2.5,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointHoverBorderWidth: 2,
                            pointHoverBackgroundColor: 'white',
                            tension: 0.4,
                            fill: true,
                        },
                        {
                            label: 'Absent',
                            data: dashboardData.last30DaysAttendance.map(d => d.absentCount),
                            borderColor: '#EF4444',
                            backgroundColor: absentGradient,
                            borderWidth: 2.5,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointHoverBorderWidth: 2,
                            pointHoverBackgroundColor: 'white',
                            tension: 0.4,
                            fill: true,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { align: 'end', labels: { usePointStyle: true, boxWidth: 8 } }, 
                        tooltip: {
                            backgroundColor: '#0F172A', titleFont: { size: 14, family: 'Inter' },
                            bodyFont: { size: 12, family: 'Inter' }, boxPadding: 8,
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#E2E8F0', borderDash: [5, 5], drawBorder: false }, ticks: { font: { size: 12, family: 'Inter' } } },
                        x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } }
                    }
                }
            });
        }

        if (window.Chart && pieChartRef.current) {
            const markedStudents = dashboardData.todaysPresent + dashboardData.todaysAbsent + dashboardData.todaysLate;
            const yetToMark = dashboardData.totalStudents - markedStudents;
            
            pieChartInstance = new window.Chart(pieChartRef.current.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Present', 'Absent', 'Late', 'Yet to Mark'],
                    datasets: [{
                        data: [dashboardData.todaysPresent, dashboardData.todaysAbsent, dashboardData.todaysLate, yetToMark],
                        backgroundColor: ['#93C5FD', '#FCA5A5', '#FDE047', '#E5E7EB'],
                        borderColor: 'var(--white)',
                        borderWidth: 4,
                        hoverOffset: 12,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                             callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    return `${context.label}: ${value}`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        return cleanupCharts;

    }, [dashboardData]);

    const quickActions = [
        { name: 'Students', icon: <UsersGroupIcon />, page: 'Students' },
        { name: 'Requests', icon: <BellIcon />, page: 'Requests', count: dashboardData.pendingRequestsCount },
        { name: 'Reports', icon: <FileTextIcon />, page: 'Reports' },
        { name: 'Late', icon: <ClockIcon />, page: 'Late Attendance', count: dashboardData.lateRequestsCount },
        { name: 'Leave', icon: <ClipboardListIcon />, page: 'Leave Requests', count: dashboardData.leaveRequestsCount },
        { name: 'Information', icon: <InfoIcon />, page: 'Information' },
        { name: 'Verification', icon: <CheckBadgeIcon />, page: 'Verification' },
        { name: 'Settings', icon: <SettingsIcon />, page: 'Settings' },
    ];

    if (isLoading) {
        return <div style={{textAlign: 'center', padding: '3rem'}}>Loading Dashboard Data...</div>;
    }

    return (
        <div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--dark-text); display: flex; align-items: center; gap: 0.75rem; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .stat-card { display: flex; align-items: center; gap: 1.5rem; background-color: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); transition: all 0.3s ease; }
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08); border-color: var(--brand-blue); }
                .stat-icon-wrapper { width: 60px; height: 60px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: var(--white); }
                .stat-icon-wrapper.blue { background-color: #3B82F6; }
                .stat-icon-wrapper.green { background-color: #22C55E; }
                .stat-icon-wrapper.red { background-color: #EF4444; }
                .stat-info h4 { margin: 0 0 0.25rem; color: var(--light-text); font-weight: 500; font-size: 0.9rem; }
                .stat-info p { margin: 0; font-size: 2.25rem; font-weight: 700; color: var(--dark-text); }

                .quick-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
                .action-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem 1rem; text-align: center; font-weight: 600; cursor: pointer; transition: all 0.2s ease; position: relative; }
                .action-card:hover { transform: translateY(-5px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-color: var(--brand-blue); color: var(--brand-blue); }
                .action-card svg { color: var(--brand-blue); }
                .action-card:hover span { color: var(--brand-blue); }
                .action-count-badge { position: absolute; top: 1rem; right: 1rem; background-color: #EF4444; color: white; font-size: 0.75rem; font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--white); }

                .charts-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 2.5rem; }
                @media (min-width: 1024px) { .charts-grid { grid-template-columns: 2fr 1fr; } }
                .chart-card { background-color: var(--white); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
                .chart-card h3 { margin: 0 0 1.5rem; font-size: 1.2rem; font-weight: 600; }
                .chart-container { position: relative; height: 400px; }
                .pie-container { position: relative; width: 100%; max-width: 320px; height: 320px; margin: 0 auto 1.5rem; padding: 10px; }
                .pie-legend { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                .legend-item { display: flex; align-items: center; font-size: 0.9rem; color: var(--light-text); }
                .legend-item .dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 0.75rem; }
                
                .absent-list-table { width: 100%; border-collapse: collapse; }
                .absent-list-table th, .absent-list-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
                .absent-list-table thead { background-color: #F8FAFC; }
                .absent-list-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .status-badge { padding: 4px 10px; border-radius: 999px; font-weight: 600; font-size: 0.8rem; }
                .status-absent { background-color: #FEE2E2; color: #991B1B; }
                
                .empty-state { text-align: center; padding: 3rem 1rem; color: var(--light-text); background: #F8FAFC; border-radius: 1rem; }
                .empty-state svg { color: #22C55E; margin-bottom: 1rem; }
                .empty-state h4 { color: var(--dark-text); font-size: 1.1rem; margin: 0; }

                .domain-table { width: 100%; border-collapse: collapse; }
                .domain-table th, .domain-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
                .domain-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
                .progress-bar-container { width: 100%; background-color: #E2E8F0; border-radius: 999px; height: 8px; overflow: hidden; }
                .progress-bar { height: 100%; border-radius: 999px; }
            `}</style>

            <div className="fade-in-up">
                <div className="stats-grid">
                    <StatCard title="Total Students" value={dashboardData.totalStudents} icon={<UsersGroupIcon />} color="blue" />
                    <StatCard title="Today's Present" value={dashboardData.todaysPresent} icon={<UserCheckIcon />} color="green" />
                    <StatCard title="Today's Absent" value={dashboardData.todaysAbsent} icon={<UserXIcon />} color="red" />
                </div>
            </div>

            <div className="fade-in-up" style={{ animationDelay: '100ms', marginTop: '2.5rem' }}>
                <h3 className="section-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <div key={action.name} className="action-card" onClick={() => onNavigate(action.page)}>
                            {action.icon}
                            <span>{action.name}</span>
                            {action.count > 0 && <span className="action-count-badge">{action.count}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="charts-grid fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="chart-card">
                    <h3>Last 30 Days Attendance Trend</h3>
                    <div className="chart-container">
                        <canvas ref={areaChartRef}></canvas>
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Today's Status</h3>
                    <div className="pie-container">
                        <canvas ref={pieChartRef}></canvas>
                    </div>
                    <div className="pie-legend">
                        <LegendItem color="#93C5FD" label="Present" value={dashboardData.todaysPresent} />
                        <LegendItem color="#FCA5A5" label="Absent" value={dashboardData.todaysAbsent} />
                        <LegendItem color="#FDE047" label="Late" value={dashboardData.todaysLate} />
                        <LegendItem color="#E5E7EB" label="Yet to Mark" value={dashboardData.totalStudents - (dashboardData.todaysPresent + dashboardData.todaysAbsent + dashboardData.todaysLate)} />
                    </div>
                </div>
            </div>

             <div className="fade-in-up" style={{ animationDelay: '300ms', marginTop: '2.5rem' }}>
                <h3 className="section-title"><LayersIcon /> Domain-wise Attendance</h3>
                 <div className="card" style={{ padding: 0 }}>
                    <table className="domain-table">
                        <thead><tr><th>Domain</th><th>Total Students</th><th>Present %</th><th>Absent %</th></tr></thead>
                        <tbody>
                            {dashboardData.domainWiseAttendance.map(d => (
                                <tr key={d.domain}>
                                    <td>{d.domain}</td>
                                    <td>{d.totalStudents}</td>
                                    <td><ProgressBar percentage={d.presentPercentage} color="#22C55E" /></td>
                                    <td><ProgressBar percentage={d.absentPercentage} color="#EF4444" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            <div className="fade-in-up" style={{ animationDelay: '400ms', marginTop: '2.5rem' }}>
                <h3 className="section-title">Today's Absent List</h3>
                <div className="card" style={{ padding: 0 }}>
                    {dashboardData.absentTodayList.length > 0 ? (
                        <table className="absent-list-table">
                            <thead>
                                <tr><th>Student</th><th>Domain</th><th>Phone</th><th>Email</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {dashboardData.absentTodayList.map(student => (
                                    <tr key={student._id}>
                                        <td>{student.name}</td>
                                        <td>{student.domain || 'N/A'}</td>
                                        <td>{student.phone || 'N/A'}</td>
                                        <td>{student.email}</td>
                                        <td>
                                            <span className="status-badge status-absent">Absent</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                             <CheckBadgeIcon width="48" height="48" />
                             <h4>All Students are Present Today!</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componentes Auxiliares
const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
        <div className={`stat-icon-wrapper ${color}`}>{icon}</div>
        <div className="stat-info">
            <h4>{title}</h4>
            <p>{value}</p>
        </div>
    </div>
);

const LegendItem = ({ color, label, value }) => (
    <div className="legend-item">
        <span className="dot" style={{ backgroundColor: color }}></span>
        {label}: <strong>{value}</strong>
    </div>
);

const ProgressBar = ({ percentage, color }) => (
    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
        </div>
        <span style={{fontSize: '0.9rem', fontWeight: 500}}>{percentage.toFixed(1)}%</span>
    </div>
);

export default DashboardContent;

