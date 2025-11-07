import React from 'react';
import AboutImage from '../components/AboutImage';
import AboutText from '../components/AboutText';
import Vision from '../components/Vision';

const AboutPage = () => {
    return (
        <div>
            <Vision />
            <AboutImage />
            <AboutText />
        </div>
    );
};

export default AboutPage;