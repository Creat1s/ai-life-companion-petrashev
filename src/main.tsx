import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    gm_authFailure?: () => void;
    __GMP_QUOTA_EXCEEDED__?: boolean;
  }
}

// Tier 1 Free Demo Key Quota Exceeded Handler (Google Maps Platform Skill Section 1)
window.gm_authFailure = () => {
  window.__GMP_QUOTA_EXCEEDED__ = true;
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

createRoot(document.getElementById('root')!).render(<App />);
