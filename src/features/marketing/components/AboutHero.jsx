import React from 'react';
import arrowUp from '@assets/icons/arrowUp.svg';
import globus from '@assets/images/globus.png';

function AboutHero() {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between ">
                    <img className="h-24 dark:brightness-90 dark:contrast-110" src={arrowUp} alt="arrow up" />
                </div>
                <h1 className="font-medium text-7xl md:text-8xl pl-1 text-gray-900 dark:text-white">EduBot Learning жөнүндө</h1>
                <p className="text-lg font-normal max-w-4xl leading-5 text-gray-700 dark:text-gray-300">
                    EduBot Learning — бул заманбап онлайн билим берүү платформасы. Биз адамдарга IT жана санариптик көндүмдөрдү үйрөнүүгө, карьерасын өнүктүрүүгө жана жаңы мүмкүнчүлүктөргө жетүүгө жардам беребиз.
                    Биздин курстар практикага багытталган, түшүнүктүү жана реалдуу тажрыйбага негизделген. Окуучулар өз темпинде билим алып, сапаттуу мазмун жана тажрыйбалуу менторлор менен иштешет.
                </p>
            </div>
            <img src={globus} alt="globus" className="dark:brightness-90 dark:contrast-110" />
        </div>
    );
}

export default AboutHero;
