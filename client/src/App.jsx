import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SplineAnimation from './components/SplineAnimation';
import LoginSplineAnimation from './components/LoginSplineAnimation';
import skeneticLogo from './assets/skenetic-logo.jpg';
import { GoogleLogin } from '@react-oauth/google';

// --- ICONS ---
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);
const ArrowLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);


// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    :root { --brand-blue: #0052FF; --light-bg: #F0F4F8; --dark-text: #1E293B; --light-text: #64748B; --white: #FFFFFF; --border-color: #E2E8F0; --error-red: #EF4444; --success-green: #22C55E; }
    body { font-family: 'Inter', sans-serif; background-color: var(--white); color: var(--dark-text); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden; margin: 0; }
    .page-container { opacity: 0; animation: pageFadeIn 0.8s ease-out forwards; }
    @keyframes pageFadeIn { to { opacity: 1; } }
    @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideInFromRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 5%; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 50; height: 70px; box-sizing: border-box; }
    .logo-container { width: 150px; height: 100px; background-image: url(${skeneticLogo}); background-size: contain; background-repeat: no-repeat; background-position: center; }
    .nav-btn { padding: 0.7rem 1.4rem; background-color: var(--brand-blue); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 1rem; }
    .nav-btn:hover { background-color: #003ECC; transform: translateY(-2px); }
    .hero-section { display: grid; grid-template-columns: 45% 55%; align-items: center; gap: 2rem; padding: 4rem 5% 5rem; min-height: 90vh; box-sizing: border-box; }
    .hero-content { animation: slideUp 1s ease-out; }
    .hero-title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; color: var(--dark-text); }
    .hero-title .highlight { color: var(--brand-blue); }
    .hero-subtitle { max-width: 500px; margin: 1.5rem 0 2.5rem; font-size: 1.125rem; color: var(--light-text); }
    .hero-animation { width: 100%; height: 600px; animation: slideUp 1s ease-out; }
    .features-section { padding: 5rem 5%; background-color: var(--light-bg); text-align: center; }
    .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 3rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; text-align: left; }
    .feature-card { background: var(--white); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s ease; }
    .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .feature-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    @media (max-width: 992px) { .hero-section { grid-template-columns: 1fr; text-align: center; } .hero-animation { height: 450px; margin-top: 2rem; } .hero-subtitle { margin: 1.5rem auto 2.5rem; } }
    .login-page-wrapper { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; width: 100%; background-color: var(--white); overflow: hidden; position: relative; }
    .login-animation-container { background-color: var(--light-bg); display: flex; align-items: center; justify-content: center; padding: 2rem; animation: slideInFromLeft 1s ease-out; }
    .login-form-container { position: relative; display: flex; align-items: center; justify-content: center; padding: 2rem; animation: slideInFromRight 1s ease-out; }
    .back-to-home-btn { position: absolute; top: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(5px); border: 1px solid var(--border-color); border-radius: 9999px; color: var(--dark-text); font-weight: 500; text-decoration: none; transition: all 0.3s ease; z-index: 10; }
    .back-to-home-btn:hover { background-color: var(--white); box-shadow: 0 4px 10px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .login-card { width: 100%; max-width: 400px; transform: perspective(1000px); }
    .form-inner { transition: transform 0.6s ease-in-out; }
    .form-group, .submit-button, .divider, .google-btn-wrapper, .toggle-text, .forgot-password-link { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
    .form-group:nth-child(1) { animation-delay: 0.1s; }
    .form-group:nth-child(2) { animation-delay: 0.2s; }
    .form-group:nth-child(3) { animation-delay: 0.3s; }
    .forgot-password-link { animation-delay: 0.35s; }
    .form-group:nth-child(4) { animation-delay: 0.4s; }
    .submit-button { animation-delay: 0.5s; }
    .divider { animation-delay: 0.6s; }
    .google-btn-wrapper { animation-delay: 0.6s; }
    .toggle-text { animation-delay: 0.7s; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .login-header { text-align: center; margin-bottom: 2.5rem; }
    .login-logo-wrapper { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .login-logo { height: 120px; width: auto; }
    .login-title { font-size: 2rem; font-weight: 700; color: var(--dark-text); }
    .login-subtitle { color: var(--light-text); margin-top: 0.5rem; }
    .form-group { margin-bottom: 1.25rem; }
    .input-wrapper { position: relative; }
    .input-field { width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background-color: #F8FAFC; color: var(--dark-text); font-size: 1rem; transition: all 0.2s ease; box-sizing: border-box; height: 48px; cursor: text; }
    .input-field:focus { outline: none; border-color: var(--brand-blue); background-color: var(--white); box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.2); }
    .forgot-password-link { display: block; text-align: right; font-size: 0.8rem; color: var(--brand-blue); text-decoration: none; margin-top: -0.75rem; margin-bottom: 1.5rem; cursor: pointer; }
    .password-toggle { position: absolute; top: 0; right: 0; height: 100%; width: 48px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--light-text); cursor: pointer; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-content { background: var(--white); padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; position: relative; animation: zoomIn 0.3s ease; }
    @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--light-text); }
    .modal-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
    .modal-subtitle { color: var(--light-text); margin-bottom: 2rem; }
    .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; }
    .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
    .success-message-box { background-color: #D1FAE5; color: #047857; }
    .submit-button { width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: none; background-color: var(--brand-blue); color: var(--white); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0, 82, 255, 0.2); }
    .submit-button:hover { background-color: #003ECC; transform: translateY(-2px); box-shadow: 0 7px 10px rgba(0, 82, 255, 0.2); }
    .submit-button:disabled { background-color: #A0BFFD; cursor: not-allowed; box-shadow: none; transform: none; }
    .divider { text-align: center; color: var(--light-text); margin: 1.5rem 0; font-size: 0.8rem; display: flex; align-items: center; gap: 1rem; }
    .divider::before, .divider::after { content: ''; height: 1px; background-color: var(--border-color); flex-grow: 1; }
    .toggle-link { color: var(--brand-blue); font-weight: 600; cursor: pointer; text-decoration: none; }
    .toggle-link:hover { text-decoration: underline; }
    @media (max-width: 992px) { .login-page-wrapper { grid-template-columns: 1fr; } .login-animation-container { display: none; } .back-to-home-btn { background: var(--white); } }
  `}</style>
);

// --- RE-IMPLEMENTED ForgotPasswordModal (FROM SCRATCH) ---
const ForgotPasswordModal = ({ onClose, setServerMessage }) => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 Handler: Email anupuradhu
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      // Namma puthu endpoint-a call panrom
      await axios.post('/api/users/send-otp', { email });
      setSuccess(`OTP has been sent to ${email}. Please check your inbox.`);
      setStep(2); // Adutha step-ku porom
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setIsLoading(false);
  };
  
  // Step 2 Handler: OTP & New Password-a serthu anupuradhu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      // Namma puthu endpoint-a call panrom
      await axios.post('/api/users/reset-password-with-otp', { email, otp, password });
      setServerMessage({ type: 'success', text: 'Password reset successfully! Please sign in.' });
      onClose(); // Ellam mudinjadhum modal-a close pannidalam
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <h2 className="modal-title">Forgot Password</h2>
            <p className="modal-subtitle">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
            {error && <div className="message-box error-message-box">{error}</div>}
            <div className="form-group"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Your registered email" required/></div>
            <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}

        {/* Step 2: Verify OTP & Reset Password */}
        {step === 2 && (
           <form onSubmit={handleResetPassword}>
            <h2 className="modal-title">Reset Your Password</h2>
            <p className="modal-subtitle">Check your email for the OTP and create a new password.</p>
            {error && <div className="message-box error-message-box">{error}</div>}
            {success && <div className="message-box success-message-box">{success}</div>}
            <div className="form-group"><input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-field" placeholder="Enter 6-digit OTP" maxLength="6" required/></div>
            <div className="form-group"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="New Password (min 8 characters)" required /></div>
            <div className="form-group"><input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="input-field" placeholder="Confirm New Password" required /></div>
            <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
};


const HomePage = ({ onNavigate }) => (
  <div className="home-container">
    <nav className="navbar"><div className="logo-container" /><button className="nav-btn" onClick={() => onNavigate('login')}>Login / Sign Up</button></nav>
    <main className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Unlock Your Potential with <span className="highlight">Skenetic Digital</span> Internships</h1>
        <p className="hero-subtitle">Join our elite internship program designed to transform students into industry-ready professionals. Gain hands-on experience, work on live projects, and get mentored by experts.</p>
        <button className="nav-btn" onClick={() => onNavigate('login')}>Apply Now</button>
      </div>
      <div className="hero-animation"><SplineAnimation /></div>
    </main>
    <section className="features-section">
      <h2 className="section-title">Why Intern with Skenetic Digital?</h2>
      <div className="features-grid">
        <div className="feature-card"><h3 className="feature-title">Real-World Projects</h3><p className="light-text">Move beyond theory. You'll contribute to live projects that have a real impact, building a portfolio that stands out.</p></div>
        <div className="feature-card"><h3 className="feature-title">Expert Mentorship</h3><p className="light-text">Receive one-on-one guidance from seasoned industry professionals who are invested in your growth and success.</p></div>
        <div className="feature-card"><h3 className="feature-title">Career Opportunities</h3><p className="light-text">Exceptional performance can lead to full-time job offers. We believe in nurturing and retaining top talent.</p></div>
      </div>
    </section>
  </div>
);

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' });
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { name, email, password, password2 } = formData;
  
  useEffect(() => {
    setServerMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '', password2: '' });
  }, [isLogin]);

  const onChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });
  
    if (!isLogin) {
      if (password !== password2) {
        setServerMessage({ type: 'error', text: 'Passwords do not match!' });
        return;
      }
    }
  
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    const payload = isLogin ? { email, password } : { name, email, password }; 
    
    try {
      const response = await axios.post(endpoint, payload);
      if (!isLogin) {
        setServerMessage({ type: 'success', text: 'Account created successfully! Please sign in.'});
        setIsLogin(true);
      } else {
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setServerMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred.' });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/users/google-login', { token: credentialResponse.credential });
      onLoginSuccess(res.data);
    } catch (err) {
      setServerMessage({ type: 'error', text: err.response?.data?.message || 'Google login failed.' });
    }
  };
  
  return (
    <>
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} setServerMessage={setServerMessage} />}
      <div className="login-page-wrapper">
        <div className="login-animation-container"><LoginSplineAnimation /></div>
        <div className="login-form-container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="back-to-home-btn"><ArrowLeftIcon/> Back to Home</a>
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo-wrapper"><img src={skeneticLogo} alt="Skenetic Digital Logo" className="login-logo" /></div>
              <h1 className="login-title">{isLogin ? 'Welcome Back!' : 'Create an Account'}</h1>
              <p className="login-subtitle">{isLogin ? 'Sign in to continue your journey' : 'Join us to unlock your potential'}</p>
            </div>
            {serverMessage.text && <div className={serverMessage.type === 'error' ? 'message-box error-message-box' : 'message-box success-message-box'}>{serverMessage.text}</div>}
            <div className="form-inner">
              <form onSubmit={onSubmit} noValidate>
                 {!isLogin && (<div className="form-group"><input type="text" name="name" value={name} onChange={onChange} className="input-field" placeholder="Your Name" required /></div>)}
                 <div className="form-group"><input type="email" name="email" value={email} onChange={onChange} className="input-field" placeholder="Email Address" required /></div>
                 <div className="form-group"><div className="input-wrapper"><input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={onChange} className="input-field" placeholder="Password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>
                 {isLogin && <a onClick={(e) => {e.preventDefault(); setShowForgotPassword(true);}} className="forgot-password-link">Forgot Password?</a>}
                 {!isLogin && (<div className="form-group"><div className="input-wrapper"><input type={showPassword2 ? 'text' : 'password'} name="password2" value={password2} onChange={onChange} className="input-field" placeholder="Confirm Password" required /><button type="button" onClick={() => setShowPassword2(!showPassword2)} className="password-toggle">{showPassword2 ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>)}
                <button type="submit" className="submit-button">{isLogin ? 'Sign In' : 'Create Account'}</button>
              </form>
              <div className="divider">OR</div>
              <div className="google-btn-wrapper"><GoogleLogin onSuccess={handleGoogleSuccess} useOneTap shape="rectangular" width="100%" /></div>
              <p className="toggle-text">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <a onClick={() => setIsLogin(!isLogin)} className="toggle-link" style={{marginLeft: '0.5rem'}}>{isLogin ? 'Sign up' : 'Sign in'}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StudentDashboard = ({ user, onLogout }) => (
  <div style={{ padding: '2rem' }}>
    <h1>Welcome, {user.name} (Student)</h1>
    <p>This is your student dashboard.</p>
    <button onClick={onLogout} className="nav-btn">Logout</button>
  </div>
);

const AdminDashboard = ({ user, onLogout }) => (
  <div style={{ padding: '2rem' }}>
    <h1>Welcome, {user.name} (Admin)</h1>
    <p>This is the admin dashboard.</p>
    <button onClick={onLogout} className="nav-btn">Logout</button>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); 

  const handleLoginSuccess = (userData) => { setUser(userData); };
  const handleLogout = () => { setUser(null); setCurrentPage('home'); };
  const navigateTo = (page) => { setCurrentPage(page); };
  
  const renderPage = () => {
    if (user) {
      if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
      return <StudentDashboard user={user} onLogout={handleLogout} />;
    }
    switch (currentPage) {
      case 'login': return <LoginPage onNavigate={navigateTo} onLoginSuccess={handleLoginSuccess} />;
      case 'home': default: return <HomePage onNavigate={navigateTo} />;
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
