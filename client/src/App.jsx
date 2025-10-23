import React, { useState, useEffect } from 'react';
import axios from 'axios';
// --- MODIFICATION: Only import GoogleLogin component ---
import { GoogleLogin } from '@react-oauth/google';

// Importing Components from other files
import AdminDashboard from './Admin.jsx';
import StudentPlatform from './User.jsx';

// Importing assets and local components
import skeneticLogo from './assets/skenetic-logo.jpg';
import SplineAnimation from './components/SplineAnimation.jsx';

// --- Hooks ---
const useTypingEffect = (text, speed = 100) => {
    // ... (no changes)
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);
        return () => clearInterval(typingInterval);
    }, [text, speed]);
    return displayedText;
};

const useRepeatingTypingEffect = (words, typeSpeed = 150, eraseSpeed = 100, delay = 2000) => {
    // ... (no changes)
     const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % words.length;
            const fullText = words[i];

            setText(current =>
                isDeleting
                    ? fullText.substring(0, current.length - 1)
                    : fullText.substring(0, current.length + 1)
            );

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), delay);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, isDeleting ? eraseSpeed : typeSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, words, typeSpeed, eraseSpeed, delay]);

    return text;
};


// --- Reusable Components & Icons ---
const GlobalStyles = () => ( <style>{`
    /* ... (no changes) */
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

    /* Modal Styles */
     .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease-out; }
     .modal-content { background: var(--white); padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; position: relative; animation: slideInUpModal 0.4s ease-out; }
     .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.75rem; cursor: pointer; color: var(--light-text); line-height: 1; padding: 0.5rem;}
     .modal-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem;}
     .modal-subtitle { color: var(--light-text); margin-bottom: 2rem; }
     .modal-form-group { margin-bottom: 1.5rem; }
     .modal-input-field { width: 100%; padding: 0.9rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background-color: #F8FAFC; color: var(--dark-text); font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box; height: 50px; text-align: center; letter-spacing: 2px; }
     .modal-input-field:focus { outline: none; border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.2); }
     .modal-submit-button { width: 100%; padding: 0.9rem 1rem; border-radius: 0.5rem; border: none; background-color: var(--brand-blue); color: var(--white); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
     .modal-submit-button:disabled { background-color: #94A3B8; cursor: not-allowed; }
     .modal-message-box { padding: 0.75rem; margin-top: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; font-size: 0.9rem; }
     .modal-error-message { background-color: #FEE2E2; color: #B91C1C; }
     @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
     @keyframes slideInUpModal { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

`}</style> );

const EyeIcon = () => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeOffIcon = () => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);
const ArrowLeftIcon = () => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const KeyIcon = () => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>);


// --- Forgot Password Modal ---
const ForgotPasswordModal = ({ onClose, setServerMessage }) => {
    // ... (no changes) ...
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

      return (<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}><button className="modal-close-btn" onClick={onClose}>&times;</button>{step === 1 && (<form onSubmit={handleSendOtp}><h2 className="modal-title">Forgot Password</h2><p className="modal-subtitle">Enter your email for an OTP.</p>{error && <div className="message-box error-message-box">{error}</div>}<div className="form-group"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Your registered email" required/></div><button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send OTP'}</button></form>)}{step === 2 && (<form onSubmit={handleResetPassword}><h2 className="modal-title">Reset Your Password</h2><p className="modal-subtitle">Check your email for the OTP.</p>{error && <div className="message-box error-message-box">{error}</div>}{success && <div className="message-box success-message-box">{success}</div>}<div className="form-group"><input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-field" placeholder="Enter 6-digit OTP" maxLength="6" required/></div><div className="form-group"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="New Password" required /></div><div className="form-group"><input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="input-field" placeholder="Confirm New Password" required /></div><button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</button></form>)}</div></div>);
};

