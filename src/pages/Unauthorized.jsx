import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Кирүү мүмкүн эмес</h1>
            <p className="mb-6">Бул баракчага кирүүгө укугуңуз жок.</p>
            <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-edubot-orange text-white rounded"
            >
                Башкы бетке өтүү
            </button>
        </div>
    );
};

export default Unauthorized;
