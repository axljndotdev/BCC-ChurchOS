import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign third-party script errors or cross-origin sandbox restrictions
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message?.includes('Script error')) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Intercepted and suppressed third-party cross-origin Script error:', event);
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.message === 'Script error.' || String(event.reason).includes('Script error'))) {
    event.preventDefault();
    console.warn('Intercepted and suppressed third-party unhandled promise Script error:', event.reason);
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

