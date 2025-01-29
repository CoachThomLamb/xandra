import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to the user to refresh the page
  },
  onOfflineReady() {
    // Show a prompt to the user that the app is ready to work offline
  }
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
