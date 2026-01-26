import React from 'react';
import '../App.css';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import ReactGA4 from 'react-ga4';
import usePageTracking from '../hooks/usePageTracking';
import { usePendingActions } from '../hooks/usePendingActions'; // Добавили хук

ReactGA4.initialize('G-GFGKS2VM2D');

function App() {
    usePageTracking();
    usePendingActions(); // Используем хук для обработки отложенных действий
    
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <AppRoutes />
        </>
    );
}

export default App;