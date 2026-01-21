import React, { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-200 dark:border-[#2A2E35]">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
        >
            <span className="font-semibold text-gray-900 dark:text-[#E8ECF3]">{question}</span>
            <span className="text-xl text-gray-500 dark:text-gray-300">{isOpen ? '−' : '+'}</span>
        </button>

        <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'
                }`}
        >
            <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">{answer}</p>
        </div>
    </div>
);

const FAQ = () => {
    const faqData = [
        {
            q: 'Курска кантип катталса болот?',
            a: 'Каттоо үчүн каттоо эсебин түзүп, курсту тандап, "Катталуу" баскычын басыңыз.',
        },
        {
            q: 'Edubot кандай курстарды сунуш кылат?',
            a: 'Бизде IT, дизайн, маркетинг, ар кандай тилдер жана башка багыттар боюнча курстар бар.',
        },
        {
            q: 'Курсту аяктагандан кийин кантип сертификат алсам болот?',
            a: 'Курсту ийгиликтүү аяктап, тесттен өткөндөн кийин жеке кабинетиңизде сертификат аласыз.',
        },
        {
            q: 'Суроолорум болсо, колдоо алууга кандай кайрылсам болот?',
            a: 'Сиз бизге электрондук почта аркылуу жазсаңыз болот: edubot@gmail.com же +996 (500) 000 000 номерине чалыңыз.',
        },
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 bg-white dark:bg-[#141619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2E35]">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-[#E8ECF3]">FAQ</h3>
            <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                Биз бул жерде көп берилүүчү суроолорго жоопторду чогулттук.
            </p>
            <div className="divide-y divide-gray-200 dark:divide-[#2A2E35]">
                {faqData.map((item, index) => (
                    <FAQItem
                        key={index}
                        question={item.q}
                        answer={item.a}
                        isOpen={openIndex === index}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FAQ;
