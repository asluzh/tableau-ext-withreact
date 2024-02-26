import React from 'react';
import ReactDOM from 'react-dom/client';
import ExtensionWrapper from './components/Extension/ExtensionWrapper.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExtensionWrapper />
  </React.StrictMode>
);
