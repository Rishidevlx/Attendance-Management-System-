import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- ICONS ---
// Idhunga ellam namma stat cards and detail fields ku use panna porom
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const PhoneIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>);
const BirthdayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const CheckBadgeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const XCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);


const ProfilePage = ({ user }) => {
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceStats = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                if (!token) throw new Error("No auth token found");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const { data: history } = await axios.get('/api/attendance/history', config);

                const calculatedStats = history.reduce((acc, record) => {
                    if (record.type === 'Check-in') {
                        // --- BUG FIX: Inga logic ah maathirukom ---
                        // Oru record 'wasLate' true ah irundha, adha 'late' count la eduthukanum
                        // Andha record oda status 'Present' ah irundhaalum parava illa
                        if (record.wasLate) {
                            acc.late += 1;
                        }

                        // Status 'Present' ah irundhu, 'wasLate' false ah irundha mattum 'present' la count panrom
                        if (record.status === 'Present' && !record.wasLate) {
                            acc.present += 1;
                        } else if (record.status === 'Absent') {
                            acc.absent += 1;
                        }
                    }
                    return acc;
                }, { present: 0, absent: 0, late: 0 });

                setStats(calculatedStats);
            } catch (error) {
                console.error("Failed to fetch attendance stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceStats();
    }, [user]);

    const profileImageUrl = `https://placehold.co/400x400/E2E8F0/475569?text=${user.name.charAt(0)}`;
    
    return (
        <div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                @media (min-width: 992px) {
                    .profile-grid {
                        grid-template-columns: 300px 1fr;
                    }
                }

                .profile-sidebar {
                    background: var(--white);
                    border: 1px solid var(--border-color);
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                }
                .profile-image-wrapper {
                    width: 150px;
                    height: 150px;
                    border-radius: 1rem;
                    overflow: hidden;
                    margin: 0 auto 1.5rem;
                    border: 4px solid var(--white);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
                .profile-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .profile-sidebar h2 {
                    font-size: 1.5rem;
                    margin: 0;
                    color: var(--dark-text);
                }
                .profile-sidebar p {
                    color: var(--light-text);
                    margin: 0.25rem 0 0;
                }

                .profile-content {
                    background: var(--white);
                    border: 1px solid var(--border-color);
                    border-radius: 1rem;
                    padding: 2rem;
                }
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .detail-item {
                    background-color: #F8FAFC;
                    border: 1px solid var(--border-color);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .detail-item .icon {
                    color: var(--brand-blue);
                }
                .detail-item-content label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--light-text);
                    margin-bottom: 0.25rem;
                }
                .detail-item-content span {
                    font-weight: 500;
                    color: var(--dark-text);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    background-color: var(--white);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08);
                }
                .stat-icon-wrapper {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--white);
                }
                .stat-icon-wrapper.green { background-color: #22C55E; }
                .stat-icon-wrapper.red { background-color: #EF4444; }
                .stat-icon-wrapper.yellow { background-color: #FBBF24; }
                .stat-info h4 { margin: 0 0 0.25rem; color: var(--light-text); font-weight: 500; font-size: 0.9rem; }
                .stat-info p { margin: 0; font-size: 2rem; font-weight: 700; color: var(--dark-text); }
            `}</style>

            <div className="profile-grid">
                <div className="profile-sidebar fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="profile-image-wrapper">
                        <img src={profileImageUrl} alt="Profile" />
                    </div>
                    <h2>{user.name}</h2>
                    <p>{user.domain || 'Intern'}</p>
                </div>

                <div className="profile-content">
                    <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
                        <h3 className="section-title">Personal Details</h3>
                        <div className="details-grid">
                            <DetailItem icon={<UserIcon />} label="Full Name" value={user.name} />
                            <DetailItem icon={<MailIcon />} label="Email Address" value={user.email} />
                            <DetailItem icon={<PhoneIcon />} label="Mobile Number" value={user.phone || 'Not Provided'} />
                            <DetailItem icon={<CodeIcon />} label="Interested Domain" value={user.domain || 'Not Provided'} />
                            <DetailItem icon={<BirthdayIcon />} label="Age" value={user.age || 'Not Provided'} />
                        </div>
                    </div>
                    
                    <div className="fade-in-up" style={{ animationDelay: '300ms', marginTop: '2.5rem' }}>
                         <h3 className="section-title">Attendance Summary</h3>
                         {isLoading ? <p>Calculating stats...</p> : (
                             <div className="stats-grid">
                                <StatCard title="Total Present" value={stats.present} icon={<CheckBadgeIcon />} color="green" />
                                <StatCard title="Total Absent" value={stats.absent} icon={<XCircleIcon />} color="red" />
                                <StatCard title="Total Late" value={stats.late} icon={<ClockIcon />} color="yellow" />
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="detail-item">
        <div className="icon">{icon}</div>
        <div className="detail-item-content">
            <label>{label}</label>
            <span>{value}</span>
        </div>
    </div>
);

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

export default ProfilePage;

