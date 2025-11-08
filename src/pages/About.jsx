import React from 'react';
import Vision from '../components/Vision';
import AboutHero from '../components/AboutHero';
import Metrics from '../components/Metrics';
import team from '../assets/images/team.png'


const AboutPage = () => {
    return (
        <div className='mx-4 md:mx-12 '>
            <AboutHero />
            <Metrics />
            <img src={team} alt="" />
            <Vision />
        </div>
    );
};

export default AboutPage;