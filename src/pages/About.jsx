import React from 'react';
import InfoCards from '../components/InfoCards';
import Metrics from '../components/Metrics';
import team from '../assets/images/team.png'

const AboutPage = () => {
    return (
        <div>
            <Metrics />
            <img src={team} alt="" />

            <InfoCards />
        </div>
    );
};

export default AboutPage;