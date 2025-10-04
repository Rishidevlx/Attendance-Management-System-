import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

// Importing Components from other files
import AdminDashboard from './Admin.jsx';
import StudentPlatform from './User.jsx'; 

// Importing assets and local components
import SplineAnimation from './components/SplineAnimation';
import LoginSplineAnimation from './components/LoginSplineAnimation';
import skeneticLogo from './assets/skenetic-logo.jpg';

// --- Reusable Components ---
const GlobalStyles = () => ( <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    :root { 
      --brand-blue: #0052FF; 
      --light-bg: #F0F4F8; 
      --dark-text: #1E293B; 
      --light-text: #64748B; 
      --white: #FFFFFF; 
      --border-color: #E2E8F0; 
      --error-red: #EF4444; 
      --success-green: #22C55E;
      --admin-bg: #0F172A;
      --admin-sidebar-bg: #1E293B;
      --admin-text-primary: #F8FAFC;
      --admin-text-secondary: #94A3B8;
      --admin-accent: var(--brand-blue);
    }
    body { font-family: 'Inter', sans-serif; background-color: var(--white); color: var(--dark-text); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden; margin: 0; }
    .page-container { opacity: 0; animation: pageFadeIn 0.8s ease-out forwards; }
    @keyframes pageFadeIn { to { opacity: 1; } }
    .nav-btn { padding: 0.7rem 1.4rem; background-color: var(--brand-blue); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 1rem; }
    .nav-btn:hover { background-color: #003ECC; transform: translateY(-2px); }
`}</style> );

const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);
const ArrowLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);

const ForgotPasswordModal = ({ onClose, setServerMessage }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => { e.preventDefault(); setError(''); setSuccess(''); setIsLoading(true); try { await axios.post('/api/users/send-otp', { email }); setSuccess(`OTP has been sent to ${email}. Please check your inbox.`); setStep(2); } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP'); } setIsLoading(false); };
  const handleResetPassword = async (e) => { e.preventDefault(); if (password.length < 8) { setError('Password must be at least 8 characters'); return; } if (password !== password2) { setError('Passwords do not match'); return; } setError(''); setIsLoading(true); try { await axios.post('/api/users/reset-password-with-otp', { email, otp, password }); setServerMessage({ type: 'success', text: 'Password reset successfully! Please sign in.' }); onClose(); } catch (err) { setError(err.response?.data?.message || 'Failed to reset password.'); } setIsLoading(false); };

  return (<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}><button className="modal-close-btn" onClick={onClose}>&times;</button>{step === 1 && (<form onSubmit={handleSendOtp}><h2 className="modal-title">Forgot Password</h2><p>Enter your email for an OTP.</p>{error && <div className="message-box error-message-box">{error}</div>}<div className="form-group"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Your registered email" required/></div><button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send OTP'}</button></form>)}{step === 2 && (<form onSubmit={handleResetPassword}><h2 className="modal-title">Reset Your Password</h2><p>Check your email for the OTP.</p>{error && <div className="message-box error-message-box">{error}</div>}{success && <div className="message-box success-message-box">{success}</div>}<div className="form-group"><input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-field" placeholder="Enter 6-digit OTP" maxLength="6" required/></div><div className="form-group"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="New Password" required /></div><div className="form-group"><input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="input-field" placeholder="Confirm New Password" required /></div><button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</button></form>)}</div></div>);
};

const HomePage = ({ onNavigate }) => (
  <div className="home-container">
     <style>{`
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 5%; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 50; height: 70px; box-sizing: border-box; }
        .logo-container { width: 150px; height: 100px; background-image: url(${skeneticLogo}); background-size: contain; background-repeat: no-repeat; background-position: center; }
        .hero-section { display: grid; grid-template-columns: 45% 55%; align-items: center; gap: 2rem; padding: 4rem 5% 5rem; min-height: 90vh; box-sizing: border-box; }
        .hero-content { animation: slideUp 1s ease-out; }
        .hero-title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; color: var(--dark-text); }
        .hero-title .highlight { color: var(--brand-blue); }
        .hero-subtitle { max-width: 500px; margin: 1.5rem 0 2.5rem; font-size: 1.125rem; color: var(--light-text); }
        .hero-animation { width: 100%; height: 600px; }
        .features-section { padding: 5rem 5%; background-color: var(--light-bg); text-align: center; }
        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 3rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; text-align: left; }
        .feature-card { background: var(--white); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .feature-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
     `}</style>
    <nav className="navbar"><div className="logo-container" /><button className="nav-btn" onClick={() => onNavigate('login')}>Login / Sign Up</button></nav>
    <main className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Unlock Your Potential with <span className="highlight">Skenetic Digital</span></h1>
        <p className="hero-subtitle">Join our elite internship program to transform into an industry-ready professional.</p>
        <button className="nav-btn" onClick={() => onNavigate('login')}>Apply Now</button>
      </div>
      <div className="hero-animation"><SplineAnimation /></div>
    </main>
    <section className="features-section">
      <h2 className="section-title">Benefits of Skenetic Internships</h2>
      <div className="features-grid">
        <div className="feature-card"><h3 className="feature-title">Real-World Projects</h3><p className="light-text">Contribute to live projects that have a real impact, building a portfolio that stands out.</p></div>
        <div className="feature-card"><h3 className="feature-title">Expert Mentorship</h3><p className="light-text">Receive one-on-one guidance from seasoned industry professionals invested in your growth.</p></div>
        <div className="feature-card"><h3 className="feature-title">Career Opportunities</h3><p className="light-text">Exceptional performance can lead to full-time job offers. We believe in nurturing top talent.</p></div>
      </div>
    </section>
  </div>
);

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '', phone: '' });
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { name, email, password, password2, phone } = formData;
  
  useEffect(() => {
    setServerMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '', password2: '', phone: '' });
  }, [isLogin]);

  const onChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });
  
    if (!isLogin && password !== password2) {
      setServerMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
  
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    const payload = isLogin ? { email, password } : { name, email, password, phone }; 
    
    try {
      const response = await axios.post(endpoint, payload);
      if (!isLogin) {
        setServerMessage({ type: 'success', text: 'Account created! Please sign in.'});
        setIsLogin(true);
      } else {
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setServerMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred.' });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try { const res = await axios.post('/api/users/google-login', { token: credentialResponse.credential }); onLoginSuccess(res.data); } 
    catch (err) { setServerMessage({ type: 'error', text: err.response?.data?.message || 'Google login failed.' }); }
  };
  
  return (
    <>
      <style>{`
        .login-page-wrapper { display: grid; grid-template-columns: 55% 45%; min-height: 100vh; width: 100%; background-color: var(--light-bg); overflow: hidden; position: relative; }
        .login-animation-container { background-color: var(--light-bg); display: flex; align-items: center; justify-content: center; }
        .login-form-container { position: relative; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .login-card { width: 100%; max-width: 420px; background: var(--white); padding: 2.5rem; border-radius: 1.25rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); }
        .login-header { text-align: center; margin-bottom: 2.5rem; }
        .login-logo { height: 120px; }
        .input-field { width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background-color: #F8FAFC; color: var(--dark-text); font-size: 1rem; transition: all 0.2s ease; box-sizing: border-box; height: 48px; }
        .submit-button { width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: none; background-color: var(--brand-blue); color: var(--white); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; }
        .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
        .success-message-box { background-color: #D1FAE5; color: #047857; }
        .form-group { margin-bottom: 1.25rem; position: relative; }
        .password-toggle-btn { position: absolute; top: 0; right: 0; height: 100%; background: none; border: none; cursor: pointer; padding: 0 1rem; color: var(--light-text); }
        .forgot-password-link { display: block; text-align: right; font-size: 0.8rem; text-decoration: none; margin-bottom: 1.5rem; color: var(--brand-blue); cursor: pointer; }
        .divider { text-align: center; margin: 1.5rem 0; color: var(--light-text); }
        .toggle-text { text-align: center; margin-top: 1.5rem; }
        .toggle-link { margin-left: 0.5rem; cursor: pointer; font-weight: 600; color: var(--brand-blue); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
        .modal-content { background: var(--white); padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; position: relative; }
        .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--light-text); }
        .modal-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
        .back-to-home-btn { position: absolute; top: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: var(--white); border: 1px solid var(--border-color); border-radius: 9999px; color: var(--dark-text); font-weight: 500; text-decoration: none; transition: all 0.3s ease; z-index: 10; }
        .back-to-home-btn:hover { background-color: #F8FAFC; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transform: translateY(-2px); }
      `}</style>
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} setServerMessage={setServerMessage} />}
      <div className="login-page-wrapper">
        <div className="login-animation-container"><LoginSplineAnimation /></div>
        <div className="login-form-container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="back-to-home-btn"><ArrowLeftIcon/> <span>Back to Home</span></a>
          <div className="login-card">
            <div className="login-header">
              <img src={skeneticLogo} alt="Skenetic Logo" className="login-logo" />
              <h1>{isLogin ? 'Welcome Back!' : 'Create an Account'}</h1>
              <p>{isLogin ? 'Sign in to continue' : 'Join us'}</p>
            </div>
            {serverMessage.text && <div className={serverMessage.type === 'error' ? 'message-box error-message-box' : 'message-box success-message-box'}>{serverMessage.text}</div>}
            <form onSubmit={onSubmit} noValidate>
                 {!isLogin && (<div className="form-group"><input type="text" name="name" value={name} onChange={onChange} className="input-field" placeholder="Your Name" required /></div>)}
                 {!isLogin && (<div className="form-group"><input type="tel" name="phone" value={phone} onChange={onChange} className="input-field" placeholder="Phone Number" required maxLength="10" /></div>)}
                 <div className="form-group"><input type="email" name="email" value={email} onChange={onChange} className="input-field" placeholder="Email Address" required /></div>
                 <div className="form-group">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={onChange} className="input-field" placeholder="Password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                 </div>
                 {isLogin && <a onClick={(e) => {e.preventDefault(); setShowForgotPassword(true);}} className="forgot-password-link">Forgot Password?</a>}
                 {!isLogin && (
                    <div className="form-group">
                        <input type={showPassword2 ? 'text' : 'password'} name="password2" value={password2} onChange={onChange} className="input-field" placeholder="Confirm Password" required />
                        <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="password-toggle-btn">{showPassword2 ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                 )}
                <button type="submit" className="submit-button">{isLogin ? 'Sign In' : 'Create Account'}</button>
            </form>
            <div className="divider">OR</div>
            <div><GoogleLogin onSuccess={handleGoogleSuccess} useOneTap shape="rectangular" width="100%" /></div>
            <p className="toggle-text">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <a onClick={() => setIsLogin(!isLogin)} className="toggle-link">{isLogin ? 'Sign up' : 'Sign in'}</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};


// --- MAIN APP COMPONENT (ROUTER) ---
function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [isLoading, setIsLoading] = useState(true); // To handle initial auth check

  // Check if user is already logged in from localStorage on initial load
  useEffect(() => {
      try {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            setUser(foundUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => { 
      localStorage.setItem('user', JSON.stringify(userData)); // Save user to local storage
      setUser(userData); 
  };
  
  const handleLogout = () => { 
      localStorage.removeItem('user'); // Clear user from local storage
      setUser(null); 
      setCurrentPage('home'); 
  };

  const navigateTo = (page) => { setCurrentPage(page); };
  
  const renderPage = () => {
    if (isLoading) {
        return <div>Loading...</div>; // Or a splash screen
    }

    if (user) {
      if (user.role === 'admin') {
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      // For students, always render the StudentPlatform component
      // It will handle the survey vs dashboard logic internally
      return <StudentPlatform user={user} onLogout={handleLogout} />;
    }
    
    switch (currentPage) {
      case 'login': return <LoginPage onNavigate={navigateTo} onLoginSuccess={handleLoginSuccess} />;
      case 'home': 
      default: 
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="page-container">
        {renderPage()}
      </div>
    </>
  );
}

export default App;

