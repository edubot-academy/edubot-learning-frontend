import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        let cancelled = false;

        import('react-ga4').then((module) => {
            if (!cancelled) {
                module.default.send({ hitType: 'pageview', page: location.pathname });
            }
        });

        return () => {
            cancelled = true;
        };
    }, [location]);
};

export default usePageTracking;