// --- Verification Token Modal ---
// No changes needed here, logic is handled in LoginPage
const VerificationTokenModal = ({ onClose, onSubmit, isLoading, message, title, buttonText }) => {
    // ... (no changes) ...
     const [token, setToken] = useState('');

    const handleTokenChange = (e) => {
        setToken(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(token);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2 className="modal-title"><KeyIcon /> {title}</h2>
                <p className="modal-subtitle">Please enter the secret token provided by your administrator to complete.</p>
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-group">
                        <input
                            type="text"
                            value={token}
                            onChange={handleTokenChange}
                            className="modal-input-field"
                            placeholder="Enter Verification Token"
                            required
                        />
                    </div>
                    {message && <div className="modal-message-box modal-error-message">{message}</div>}
                    <button type="submit" className="modal-submit-button" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Home Page ---
const HomePage = ({ onNavigate }) => {
    // ... (no changes) ...
    const typingText = useTypingEffect("Digital", 150);
    return (
      <div className="home-container">
         <style>{`
            .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 5%; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 50; height: 70px; box-sizing: border-box; }
            .logo-container { width: 150px; height: 100px; background-image: url(${skeneticLogo}); background-size: contain; background-repeat: no-repeat; background-position: center; }
            .hero-section { display: grid; grid-template-columns: 1fr; align-items: center; gap: 2rem; padding: 2rem 5% 4rem; min-height: calc(100vh - 70px); box-sizing: border-box; text-align: center; }
            .hero-content { animation: slideUp 1s ease-out; }
            .hero-title { font-size: clamp(2.5rem, 8vw, 4rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; color: var(--dark-text); }
            .hero-title .highlight { color: var(--brand-blue); }
            .typing-cursor::after {
                content: '|';
                animation: blink 1s step-end infinite;
                color: var(--brand-blue);
            }
            @keyframes blink { 50% { opacity: 0; } }
            .hero-subtitle { max-width: 500px; margin: 1.5rem auto 2.5rem; font-size: 1.125rem; color: var(--light-text); }
            .hero-animation { width: 100%; max-width: 500px; height: 350px; margin: 0 auto; }
            .features-section { padding: 5rem 5%; background-color: var(--light-bg); text-align: center; }
            .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 3rem; }
            .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; text-align: left; }
            .feature-card { background: var(--white); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s ease; }
            .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .feature-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
            @media (min-width: 992px) {
                .hero-section { grid-template-columns: 45% 55%; text-align: left; padding: 4rem 5% 5rem; }
                .hero-subtitle { margin-left: 0; }
                .hero-animation { margin: 0; max-width: none; height: 600px; }
            }
         `}</style>
        <nav className="navbar"><div className="logo-container" /><button className="nav-btn" onClick={() => onNavigate('login')}>Login / Sign Up</button></nav>
        <main className="hero-section">
          <div className="hero-content" style={{animationDelay: '200ms'}}>
            <h1 className="hero-title">Unlock Your Potential with Skenetic <span className="highlight typing-cursor">{typingText}</span></h1>
            <p className="hero-subtitle" style={{animationDelay: '400ms'}}>Join our elite internship program to transform into an industry-ready professional.</p>
            <button className="nav-btn" onClick={() => onNavigate('login')} style={{animationDelay: '600ms'}}>Apply Now</button>
          </div>
          <div className="hero-animation" style={{animationDelay: '300ms'}}><SplineAnimation /></div>
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
};

// --- Login Page ---
const LoginPage = ({ onNavigate, onLoginSuccess }) => {
    // ... (States remain mostly the same) ...
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '', phone: '' });
    const [serverMessage, setServerMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const animatedAccount = useRepeatingTypingEffect(["Account"]);

    const [showTokenModal, setShowTokenModal] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);
    const [tokenVerificationMessage, setTokenVerificationMessage] = useState('');
    const [isVerifyingToken, setIsVerifyingToken] = useState(false);
    // --- MODIFICATION: Store Google ID Token for signup flow ---
    const [googleIdTokenForSignup, setGoogleIdTokenForSignup] = useState(null);

    const { name, email, password, password2, phone } = formData;

    useEffect(() => {
        setServerMessage({ type: '', text: '' });
        setFormData({ name: '', email: '', password: '', password2: '', phone: '' });
        setRegistrationData(null);
        setGoogleIdTokenForSignup(null); // Clear Google token on view switch
        setTokenVerificationMessage('');
    }, [isLogin]);

    const onChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const onSubmit = async (e) => {
        // ... (No changes in the regular registration/login logic) ...
         e.preventDefault();
        setServerMessage({ type: '', text: '' });
        setTokenVerificationMessage('');

        if (!isLogin) { // Registration Flow
            if (password !== password2) {
                setServerMessage({ type: 'error', text: 'Passwords do not match!' });
                return;
            }
            if (password.length < 8) {
                setServerMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
                return;
            }
             if (phone && !/^\d{10}$/.test(phone)) {
                 setServerMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
                 return;
            }
            // Store registration data and show token modal
            setRegistrationData({ name, email, password, phone });
            setGoogleIdTokenForSignup(null); // Ensure google token is cleared
            setShowTokenModal(true);
        } else { // Login Flow
            const endpoint = '/api/users/login';
            const payload = { email, password };
            try {
                const response = await axios.post(endpoint, payload);
                onLoginSuccess(response.data);
            } catch (err) {
                setServerMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred.' });
            }
        }
    };

    const handleRegisterWithToken = async (verificationToken) => {
        // ... (No changes here) ...
         if (!registrationData || !verificationToken) return;

        setIsVerifyingToken(true);
        setTokenVerificationMessage('');
        try {
            // 1. Validate the token first
             await axios.post('/api/verification/validate', { token: verificationToken });

            // 2. Proceed with registration
            const endpoint = '/api/users/register';
            const payload = { ...registrationData, verificationToken };
            await axios.post(endpoint, payload);

            setShowTokenModal(false);
            setRegistrationData(null);
            setIsLogin(true);
            setServerMessage({ type: 'success', text: 'Account created! Please sign in.' });

        } catch (err) {
            setTokenVerificationMessage(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsVerifyingToken(false);
        }
    };

    // --- NEW: Function to handle direct Google Login (for existing users) ---
    const handleGoogleLoginDirectly = async (googleIdToken) => {
        setServerMessage({ type: '', text: '' }); // Clear any previous messages
        try {
             const endpoint = '/api/users/google-login';
             const payload = { token: googleIdToken }; // Send Google ID token
             const response = await axios.post(endpoint, payload);
             onLoginSuccess(response.data); // Log in the user directly
        } catch (err) {
            console.error("Direct Google Login Error:", err);
            setServerMessage({ type: 'error', text: err.response?.data?.message || 'Google login failed.' });
        }
    };

     // --- NEW: Function to handle Google Signup AFTER token verification ---
     const handleGoogleSignupWithToken = async (verificationToken) => {
        if (!googleIdTokenForSignup || !verificationToken) return;

        setIsVerifyingToken(true);
        setTokenVerificationMessage('');
        try {
            // 1. Validate OUR verification token
             await axios.post('/api/verification/validate', { token: verificationToken });

            // 2. If OUR token valid, proceed with Google login/signup API call using the Google ID token
            const endpoint = '/api/users/google-login';
            const payload = { token: googleIdTokenForSignup }; // Send Google ID token
            const response = await axios.post(endpoint, payload);

            // Success: Close modal and log in the user (account is created by backend)
            setShowTokenModal(false);
            setGoogleIdTokenForSignup(null);
            onLoginSuccess(response.data); // Log in the user

        } catch (err) {
            // --- MODIFICATION: Use correct error message source ---
             setTokenVerificationMessage(err.response?.data?.message || 'Verification or Google sign-up failed.');
        } finally {
            setIsVerifyingToken(false);
        }
    };

    // --- MODIFIED: Google Login `onSuccess` handler ---
    const handleGoogleOnSuccess = async (credentialResponse) => {
         setServerMessage({ type: '', text: '' }); // Clear messages
         setTokenVerificationMessage('');
         const googleIdToken = credentialResponse.credential; // This IS the ID Token JWT

        if (!googleIdToken) {
            setServerMessage({ type: 'error', text: 'Failed to get Google ID token.' });
            return;
        }

        try {
            // Decode JWT locally to get email (no need for backend call yet)
            // Basic JWT decoding (doesn't verify signature, but okay for getting email)
            const base64Url = googleIdToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const googleUserData = JSON.parse(jsonPayload);
            const googleEmail = googleUserData.email;

            if (!googleEmail) {
                 throw new Error("Could not extract email from Google token.");
            }

            // --- Call NEW backend endpoint to check if user exists ---
            const checkResponse = await axios.get(`/api/users/check-email/${googleEmail}`);
            const userExists = checkResponse.data.exists;

            if (userExists) {
                // --- User exists, log them in directly ---
                console.log("Google user exists, logging in directly...");
                handleGoogleLoginDirectly(googleIdToken);
            } else {
                // --- User does NOT exist, store Google ID token and show OUR verification modal ---
                console.log("Google user does not exist, showing verification token modal...");
                setGoogleIdTokenForSignup(googleIdToken);
                setRegistrationData(null); // Ensure registration form data is cleared
                setShowTokenModal(true);
            }

        } catch (error) {
            console.error("Google login check/decode error:", error);
             setServerMessage({ type: 'error', text: 'Failed to process Google login. Please try again.' });
             setGoogleIdTokenForSignup(null); // Clear token on error
        }
    };

    // --- MODIFIED: Determine which submit function the modal should call ---
    const handleTokenSubmit = (token) => {
        if (registrationData) {
            handleRegisterWithToken(token);
        } else if (googleIdTokenForSignup) { // Check for Google signup token
            handleGoogleSignupWithToken(token);
        }
    };


    return (
        <>
            {/* Styles */}
            <style>{`
                /* ... (Existing styles) ... */
                 @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                .login-page-wrapper { display: grid; grid-template-columns: 1fr; min-height: 100vh; width: 100%; background-color: var(--white); overflow: hidden; }
                .login-info-panel { display: none; }

                @media (min-width: 992px) {
                    .login-page-wrapper { grid-template-columns: 45% 55%; }
                    .login-info-panel {
                      background: #0052FF;
                      color: white;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      padding: 4rem;
                      position: relative;
                      overflow: hidden;
                      animation: fadeIn 1s ease-out;
                    }
                    .info-panel-content {
                        z-index: 2;
                        animation: slideInUp 1s ease-out 0.3s forwards;
                        opacity: 0;
                    }
                    .info-panel-content h2 { font-size: 1rem; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1rem; opacity: 0.8;}
                    .info-panel-content h1 { font-size: 3.8rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; }
                    .info-panel-content p { font-size: 1.1rem; max-width: 400px; opacity: 0.9; line-height: 1.7; }
                }

                .bubbles-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
                .bubble { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); animation: float 25s infinite; }
                .bubble:nth-child(1) { width: 80px; height: 80px; left: 10%; animation-duration: 20s; bottom: -80px; }
                .bubble:nth-child(2) { width: 30px; height: 30px; left: 40%; animation-duration: 22s; animation-delay: 2s; bottom: -30px; }
                .bubble:nth-child(3) { width: 50px; height: 50px; left: 70%; animation-duration: 25s; animation-delay: 0s; bottom: -50px; }
                .bubble:nth-child(4) { width: 100px; height: 100px; left: 85%; animation-duration: 18s; animation-delay: 5s; bottom: -100px; }
                .bubble:nth-child(5) { width: 40px; height: 40px; left: 25%; animation-duration: 28s; animation-delay: 8s; bottom: -40px; }

                @keyframes float {
                  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
                }

                .login-form-container { display: flex; align-items: center; justify-content: center; padding: 2rem; position: relative; }
                .login-card { width: 100%; max-width: 420px; animation: slideInUp 1s ease-out 0.5s forwards; opacity: 0; }
                .login-header { text-align: center; margin-bottom: 2.5rem; }
                .login-logo { height: 80px; margin-bottom: 1rem; }

                .input-field { width: 100%; padding: 0.9rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background-color: #F8FAFC; color: var(--dark-text); font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box; height: 50px; }
                .input-field:focus { outline: none; border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.2); }

                .submit-button { width: 100%; padding: 0.9rem 1rem; border-radius: 0.5rem; border: none; background-color: var(--brand-blue); color: var(--white); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
                .submit-button:hover { background-color: #003ECC; transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }

                .message-box { padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 500; }
                .error-message-box { background-color: #FEE2E2; color: #B91C1C; }
                .success-message-box { background-color: #D1FAE5; color: #047857; }

                .form-group { margin-bottom: 1.25rem; position: relative; }
                .password-toggle-btn { position: absolute; top: 0; right: 0; height: 100%; background: none; border: none; cursor: pointer; padding: 0 1rem; color: var(--light-text); }
                .forgot-password-link { display: block; text-align: right; font-size: 0.9rem; text-decoration: none; margin-bottom: 1.5rem; color: var(--brand-blue); cursor: pointer; transition: color 0.2s ease; }
                .forgot-password-link:hover { color: #003ECC; }

                .divider { text-align: center; margin: 1.5rem 0; color: var(--light-text); position: relative; }
                .divider::before, .divider::after { content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--border-color); }
                .divider::before { left: 0; } .divider::after { right: 0; }

                .toggle-text { text-align: center; margin-top: 1.5rem; }
                .toggle-link { margin-left: 0.5rem; cursor: pointer; font-weight: 600; color: var(--brand-blue); transition: color 0.2s ease; }
                .toggle-link:hover { color: #003ECC; }

                /* Styles for ForgotPasswordModal content alignment */
                .modal-content .form-group { text-align: left; }
                .modal-content .submit-button { margin-top: 1rem; }

                .back-to-home-btn { position: absolute; top: 1rem; left: 1rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: rgba(255,255,255,0.9); border: 1px solid var(--border-color); border-radius: 9999px; color: var(--dark-text); font-weight: 500; text-decoration: none; transition: all 0.3s ease; z-index: 10; }
                .back-to-home-btn:hover { background-color: var(--white); box-shadow: 0 4px 10px rgba(0,0,0,0.1); transform: translateY(-2px); }

                .animated-account-word {
                    color: var(--brand-blue);
                    font-weight: 800;
                }
                .animated-account-word::after {
                    content: '|';
                    animation: blink 1s step-end infinite;
                    color: var(--brand-blue);
                }

                 /* Style for Google Login Button Wrapper */
                 .google-login-button-wrapper {
                    display: flex;
                    justify-content: center; /* Center the button */
                    width: 100%; /* Ensure the wrapper takes full width */
                 }
                 /* Override default Google button styles if needed */
                .google-login-button-wrapper > div {
                    width: 100% !important; /* Force button width */
                    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1) !important;
                    transition: all 0.3s ease !important;
                 }
                .google-login-button-wrapper > div:hover {
                    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.15) !important;
                    transform: translateY(-2px);
                }

            `}</style>
            {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} setServerMessage={setServerMessage} />}
            {showTokenModal && (
                <VerificationTokenModal
                    onClose={() => { setShowTokenModal(false); setRegistrationData(null); setGoogleIdTokenForSignup(null); setTokenVerificationMessage(''); }}
                    onSubmit={handleTokenSubmit}
                    isLoading={isVerifyingToken}
                    message={tokenVerificationMessage}
                    // --- MODIFICATION: Updated Title Logic ---
                    title={registrationData ? "Enter Registration Token" : "Enter Verification Token"} // Title adjusted
                    buttonText={registrationData ? "Verify & Register" : "Verify & Continue"} // Button text adjusted
                />
            )}

            <div className="login-page-wrapper">
                {/* Info Panel remains the same */}
                 <div className="login-info-panel">
                    <div className="bubbles-container">
                        {[...Array(5)].map((_, i) => <div className="bubble" key={i}></div>)}
                    </div>
                    <div className="info-panel-content">
                        <h2>Skenetic Digital</h2>
                        <h1>{isLogin ? "Welcome Back!" : "Join Our Team"}</h1>
                        <p>{isLogin ? 'Sign in to access your dashboard and manage your internship progress.' : 'Create an account to start your journey with us and unlock your potential.'}</p>
                    </div>
                </div>
                <div className="login-form-container">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="back-to-home-btn"><ArrowLeftIcon/> <span>Back to Home</span></a>
                    <div className="login-card">
                        {/* Login Header remains the same */}
                         <div className="login-header">
                            <img src={skeneticLogo} alt="Skenetic Logo" className="login-logo" />
                            <h1>
                                {isLogin ? 'Login ' : 'Create an '}
                                <span className="animated-account-word">{animatedAccount}</span>
                            </h1>
                        </div>
                        {serverMessage.text && <div className={serverMessage.type === 'error' ? 'message-box error-message-box' : 'message-box success-message-box'}>{serverMessage.text}</div>}
                        {/* Form remains the same */}
                         <form onSubmit={onSubmit} noValidate>
                            {!isLogin && (<div className="form-group"><input type="text" name="name" value={name} onChange={onChange} className="input-field" placeholder="Your Name" required /></div>)}
                            {!isLogin && (<div className="form-group"><input type="tel" name="phone" value={phone} onChange={onChange} className="input-field" placeholder="Phone Number (10 digits)" maxLength="10" /></div>)}
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
                        {/* --- MODIFICATION: Use GoogleLogin component --- */}
                        <div className="google-login-button-wrapper">
                             <GoogleLogin
                                onSuccess={handleGoogleOnSuccess} // Use the new handler
                                onError={() => {
                                    setServerMessage({ type: 'error', text: 'Google login failed. Please try again.' });
                                }}
                                useOneTap={false} // Disable one-tap login for more control
                                shape="rectangular" // Or other shape
                                theme="outline"
                                size="large"
                                width="100%" // Try to force width via prop
                                text={isLogin ? "signin_with" : "signup_with"} // Dynamic text
                             />
                        </div>
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


// --- Main App Component ---
function App() {
    // ... (States remain the same) ...
     const [user, setUser] = useState(null);
      const [currentPage, setCurrentPage] = useState('home');
      const [isLoading, setIsLoading] = useState(true);

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
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
      };

      const handleLogout = () => {
          localStorage.removeItem('user');
          setUser(null);
          setCurrentPage('home');
      };

      const navigateTo = (page) => { setCurrentPage(page); };

      const renderPage = () => {
        if (isLoading) {
            return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;
        }

        if (user) {
          if (user.role === 'admin') {
            return <AdminDashboard user={user} onLogout={handleLogout} />;
          }
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

