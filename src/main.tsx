import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/sentry'; // Initialize Sentry (must be before everything else)
import './lib/mixpanel'; // Initialize Mixpanel

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <App />
);


