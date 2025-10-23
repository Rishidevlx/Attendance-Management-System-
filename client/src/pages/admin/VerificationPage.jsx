import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- ICONS ---
const RefreshCwIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>);
const KeyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const ClipboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);


const VerificationPage = () => {
    // --- CHANGE: Initial state for manual token is now empty ---
    const [manualToken, setManualToken] = useState('');
    // --- Other states remain the same ---
    const [activeToken, setActiveToken] = useState(null);
    const [expiryDateTime, setExpiryDateTime] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [copied, setCopied] = useState(false);

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        const duration = type === 'info' ? 3000 : 5000;
        setTimeout(() => setMessage({ text: '', type: '' }), duration);
    };

    const fetchActiveToken = async () => {
        if(!activeToken && !isLoading) setIsLoading(true);
        try {
            const { data } = await axios.get('/api/verification/active', getAuthConfig());
            setActiveToken(data);
        } catch (error) {
            console.error("Failed to fetch active token", error);
             if(!activeToken) setActiveToken(null);
            showMessage('Could not load the active token info.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveToken();
        const now = new Date();
        now.setHours(now.getHours() + 24);
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        setExpiryDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }, []);

    const handleGenerateAuto = async () => {
        setIsGenerating(true);
        try {
            const { data } = await axios.post('/api/verification/auto', {}, getAuthConfig());
            setActiveToken(data);
            showMessage('New auto-generated token activated!', 'success');
        } catch (error) {
            showMessage('Failed to generate auto token.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleActivateManual = async () => {
        const trimmedToken = manualToken.trim();

        // --- CHANGE: Updated Validation Logic ---
        // 1. Check if token is empty
        if (!trimmedToken) {
            showMessage('Please enter a manual token.', 'info');
            return;
        }
        // 2. Check if token length is less than 4
        if (trimmedToken.length < 4) {
             showMessage('Manual token must be at least 4 characters long.', 'info');
             return;
        }
        // 3. Check if token length exceeds 15 (already handled by input's maxLength, but good for safety)
        if (trimmedToken.length > 15) {
             showMessage('Manual token cannot exceed 15 characters.', 'error'); // Keep as error
             return;
        }
        // --- End CHANGE ---


        // Check 3: Expiry Date (Kept as before)
        if (!expiryDateTime || new Date(expiryDateTime) <= new Date()) {
             showMessage('Please select a valid future expiry date and time.', 'error');
             return;
        }

        // Check 4: Same as active auto token (Kept as before)
        if (activeToken && activeToken.type === 'auto' && activeToken.isActive && activeToken.token === trimmedToken) {
            showMessage('Manual token cannot be the same as the current auto-generated token.', 'info');
            return;
        }

        // Proceed with API call
        setIsActivating(true);
        try {
            const { data } = await axios.post('/api/verification/manual', { manualToken: trimmedToken, expiryDateTime }, getAuthConfig());
            setActiveToken(data);
            showMessage('Manual token activated successfully!', 'success');
            setManualToken(''); // Clear the input field after successful activation
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to activate manual token.', 'error');
        } finally {
            setIsActivating(false);
        }
    };

    const copyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; textArea.style.left = "-9999px"; textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus(); textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
             showMessage('Failed to copy token.', 'error');
        }
        document.body.removeChild(textArea);
    };

    const formatRemainingTime = (expiry) => {
        // ... (This function remains the same) ...
        if (!expiry) return 'N/A';
        const now = new Date();
        const expires = new Date(expiry);
        const diff = expires - now;

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        let remaining = '';
        if (days > 0) remaining += `${days}d `;
        if (hours > 0) remaining += `${hours}h `;
        if (minutes > 0 || (days === 0 && hours === 0)) remaining += `${minutes}m`;

        return remaining.trim() || '< 1m';
    };

    // --- CHANGE: Simplified handleManualTokenChange, just limit length ---
    const handleManualTokenChange = (e) => {
        // Allow any character, but limit length to 15
        if (e.target.value.length <= 15) {
            setManualToken(e.target.value);
        }
    };
    // --- End CHANGE ---

    const currentActiveDisplayToken = activeToken && activeToken.isActive && new Date(activeToken.expiresAt) > new Date()
        ? activeToken
        : null;

    return (
        <div>
            {/* Styles remain the same */}
             <style>{`
                .verification-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                @media (min-width: 992px) { .verification-grid { grid-template-columns: repeat(2, 1fr); } }
                .card { background-color: var(--white); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem; }
                .card-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
                .card-header-title { display: flex; align-items: center; gap: 1rem; }
                .card-header .icon { color: var(--brand-blue); }
                .card-header h3 { margin: 0; font-size: 1.25rem; }
                .action-btn { display: inline-flex; align-items: center; gap: 0.5rem; background-color: var(--brand-blue); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
                .action-btn:disabled { background-color: #94A3B8; cursor: not-allowed; }
                .token-display-area { background-color: #F8FAFC; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin-top: 1.5rem; }
                .active-token-label { font-size: 0.9rem; color: var(--light-text); font-weight: 500; margin-bottom: 0.75rem; display: block; }
                .token-string { font-size: 2rem; font-weight: 700; color: var(--dark-text); letter-spacing: 2px; margin-bottom: 1rem; display: block; word-break: break-all; }
                .token-details { font-size: 0.9rem; color: var(--light-text); }
                .token-details span { font-weight: 600; color: var(--dark-text); }
                .copy-btn { background: none; border: none; color: var(--light-text); cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-top: 1rem; }
                .copy-btn:hover { color: var(--brand-blue); }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .input-field { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; box-sizing: border-box; font-size: 1rem; }
                /* Message Box Styles */
                .message-box { padding: 1rem 1.5rem; margin-bottom: 1.5rem; border-radius: 0.75rem; text-align: center; font-weight: 600; animation: fadeIn 0.3s; position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.75rem; }
                .error-message-box { background-color: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; } /* Red */
                .success-message-box { background-color: #F0FDF4; color: #16A34A; border: 1px solid #86EFAC; } /* Green */
                .info-message-box { background-color: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; } /* Blue */

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                 .loading-text { text-align: center; padding: 2rem; color: var(--light-text); font-weight: 500; }
                 .validation-message { display: flex; align-items: center; gap: 0.5rem; color: #F59E0B; font-size: 0.8rem; margin-top: 0.5rem; }

            `}</style>

            {message.text && (
                <div className={`message-box ${message.type}-message-box`}>
                    {message.type === 'error' && <AlertTriangleIcon />}
                    {message.type === 'info' && <InfoIcon />}
                    {message.type === 'success' && <CheckIcon />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="verification-grid">
                {/* Left Card: Displays the CURRENTLY ACTIVE token */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-header-title">
                            <span className="icon"><KeyIcon /></span>
                            <h3>Current Active Token</h3>
                        </div>
                        <button className="action-btn" onClick={handleGenerateAuto} disabled={isGenerating}>
                             <RefreshCwIcon/> {isGenerating ? 'Generating...' : 'Generate New Auto'}
                        </button>
                    </div>
                    <p>This is the token students need for registration right now. Generate a new auto token (24h expiry) or activate a manual one below.</p>
                     {isLoading ? <p className="loading-text">Loading active token...</p> : currentActiveDisplayToken ? (
                        <div className="token-display-area">
                             <span className="active-token-label">
                                Currently Active ({currentActiveDisplayToken.type === 'auto' ? 'Auto' : 'Manual'})
                             </span>
                             <span className="token-string">{currentActiveDisplayToken.token}</span>
                              <div className="token-details">
                                Type: <span>{currentActiveDisplayToken.type.charAt(0).toUpperCase() + currentActiveDisplayToken.type.slice(1)}</span> |
                                Expires in: <span>{formatRemainingTime(currentActiveDisplayToken.expiresAt)}</span>
                              </div>
                            <button className="copy-btn" onClick={() => copyToClipboard(currentActiveDisplayToken.token)}>
                                {copied ? <><CheckIcon/> Copied!</> : <><ClipboardIcon /> Copy Token</>}
                            </button>
                        </div>
                    ) : <p className="loading-text">No token is currently active or valid. Generate an auto token.</p>}
                </div>

                {/* Right Card: Manual Activation */}
                <div className="card">
                     <div className="card-header">
                        <div className="card-header-title">
                            <span className="icon"><EditIcon /></span>
                            <h3>Manual Token Activation</h3>
                        </div>
                     </div>
                    <p>Create a custom token (4-15 chars) and set its expiry time. Activating this will override the auto-generated one.</p>
                    <form onSubmit={(e) => { e.preventDefault(); handleActivateManual(); }}>
                        <div className="form-group">
                            <label htmlFor="manualToken">Verification Token (4-15 characters)</label>
                            {/* --- CHANGE: Added maxLength attribute --- */}
                            <input
                                type="text"
                                id="manualToken"
                                name="manualToken"
                                className="input-field"
                                value={manualToken}
                                onChange={handleManualTokenChange}
                                placeholder="Enter custom token..."
                                maxLength="15" // Limit input length to 15
                                required
                            />
                            {/* --- End CHANGE --- */}
                        </div>
                        <div className="form-group">
                            <label htmlFor="expiryDateTime">Expiry Date & Time</label>
                            <input
                                type="datetime-local"
                                id="expiryDateTime"
                                name="expiryDateTime"
                                className="input-field"
                                value={expiryDateTime}
                                onChange={(e) => setExpiryDateTime(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                             {new Date(expiryDateTime) <= new Date() && expiryDateTime && (
                                <div className="validation-message">
                                    <AlertTriangleIcon />
                                    <span>Expiry must be in the future.</span>
                                </div>
                            )}
                        </div>
                        <button type="submit" className="action-btn" style={{width: '100%'}} disabled={isActivating}>
                            {isActivating ? 'Activating...' : 'Activate Manual Token'}
                        </button>
                    </form>
                      {/* Display area below form only if a manual token IS currently active */}
                      {currentActiveDisplayToken && currentActiveDisplayToken.type === 'manual' && (
                           <div className="token-display-area" style={{marginTop: '2rem'}}>
                             <span className="active-token-label">Current Manual Token (Active)</span>
                             <span className="token-string">{currentActiveDisplayToken.token}</span>
                              <div className="token-details">
                                Type: <span>Manual</span> |
                                Expires in: <span>{formatRemainingTime(currentActiveDisplayToken.expiresAt)}</span>
                              </div>
                              <button className="copy-btn" onClick={() => copyToClipboard(currentActiveDisplayToken.token)}>
                                {copied ? <><CheckIcon/> Copied!</> : <><ClipboardIcon /> Copy Token</>}
                            </button>
                        </div>
                       )}
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;

