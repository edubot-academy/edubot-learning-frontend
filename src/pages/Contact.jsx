import { useState } from 'react';
import { submitContactMessage } from '@services/api';
import toast from 'react-hot-toast';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import LeftLittleMan from '../assets/images/LeftLittleMan.png';
import { FaInstagram } from "react-icons/fa";
import { PiTelegramLogo } from "react-icons/pi";
import { FiMail } from "react-icons/fi";
import { GoClock } from "react-icons/go";
import { SlLocationPin } from "react-icons/sl";

const CONTACT_FIELDS = [
    {
        label: 'Атыңыз',
        name: 'name',
        type: 'text',
        autoComplete: 'name',
    },
    {
        label: 'Электрондук почта',
        name: 'email',
        type: 'email',
        autoComplete: 'email',
    },
    {
        label: 'Телефон номери',
        name: 'phone',
        type: 'tel',
        autoComplete: 'tel',
        inputMode: 'numeric',
    },
];

const CONTACT_METHODS = [
    {
        label: 'Instagram',
        value: '@edubot.company',
        href: 'https://www.instagram.com/edubot.company/',
        icon: FaInstagram,
        description: 'Курстар, жаңылыктар жана коомчулуктагы билдирүүлөр.',
        external: true,
    },
    {
        label: 'Telegram',
        value: '@edubot_learning',
        href: 'https://t.me/edubot_learning',
        icon: PiTelegramLogo,
        description: 'Тез суроолор жана окуу боюнча кыска консультация.',
        external: true,
    },
    {
        label: 'Электрондук почта',
        value: 'jardam.edubot_learning@outlook.com',
        href: 'mailto:jardam.edubot_learning@outlook.com',
        icon: FiMail,
        description: 'Толук суроо-талаптар жана кызматташуу боюнча байланыш.',
    },
    {
        label: 'Иштөө убактысы',
        value: 'Дүйшөмбү - Жума, 9:00 - 21:00',
        icon: GoClock,
        description: 'Бишкек убактысы боюнча жооп беребиз.',
    },
];

const SUPPORT_STEPS = [
    'Сурооңузду окуп, туура адиске багыттайбыз.',
    'Курс, баа же платформа боюнча так жооп даярдайбыз.',
    'Керек болсо Telegram же email аркылуу кийинки кадамды сүйлөшөбүз.',
];

const CONTACT_FIELD_ERROR_KEYS = {
    name: 'name',
    fullName: 'name',
    email: 'email',
    phone: 'phone',
    phoneNumber: 'phone',
    message: 'message',
};

const getApiErrorMessage = (error) => {
    const data = error?.response?.data;

    if (typeof data === 'string') return data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;

    return 'Билдирүү жөнөтүлбөй калды. Маалыматты текшерип, кайра аракет кылыңыз.';
};

const getApiFieldErrors = (error) => {
    const data = error?.response?.data;
    const source = data?.errors || data?.fieldErrors || data?.validationErrors;

    if (!source || typeof source !== 'object') return {};

    return Object.entries(source).reduce((acc, [key, value]) => {
        const fieldName = CONTACT_FIELD_ERROR_KEYS[key];
        if (!fieldName) return acc;

        acc[fieldName] = Array.isArray(value) ? value.join(' ') : String(value);
        return acc;
    }, {});
};

const ContactIntro = () => (
    <>
        <div className="mb-6 mt-10">
            <h1 className="text-5xl md:text-6xl font-bold">Биз менен байланышыңыз</h1>
        </div>

        <p className="mb-10 text-lg text-gray-700 dark:text-[#a6adba]">
            Суроолоруңуз барбы же кайсы курстан баштоону билбей жатасызбы?
            Биз сизге жардам берүүгө дайым даярбыз. Форманы толтуруңуз — командабыз жакын арада сиз менен байланышат.
        </p>

        <div className="mb-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-2 dark:text-[#a6adba]">
            <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 dark:border-orange-900/40 dark:bg-orange-950/20">
                Жооп убактысы: адатта 1 жумуш күнүнүн ичинде.
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#222222]">
                Маалыматыңыз байланыш үчүн гана колдонулат.
            </div>
        </div>
    </>
);

const ContactField = ({ field, value, error, onChange }) => {
    const { label, name, type, autoComplete, inputMode } = field;
    const inputId = `contact-${name}`;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error);

    return (
        <div>
            <label htmlFor={inputId} className="block font-medium mb-1">{label}</label>
            {name === 'phone' ? (
                <PhoneInput
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={(nextValue) => onChange({ target: { name, value: nextValue } })}
                    autoComplete={autoComplete}
                    allowPlus={true}
                    maxLength={16}
                    required
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`rounded-[10px] px-3 transition focus:ring-2 focus:ring-[#E14219] dark:placeholder-gray-400 ${
                        hasError
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-black dark:border-white'
                    }`}
                />
            ) : (
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    required
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`w-full border rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219] transition bg-white dark:bg-[#222222] dark:text-white dark:placeholder-gray-400 ${
                        hasError
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-black dark:border-white'
                    }`}
                />
            )}
            {hasError && (
                <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
            )}
            {name === 'phone' && !hasError && (
                <p className="mt-1 text-sm text-gray-500 dark:text-[#a6adba]">
                    Эл аралык форматта жазыңыз. Мисалы: +996700123456.
                </p>
            )}
        </div>
    );
};

