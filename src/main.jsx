import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import '@fontsource/inter';
import './i18n';
import App from './app/App.jsx';
import AppProviders from './app/providers';
import ScrollToTop from '@shared/ScrollToTop';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ScrollToTop />
            <AppProviders>
                <App />
            </AppProviders>
        </BrowserRouter>
    </StrictMode>
);
