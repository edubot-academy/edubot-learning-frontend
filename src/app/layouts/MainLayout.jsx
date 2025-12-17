import React from 'react';
import Header from '@shared/Header';
import Footer from '@shared/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow">{children}</div>
            <Footer />
        </div>
    );
};

export default MainLayout;
