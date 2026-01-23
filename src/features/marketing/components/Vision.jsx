import React from 'react';
import workplace from '@assets/images/workplace.png';

function Vision() {
    return (
        <div className="flex flex-col md:flex-row justify-left gap-36 items-center mb-28 lg:p-20">
            <img src={workplace} alt="" className='w-[400px] h-[500px] object-cover' />
            <div className="flex flex-col gap-6 ">
                <h2 className="font-medium text-6xl md:text-8xl pl-1">Our vision</h2>
                <p className="md:text-lg text-base font-normal text-[#3E424A] dark:text-[#a6adba] max-w-2xl leading-5">
                    Lorem ipsum dolor sit amet consectetur. Enim ultrices in id pellentesque.
                    Bibendum odio eget porta aliquet. Eget et dui non non. Vestibulum vitae amet
                    sagittis viverra dignissim ultrices elementum nunc quam. Lectus tellus tincidunt
                    a eget quisque nibh varius eget viverra. Morbi vitae scelerisque dapibus tortor
                    diam at mauris adipiscing gravida.
                </p>
            </div>
        </div>
    );
}

export default Vision;
