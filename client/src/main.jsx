import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios'; // --- ADD THIS ---

// Import responsive styles
import './responsive.css';

// --- AXIOS BASE URL CONFIGURATION START ---
// Idhu than 'localhost' vs 'production' ah handle pannum
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
console.log(`API Base URL set to: ${import.meta.env.VITE_API_URL}`);
// --- AXIOS BASE URL CONFIGURATION END ---


// Unga Google Client ID
const GOOGLE_CLIENT_ID = "1062040593933-8rmt6jam7krn4rr0vmh5p69q55669e3i.apps.googleusercontent.com"; // Replace with your actual Client ID if different

// Service Worker Registration Logic
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed: ', error);
      });
  });
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
