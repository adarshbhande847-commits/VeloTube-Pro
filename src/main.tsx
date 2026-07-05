import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && (args[0].includes('WebSocket closed') || args[0].includes('failed to connect to websocket'))) return;
  if (args[0] instanceof Error && (args[0].message.includes('WebSocket closed') || args[0].message.includes('failed to connect to websocket'))) return;
  originalError.call(console, ...args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('WebSocket closed')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
