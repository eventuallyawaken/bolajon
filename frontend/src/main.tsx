import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/components.css';
import '@/styles/pages/superadmin.css';
import '@/styles/pages/dashboard.css';
import '@/styles/pages/attendance.css';
import '@/styles/pages/finance.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
