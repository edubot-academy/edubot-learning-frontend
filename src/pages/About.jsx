import React from 'react';
import InfoCards from '@features/marketing/components/InfoCards';
import Vision from '@features/marketing/components/Vision';
import AboutHero from '@features/marketing/components/AboutHero';
import Metrics from '@features/marketing/components/Metrics';
import team from '@assets/images/team.png';

const AboutPage = () => {
    return (
        <div className="mx-4 md:mx-12 ">
            <AboutHero />
            <Metrics />
            <img src={team} alt="" />
            <Vision />
            <InfoCards />
        </div>
    );
};

export default AboutPage;
