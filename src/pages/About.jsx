import React from 'react';
import AboutImage from '../components/AboutImage';
import AboutText from '../components/AboutText';
import Metrics from '../components/Metrics';
import team from '../assets/images/team.png'

const AboutPage = () => {
    return (
        <div> 
            <Metrics />
            <img src={team} alt="" />
        </div>
    );
};

export default AboutPage;