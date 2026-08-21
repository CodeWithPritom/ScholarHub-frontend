import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress third-party Cloudflare Turnstile unmount warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('challenges.cloudflare.com') ||
     args[0].includes('Cloudflare Turnstile') ||
     args[0].includes('turnstile.remove'))
  ) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('challenges.cloudflare.com') ||
     args[0].includes('Cloudflare Turnstile') ||
     args[0].includes('turnstile.remove'))
  ) {
    return;
  }
  originalError(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
