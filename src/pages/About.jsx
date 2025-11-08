import React from 'react';
import Vision from '../components/Vision';
import Metrics from '../components/Metrics';
import team from '../assets/images/team.png'


const AboutPage = () => {
    return (
        <div className='mx-4 md:mx-12 '>
            <Metrics />
            <img src={team} alt="" />
            <Vision />
        </div>
    );
};

export default AboutPage;