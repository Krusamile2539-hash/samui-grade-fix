import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ผูก React เข้ากับ div#root ใน index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('ไม่พบ element id="root"');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
