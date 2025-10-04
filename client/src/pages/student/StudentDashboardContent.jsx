import React, { useEffect, useRef } from 'react';

// --- ICONS ---
const CheckBadgeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l.22.22a.68.68 0 0 0 .96 0l.22-.22a4 4 0 0 1 4.78 4.78l-.22.22a.68.68 0 0 0 0 .96l.22.22a4 4 0 0 1-4.78 4.78l-.22-.22a.68.68 0 0 0-.96 0l-.22.22a4 4 0 0 1-4.78-4.78l.22-.22a.68.68 0 0 0 0-.96l-.22-.22z" /><path d="m9 12 2 2 4-4" /></svg>);
const XCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>);
const HelpCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>);


// --- MAIN STUDENT DASHBOARD CONTENT ---
const StudentDashboardContent = ({ user }) => {
    const attendanceChartRef = useRef(null);

    // Dummy data for now
    const attendanceData = {
        todayStatus: 'Present', // Can be 'Present', 'Absent', or 'Pending'
        totalPresent: 26,
        totalDays: 30,
        last15Days: [
            { day: '2025-10-03', status: 'Present' },
            { day: '2025-10-02', status: 'Present' },
            { day: '2025-10-01', status: 'Absent' },
            { day: '2025-09-30', status: 'Present' },
            { day: '2025-09-29', status: 'Present' },
            { day: '2025-09-28', status: 'Present' },
            { day: '2025-09-27', status: 'Late' },
            { day: '2025-09-26', status: 'Present' },
            { day: '2025-09-25', status: 'Present' },
            { day: '2025-09-24', status: 'Present' },
            { day: '2025-09-23', status: 'Absent' },
            { day: '2025-09-22', status: 'Present' },
            { day: '2025-09-21', status: 'Present' },
            { day: '2025-09-20', status: 'Present' },
            { day: '2025-09-19', status: 'Present' },
        ].reverse() // Show oldest first
    };

    const attendancePercentage = Math.round((attendanceData.totalPresent / attendanceData.totalDays) * 100);

    useEffect(() => {
        let chartInstance;
        if (window.Chart && attendanceChartRef.current) {
            const chartCtx = attendanceChartRef.current.getContext('2d');
            
            const gradient = chartCtx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, '#0052FF');
            gradient.addColorStop(1, '#82aaff');

            chartInstance = new window.Chart(chartCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Present', 'Absent'],
                    datasets: [{
                        data: [attendancePercentage, 100 - attendancePercentage],
                        backgroundColor: [gradient, '#E2E8F0'],
                        borderWidth: 0,
                        borderRadius: 10,
                        cutout: '80%',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                }
            });
        }
        return () => { if (chartInstance) chartInstance.destroy(); };
    }, [attendancePercentage]);
    
    const getStatusChip = (status) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem' };
        switch (status) {
            case 'Present': return <span style={{ ...baseStyle, background: '#D1FAE5', color: '#065F46' }}>Present</span>;
            case 'Absent': return <span style={{ ...baseStyle, background: '#FEE2E2', color: '#991B1B' }}>Absent</span>;
            case 'Late': return <span style={{ ...baseStyle, background: '#FEF3C7', color: '#92400E' }}>Late</span>;
            default: return <span style={{ ...baseStyle, background: '#E5E7EB', color: '#4B5563' }}>Pending</span>;
        }
    };
    
    const getStatusIcon = (status) => {
         switch (status) {
            case 'Present': return <div className="status-icon present"><CheckBadgeIcon /></div>;
            case 'Absent': return <div className="status-icon absent"><XCircleIcon /></div>;
            default: return <div className="status-icon pending"><HelpCircleIcon /></div>;
        }
    }

    return (
        <div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .welcome-header { margin-bottom: 2rem; }
                .welcome-header h1 { font-size: 2rem; font-weight: 700; margin: 0; }
                .welcome-header p { color: var(--light-text); font-size: 1.1rem; }
                .student-dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
                .card { background: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .today-status-card { grid-column: span 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .status-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
                .status-icon.present { background: #D1FAE5; color: #065F46; }
                .status-icon.absent { background: #FEE2E2; color: #991B1B; }
                .status-icon.pending { background: #E5E7EB; color: #4B5563; }
                .today-status-card h3 { margin: 0 0 0.5rem; color: var(--light-text); font-weight: 500; }
                .today-status-card p { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--dark-text); }
                
                .attendance-chart-card { grid-column: span 2; display: flex; align-items: center; gap: 2rem; }
                .chart-container { position: relative; width: 150px; height: 150px; }
                .chart-percentage { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2.5rem; font-weight: 800; color: var(--brand-blue); }
                .chart-info h3 { margin: 0 0 0.5rem; }
                .chart-info p { margin: 0 0 1rem; color: var(--light-text); }
                .chart-info .days-info { font-size: 1.2rem; font-weight: 600; color: var(--dark-text); }
                .days-info span { font-weight: 800; color: var(--brand-blue); }

                .attendance-table-card { grid-column: span 3; }
                .attendance-table-card h3 { margin-top: 0; }
                .table-wrapper { max-height: 300px; overflow-y: auto; }
                .attendance-table { width: 100%; border-collapse: collapse; }
                .attendance-table th, .attendance-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                .attendance-table thead { position: sticky; top: 0; background: #F8FAFC; }
                .attendance-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--light-text); }
            `}</style>
            <div className="welcome-header fade-in-up" style={{ animationDelay: '100ms' }}>
                <h1>Welcome Back, {user.name.split(' ')[0]}!</h1>
                <p>Here's a quick look at your attendance summary.</p>
            </div>
            <div className="student-dashboard-grid">
                <div className="card today-status-card fade-in-up" style={{ animationDelay: '200ms' }}>
                    {getStatusIcon(attendanceData.todayStatus)}
                    <h3>Today's Status</h3>
                    <p>{attendanceData.todayStatus}</p>
                </div>

                <div className="card attendance-chart-card fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="chart-container">
                        <canvas ref={attendanceChartRef}></canvas>
                        <div className="chart-percentage">{attendancePercentage}%</div>
                    </div>
                    <div className="chart-info">
                        <h3>Total Attendance</h3>
                        <p>Your overall attendance percentage for the internship.</p>
                        <div className="days-info">You were present for <span>{attendanceData.totalPresent}</span> out of {attendanceData.totalDays} days.</div>
                    </div>
                </div>

                <div className="card attendance-table-card fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h3>Last 15 Days Attendance</h3>
                    <div className="table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr><th>Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {attendanceData.last15Days.map(item => (
                                    <tr key={item.day}>
                                        <td>{new Date(item.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td>{getStatusChip(item.status)}</td>
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

export default StudentDashboardContent;
