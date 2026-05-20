import { useState } from 'react';
import { SUPPORT_CONTACT } from '@shared/config/support';
import { useTranslation } from 'react-i18next';

const FAQItem = ({ id, question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-200 dark:border-[#2A2E35]">
        <button
            type="button"
            onClick={onClick}
            className="w-full flex justify-between items-center py-4 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#141619]"
            aria-expanded={isOpen}
            aria-controls={`${id}-panel`}
            id={`${id}-button`}
        >
            <span className="font-semibold text-gray-900 dark:text-[#E8ECF3]">{question}</span>
            <span className="text-xl text-gray-500 dark:text-gray-300" aria-hidden="true">
                {isOpen ? '−' : '+'}
            </span>
        </button>

        <div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'
            }`}
        >
            <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">{answer}</p>
        </div>
    </div>
);

const FAQ = () => {
    const { t } = useTranslation();
    const faqData = t('public.home.faq.items', {
        email: SUPPORT_CONTACT.email,
        phone: SUPPORT_CONTACT.phoneDisplay,
        returnObjects: true,
    });
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 bg-white dark:bg-[#141619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2E35]">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-[#E8ECF3]">
                {t('public.home.faq.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                {t('public.home.faq.intro')}
            </p>
            <div className="divide-y divide-gray-200 dark:divide-[#2A2E35]">
                {faqData.map((item, index) => (
                    <FAQItem
                        key={item.q}
                        id={`home-faq-${index}`}
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
