import React from 'react';
import AboutText from '../components/AboutText';
import AboutHero from '../components/AboutHero';

const AboutPage = () => {
    return (
        <div className='mx-4 md:mx-12 '>
            <AboutHero/>
            <AboutText />
        </div>
    );
};

export default AboutPage;