import React from 'react'
import arrowUp from '../assets/icons/arrowUp.svg';
import globus from '../assets/images/globus.png';


function AboutHero() {
    return (
        <div className='flex flex-col md:flex-row justify-between items-center bg-white'>
            <div className='flex flex-col gap-6'>
                <div className='flex items-start justify-between '>
                    <span className='text-sm text-[#3E424A] font-normal'>Lorem ipsum dolor sit amet consectetur.</span>
                    <img className='h-24' src={arrowUp} alt="arrow up" />
                </div>
                <h1 className='font-medium text-7xl md:text-8xl pl-1'>
                    EduBot Learning жөнүндө
                </h1>
                <p className='text-lg font-normal text-[#3E424A] max-w-4xl leading-5'>
                    Lorem ipsum dolor sit amet consectetur. Enim ultrices in id pellentesque. Bibendum odio eget porta aliquet. Eget et dui non non. Vestibulum vitae amet sagittis viverra dignissim ultrices elementum nunc quam. Lectus tellus tincidunt a eget quisque nibh varius eget viverra. Morbi vitae scelerisque dapibus tortor diam at mauris adipiscing gravida.
                </p>
            </div>
            {/* <img src={globus} alt="globus" /> */}
        </div>
    )
}

export default AboutHero
