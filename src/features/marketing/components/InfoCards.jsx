import React from 'react';
import notebook from '@assets/icons/notebook.svg';
import security from '@assets/icons/security.svg';
import medal from '@assets/icons/medal.svg';

function InfoCards() {
    const infoCards = [
        {
            icon: notebook,
            name: 'Биз жөнүндө',
            title: 'EduBot Learning — бул ар бир адамга ылайыкталган онлайн билим берүү платформасы. Биздин максат – заманбап, жеткиликтүү жана сапаттуу билимди дүйнө жүзүндөгү бардык адамдарга жеткирүү.',
        },
        {
            icon: security,
            name: 'Көз карашыбыз',
            title: 'Интерактивдүү жана практикалык окуу аркылуу адамдардын мүмкүнчүлүктөрүн кеңейтип, жаңы кесиптерди өздөштүрүүгө шарт түзүү.',
        },
        {
            icon: medal,
            name: '🎯 Миссиябыз',
            title: 'Адамдардын жаш курагына, кесибине же билимин деңгээлине карабастан, сапаттуу билимге жеткиликтүү болушун камсыздоо. Биз IT, жасалма интеллект, тил үйрөнүү, дизайн жана башка тармактар боюнча курстарды сунуштайбыз.',
        },
    ];
    return (
        <div className="flex flex-col md:flex-row items-center gap-5 mb-14">
            {infoCards.map((x, index) => (
                <div
                    key={index}
                    className="flex flex-col items-start gap-2 border border-[#C5C9D1] dark:border-gray-600 rounded p-3 h-64 bg-white dark:bg-gray-800"
                >
                    <img src={x.icon} alt="" className="dark:brightness-90 dark:contrast-110" />
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{x.name}</h3>
                    <p className="font-normal text-[#3E424A] dark:text-[#a6adba] max-w-md ">{x.title}</p>
                </div>
            ))}
        </div>
    );
}

export default InfoCards;
