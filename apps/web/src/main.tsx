import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/global.css';
import { ToastProvider } from './components';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
