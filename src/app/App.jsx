import { lazy, Suspense, useEffect } from 'react';
import '../App.css';
import AppRoutes from './routes';
import usePageTracking from '../hooks/usePageTracking';
import { DarkModeProvider } from '../contexts/DarkModeProvider';

const Toaster = lazy(() =>
    import('react-hot-toast').then((module) => ({ default: module.Toaster }))
);

function App() {
    useEffect(() => {
        let cancelled = false;

        import('react-ga4').then((module) => {
            if (!cancelled) {
                module.default.initialize('G-GFGKS2VM2D');
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    usePageTracking();

    return (
        <DarkModeProvider>
            <Suspense fallback={null}>
                <Toaster position="top-center" reverseOrder={false} />
            </Suspense>
            <AppRoutes />
        </DarkModeProvider>
    );
}

export default App;