const ContactForm = ({ formData, errors, isSubmitting, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl" noValidate>
        {CONTACT_FIELDS.map((field) => (
            <ContactField
                key={field.name}
                field={field}
                value={formData[field.name]}
                error={errors[field.name]}
                onChange={onChange}
            />
        ))}

        <div>
            <label htmlFor="contact-message" className="block font-medium mb-1">Билдирүү</label>
            <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={onChange}
                rows={4}
                required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                className={`w-full border rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219] transition bg-white dark:bg-[#222222] dark:text-white dark:placeholder-gray-400 ${
                    errors.message
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-black dark:border-white'
                }`}
            ></textarea>
            {errors.message && (
                <p id="contact-message-error" className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.message}</p>
            )}
        </div>

        <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex h-[56px] min-w-[156px] items-center justify-center gap-2 rounded-[8px] bg-[#E14219] px-5 font-medium text-white shadow-lg shadow-[#FF8C6E]/90 transition hover:bg-[#d63915] disabled:cursor-not-allowed disabled:opacity-75 dark:hover:bg-[#c83413]"
        >
            {isSubmitting && (
                <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}
            {isSubmitting ? 'Жөнөтүлүүдө...' : 'Жөнөтүү'}
        </button>
    </form>
);

const SupportPanel = () => (
    <aside className="hidden lg:block sticky top-28">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-orange-100/60 dark:border-gray-700 dark:bg-[#222222] dark:shadow-none">
            <div className="flex justify-center">
                <img
                    src={LeftLittleMan}
                    alt=""
                    aria-hidden="true"
                    className="max-h-72 w-auto object-contain"
                />
            </div>
            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Билдирүүдөн кийин эмне болот?</h2>
                <div className="mt-4 space-y-3">
                    {SUPPORT_STEPS.map((step, index) => (
                        <div key={step} className="flex gap-3 rounded-2xl bg-orange-50/70 p-3 dark:bg-orange-950/20">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EA580C] text-sm font-semibold text-white">
                                {index + 1}
                            </span>
                            <p className="text-sm leading-6 text-gray-700 dark:text-[#a6adba]">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </aside>
);

const ContactMethodsSection = () => (
    <section className="w-full max-w-[1739px] mx-auto px-4 md:px-10 mt-10" aria-labelledby="contact-methods-title">
        <div className="mb-10">
            <h2 id="contact-methods-title" className="text-2xl font-bold text-gray-900 dark:text-white">Башка байланыш жолдору</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-[#a6adba]">
                Формадан тышкары, өзүңүзгө ыңгайлуу канал аркылуу кайрылсаңыз болот.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-base mb-12 md:grid-cols-2 xl:grid-cols-4">
            {CONTACT_METHODS.map((method) => {
                const Icon = method.icon;
                const content = (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C] dark:bg-orange-950/30 dark:text-orange-300">
                                <Icon className="h-5 w-5" />
                            </span>
                            <p className="font-semibold text-[#EA580C] dark:text-orange-400">{method.label}</p>
                        </div>
                        <p className="mt-4 break-words text-sm font-medium text-gray-900 dark:text-white">
                            {method.value}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-[#a6adba]">
                            {method.description}
                        </p>
                    </>
                );

                return method.href ? (
                    <a
                        key={method.label}
                        href={method.href}
                        target={method.external ? '_blank' : undefined}
                        rel={method.external ? 'noopener noreferrer' : undefined}
                        className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#EA580C] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:border-gray-700 dark:bg-[#222222]"
                    >
                        {content}
                    </a>
                ) : (
                    <div
                        key={method.label}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#222222]"
                    >
                        {content}
                    </div>
                );
            })}
        </div>

        <LocationSection />
    </section>
);

const LocationSection = () => (
    <>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="font-inter flex items-center gap-2">
                    <SlLocationPin className="h-5 w-5 text-[#EA580C] dark:text-orange-300" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Дарек</h2>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-[#a6adba]">
                    Ахунбаева 129B, Бишкек, Кыргызстан
                </p>
            </div>
            <a
                href="https://www.google.com/maps?q=Ahunbaeva+129B,+Bishkek,+Kyrgyzstan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#EA580C] px-4 text-sm font-semibold text-[#EA580C] transition hover:bg-[#EA580C] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:border-orange-400 dark:text-orange-300"
            >
                Картадан ачуу
            </a>
        </div>

        <div className="max-w-full">
            <iframe
                src="https://www.google.com/maps?q=Ahunbaeva+129B,+Bishkek,+Kyrgyzstan&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="EduBot Location"
                className="rounded-xl w-full dark:brightness-90 dark:contrast-110"
            ></iframe>
        </div>
    </>
);

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (formData.name.trim().length < 2) {
            newErrors.name = 'Атыңыз кеминде 2 белгиден турушу керек.';
        }

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email.trim())) {
            newErrors.email = 'Туура электрондук почта киргизиңиз.';
        }

        if (!/^\+\d{10,15}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Телефон эл аралык форматта болсун. Мисалы: +996700123456.';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Билдирүү бош болбошу керек.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 13) return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await submitContactMessage({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
            });
            toast.success('Билдирүү ийгиликтүү жөнөтүлдү!');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setErrors({});
        } catch (error) {
            const apiFieldErrors = getApiFieldErrors(error);

            if (Object.keys(apiFieldErrors).length > 0) {
                setErrors(apiFieldErrors);
            }

            toast.error(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12 md:px-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr),minmax(21rem,0.78fr)] lg:gap-16">
                <div className="max-w-2xl">
                    <ContactIntro />
                    <ContactForm
                        formData={formData}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                    />
                </div>

                <SupportPanel />
            </div>

            <ContactMethodsSection />
        </div>
    );
};

export default ContactPage;
