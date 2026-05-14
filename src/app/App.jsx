import '../App.css';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import ReactGA4 from 'react-ga4';
import usePageTracking from '../hooks/usePageTracking';
import { DarkModeProvider } from '../contexts/DarkModeProvider';

ReactGA4.initialize('G-GFGKS2VM2D');

function App() {
    usePageTracking();

    return (
        <DarkModeProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <AppRoutes />
        </DarkModeProvider>
    );
}

export default App;
