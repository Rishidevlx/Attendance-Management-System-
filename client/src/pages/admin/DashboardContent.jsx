import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- ICONS ---
const UsersGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const DashboardContent = () => {
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [stats, setStats] = useState({ totalStudents: 0, attendanceToday: 0, todaysStatus: { present: 0, absent: 0, late: 0 } });

  useEffect(() => {
    // --- FIX: Added Authorization header to the API call ---
    const fetchStats = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            if (!token) throw new Error("No auth token found");

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/users/stats', config); 
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    let pieChartInstance;
    let barChartInstance;
    if (window.Chart && pieChartRef.current) {
      const pieCtx = pieChartRef.current.getContext('2d');
      pieChartInstance = new window.Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Present', 'Absent', 'Late'],
          datasets: [{
            data: [
              stats.todaysStatus.present || 85, 
              stats.todaysStatus.absent || 10,
              stats.todaysStatus.late || 5
            ],
            backgroundColor: ['#3B82F6', '#8B5CF6', '#FBBF24'],
            borderColor: 'var(--light-bg)',
            borderWidth: 5,
            hoverOffset: 15,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
    if (window.Chart && barChartRef.current) {
      const barCtx = barChartRef.current.getContext('2d');
      barChartInstance = new window.Chart(barCtx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 15 }, (_, i) => `Day ${i + 1}`),
          datasets: [{
            data: Array.from({ length: 15 }, () => Math.floor(Math.random() * (125 - 80 + 1) + 80)),
            borderColor: '#3B82F6',
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#3B82F6',
            pointHoverRadius: 7,
            pointHoverBorderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
            fill: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#E2E8F0', borderDash: [5, 5], drawBorder: false }, ticks: { font: { size: 12, family: 'Inter' } } },
            x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } }
          }
        }
      });
    }
    return () => {
      if (pieChartInstance) pieChartInstance.destroy();
      if (barChartInstance) barChartInstance.destroy();
    };
  }, [stats]);

  const totalAttendance = (stats.todaysStatus.present || 85) + (stats.todaysStatus.absent || 10) + (stats.todaysStatus.late || 5);

  return (
    <div>
        <style>{`
            .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
            .stat-card { display: flex; align-items: center; gap: 1.5rem; background-color: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); transition: all 0.3s ease; }
            .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08); }
            .stat-icon-wrapper { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--white); }
            .stat-icon-wrapper.blue { background-color: #3B82F6; }
            .stat-icon-wrapper.purple { background-color: #8B5CF6; }
            .stat-icon-wrapper.yellow { background-color: #FBBF24; }
            .stat-info h4 { margin: 0 0 0.25rem; color: var(--light-text); font-weight: 500; font-size: 0.9rem; }
            .stat-info p { margin: 0; font-size: 2rem; font-weight: 700; color: var(--dark-text); }
            .chart-wrapper { grid-column: span 3; display: grid; grid-template-columns: 60% 40%; gap: 1.5rem; }
            .chart-card-large { background-color: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
            .chart-card-large h3 { margin: 0 0 1.5rem; font-size: 1.2rem; font-weight: 600; }
            .chart-container { position: relative; height: 350px; }
            .pie-chart-card { background-color: var(--white); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; }
            .pie-chart-card h3 { margin: 0 0 1rem; font-size: 1.2rem; font-weight: 600; }
            .pie-chart-container { position: relative; width: 220px; height: 220px; margin-bottom: 1.5rem; }
            .pie-chart-legend { width: 100%; }
            .legend-item { display: flex; align-items: center; font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--light-text); }
            .legend-item .dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 0.75rem; }
            .legend-item .dot.blue { background-color: #3B82F6; }
            .legend-item .dot.purple { background-color: #8B5CF6; }
            .legend-item .dot.yellow { background-color: #FBBF24; }
            .legend-item.total { font-weight: 600; color: var(--dark-text); border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem; }
        `}</style>
        <div className="dashboard-grid">
            <StatCard title="Total Students" value={stats.totalStudents} icon={<UsersGroupIcon />} color="blue" />
            <StatCard title="Present Today" value={stats.todaysStatus.present || 85} icon={<CheckCircleIcon />} color="purple" />
            <StatCard title="Late/Absent" value={`${stats.todaysStatus.late || 5} / ${stats.todaysStatus.absent || 10}`} icon={<ClockIcon />} color="yellow" />
            
            <div className="chart-wrapper">
                <div className="chart-card-large">
                <h3>Last 15 Days Trend</h3>
                <div className="chart-container">
                    <canvas ref={barChartRef}></canvas>
                </div>
                </div>
                <div className="pie-chart-card">
                <h3>Today's Attendance</h3>
                <div className="pie-chart-container">
                    <canvas ref={pieChartRef}></canvas>
                </div>
                <div className="pie-chart-legend">
                    <div className="legend-item"><span className="dot blue"></span>Present: <strong>{stats.todaysStatus.present || 85}</strong></div>
                    <div className="legend-item"><span className="dot purple"></span>Absent: <strong>{stats.todaysStatus.absent || 10}</strong></div>
                    <div className="legend-item"><span className="dot yellow"></span>Late: <strong>{stats.todaysStatus.late || 5}</strong></div>
                    <div className="legend-item total">Total: <strong>{totalAttendance}</strong></div>
                </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card">
    <div className={`stat-icon-wrapper ${color}`}>
      {icon}
    </div>
    <div className="stat-info">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  </div>
);

export default DashboardContent;
