import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

// --- Unga Google Client ID-a inga correct-ah kudunga ---
const GOOGLE_CLIENT_ID = "1062040593933-8rmt6jam7krn4rr0vmh5p69q55669e3i.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);

