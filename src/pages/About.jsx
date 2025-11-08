import React from 'react';
import InfoCards from '../components/InfoCards';
import AboutHero from '../components/AboutHero';
import Metrics from '../components/Metrics';
import team from '../assets/images/team.png'

const AboutPage = () => {
    return (
        <div className='mx-4 md:mx-12 '>
            <AboutHero />
            <Metrics />
            <img src={team} alt="" />

            <InfoCards />
        </div>
    );
};

export default AboutPage;