import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useUIStore } from './store/uiStore';
import ErrorBoundary from './components/common/ErrorBoundary';

// Apply dark mode class on initial load
const isDark = useUIStore.getState().isDarkMode;
document.documentElement.classList.toggle('dark', isDark);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
