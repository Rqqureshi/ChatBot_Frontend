import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatInterface from './Components/ChatInterface'; // or App
import App from './App'; // or App
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChatInterface />
  </React.StrictMode>
);
