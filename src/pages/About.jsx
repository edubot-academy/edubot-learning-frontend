import React from 'react';
import AboutImage from '../components/AboutImage';
import AboutText from '../components/AboutText';

const AboutPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-24 text-gray-800"> {/* py-24 instead of py-10 to push content below header */}
            <AboutImage />
            <AboutText />
        </div>
    );
};

export default AboutPage;