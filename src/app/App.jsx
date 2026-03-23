import React from 'react';
import '../App.css';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import ReactGA4 from 'react-ga4';
import usePageTracking from '../hooks/usePageTracking';
import { usePendingActions } from '../hooks/usePendingActions';
import { DarkModeProvider } from '../contexts/DarkModeContext';

ReactGA4.initialize('G-GFGKS2VM2D');

function App() {
    usePageTracking();
    usePendingActions();

    return (
        <DarkModeProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <AppRoutes />
        </DarkModeProvider>
    );
}

export default App;