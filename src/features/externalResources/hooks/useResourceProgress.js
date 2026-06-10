import { useContext } from 'react';
import ResourceProgressContext from '../../../context/ResourceProgressContext';

const useResourceProgress = () => {
    const ctx = useContext(ResourceProgressContext);
    if (!ctx) throw new Error('useResourceProgress must be used within ResourceProgressProvider');
    return ctx;
};

export default useResourceProgress;
