import React from 'react';
import AboutHero from '../components/AboutHero';
import team from '../assets/images/team.png'

const AboutPage = () => {
    return (
        <div className='mx-4 md:mx-12 '>
            <AboutHero/>
            <img src={team} alt="" />
        </div>
    );
};

export default AboutPage;