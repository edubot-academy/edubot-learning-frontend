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
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'
            }`}
        >
            <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">{answer}</p>
        </div>
    </div>
);

const FAQ = () => {
    const faqData = [
        {
            q: 'Как зарегистрироваться на курсе?',
            a: 'Чтобы зарегистрироваться, создайте аккаунт, выберите курс и нажмите «Записаться».',
        },
        {
            q: 'Какие курсы предлагает Edubot?',
            a: 'У нас есть курсы по IT, дизайну, маркетингу, языкам и другим направлениям.',
        },
        {
            q: 'Как получить сертификат после завершения курса?',
            a: 'После успешного завершения курса и сдачи теста, вы получите сертификат в личном кабинете.',
        },
        {
            q: 'Как связаться с поддержкой, если возникнут вопросы?',
            a: 'Вы можете написать нам на email: edubot@gmail.com или позвонить по телефону +996 (500) 000 000.',
        },
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 bg-white dark:bg-[#141619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2E35]">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-[#E8ECF3]">FAQ</h3>
            <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                Мы тут собрали ответы на часто задаваемые вопросы
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
