import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import '@fontsource/inter';
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider> 
        <AuthProvider>
          <App />
        </AuthProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>
);
