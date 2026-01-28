import React from 'react';
import workplace from '@assets/images/workplace.png';

function Vision() {
    return (
        <div className="flex flex-col md:flex-row justify-left gap-36 items-center mb-28 lg:p-20">
            <img src={workplace} alt="" className='w-[400px] h-[500px] object-cover' />
            <div className="flex flex-col gap-6 ">
                <h2 className="font-medium text-6xl md:text-8xl pl-1">Биздин көз караш</h2>
                <p className="md:text-lg text-base font-normal text-[#3E424A] dark:text-[#a6adba] max-w-2xl leading-5">
                    Биздин максат — билимди жеткиликтүү, практикалык жана пайдалуу кылуу. EduBot Learning ар бир адамга жаңы кесипти өздөштүрүүгө же учурдагы билимин тереңдетүүгө мүмкүнчүлүк берет.
                    Биз теория менен чектелбестен, реалдуу долбоорлор, практикалык тапшырмалар жана заманбап технологиялар аркылуу окутууга ишенебиз. Платформа окуучуларды өз алдынча ой жүгүртүүгө, маселелерди чечүүгө жана рынокко даяр адис болууга багыттайт.
                </p>
            </div>
        </div>
    );
}

export default Vision;
