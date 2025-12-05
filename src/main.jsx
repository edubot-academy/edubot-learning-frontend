import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import '@fontsource/inter';
import App from './app/App.jsx';
import AppProviders from './app/providers';
import { FavouritesProvider } from './context/FavouritesContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AppProviders>
                <FavouritesProvider>
                    <App />
                </FavouritesProvider>
            </AppProviders>
        </BrowserRouter>
    </StrictMode>
);
