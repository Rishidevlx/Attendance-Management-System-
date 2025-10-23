import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- ICONS ---
const UserCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);

const SettingsPage = ({ user, onUpdateSuccess }) => {
    const [profileData, setProfileData] = useState({ name: '', age: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                age: user.age || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put('/api/users/profile', profileData, getAuthConfig());
            onUpdateSuccess(data); // Parent component-ku puthu data-va anuppurom
            showMessage('Profile updated successfully!', 'success');
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to update profile.', 'error');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword.length < 8) {
            return showMessage('New password must be at least 8 characters long.', 'error');
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return showMessage('New passwords do not match.', 'error');
        }
        try {
            await axios.put('/api/users/change-password', { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }, getAuthConfig());
            showMessage('Password changed successfully!', 'success');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Form-ah clear panrom
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to change password.', 'error');
        }
    };

    const toggleShowPassword = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    }

    return (
        <div>
            <style>{`
                .settings-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                @media (min-width: 992px) { .settings-grid { grid-template-columns: 1fr 1fr; } }
                .card { background-color: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem; }
                .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
                .card-header .icon { color: var(--brand-blue); }
                .card-header h3 { margin: 0; font-size: 1.25rem; }
                .form-group { margin-bottom: 1.5rem; position: relative; }
                .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .input-field { width: 100%; padding: 0.8rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; box-sizing: border-box; font-size: 1rem; background-color: #F8FAFC; }
                .input-field:disabled { background-color: #F1F5F9; color: var(--light-text); cursor: not-allowed; }
                
                /* --- UI FIX: Eye icon alignment சரி pannirukom --- */
                .password-toggle-btn { 
                    position: absolute; 
                    top: 50%; /* Label illama, input field mattum irundha 50% correct ah work aagum */
                    transform: translateY(-50%); /* Vertically center pannurathukku */
                    right: 0; 
                    height: 100%;
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    padding: 0 1rem; 
                    color: var(--light-text); 
                    display: flex;
                    align-items: center;
                }
                
                /* --- UI FIX: Label irukura inputs-ku top position adjust pannurathukku --- */
                .form-group label + .input-field + .password-toggle-btn,
                .form-group label + div .password-toggle-btn {
                    top: 15px;
                    transform: none; /* Already positioned by 'top', so no need for transform */
                }

                .save-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; background-color: var(--brand-blue); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; font-size: 1rem; margin-top: 1rem; }
                .save-btn:hover { background-color: #003ECC; }
                .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; animation: fadeIn 0.3s; }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            {message.text && <div className={`message-box ${message.type === 'error' ? 'error-message-box' : 'success-message-box'}`}>{message.text}</div>}

            <div className="settings-grid">
                <div className="card">
                    <div className="card-header">
                        <span className="icon"><UserCircleIcon /></span>
                        <h3>Personal Information</h3>
                    </div>
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" className="input-field" value={profileData.name} onChange={handleProfileChange} />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" className="input-field" value={user.email} disabled />
                        </div>
                        <div className="form-group">
                            <label>Domain</label>
                            <input type="text" name="domain" className="input-field" value={user.domain || 'Not Assigned'} disabled />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" className="input-field" value={profileData.phone} onChange={handleProfileChange} maxLength="10" />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input type="number" name="age" className="input-field" value={profileData.age} onChange={handleProfileChange} />
                        </div>
                        <button type="submit" className="save-btn"><SaveIcon /> Save Changes</button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="icon"><LockIcon /></span>
                        <h3>Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label>Old Password</label>
                            <input type={showPassword.old ? 'text' : 'password'} name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} className="input-field" required />
                            <button type="button" onClick={() => toggleShowPassword('old')} className="password-toggle-btn">{showPassword.old ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type={showPassword.new ? 'text' : 'password'} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="input-field" required />
                            <button type="button" onClick={() => toggleShowPassword('new')} className="password-toggle-btn">{showPassword.new ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type={showPassword.confirm ? 'text' : 'password'} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="input-field" required />
                             <button type="button" onClick={() => toggleShowPassword('confirm')} className="password-toggle-btn">{showPassword.confirm ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                        <button type="submit" className="save-btn"><SaveIcon /> Change Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

